// File: src/documents/documentIndexer.ts

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
 * Document Indexing Module
 *
 * This module handles the indexing of document chunks in LanceDB for semantic search.
 * It provides functionality for creating, updating, and searching the document index.
 */

import { connect } from '@lancedb/lancedb';
import { logger } from '../logger';
import { config } from '../config';
import { TextChunk, chunkText } from './textChunker';
import { generateEmbedding, generateQueryEmbedding, EMBEDDING_DIMENSION } from './embeddings';
import { ProcessedDocument } from './documentProcessor';

/**
 * Interface for a document chunk with embedding
 */
export interface IndexedChunk {
  id: string;           // Unique ID for the chunk (docId + index)
  text: string;         // The chunk text content
  doc_id: string;       // Source document ID
  doc_uri: string;      // Source document URI/name
  chunk_id: number;     // Index of the chunk within the document
  vector: number[];     // Vector embedding of the chunk
  metadata: {
    contentType?: string;
    category?: string;
    created: string;
    updated: string;
    size?: number;      // Added size field explicitly to schema
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
    size?: number;      // Added size field explicitly to schema
    parentFolder?: {
      id?: string;
      name?: string;
    };
  };
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

  /**
   * Constructor initializes the LanceDB connection
   */
  constructor() {
    logger.info(`Initializing LanceDB at ${config.lanceDbPath}`);
    this.dbPromise = connect(config.lanceDbPath);
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    try {
      const db = await this.dbPromise;
      // LanceDB doesn't have an explicit close method, but we can set references to null
      this.tablePromise = null;
      this.initialized = false;
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

      // Always recreate the table to ensure schema compatibility
      if (tables.includes('vectors')) {
        logger.info('Dropping existing vectors table in LanceDB to ensure schema compatibility');
        await db.dropTable('vectors');
      }

      // Create a new table with the schema
      logger.info('Creating new vectors table in LanceDB with schema');

      // Sample document for schema definition
      // Updated to include all fields that will be used in actual documents
      const sampleChunk = {
        id: 'sample_chunk',
        text: 'This is a sample text for schema creation',
        doc_id: 'sample_doc',
        doc_uri: 'Sample Document',
        chunk_id: 0,
        vector: new Array(EMBEDDING_DIMENSION).fill(0),
        metadata: {
          contentType: 'text/plain',
          category: 'sample',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          size: 0,  // Added size field to schema
          parentFolder: {
            id: 'folder-1',
            name: 'Sample Folder',
          },
        },
      };

      this.tablePromise = db.createTable('vectors', [sampleChunk]);

      // Wait for table creation to complete
      const table = await this.tablePromise;

      // Verify the table was created successfully
      const countResult = await table.countRows();
      const rowCount = typeof countResult === 'number' ? countResult :
        (countResult && countResult.count ? countResult.count : 0);

      logger.info(`Initialized table with ${rowCount} sample row(s)`);

      // Try to query the table to verify it works
      try {
        const queryResult = await table.query().execute();
        const resultArray = Array.isArray(queryResult) ? queryResult :
          (queryResult && typeof queryResult === 'object' && queryResult.data ?
            queryResult.data : []);

        logger.info(`Verified query access: retrieved ${resultArray.length} row(s)`);

        if (resultArray.length > 0) {
          logger.debug(`Sample row: ${JSON.stringify(resultArray[0], null, 2)}`);
        }
      } catch (queryError) {
        logger.warn(`Could not verify query access: ${queryError}`);
      }

      this.initialized = true;
      logger.info('Document indexer initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize document indexer:', error);
      return false;
    }
  }

  /**
   * Check if the indexer is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Index a processed document by chunking it and storing embeddings
   */
  public async indexDocument(document: ProcessedDocument): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      logger.info(`Indexing document: ${document.id} - ${document.name}`);

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

      for (const chunk of chunks) {
        // Generate embedding for the chunk
        const embedding = await generateEmbedding(chunk.text);

        // Create indexed chunk
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
            size: document.metadata.size,  // Make sure this is included in the schema
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

      logger.info(`Successfully indexed document ${document.id} with ${chunks.length} chunks`);
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

      logger.info(`Successfully removed document ${documentId} from index`);
      return true;
    } catch (error) {
      logger.error(`Error removing document ${documentId} from index:`, error);
      return false;
    }
  }

  /**
   * Search the index for documents matching a query
   *
   * Performs a semantic vector search in LanceDB based on the user's query
   * to retrieve relevant document chunks with their metadata.
   *
   * Implementation of Story 4.2: Semantic Search Implementation
   * - Gets the query string
   * - Generates a query embedding using Transformers.js
   * - Accesses the initialized LanceDB table
   * - Performs vector similarity search using table.search()
   * - Retrieves top N results with text content and metadata
   * - Handles scenarios with few or no results gracefully
   */
  public async searchDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      logger.info(`Performing semantic vector search with query: "${query}"`);

      // Generate embedding for the query using Transformers.js (Story 3.3)
      const queryEmbedding = await generateQueryEmbedding(query);
      logger.debug(`Generated query embedding with dimension: ${queryEmbedding.length}`);

      // Get the table (access the initialized LanceDB table)
      const table = await this.tablePromise;

      try {
        // Check if the table has any data
        const countResult = await table.countRows();
        const rowCount = typeof countResult === 'number' ? countResult :
          (countResult && countResult.count ? countResult.count : 0);

        logger.debug(`Table contains ${rowCount} total rows according to countRows()`);

        // Handle case where the table is empty
        if (rowCount === 0) {
          logger.warn('No documents have been indexed yet');
          return [];
        }

        // Perform vector similarity search using table.search()
        logger.debug(`Performing vector similarity search with query embedding`);

        const searchResults = await table.search(queryEmbedding, 'vector')
          .limit(limit)
          .execute();

        // Handle the case where searchResults might not be an array
        const resultsArray = Array.isArray(searchResults) ? searchResults :
          (searchResults && typeof searchResults === 'object' && searchResults.data ?
            searchResults.data : []);

        logger.debug(`Retrieved ${resultsArray.length} results from vector search`);

        // Handle scenarios with few or no results gracefully
        if (resultsArray.length === 0) {
          logger.info(`No documents found that semantically match the query: "${query}"`);
          return [];
        } else if (resultsArray.length < 3) {
          // If we have fewer than 3 results, log a message but still return them
          logger.info(`Found only ${resultsArray.length} results for query: "${query}"`);
        }

        // Map the results to our SearchResult interface to return text content and metadata
        const mappedResults: SearchResult[] = resultsArray.map(result => ({
          documentId: result.doc_id || '',
          documentName: result.doc_uri || '',
          text: result.text || '',
          score: result._distance || 0,
          metadata: result.metadata || {},
        }));

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
  public async getIndexStats(): Promise<{ documentCount: number, chunkCount: number }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get the table
      const table = await this.tablePromise;

      // Get all chunks using query().execute() to match how we query in searchDocuments
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

        // If we have chunks, log a sample to debug
        if (chunksArray.length > 0) {
          logger.debug(`getIndexStats: Sample chunk: ${JSON.stringify(chunksArray[0], null, 2)}`);
        }

        // Get unique document IDs
        const uniqueDocIds = new Set();

        // Skip the sample document used for schema creation
        chunksArray.forEach(row => {
          if (row && row.doc_id && row.doc_id !== 'sample_doc') {
            uniqueDocIds.add(row.doc_id);
          }
        });

        const documentCount = uniqueDocIds.size;
        // For chunk count, don't count the sample document
        const chunkCount = chunksArray.filter(row => row.doc_id !== 'sample_doc').length;

        logger.debug(`Index stats: ${documentCount} documents, ${chunkCount} chunks via query, ${countRowsChunkCount} chunks via countRows`);
        return { documentCount, chunkCount };
      } catch (queryError) {
        logger.warn(`Error querying chunks: ${queryError}`);

        // Fallback to countRows
        try {
          const countResult = await table.countRows();
          const chunkCount = typeof countResult === 'number' ? countResult :
            (countResult && countResult.count ? countResult.count : 0);

          logger.debug(`Index stats (fallback): 0 documents, ${chunkCount} chunks via countRows`);
          return { documentCount: 0, chunkCount };
        } catch (countError) {
          logger.warn(`Error counting rows: ${countError}`);
          return { documentCount: 0, chunkCount: 0 };
        }
      }
    } catch (error) {
      logger.error('Error getting index stats:', error);
      return { documentCount: 0, chunkCount: 0 };
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
