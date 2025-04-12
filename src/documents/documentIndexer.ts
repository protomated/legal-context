/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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
  documentId: string;   // Source document ID
  documentName: string; // Source document name
  chunkIndex: number;   // Index of the chunk within the document
  embedding: number[];  // Vector embedding of the chunk
  metadata: {
    contentType?: string;
    category?: string;
    created: string;
    updated: string;
    parentFolder?: {
      id: string;
      name: string;
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
    parentFolder?: {
      id: string;
      name: string;
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
   * Initialize the document index
   */
  public async initialize(): Promise<boolean> {
    try {
      const db = await this.dbPromise;

      // Check if the documents table exists, create it if not
      const tables = await db.tableNames();

      if (!tables.includes('documents')) {
        logger.info('Creating documents table in LanceDB');

        // Create the table with the schema
        this.tablePromise = db.createTable('documents', [
          {
            id: 'chunk_1',
            text: 'Sample text for schema creation',
            documentId: 'doc_1',
            documentName: 'Sample Document',
            chunkIndex: 0,
            embedding: new Array(EMBEDDING_DIMENSION).fill(0),
            metadata: {
              contentType: 'text/plain',
              category: 'sample',
              created: new Date().toISOString(),
              updated: new Date().toISOString()
            }
          }
        ]);
      } else {
        logger.info('Documents table already exists in LanceDB');
        this.tablePromise = db.openTable('documents');
      }

      await this.tablePromise;
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

      // Chunk the document text
      const chunks = chunkText(document.text, document.id, document.name);

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
          documentId: document.id,
          documentName: document.name,
          chunkIndex: chunk.index,
          embedding,
          metadata: document.metadata
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

      // Delete all chunks for this document
      await table.delete(`documentId = '${documentId}'`);

      logger.info(`Successfully removed document ${documentId} from index`);
      return true;
    } catch (error) {
      logger.error(`Error removing document ${documentId} from index:`, error);
      return false;
    }
  }

  /**
   * Search the index for documents matching a query
   */
  public async searchDocuments(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      logger.info(`Searching documents with query: ${query}`);

      // Generate embedding for the query
      const queryEmbedding = await generateQueryEmbedding(query);

      // Get the table
      const table = await this.tablePromise;

      // Search for similar documents
      const results = await table.search(queryEmbedding)
        .limit(limit)
        .execute();

      // Format the results
      const searchResults: SearchResult[] = results.map(result => ({
        documentId: result.documentId,
        documentName: result.documentName,
        text: result.text,
        score: result._distance,
        metadata: result.metadata
      }));

      logger.info(`Found ${searchResults.length} results for query: ${query}`);
      return searchResults;
    } catch (error) {
      logger.error(`Error searching documents:`, error);
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

      // Count total chunks
      const countResult = await table.countRows();
      const chunkCount = countResult.count;

      // Count unique documents
      const uniqueDocsResult = await table.query().select('documentId').groupBy('documentId').execute();
      const documentCount = uniqueDocsResult.length;

      return { documentCount, chunkCount };
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
