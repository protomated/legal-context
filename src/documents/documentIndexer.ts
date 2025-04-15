// Path: /Users/deletosh/projects/legal-context/src/documents/documentIndexer.ts

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */
/**
 * Enhanced Document Indexing Module
 *
 * This module handles the indexing of document chunks in LanceDB for semantic search.
 * It provides versioning, sophisticated chunk management, and enhanced metadata filtering.
 */

import { connect } from '@lancedb/lancedb';
import { logger } from '../logger';
import { config } from '../config';
import { TextChunk, chunkText } from './textChunker';
import { generateEmbedding, generateQueryEmbedding, EMBEDDING_DIMENSION, clearEmbeddingCache } from './embeddings';
import { ProcessedDocument } from './documentProcessor';
import crypto from 'crypto';

/**
 * Interface for a document chunk with embedding
 */
export interface IndexedChunk {
  id: string;               // Unique ID for the chunk (docId + index)
  text: string;             // The chunk text content
  doc_id: string;           // Source document ID
  doc_uri: string;          // Source document URI/name
  chunk_id: number;         // Index of the chunk within the document
  vector: number[];         // Vector embedding of the chunk
  // Enhanced metadata for legal documents
  metadata: {
    contentType?: string;
    category?: string;
    created: string;
    updated: string;
    size?: number;
    version: string;        // Document version hash
    lastIndexed: string;    // When the chunk was last indexed
    sectionTitle?: string;  // Section title if available
    sectionNumber?: string; // Section number if available
    isHeading?: boolean;    // Whether this chunk is a heading
    citations?: string[];   // Legal citations found in the chunk
    clauseType?: string;    // Type of legal clause if identifiable
    parentFolder?: {
      id?: string;
      name?: string;
    };
  };
}

/**
 * Interface for search results
 */
export interface SearchResult {
  documentId: string;
  documentName: string;
  text: string;
  score: number;
  metadata: {
    contentType?: string;
    category?: string;
    created: string;
    updated: string;
    size?: number;
    version?: string;
    lastIndexed?: string;
    sectionTitle?: string;
    sectionNumber?: string;
    isHeading?: boolean;
    citations?: string[];
    clauseType?: string;
    parentFolder?: {
      id?: string;
      name?: string;
    };
  };
}

/**
 * Interface for metadata filter options
 */
export interface MetadataFilter {
  contentType?: string | string[];
  category?: string | string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  clauseType?: string | string[];
  isHeading?: boolean;
  hasCitations?: boolean;
  folderName?: string;
  folderId?: string;
}

/**
 * Interface for search options
 */
export interface SearchOptions {
  limit?: number;           // Maximum number of results
  filter?: MetadataFilter;  // Metadata filters
  includeVersions?: boolean;// Whether to include multiple versions of the same document
  minScore?: number;        // Minimum similarity score (0-1)
}

// Singleton instance of the document indexer
let indexerInstance: DocumentIndexer | null = null;

/**
 * Document Indexer class for managing the LanceDB document index
 */
export class DocumentIndexer {
  private dbPromise: Promise<any>;
  private tablePromise: Promise<any> | null = null;
  private initialized = false;
  private documentVersions: Map<string, string> = new Map();

  /**
   * Constructor initializes the LanceDB connection
   */
  constructor() {
    logger.info(`Initializing LanceDB at ${config.lanceDbPath}`);
    this.dbPromise = connect(config.lanceDbPath);

    // Initialize version tracking
    this.loadDocumentVersions().catch(err => {
      logger.warn('Failed to load document versions:', err);
    });
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    try {
      await this.dbPromise;

      // Save document versions before closing
      await this.saveDocumentVersions();

      this.tablePromise = null;
      this.initialized = false;

      // Clear caches
      clearEmbeddingCache();

      logger.info('LanceDB connection closed');
    } catch (error) {
      logger.error('Error closing LanceDB connection:', error);
    }
  }

  /**
   * Initialize the document index
   */
  public async initialize(): Promise<boolean> {
    try {
      const db = await this.dbPromise;

      // Check if the vector table exists
      const tables = await db.tableNames();

      // Check for version tracking table
      if (!tables.includes('document_versions')) {
        logger.info('Creating document versions table in LanceDB');

        // Sample version entry for schema definition
        const sampleVersion = {
          doc_id: 'sample_doc',
          version: 'sample_version',
          last_updated: new Date().toISOString(),
        };

        await db.createTable('document_versions', [sampleVersion]);
        logger.info('Document versions table created');
      } else {
        // Load existing document versions
        await this.loadDocumentVersions();
      }

      // Main vectors table with enhanced schema
      if (tables.includes('vectors')) {
        try {
          const table = await db.openTable('vectors');
          this.tablePromise = Promise.resolve(table);
          this.initialized = true;
          logger.info('Using existing vectors table');
          return true;
        } catch (tableError) {
          logger.error('Error opening vectors table:', tableError);
          try {
            await db.dropTable('vectors');
            logger.info('Dropped problematic vectors table');
          } catch (dropError) {
            logger.error('Error dropping vectors table:', dropError);
          }
        }
      }

      // Create a new table with simplified schema
      logger.info('Creating new vectors table with simplified schema');

      // Use a simplified sample with no boolean fields
      const sampleChunk = {
        id: 'sample_chunk',
        text: 'This is a sample text for schema creation',
        doc_id: 'sample_doc',
        doc_uri: 'Sample Document',
        chunk_id: 0,
        vector: new Array(384).fill(0),
        metadata: {
          contentType: 'text/plain',
          category: 'sample',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          size: 0,
          version: 'v1',
          lastIndexed: new Date().toISOString(),
          sectionTitle: 'Sample Section',
          sectionNumber: '1.0',
          // Convert boolean to string or number
          isHeading: 0, // Using 0/1 instead of boolean
          citations: ['Sample v. Citation, 123 F.3d 456 (2023)'],
          clauseType: 'sample',
          parentFolder: {
            id: 'folder-1',
            name: 'Sample Folder',
          },
        },
      };

      try {
        this.tablePromise = db.createTable('vectors', [sampleChunk]);
        const table = await this.tablePromise;

        const countResult = await table.countRows();
        const rowCount = typeof countResult === 'number' ? countResult :
          (countResult && countResult.count ? countResult.count : 0);

        logger.info(`Initialized table with ${rowCount} sample row(s)`);

        this.initialized = true;
        logger.info('Document indexer initialized successfully');
        return true;
      } catch (createError) {
        logger.error('Failed to create vectors table:', createError);
        throw createError;
      }
    } catch (error) {
      logger.error('Failed to initialize document indexer:', error);
      return false;
    }
  }

  /**
   * Load document versions from the database
   */
  private async loadDocumentVersions(): Promise<void> {
    try {
      const db = await this.dbPromise;

      if (!(await db.tableNames()).includes('document_versions')) {
        return;
      }

      const versionsTable = await db.openTable('document_versions');
      const versionsResult = await versionsTable.query().execute();

      // Reset version map
      this.documentVersions = new Map();

      // Ensure versions is an array before iterating
      const versions = Array.isArray(versionsResult) ? versionsResult :
        (versionsResult && typeof versionsResult === 'object' && versionsResult.data ?
          versionsResult.data : []);

      // Load versions into memory
      for (const row of versions) {
        if (row.doc_id && row.version) {
          this.documentVersions.set(row.doc_id, row.version);
        }
      }

      logger.info(`Loaded ${this.documentVersions.size} document versions`);
    } catch (error) {
      logger.error('Error loading document versions:', error);
    }
  }

  /**
   * Save document versions to the database
   */
  private async saveDocumentVersions(): Promise<void> {
    try {
      if (this.documentVersions.size === 0) {
        return;
      }

      const db = await this.dbPromise;

      // Create table if it doesn't exist
      if (!(await db.tableNames()).includes('document_versions')) {
        logger.warn('Versions table not found, creating it');
        return;
      }

      const versionsTable = await db.openTable('document_versions');

      // Prepare version data
      const versions = Array.from(this.documentVersions.entries()).map(([doc_id, version]) => ({
        doc_id,
        version,
        last_updated: new Date().toISOString(),
      }));

      // Delete existing versions
      for (const [doc_id] of this.documentVersions.entries()) {
        await versionsTable.delete(`doc_id = '${doc_id}'`);
      }

      // Add new versions
      await versionsTable.add(versions);

      logger.info(`Saved ${versions.length} document versions`);
    } catch (error) {
      logger.error('Error saving document versions:', error);
    }
  }

  /**
   * Generate a version hash for a document
   * This is used to detect changes in the document content
   */
  private generateDocumentVersion(document: ProcessedDocument): string {
    // Create a hash of the document text and metadata
    const hash = crypto.createHash('md5');
    hash.update(document.text || '');
    hash.update(document.name || '');

    // Safely handle potentially undefined metadata
    if (document.metadata?.updated) {
      hash.update(document.metadata.updated);
    }

    if (document.metadata?.contentType) {
      hash.update(document.metadata.contentType);
    }

    if (document.metadata?.category) {
      hash.update(document.metadata.category);
    }

    // Return the hash as a version string
    return `v${hash.digest('hex').substring(0, 8)}`;
  }

  /**
   * Check if a document has changed by comparing version hashes
   */
  private hasDocumentChanged(documentId: string, newVersion: string): boolean {
    const existingVersion = this.documentVersions.get(documentId);

    // If we don't have a version, assume the document has changed
    if (!existingVersion) {
      return true;
    }

    // Compare versions
    return existingVersion !== newVersion;
  }

  /**
   * Index a processed document by chunking it and storing embeddings
   * Now with versioning and change detection
   */
  public async indexDocument(document: ProcessedDocument, forceReindex: boolean = false): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      logger.info(`Indexing document: ${document.id} - ${document.name}`);

      // Generate version hash for the document
      const version = this.generateDocumentVersion(document);

      // Check if the document has changed since last indexing
      if (!forceReindex && !this.hasDocumentChanged(document.id, version)) {
        logger.info(`Document ${document.id} hasn't changed since last indexing (version: ${version}). Skipping.`);
        return true;
      }

      logger.info(`Document ${document.id} has changed or force reindex requested. Indexing with version: ${version}`);

      // Chunk the document text (now async)
      const chunks = await chunkText(document.text, document.id, document.name);

      if (chunks.length === 0) {
        logger.warn(`Document ${document.id} has no content to index`);
        return false;
      }

      // Get the table
      const table = await this.tablePromise;

      // Process each chunk
      const indexedChunks: IndexedChunk[] = [];
      const now = new Date().toISOString();

      for (const chunk of chunks) {
        // Generate embedding for the chunk
        const embedding = await generateEmbedding(chunk);

        // Create indexed chunk with enhanced metadata
        const indexedChunk: IndexedChunk = {
          id: `${document.id}_${chunk.index}`,
          text: chunk.text,
          doc_id: document.id,
          doc_uri: document.name,
          chunk_id: chunk.index,
          vector: embedding,
          metadata: {
            contentType: document.metadata.contentType,
            category: document.metadata.category,
            created: document.metadata.created,
            updated: document.metadata.updated,
            size: document.metadata.size,
            version: version,
            lastIndexed: now,
            sectionTitle: chunk.sectionTitle,
            sectionNumber: chunk.sectionNumber,
            isHeading: chunk.isHeading,
            citations: chunk.citations,
            clauseType: chunk.clauseType,
            parentFolder: {
              id: document.metadata.parentFolder?.id,
              name: document.metadata.parentFolder?.name,
            },
          },
        };

        indexedChunks.push(indexedChunk);
      }

      // Remove any existing chunks for this document
      await this.removeDocumentFromIndex(document.id);

      // Add the new chunks to the index
      await table.add(indexedChunks);

      // Update version tracking
      this.documentVersions.set(document.id, version);
      await this.saveDocumentVersions();

      logger.info(`Successfully indexed document ${document.id} with ${chunks.length} chunks (version: ${version})`);
      return true;
    } catch (error) {
      logger.error(`Error indexing document ${document.id}:`, error);
      return false;
    }
  }

  /**
   * Remove a document from the index
   */
  public async removeDocumentFromIndex(documentId: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      logger.info(`Removing document from index: ${documentId}`);

      // Get the table
      const table = await this.tablePromise;

      // Delete all chunks for this document - use double quotes to ensure case sensitivity
      await table.delete(`"doc_id" = '${documentId}'`);

      // Remove from version tracking
      this.documentVersions.delete(documentId);
      await this.saveDocumentVersions();

      logger.info(`Successfully removed document ${documentId} from index`);
      return true;
    } catch (error) {
      logger.error(`Error removing document ${documentId} from index:`, error);
      return false;
    }
  }

  /**
   * Build a WHERE clause for filtering based on metadata
   */
  private buildMetadataFilterClause(filter: MetadataFilter): string {
    const conditions: string[] = [];

    // Content type filter
    if (filter.contentType) {
      if (Array.isArray(filter.contentType)) {
        const contentTypes = filter.contentType.map(t => `'${t}'`).join(', ');
        conditions.push(`"metadata.contentType" IN (${contentTypes})`);
      } else {
        conditions.push(`"metadata.contentType" = '${filter.contentType}'`);
      }
    }

    // Category filter
    if (filter.category) {
      if (Array.isArray(filter.category)) {
        const categories = filter.category.map(c => `'${c}'`).join(', ');
        conditions.push(`"metadata.category" IN (${categories})`);
      } else {
        conditions.push(`"metadata.category" = '${filter.category}'`);
      }
    }

    // Date range filter
    if (filter.dateRange) {
      if (filter.dateRange.start) {
        conditions.push(`"metadata.updated" >= '${filter.dateRange.start}'`);
      }
      if (filter.dateRange.end) {
        conditions.push(`"metadata.updated" <= '${filter.dateRange.end}'`);
      }
    }

    // Clause type filter
    if (filter.clauseType) {
      if (Array.isArray(filter.clauseType)) {
        const clauseTypes = filter.clauseType.map(c => `'${c}'`).join(', ');
        conditions.push(`"metadata.clauseType" IN (${clauseTypes})`);
      } else {
        conditions.push(`"metadata.clauseType" = '${filter.clauseType}'`);
      }
    }

    // Heading filter
    if (filter.isHeading !== undefined) {
      conditions.push(`"metadata.isHeading" = ${filter.isHeading}`);
    }

    // Citations filter
    if (filter.hasCitations !== undefined) {
      if (filter.hasCitations) {
        conditions.push(`"metadata.citations" IS NOT NULL`);
      } else {
        conditions.push(`"metadata.citations" IS NULL`);
      }
    }

    // Folder filters
    if (filter.folderName) {
      conditions.push(`"metadata.parentFolder.name" = '${filter.folderName}'`);
    }

    if (filter.folderId) {
      conditions.push(`"metadata.parentFolder.id" = '${filter.folderId}'`);
    }

    return conditions.length > 0 ? conditions.join(' AND ') : '';
  }

  /**
   * Enhanced semantic search with metadata filtering and version control
   */
  public async searchDocuments(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Set default options
      const limit = options.limit || 5;
      const filter = options.filter || {};
      const includeVersions = options.includeVersions || false;
      const minScore = options.minScore || 0;

      logger.info(`Performing semantic vector search: "${query}" with limit ${limit}`);

      // Generate embedding for the query using Transformers.js
      const queryEmbedding = await generateQueryEmbedding(query);
      logger.debug(`Generated query embedding with dimension: ${queryEmbedding.length}`);

      // Get the table
      const table = await this.tablePromise;

      try {
        // Check if the table has any data
        const countResult = await table.countRows();
        const rowCount = typeof countResult === 'number' ? countResult :
          (countResult && countResult.count ? countResult.count : 0);

        logger.debug(`Table contains ${rowCount} total rows`);

        // Handle case where the table is empty
        if (rowCount === 0) {
          logger.warn('No documents have been indexed yet');
          return [];
        }

        // Start building the search query
        let searchQuery = table.search(queryEmbedding, 'vector');

        // Apply metadata filters if provided
        const filterClause = this.buildMetadataFilterClause(filter);
        if (filterClause) {
          searchQuery = searchQuery.where(filterClause);
        }

        // Add limit
        searchQuery = searchQuery.limit(limit * 2); // Get more results than needed for post-processing

        // Execute the search
        const searchResults = await searchQuery.execute();

        // Handle the case where searchResults might not be an array
        const resultsArray = Array.isArray(searchResults) ? searchResults :
          (searchResults && typeof searchResults === 'object' && searchResults.data ?
            searchResults.data : []);

        logger.debug(`Retrieved ${resultsArray.length} results from vector search`);

        // No results
        if (resultsArray.length === 0) {
          logger.info(`No documents found matching query: "${query}"`);
          return [];
        }

        // Post-process results
        let mappedResults: SearchResult[] = resultsArray.map(result => ({
          documentId: result.doc_id || '',
          documentName: result.doc_uri || '',
          text: result.text || '',
          score: result._distance || 0,
          metadata: result.metadata || {},
        }));

        // Filter by minimum score
        if (minScore > 0) {
          mappedResults = mappedResults.filter(result => 1 - result.score >= minScore);
        }

        // Handle version deduplication if requested
        if (!includeVersions) {
          // Group by document ID and keep only the latest version
          const latestVersions = new Map<string, SearchResult>();

          for (const result of mappedResults) {
            if (!latestVersions.has(result.documentId) ||
              (result.metadata.lastIndexed && latestVersions.get(result.documentId)!.metadata.lastIndexed &&
                result.metadata.lastIndexed > latestVersions.get(result.documentId)!.metadata.lastIndexed)) {
              latestVersions.set(result.documentId, result);
            }
          }

          mappedResults = Array.from(latestVersions.values());
        }

        // Sort by score and limit
        mappedResults.sort((a, b) => a.score - b.score);
        mappedResults = mappedResults.slice(0, limit);

        logger.info(`Found ${mappedResults.length} results for query: "${query}"`);
        return mappedResults;
      } catch (searchError) {
        // Handle error cases gracefully
        logger.warn(`Vector search operation failed: ${searchError}`);
        logger.info('Returning empty results due to search error');
        return [];
      }
    } catch (error) {
      // Handle error cases gracefully
      logger.error(`Error performing semantic vector search:`, error);
      return [];
    }
  }

  /**
   * Get statistics about the document index
   */
  public async getIndexStats(): Promise<{
    documentCount: number;
    chunkCount: number;
    versionsCount: number;
    averageChunksPerDocument: number;
    oldestDocumentDate?: string;
    newestDocumentDate?: string;
    categoryBreakdown?: Record<string, number>;
    clauseTypeBreakdown?: Record<string, number>;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get the table
      const table = await this.tablePromise;

      // Get all chunks
      try {
        const allChunks = await table.query().execute();

        // Handle the case where allChunks might not be an array
        const chunksArray = Array.isArray(allChunks) ? allChunks :
          (allChunks && typeof allChunks === 'object' && allChunks.data ?
            allChunks.data : []);

        logger.debug(`getIndexStats: Table contains ${chunksArray.length} total chunks via query().execute()`);

        // Also try countRows() to compare
        const countResult = await table.countRows();
        const countRowsChunkCount = typeof countResult === 'number' ? countResult :
          (countResult && countResult.count ? countResult.count : 0);

        logger.debug(`getIndexStats: Table contains ${countRowsChunkCount} total chunks via countRows()`);

        // Skip the sample document used for schema creation
        const filteredChunks = chunksArray.filter(row => row.doc_id !== 'sample_doc');

        // Get unique document IDs
        const uniqueDocIds = new Set<string>();

        // Collect metadata for statistics
        const categories = new Map<string, number>();
        const clauseTypes = new Map<string, number>();
        let oldestDate: string | undefined;
        let newestDate: string | undefined;

        // Process each chunk
        for (const row of filteredChunks) {
          if (row && row.doc_id) {
            uniqueDocIds.add(row.doc_id);
          }

          // Collect category stats
          if (row?.metadata?.category) {
            categories.set(
              row.metadata.category,
              (categories.get(row.metadata.category) || 0) + 1,
            );
          }

          // Collect clause type stats
          if (row?.metadata?.clauseType) {
            clauseTypes.set(
              row.metadata.clauseType,
              (clauseTypes.get(row.metadata.clauseType) || 0) + 1,
            );
          }

          // Track document dates
          if (row?.metadata?.updated) {
            if (!oldestDate || row.metadata.updated < oldestDate) {
              oldestDate = row.metadata.updated;
            }

            if (!newestDate || row.metadata.updated > newestDate) {
              newestDate = row.metadata.updated;
            }
          }
        }

        // Calculate statistics
        const documentCount = uniqueDocIds.size;
        const chunkCount = filteredChunks.length;
        const versionsCount = this.documentVersions.size;
        const averageChunksPerDocument = documentCount > 0 ? chunkCount / documentCount : 0;

        // Convert maps to records
        const categoryBreakdown: Record<string, number> = {};
        categories.forEach((count, category) => {
          categoryBreakdown[category] = count;
        });

        const clauseTypeBreakdown: Record<string, number> = {};
        clauseTypes.forEach((count, clauseType) => {
          clauseTypeBreakdown[clauseType] = count;
        });

        logger.debug(`Index stats: ${documentCount} documents, ${chunkCount} chunks, ${versionsCount} versions`);

        return {
          documentCount,
          chunkCount,
          versionsCount,
          averageChunksPerDocument,
          oldestDocumentDate: oldestDate,
          newestDocumentDate: newestDate,
          categoryBreakdown: Object.keys(categoryBreakdown).length > 0 ? categoryBreakdown : undefined,
          clauseTypeBreakdown: Object.keys(clauseTypeBreakdown).length > 0 ? clauseTypeBreakdown : undefined,
        };
      } catch (queryError) {
        logger.warn(`Error querying chunks: ${queryError}`);

        // Fallback to countRows
        try {
          const countResult = await table.countRows();
          const chunkCount = typeof countResult === 'number' ? countResult :
            (countResult && countResult.count ? countResult.count : 0);

          logger.debug(`Index stats (fallback): 0 documents, ${chunkCount} chunks via countRows`);
          return {
            documentCount: 0,
            chunkCount,
            versionsCount: this.documentVersions.size,
            averageChunksPerDocument: 0,
          };
        } catch (countError) {
          logger.warn(`Error counting rows: ${countError}`);
          return {
            documentCount: 0,
            chunkCount: 0,
            versionsCount: this.documentVersions.size,
            averageChunksPerDocument: 0,
          };
        }
      }
    } catch (error) {
      logger.error('Error getting index stats:', error);
      return {
        documentCount: 0,
        chunkCount: 0,
        versionsCount: 0,
        averageChunksPerDocument: 0,
      };
    }
  }
}

/**
 * Get the document indexer instance (singleton)
 */
export function getDocumentIndexer(): DocumentIndexer {
  if (!indexerInstance) {
    indexerInstance = new DocumentIndexer();
  }
  return indexerInstance;
}
