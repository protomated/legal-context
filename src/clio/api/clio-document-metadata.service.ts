// src/clio/api/clio-document-metadata.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClioDocumentService } from './clio-document.service';
import { DocumentResponse } from '../dto/document.dto';

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
  normalizeDocumentMetadata(document: DocumentResponse): Record<string, any> {
    // Create base metadata object
    const metadata: Record<string, any> = {
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

    return metadata;
  }

  /**
   * Get documents related to a specific matter
   */
  async getDocumentsByMatter(matterId: string): Promise<DocumentResponse[]> {
    this.logger.debug(`Fetching documents for matter ID ${matterId}`);
    
    // Fetch all documents for this matter (handles pagination internally)
    const documents = await this.documentService.getAllPaginatedDocuments({
      matter_id: matterId,
      fields: 'id,etag,name,content_type,created_at,updated_at,parent,description,size,document_category',
      limit: 100, // Max page size
    });

    return documents;
  }

  /**
   * Extract document hierarchy (folder structure)
   */
  async getDocumentHierarchy(folderId?: string): Promise<any> {
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
        // For folders, recursively fetch contents (but only one level)
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
}
