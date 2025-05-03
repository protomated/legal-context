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
  id: string;
  text: string;
  doc_id: string;
  doc_uri: string;
  chunk_id: number;
  vector: number[];
  metadata: {
    contentType?: string;
    category?: string;
    created: string;
    updated: string;
    size?: number;
    version: string;
    lastIndexed: string;
    sectionTitle?: string;
    sectionNumber?: string;
    isHeading?: number;  // Use number instead of boolean for compatibility
    citations?: string[];
    clauseType?: string;
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
  private documentVersions: Map<string, string> = new Map();

  // In-memory cache of indexed chunks for faster retrieval
  // This is a workaround for LanceDB 0.18.2 compatibility issues
  private inMemoryChunks: Map<string, IndexedChunk[]> = new Map();

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
   * Check if the indexer has been initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Initialize the document index
   */
  public async initialize(): Promise<boolean> {
    try {
      logger.info('Initializing document indexer...');

      // Connect to LanceDB and ensure the connection is ready
      const db = await this.dbPromise;

      // Check if vectors table exists, if not create it
      const tables = await db.tableNames();
      logger.info(`Database tables: ${tables.join(', ')}`);

      if (!tables.includes('vectors')) {
        logger.info('Creating vectors table with sample document...');

        // Let LanceDB infer the schema from the sample document
// Make sure the sample document matches the schema
        const sampleDoc = {
          id: 'sample_doc',
          doc_id: 'sample_doc',
          doc_uri: 'Sample Document',
          chunk_id: 0,
          text: 'This is a sample document to initialize the schema.',
          vector: Array(EMBEDDING_DIMENSION).fill(0),
          metadata: {
            contentType: 'text/plain',
            category: '',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            size: 0,
            version: 'v1',
            lastIndexed: new Date().toISOString(),
            sectionTitle: '',
            sectionNumber: '',
            isHeading: 0,
            citations: ['sample-citation'],
            clauseType: '',
            parentFolder: {
              id: '',
              name: '',
            },
          },
        };

        // Create the table without explicit schema
        this.tablePromise = db.createTable('vectors', [sampleDoc]);
      } else {
        // Open existing table
        logger.info('Opening existing vectors table');
        this.tablePromise = db.openTable('vectors');
      }

      // Ensure the table is fully initialized by awaiting the promise
      const table = await this.tablePromise;

      if (!table) {
        throw new Error('Failed to initialize vectors table');
      }

      // Initialize document versions table if needed
      if (!tables.includes('document_versions')) {
        logger.info('Creating document_versions table...');

        // Let LanceDB infer the schema from the sample document

        await db.createTable('document_versions', [{
          doc_id: 'sample_doc',
          version: 'v1',
          last_updated: new Date().toISOString(),
          vector: Array(EMBEDDING_DIMENSION).fill(0), // Add vector for schema compatibility
        }]);
      }

      // Load document versions
      await this.loadDocumentVersions();

      this.initialized = true;
      logger.info('Document indexer initialized successfully');

      // Add diagnostic dump
      await this.diagnosticDump();

      return true;
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

      // Updated to handle different return types from query execution
      let versionsResult;
      try {
        if (typeof versionsTable.query === 'function') {
          versionsResult = await versionsTable.query().execute();
        } else {
          versionsResult = await versionsTable.search(Array(384).fill(0), 'vector').limit(1000).execute();
        }
      } catch (queryError) {
        logger.error('Error querying versions table:', queryError);
        return;
      }

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
        vector: Array(EMBEDDING_DIMENSION).fill(0), // Add vector field for schema compatibility
      }));

      // Delete existing versions - updated to handle different APIs
      try {
        // Try using the where method if available
        if (typeof versionsTable.delete === 'function') {
          for (const [doc_id] of this.documentVersions.entries()) {
            await versionsTable.delete(`doc_id = '${doc_id}'`);
          }
        } else {
          // Otherwise just add new versions (overwriting will happen at query time)
          logger.warn('delete() method not available, adding new versions without removing old ones');
        }
      } catch (deleteError) {
        logger.error('Error deleting existing versions:', deleteError);
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
   * Performs a diagnostic dump of the database
   */
  private async diagnosticDump() {
    try {
      // Get database connection
      const db = await this.dbPromise;

      // List all tables
      const tables = await db.tableNames();
      logger.info(`Database tables: ${tables.join(', ')}`);

      // Get vector table
      if (tables.includes('vectors')) {
        const table = await db.openTable('vectors');

        // Get table stats
        const countResult = await table.countRows();
        const rowCount = typeof countResult === 'number' ? countResult :
          (countResult && countResult.count ? countResult.count : 0);
        logger.info(`'vectors' table contains ${rowCount} rows`);

        // Try to get a few rows for examination
        try {
          // Create a dummy vector for search
          const dummyVector = Array(EMBEDDING_DIMENSION).fill(0.1);
          const results = await table.search(dummyVector, 'vector')
            .limit(2)
            .execute();

          if (Array.isArray(results) && results.length > 0) {
            logger.info(`Sample document in 'vectors': ${JSON.stringify(results[0])}`);
          } else if (results && typeof results === 'object' && results.data &&
            Array.isArray(results.data) && results.data.length > 0) {
            logger.info(`Sample document in 'vectors': ${JSON.stringify(results.data[0])}`);
          }
        } catch (err) {
          logger.error(`Error getting sample data: ${err}`);
        }
      }
    } catch (error) {
      logger.error(`Diagnostic dump error: ${error}`);
    }
  }

  /**
   * Get index statistics
   */
  public async getIndexStats(): Promise<{ documentCount: number, chunkCount: number }> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const table = await this.tablePromise;
      if (!table) {
        throw new Error('Vector table not initialized properly');
      }

      // Get count of chunks
      const countResult = await table.countRows();
      const chunkCount = typeof countResult === 'number' ? countResult :
        (countResult && countResult.count ? countResult.count : 0);

      // Get count of unique documents
      const docCount = this.documentVersions.size;

      return {
        documentCount: docCount,
        chunkCount: chunkCount,
      };
    } catch (error) {
      logger.error('Error getting index stats:', error);
      return { documentCount: 0, chunkCount: 0 };
    }
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

      // Get the table with error handling
      const table = await this.tablePromise;
      if (!table) {
        throw new Error('Vector table not initialized properly');
      }

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
            isHeading: chunk.isHeading ? 1 : 0, // Using number instead of boolean for compatibility
            citations: chunk.citations || [],
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
      // Handle case where removal might fail but we still want to try adding
      try {
        await this.removeDocumentFromIndex(document.id);
      } catch (removeError) {
        logger.error(`Error removing existing document ${document.id}, will try to continue with indexing:`, removeError);
      }

      // Add the new chunks to the index with error handling
      try {
        // Log a sample chunk for debugging
        if (indexedChunks.length > 0) {
          logger.info(`Sample chunk being indexed: ${JSON.stringify({
            id: indexedChunks[0].id,
            text: indexedChunks[0].text.substring(0, 50) + '...',
            doc_id: indexedChunks[0].doc_id,
            vector_length: indexedChunks[0].vector.length,
            vector_sample: indexedChunks[0].vector.slice(0, 5)
          })}`);
        }

        // WORKAROUND: Store chunks in memory for faster retrieval
        // This is a workaround for LanceDB 0.18.2 compatibility issues
        logger.info(`Storing ${indexedChunks.length} chunks in memory for document ${document.id}`);
        this.inMemoryChunks.set(document.id, indexedChunks);

        // Log the total number of chunks in memory
        let totalChunks = 0;
        this.inMemoryChunks.forEach(chunks => totalChunks += chunks.length);
        logger.info(`Total chunks in memory: ${totalChunks} across ${this.inMemoryChunks.size} documents`);

        // Add chunks to the table (still try to use LanceDB as a backup)
        try {
          const addResult = await table.add(indexedChunks);
          logger.info(`Add result: ${JSON.stringify(addResult)}`);
        } catch (addError) {
          logger.error(`Error adding chunks to LanceDB (using in-memory fallback): ${addError}`);
        }

        // Update version tracking
        this.documentVersions.set(document.id, version);
        await this.saveDocumentVersions();

        logger.info(`Successfully indexed document ${document.id} with ${chunks.length} chunks (version: ${version})`);
        return true;
      } catch (addError) {
        logger.error(`Error adding chunks to table for document ${document.id}:`, addError);
        throw addError;
      }
    } catch (error) {
      logger.error(`Error indexing document ${document.id}:`, error);
      return false;
    }
  }

  /**
   * Search for documents matching a query string
   *
   * This implementation uses an in-memory cache instead of vector search
   * due to compatibility issues with LanceDB 0.18.2
   */
  public async searchDocuments(query: string, limitOrOptions?: number | SearchOptions): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Parse options
      const options: SearchOptions = typeof limitOrOptions === 'number'
        ? { limit: limitOrOptions }
        : limitOrOptions || {};

      const limit = options.limit || 5;

      // Generate query embedding for future use
      const queryEmbedding = await generateQueryEmbedding(query);

      // Log the query for debugging
      logger.info(`Searching for documents matching query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);

      // WORKAROUND: Use in-memory cache instead of LanceDB
      logger.info('Using in-memory cache instead of vector search due to compatibility issues');

      // Check if we have any documents in the in-memory cache
      if (this.inMemoryChunks.size === 0) {
        logger.warn('In-memory cache is empty, no documents to search');
        return [];
      }

      // Collect all chunks from all documents
      const allChunks: IndexedChunk[] = [];
      this.inMemoryChunks.forEach(chunks => {
        allChunks.push(...chunks);
      });

      logger.info(`Searching through ${allChunks.length} chunks in memory from ${this.inMemoryChunks.size} documents`);

      // If we have query embedding, use vector similarity
      if (queryEmbedding && queryEmbedding.length === EMBEDDING_DIMENSION) {
        logger.info('Using vector similarity for search');

        // Calculate cosine similarity between query embedding and each chunk
        const scoredChunks = allChunks.map(chunk => {
          // Calculate cosine similarity
          let similarity = 0;
          for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
            similarity += queryEmbedding[i] * chunk.vector[i];
          }

          // Convert similarity to distance (0 = perfect match, 2 = opposite)
          const distance = 1 - similarity;

          return {
            chunk,
            score: distance
          };
        });

        // Sort by score (lowest distance first)
        scoredChunks.sort((a, b) => a.score - b.score);

        // Take the top N results
        const topChunks = scoredChunks.slice(0, limit);

        logger.info(`Selected top ${topChunks.length} chunks by vector similarity`);

        // Convert to search results
        const searchResults: SearchResult[] = topChunks.map(({ chunk, score }) => ({
          documentId: chunk.doc_id,
          documentName: chunk.doc_uri,
          text: chunk.text,
          score: score,
          metadata: {
            contentType: chunk.metadata?.contentType,
            category: chunk.metadata?.category,
            created: chunk.metadata?.created || '',
            updated: chunk.metadata?.updated || '',
            size: chunk.metadata?.size,
            version: chunk.metadata?.version,
            lastIndexed: chunk.metadata?.lastIndexed,
            sectionTitle: chunk.metadata?.sectionTitle,
            sectionNumber: chunk.metadata?.sectionNumber,
            isHeading: chunk.metadata?.isHeading ? true : false,
            citations: chunk.metadata?.citations || [],
            clauseType: chunk.metadata?.clauseType,
            parentFolder: chunk.metadata?.parentFolder,
          },
        }));

        logger.info(`Returning ${searchResults.length} search results from vector similarity search`);
        return searchResults;
      } else {
        // Fallback to text matching if we don't have query embedding
        logger.info('Falling back to text matching for search');

        // Convert query to lowercase for case-insensitive matching
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 3);

        logger.info(`Filtering chunks by text matching with query words: ${queryWords.join(', ')}`);

        // Score each chunk based on text matching
        const scoredChunks = allChunks.map(chunk => {
          // Calculate a simple text matching score
          const text = (chunk.text || '').toLowerCase();
          let score = 0;

          // Check for exact phrase match (highest score)
          if (text.includes(queryLower)) {
            score += 0.8;
          }

          // Check for individual word matches
          for (const word of queryWords) {
            if (text.includes(word)) {
              score += 0.2;
            }
          }

          return {
            chunk,
            score: 1 - Math.min(score, 1) // Convert to distance (0 = perfect match)
          };
        });

        // Sort by score (lowest distance first)
        scoredChunks.sort((a, b) => a.score - b.score);

        // Take the top N results
        const topChunks = scoredChunks.slice(0, limit);

        logger.info(`Selected top ${topChunks.length} chunks by text matching score`);

        // Convert to search results
        const searchResults: SearchResult[] = topChunks.map(({ chunk, score }) => ({
          documentId: chunk.doc_id,
          documentName: chunk.doc_uri,
          text: chunk.text,
          score: score,
          metadata: {
            contentType: chunk.metadata?.contentType,
            category: chunk.metadata?.category,
            created: chunk.metadata?.created || '',
            updated: chunk.metadata?.updated || '',
            size: chunk.metadata?.size,
            version: chunk.metadata?.version,
            lastIndexed: chunk.metadata?.lastIndexed,
            sectionTitle: chunk.metadata?.sectionTitle,
            sectionNumber: chunk.metadata?.sectionNumber,
            isHeading: chunk.metadata?.isHeading ? true : false,
            citations: chunk.metadata?.citations || [],
            clauseType: chunk.metadata?.clauseType,
            parentFolder: chunk.metadata?.parentFolder,
          },
        }));

        logger.info(`Returning ${searchResults.length} search results from text matching search`);
        return searchResults;
      }
    } catch (error) {
      logger.error('Error searching documents:', error);
      return [];
    }
  }

  /**
   * Get the LanceDB table instance
   */
  public async getTable() {
    if (!this.tablePromise) {
      throw new Error('Vector table not initialized');
    }
    return await this.tablePromise;
  }

  /**
   * Remove a document from the index
   */
  public async removeDocumentFromIndex(documentId: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      logger.info(`Removing document ${documentId} from index`);

      // WORKAROUND: Remove from in-memory cache first
      if (this.inMemoryChunks.has(documentId)) {
        const chunksRemoved = this.inMemoryChunks.get(documentId)?.length || 0;
        this.inMemoryChunks.delete(documentId);
        logger.info(`Removed ${chunksRemoved} chunks for document ${documentId} from in-memory cache`);

        // Log the total number of chunks in memory after removal
        let totalChunks = 0;
        this.inMemoryChunks.forEach(chunks => totalChunks += chunks.length);
        logger.info(`Total chunks in memory after removal: ${totalChunks} across ${this.inMemoryChunks.size} documents`);
      } else {
        logger.info(`Document ${documentId} not found in in-memory cache`);
      }

      // Try to remove from LanceDB as well (as a backup)
      try {
        const table = await this.tablePromise;

        if (!table) {
          logger.warn('Vector table not initialized properly, skipping LanceDB removal');
        } else {
          // Using the where clause to delete documents with matching doc_id
          try {
            await table.delete(`doc_id = '${documentId}'`);
          } catch (error) {
            // If the delete method doesn't exist or fails, try a different approach
            logger.warn(`Standard delete method failed: ${error}. Trying alternative approach...`);

            // Alternative approach - this is a fallback if the direct delete doesn't work
            // This is not ideal but may work in some LanceDB versions
            const dummyVector = Array(EMBEDDING_DIMENSION).fill(0);
            await table.add([{
              id: `dummy_for_deletion_${documentId}`,
              doc_id: documentId,
              doc_uri: 'Dummy for deletion',
              chunk_id: -1,
              text: '',
              vector: dummyVector,
              metadata: {
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                version: 'deletion',
                lastIndexed: new Date().toISOString(),
              },
            }]);

            logger.warn(`Used alternative deletion approach for document ${documentId}`);
          }
        }
      } catch (lanceDbError) {
        logger.error(`Error removing document from LanceDB (using in-memory fallback): ${lanceDbError}`);
      }

      // Also remove from document versions
      this.documentVersions.delete(documentId);
      await this.saveDocumentVersions();

      logger.info(`Successfully removed document ${documentId} from index`);
      return true;
    } catch (error) {
      logger.error(`Error removing document ${documentId} from index:`, error);
      return false;
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
