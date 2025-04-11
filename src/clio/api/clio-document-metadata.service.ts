// src/clio/api/clio-document-metadata.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClioDocumentService } from './clio-document.service';
import { DocumentResponse, DocumentListParams } from '../dto/document.dto';

/**
 * Represents a normalized document metadata structure
 */
export interface NormalizedDocumentMetadata {
  id: string;
  name: string;
  contentType: string;
  createdAt: string;
  updatedAt: string;
  fileSize: number;
  path?: string;
  parent?: {
    id: string;
    type: string;
  };
  description?: string;
  category?: {
    id: string;
    name: string;
  };
  matter?: {
    id: string;
    number: string;
    description: string;
  };
  sharedWith?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  customFields?: Record<string, any>;
  tags?: string[];
  version?: {
    number: number;
    createdAt: string;
    createdBy?: string;
  };
}

/**
 * Options for filtering documents
 */
export interface DocumentFilterOptions {
  contentTypes?: string[];
  categories?: string[];
  matterIds?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  modifiedAfter?: Date;
  modifiedBefore?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
  tags?: string[];
  searchTerms?: string[];
  parentId?: string;
  limit?: number;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Service for managing document metadata operations
 * Provides specialized operations for extracting, normalizing and working with document metadata
 */
@Injectable()
export class ClioDocumentMetadataService {
  private readonly logger = new Logger(ClioDocumentMetadataService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly documentService: ClioDocumentService,
  ) {}

  /**
   * Extract and normalize document metadata to a standard format
   */
  normalizeDocumentMetadata(document: DocumentResponse): NormalizedDocumentMetadata {
    // Create base metadata object
    const metadata: NormalizedDocumentMetadata = {
      id: document.id,
      name: document.name,
      contentType: document.content_type,
      createdAt: new Date(document.created_at).toISOString(),
      updatedAt: new Date(document.updated_at).toISOString(),
      fileSize: document.size || 0,
    };

    // Add parent information if available
    if (document.parent) {
      metadata.parent = {
        id: document.parent.id,
        type: document.parent.type
      };
    }

    // Add description if available
    if (document.description) {
      metadata.description = document.description;
    }

    // Add document category if available
    if (document.document_category) {
      metadata.category = {
        id: document.document_category.id,
        name: document.document_category.name
      };
    }

    // Add matter information if available
    if (document.matter) {
      metadata.matter = {
        id: document.matter.id,
        number: document.matter.display_number,
        description: document.matter.description
      };
    }

    // Add sharing information if available
    if (document.shared_with && document.shared_with.length > 0) {
      metadata.sharedWith = document.shared_with.map(user => ({
        id: user.id,
        name: user.name,
        type: user.type
      }));
    }

    // Add custom fields if available
    if (document.custom_field_values) {
      metadata.customFields = document.custom_field_values;
    }

    // Extract tags from custom fields if they exist
    if (document.custom_field_values?.tags) {
      try {
        const tags = this.extractTags(document.custom_field_values.tags);
        if (tags.length > 0) {
          metadata.tags = tags;
        }
      } catch (error) {
        this.logger.warn(`Failed to extract tags for document ${document.id}: ${error.message}`);
      }
    }

    // Add version information if available
    if (document.versions && document.versions.length > 0) {
      const latestVersion = document.versions.sort((a, b) => 
        b.version_number - a.version_number
      )[0];
      
      metadata.version = {
        number: latestVersion.version_number,
        createdAt: new Date(latestVersion.created_at).toISOString(),
        createdBy: latestVersion.created_by?.name
      };
    }

    return metadata;
  }

  /**
   * Extract tags from different tag formats 
   * Handles both string arrays and comma-separated strings
   */
  private extractTags(tagsData: any): string[] {
    if (Array.isArray(tagsData)) {
      return tagsData.map(tag => String(tag).trim());
    } else if (typeof tagsData === 'string') {
      return tagsData.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * Get documents related to a specific matter
   */
  async getDocumentsByMatter(matterId: string, options: Partial<DocumentListParams> = {}): Promise<DocumentResponse[]> {
    this.logger.debug(`Fetching documents for matter ID ${matterId}`);
    
    // Fetch all documents for this matter (handles pagination internally)
    const documents = await this.documentService.getAllPaginatedDocuments({
      matter_id: matterId,
      fields: 'id,etag,name,content_type,created_at,updated_at,parent,description,size,document_category',
      limit: options.limit || 100,
      page: options.page || 1,
      sort: options.sort,
      order: options.order,
      updated_since: options.updated_since,
      created_since: options.created_since,
    });

    return documents;
  }

  /**
   * Filter documents using advanced criteria
   */
  async filterDocuments(options: DocumentFilterOptions): Promise<DocumentResponse[]> {
    this.logger.debug(`Filtering documents with options: ${JSON.stringify(options)}`);
    
    // Build query parameters for Clio API
    const queryParams: DocumentListParams = {
      limit: options.limit || 100,
      page: options.page || 1,
      fields: 'id,etag,name,content_type,created_at,updated_at,parent,description,size,document_category,matter',
    };
    
    // Add parent ID if specified
    if (options.parentId) {
      queryParams.parent_id = options.parentId;
    }
    
    // Add matter IDs if specified
    if (options.matterIds && options.matterIds.length === 1) {
      queryParams.matter_id = options.matterIds[0];
    }
    
    // Add document category if specified
    if (options.categories && options.categories.length === 1) {
      queryParams.document_category_id = options.categories[0];
    }
    
    // Add date range parameters
    if (options.modifiedAfter) {
      queryParams.updated_since = options.modifiedAfter.toISOString();
    } else if (options.dateRange?.start) {
      queryParams.updated_since = options.dateRange.start.toISOString();
    }
    
    if (options.createdAfter) {
      queryParams.created_since = options.createdAfter.toISOString();
    }
    
    // Add sort options
    if (options.sort) {
      queryParams.sort = options.sort;
    }
    
    if (options.order) {
      queryParams.order = options.order;
    }
    
    // Add search terms if specified
    if (options.searchTerms && options.searchTerms.length > 0) {
      queryParams.query = options.searchTerms.join(' ');
    }
    
    // Fetch documents with API parameters
    let documents = await this.documentService.getAllPaginatedDocuments(queryParams);
    
    // Apply client-side filtering for more complex criteria
    if (documents.length > 0) {
      // Filter by content types
      if (options.contentTypes && options.contentTypes.length > 0) {
        documents = documents.filter(doc => 
          options.contentTypes.includes(doc.content_type)
        );
      }
      
      // Filter by multiple matter IDs (if more than one)
      if (options.matterIds && options.matterIds.length > 1) {
        documents = documents.filter(doc => 
          doc.matter && options.matterIds.includes(doc.matter.id)
        );
      }
      
      // Filter by multiple categories (if more than one)
      if (options.categories && options.categories.length > 1) {
        documents = documents.filter(doc => 
          doc.document_category && options.categories.includes(doc.document_category.name)
        );
      }
      
      // Apply date range end filter
      if (options.modifiedBefore || options.dateRange?.end) {
        const endDate = options.modifiedBefore || options.dateRange.end;
        documents = documents.filter(doc => 
          new Date(doc.updated_at) <= endDate
        );
      }
      
      // Apply created before filter
      if (options.createdBefore) {
        documents = documents.filter(doc => 
          new Date(doc.created_at) <= options.createdBefore
        );
      }
    }
    
    return documents;
  }

  /**
   * Extract document hierarchy (folder structure)
   */
  async getDocumentHierarchy(folderId?: string, depth: number = 1): Promise<any> {
    this.logger.debug(`Building document hierarchy${folderId ? ` from folder ID ${folderId}` : ''}`);
    
    // Fetch contents of the specified folder (or root if not specified)
    const response = await this.documentService.listFolderContents(folderId || 'root', {
      fields: 'id,name,content_type,parent',
      limit: 100, // Max page size
    });

    // Process results into hierarchy
    const items = response.data;
    const hierarchy: any = {
      folders: [],
      documents: []
    };

    // Split into folders and documents
    for (const item of items) {
      if (item.content_type === 'folder') {
        // For folders, recursively fetch contents (but only to specified depth)
        const folder = {
          id: item.id,
          name: item.name,
          parent_id: item.parent?.id,
          items: {
            folders: [],
            documents: []
          }
        };
        
        // Add to hierarchy
        hierarchy.folders.push(folder);
        
        // Recursively fetch folder contents if depth > 1
        if (depth > 1) {
          try {
            const subHierarchy = await this.getDocumentHierarchy(item.id, depth - 1);
            folder.items = subHierarchy;
          } catch (error) {
            this.logger.warn(`Error fetching subfolder contents for folder ${item.id}: ${error.message}`);
          }
        }
      } else {
        // For documents, just add to the documents array
        hierarchy.documents.push({
          id: item.id,
          name: item.name,
          content_type: item.content_type,
          parent_id: item.parent?.id
        });
      }
    }

    return hierarchy;
  }

  /**
   * Get the document's full path string (including ancestors)
   */
  async getDocumentPath(documentId: string): Promise<string> {
    this.logger.debug(`Getting path for document ID ${documentId}`);
    
    // Get document details
    const document = await this.documentService.getDocument(documentId);
    const pathParts: string[] = [document.name];
    
    // If document has a parent, traverse up the hierarchy
    if (document.parent) {
      await this.addParentToPath(document.parent.id, pathParts);
    }
    
    // Reverse the path parts (currently in reverse order) and join with slashes
    return '/' + pathParts.reverse().join('/');
  }

  /**
   * Helper method to recursively build document path
   */
  private async addParentToPath(parentId: string, pathParts: string[]): Promise<void> {
    try {
      // Skip if parent is root
      if (parentId === 'root') {
        return;
      }
      
      // Get parent details
      const parent = await this.documentService.getDocument(parentId);
      
      // Add parent name to path
      pathParts.push(parent.name);
      
      // Continue recursion if parent has parent
      if (parent.parent) {
        await this.addParentToPath(parent.parent.id, pathParts);
      }
    } catch (error) {
      this.logger.error(`Error building path for parent ID ${parentId}: ${error.message}`);
      // Continue with what we have so far
    }
  }

  /**
   * Group documents by category
   */
  async groupDocumentsByCategory(documents: DocumentResponse[]): Promise<Record<string, DocumentResponse[]>> {
    this.logger.debug(`Grouping ${documents.length} documents by category`);
    
    const categorized: Record<string, DocumentResponse[]> = {
      'uncategorized': []
    };
    
    for (const document of documents) {
      const categoryName = document.document_category?.name || 'uncategorized';
      
      if (!categorized[categoryName]) {
        categorized[categoryName] = [];
      }
      
      categorized[categoryName].push(document);
    }
    
    return categorized;
  }

  /**
   * Group documents by custom criteria
   */
  groupDocumentsByProperty(
    documents: DocumentResponse[], 
    property: string
  ): Record<string, DocumentResponse[]> {
    this.logger.debug(`Grouping ${documents.length} documents by property: ${property}`);
    
    const grouped: Record<string, DocumentResponse[]> = {
      'unknown': []
    };
    
    // Helper function to extract property value safely
    const getPropertyValue = (doc: DocumentResponse, prop: string): string => {
      const parts = prop.split('.');
      let value: any = doc;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          return null;
        }
      }
      
      if (value === null || value === undefined) {
        return null;
      }
      
      return String(value);
    };
    
    // Group documents by the specified property
    for (const document of documents) {
      const value = getPropertyValue(document, property);
      const key = value || 'unknown';
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      grouped[key].push(document);
    }
    
    return grouped;
  }

  /**
   * Get recently modified documents
   */
  async getRecentlyModifiedDocuments(days: number = 7): Promise<DocumentResponse[]> {
    this.logger.debug(`Getting documents modified in the last ${days} days`);
    
    // Calculate date
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString();
    
    // Fetch documents updated since the specified date
    return this.documentService.getAllPaginatedDocuments({
      updated_since: dateStr,
      sort: 'updated_at',
      order: 'desc',
      fields: 'id,name,content_type,updated_at,created_at,parent,document_category,matter'
    });
  }

  /**
   * Get documents by content type
   */
  async getDocumentsByContentType(contentType: string): Promise<DocumentResponse[]> {
    this.logger.debug(`Fetching documents with content type: ${contentType}`);
    
    // Use the search functionality to filter by content type
    const searchResults = await this.documentService.searchDocuments(contentType, {
      fields: 'id,name,content_type,updated_at,created_at,parent,document_category',
      limit: 100
    });
    
    // Filter results to match the exact content type (search might return partial matches)
    return searchResults.data.filter(doc => doc.content_type === contentType);
  }

  /**
   * Find duplicate document names
   */
  async findDuplicateDocumentNames(): Promise<Record<string, DocumentResponse[]>> {
    this.logger.debug('Searching for documents with duplicate names');
    
    // Get all documents
    const allDocuments = await this.documentService.getAllPaginatedDocuments({
      fields: 'id,name,content_type,parent,updated_at,matter'
    });
    
    // Group by name
    const nameGroups: Record<string, DocumentResponse[]> = {};
    
    for (const document of allDocuments) {
      if (!nameGroups[document.name]) {
        nameGroups[document.name] = [];
      }
      
      nameGroups[document.name].push(document);
    }
    
    // Filter to only include duplicates
    const duplicates: Record<string, DocumentResponse[]> = {};
    
    for (const [name, documents] of Object.entries(nameGroups)) {
      if (documents.length > 1) {
        duplicates[name] = documents;
      }
    }
    
    return duplicates;
  }

  /**
   * Extract common metadata statistics from a collection of documents
   */
  getDocumentMetadataStatistics(documents: DocumentResponse[]): {
    totalCount: number;
    byContentType: Record<string, number>;
    byCategory: Record<string, number>;
    byMatter: Record<string, number>;
    sizeStats: {
      totalSize: number;
      averageSize: number;
      minSize: number;
      maxSize: number;
    };
    dateStats: {
      oldestCreated: Date;
      newestCreated: Date;
      oldestUpdated: Date;
      newestUpdated: Date;
    };
  } {
    this.logger.debug(`Generating statistics for ${documents.length} documents`);
    
    // Initialize statistics object
    const stats = {
      totalCount: documents.length,
      byContentType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byMatter: {} as Record<string, number>,
      sizeStats: {
        totalSize: 0,
        averageSize: 0,
        minSize: Number.MAX_SAFE_INTEGER,
        maxSize: 0
      },
      dateStats: {
        oldestCreated: new Date(),
        newestCreated: new Date(0),
        oldestUpdated: new Date(),
        newestUpdated: new Date(0)
      }
    };
    
    // Process each document
    for (const doc of documents) {
      // Count by content type
      const contentType = doc.content_type || 'unknown';
      stats.byContentType[contentType] = (stats.byContentType[contentType] || 0) + 1;
      
      // Count by category
      const category = doc.document_category?.name || 'uncategorized';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      
      // Count by matter
      const matter = doc.matter?.display_number || 'unassigned';
      stats.byMatter[matter] = (stats.byMatter[matter] || 0) + 1;
      
      // Size statistics
      if (doc.size) {
        stats.sizeStats.totalSize += doc.size;
        stats.sizeStats.minSize = Math.min(stats.sizeStats.minSize, doc.size);
        stats.sizeStats.maxSize = Math.max(stats.sizeStats.maxSize, doc.size);
      }
      
      // Date statistics
      const createdDate = new Date(doc.created_at);
      const updatedDate = new Date(doc.updated_at);
      
      if (createdDate < stats.dateStats.oldestCreated) {
        stats.dateStats.oldestCreated = createdDate;
      }
      
      if (createdDate > stats.dateStats.newestCreated) {
        stats.dateStats.newestCreated = createdDate;
      }
      
      if (updatedDate < stats.dateStats.oldestUpdated) {
        stats.dateStats.oldestUpdated = updatedDate;
      }
      
      if (updatedDate > stats.dateStats.newestUpdated) {
        stats.dateStats.newestUpdated = updatedDate;
      }
    }
    
    // Calculate average size
    if (documents.length > 0) {
      stats.sizeStats.averageSize = stats.sizeStats.totalSize / documents.length;
    }
    
    // Fix min size if no documents with size
    if (stats.sizeStats.minSize === Number.MAX_SAFE_INTEGER) {
      stats.sizeStats.minSize = 0;
    }
    
    return stats;
  }

  /**
   * Batch normalize multiple document metadata objects
   */
  batchNormalizeMetadata(documents: DocumentResponse[]): NormalizedDocumentMetadata[] {
    this.logger.debug(`Batch normalizing metadata for ${documents.length} documents`);
    return documents.map(doc => this.normalizeDocumentMetadata(doc));
  }

  /**
   * Search for specific metadata within documents
   */
  async searchDocumentMetadata(
    searchTerm: string,
    fields: string[] = ['name', 'description'],
    options: Partial<DocumentListParams> = {}
  ): Promise<DocumentResponse[]> {
    this.logger.debug(`Searching document metadata for "${searchTerm}" in fields: ${fields.join(', ')}`);
    
    // Use Clio's search functionality
    const searchResults = await this.documentService.searchDocuments(searchTerm, {
      fields: fields.join(','),
      limit: options.limit || 100,
      page: options.page || 1,
      sort: options.sort,
      order: options.order,
      matter_id: options.matter_id,
    });
    
    return searchResults.data;
  }
}
