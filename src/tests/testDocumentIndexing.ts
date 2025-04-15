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
 * Diagnostic Test Script for Document Indexing and Semantic Search
 *
 * This script provides a comprehensive test and diagnostic for the document
 * indexing and semantic search functionality.
 *
 * Usage:
 * bun run src/tests/testDocumentIndexing.ts
 */

import { getDocumentIndexer } from '../documents/documentIndexer';
import { generateEmbedding, clearEmbeddingCache } from '../documents/embeddings';
import { logger } from '../logger';
import * as lancedb from '@lancedb/lancedb';
import { config } from '../config';

// Set to true to rebuild the vector table from scratch
const REBUILD_VECTOR_TABLE = true;


/**
 * Create a mock document specifically designed to test the queries
 */
function createMockDocument() {
  return {
    id: 'test-employment-doc',
    name: 'Employment Agreement Test Document',
    text: `
      EMPLOYMENT AGREEMENT - TEST DOCUMENT

      This Employment Agreement (the "Agreement") is made and entered into as of April 15, 2025 (the "Effective Date"), 
      by and between ABC Corporation, a Delaware corporation (the "Company"), and Jane Doe, an individual ("Employee").

      1. EMPLOYMENT POSITION AND DUTIES

      1.1 Position. The Company agrees to employ Employee as Senior Legal Counsel. Employee shall report directly to the 
      General Counsel of the Company. Employee accepts such employment on the terms and conditions set forth in this Agreement.

      1.2 Duties. Employee shall perform all duties normally associated with the position of Senior Legal Counsel and such 
      other duties as may be assigned by the General Counsel or the Company's Board of Directors. Employee shall devote 
      Employee's full business time and effort to the performance of Employee's duties for the Company.

      2. COMPENSATION

      2.1 Base Salary. As compensation for Employee's services, the Company shall pay Employee a base salary at the annual 
      rate of ONE HUNDRED SEVENTY-FIVE THOUSAND DOLLARS ($175,000) (the "Base Salary"), payable in accordance with the 
      Company's standard payroll practices.

      2.2 Bonus. Employee shall be eligible to receive an annual performance bonus of up to 20% of Employee's Base Salary, 
      based on the achievement of individual and Company performance goals established by the Company.

      3. NON-COMPETE AND CONFIDENTIALITY

      3.1 Non-Competition. During the term of Employee's employment and for a period of one (1) year following the termination 
      of Employee's employment, Employee shall not, directly or indirectly, engage in or have any interest in any entity that 
      competes with the business of the Company in any jurisdiction where the Company does business.

      3.2 Confidentiality. Employee acknowledges that, during the course of Employee's employment, Employee will have access 
      to confidential information relating to the business of the Company. Employee agrees to maintain the confidentiality of 
      all such information and not to disclose any such information to any third party without the prior written consent of the Company.

      4. TERM AND TERMINATION

      4.1 Term. This Agreement shall commence on the Effective Date and shall continue until terminated in accordance with the 
      provisions of this Agreement.

      4.2 Termination. This Agreement may be terminated at any time by the Company with or without cause, or by Employee with 
      30 days' written notice to the Company.

      5. GENERAL PROVISIONS

      5.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, 
      without giving effect to any choice of law or conflict of law provisions.

      5.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties relating to the subject matter hereof.

      IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.
    `,
    metadata: {
      contentType: 'application/pdf',
      category: 'Employment',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      parentFolder: {
        id: 'folder-test',
        name: 'Test Contracts',
      },
    },
  };
}

/**
 * Diagnostic function to directly check if chunks exist in the database
 */
async function diagnosticDatabaseCheck(documentId: string) {
  try {
    logger.info(`Performing diagnostic database check for document: ${documentId}`);

    const documentIndexer = getDocumentIndexer();
    const table = await documentIndexer.getTable();

    if (!table) {
      logger.error('Could not get table reference');
      return;
    }

    // Try different approaches to find documents
    try {
      logger.info('Checking document existence using search method...');
      // Create a dummy vector for search
      const dummyVector = Array(384).fill(0.1);
      const results = await table.search(dummyVector, 'vector')
        .limit(100)
        .execute();

      // Extract items from results based on format
      let items: any[] = [];

      if (Array.isArray(results)) {
        items = results;
      } else if (results && typeof results === 'object') {
        if (results.data && Array.isArray(results.data)) {
          items = results.data;
        } else if (results.inner && Array.isArray(results.inner)) {
          // Handle new LanceDB result format with inner property
          items = results.inner;
        } else if (results.promisedInner && typeof results.promisedInner === 'object') {
          // Try to extract from promisedInner if available
          try {
            const innerResult = await results.promisedInner;
            if (Array.isArray(innerResult)) {
              items = innerResult;
            } else if (innerResult && Array.isArray(innerResult.inner)) {
              items = innerResult.inner;
            }
          } catch (promiseError) {
            logger.error(`Error resolving promisedInner: ${promiseError}`);
          }
        }
      }

      // Log all document IDs found to help with debugging
      if (items.length > 0) {
        const docIds = new Set();
        items.forEach(r => {
          if (r.doc_id) docIds.add(r.doc_id);
        });

        logger.info(`Found documents with IDs: ${Array.from(docIds).join(', ')}`);

        // Filter results manually to find the specific document
        const docResults = items.filter(r => r.doc_id === documentId);
        logger.info(`Found ${docResults.length} chunks in database for document ID: ${documentId}`);

        // Inspect chunk vectors to ensure they're valid
        if (docResults.length > 0) {
          const firstChunk = docResults[0];
          const vectorSum = firstChunk.vector.reduce((a, b) => a + b, 0);
          logger.info(`First chunk vector sum: ${vectorSum} (should not be 0 or NaN)`);

          // Log a sample of the vector for debugging
          logger.info(`Vector sample: [${firstChunk.vector.slice(0, 5).join(', ')}...]`);
        }
      } else {
        logger.warn('No items found in search results');
      }
    } catch (error) {
      logger.error(`Error checking document existence: ${error}`);
    }

    // Try to count total documents
    try {
      const countResult = await table.countRows();
      logger.info(`Total chunks in database: ${countResult}`);
    } catch (countError) {
      logger.error(`Error counting rows: ${countError}`);
    }
  } catch (error) {
    logger.error('Error in diagnostic database check:', error);
  }
}

/**
 * Test direct vector similarity with explicit filtering
 */
async function testDirectVectorSimilarity(documentId: string, query: string) {
  try {
    logger.info(`Testing direct vector similarity for query: "${query}"`);

    // Clear the embedding cache to ensure fresh embeddings
    clearEmbeddingCache();

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    logger.info(`Generated query embedding with dimension: ${queryEmbedding.length}`);

    // Get database table
    const documentIndexer = getDocumentIndexer();
    const table = await documentIndexer.getTable();

    if (!table) {
      logger.error('Could not get table reference');
      return;
    }

    // Perform direct vector search without filtering
    try {
      logger.info('Performing direct vector search without filtering...');

      const vectorResults = await table.search(queryEmbedding, 'vector')
        .limit(10)  // Increase limit to catch more results
        .execute();

      // Extract items from results based on format
      let items: any[] = [];

      if (Array.isArray(vectorResults)) {
        items = vectorResults;
      } else if (vectorResults && typeof vectorResults === 'object') {
        if (vectorResults.data && Array.isArray(vectorResults.data)) {
          items = vectorResults.data;
        } else if (vectorResults.inner && Array.isArray(vectorResults.inner)) {
          // Handle new LanceDB result format with inner property
          items = vectorResults.inner;
        } else if (vectorResults.promisedInner && typeof vectorResults.promisedInner === 'object') {
          // Try to extract from promisedInner if available
          try {
            const innerResult = await vectorResults.promisedInner;
            if (Array.isArray(innerResult)) {
              items = innerResult;
            } else if (innerResult && Array.isArray(innerResult.inner)) {
              items = innerResult.inner;
            }
          } catch (promiseError) {
            logger.error(`Error resolving promisedInner: ${promiseError}`);
          }
        }
      }

      if (items.length > 0) {
        logger.info(`Found ${items.length} results with direct vector search`);

        // Log detailed information about the top results
        items.slice(0, 3).forEach((result, idx) => {
          logger.info(`Result ${idx + 1}:`);
          logger.info(`- Document ID: ${result.doc_id}`);
          logger.info(`- Score: ${result._distance || 'unknown'}`);
          logger.info(`- Text (snippet): ${result.text?.substring(0, 100)}...`);
        });

        // Now try to directly filter for our document ID after search
        const filteredResults = items.filter(r => String(r.doc_id) === String(documentId));
        logger.info(`After filtering: found ${filteredResults.length} results for document ID ${documentId}`);
      } else {
        logger.info(`Found 0 results with direct vector search`);
      }
    } catch (searchError) {
      logger.error(`Error performing direct vector search: ${searchError}`);
    }
  } catch (error) {
    logger.error('Error in direct vector similarity test:', error);
  }
}

/**
 * Main test function with comprehensive diagnostics
 */
async function testDocumentIndexing() {
  try {
    logger.info('Starting comprehensive document indexing diagnostic test');

    // Initialize the document indexer
    const documentIndexer = getDocumentIndexer();

    // Check for existing table
    if (REBUILD_VECTOR_TABLE) {
      logger.info('Rebuilding vector table from scratch...');
      try {
        // Clear embedding cache
        clearEmbeddingCache();
        logger.info('Embedding cache cleared');

        // Close existing connection
        await documentIndexer.close();
        logger.info('LanceDB connection closed');

        // Use connect directly to drop tables
        const db = await documentIndexer.getDb();

        // Drop existing tables
        const tables = await db.tableNames();
        if (tables.includes('vectors')) {
          logger.info('Dropping existing vectors table');
          await db.dropTable('vectors');
        }

        // Get fresh table list
        const tablesAfterDrop = await db.tableNames();
        if (tablesAfterDrop.includes('document_versions')) {
          logger.info('Dropping existing document_versions table');
          await db.dropTable('document_versions');
        }

        logger.info('Vector table reset successfully');

        // Reinitialize the indexer
        await documentIndexer.initialize();
      } catch (error) {
        logger.error('Error rebuilding vector table:', error);
      }
    } else {
      // Just initialize
      await documentIndexer.initialize();
    }

    // Create mock document with key terms
    const testDoc = createMockDocument();
    const testDocId = testDoc.id;

    logger.info(`Created test document: ${testDocId} - ${testDoc.name}`);
    logger.info(`Test document text length: ${testDoc.text.length} characters`);

    // Force remove any existing test document
    try {
      logger.info(`Removing any existing document with ID: ${testDocId}`);
      await documentIndexer.removeDocumentFromIndex(testDocId);
    } catch (error) {
      logger.info('No existing document to remove or error removing:', error);
    }

    // Diagnostic check before indexing
    await diagnosticDatabaseCheck(testDocId);

    // Index the new document with force flag
    logger.info(`Indexing test document with force flag...`);
    const indexResult = await documentIndexer.indexDocument(testDoc, true);

    if (!indexResult) {
      throw new Error(`Failed to index document ${testDocId}`);
    }

    logger.info(`Successfully indexed document ${testDocId}`);

    // Significant delay to ensure all async operations complete
    logger.info('Waiting for indexing to complete fully...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Diagnostic check after indexing
    await diagnosticDatabaseCheck(testDocId);

    // Define test queries specifically mentioning key terms from the document
    const testQueries = [
      'What are the non-compete terms in section 3.1 of this employment agreement?',
      'What is the base salary amount in section 2.1?',
      'What are the termination conditions in section 4.2?',
      'What does the confidentiality section 3.2 require?',
      'What governing law applies according to section 5.1?',
    ];

    // Test each query with direct vector search first
    for (const query of testQueries) {
      await testDirectVectorSimilarity(testDocId, query);

      // Now try the standard search API
      logger.info(`\nPerforming standard semantic search for: "${query}"`);
      const searchResults = await documentIndexer.searchDocuments(query, {
        limit: 5,
        minScore: 0, // Accept all results
      });

      if (searchResults.length === 0) {
        logger.warn(`No results found for query: "${query}"`);

        // Try a more direct approach
        logger.info('Attempting alternative search approach...');
        try {
          // Get raw table access
          const table = await documentIndexer.getTable();
          if (table) {
            // Create query embedding manually
            const queryEmbedding = await generateEmbedding(query);

            // Direct search on the table
            const directResults = await table.search(queryEmbedding, 'vector')
              .limit(5)
              .execute();

            // Extract items from results based on format
            let items: any[] = [];

            if (Array.isArray(directResults)) {
              items = directResults;
            } else if (directResults && typeof directResults === 'object') {
              if (directResults.data && Array.isArray(directResults.data)) {
                items = directResults.data;
              } else if (directResults.inner && Array.isArray(directResults.inner)) {
                // Handle new LanceDB result format with inner property
                items = directResults.inner;
              } else if (directResults.promisedInner && typeof directResults.promisedInner === 'object') {
                // Try to extract from promisedInner if available
                try {
                  const innerResult = await directResults.promisedInner;
                  if (Array.isArray(innerResult)) {
                    items = innerResult;
                  } else if (innerResult && Array.isArray(innerResult.inner)) {
                    items = innerResult.inner;
                  }
                } catch (promiseError) {
                  logger.error(`Error resolving promisedInner: ${promiseError}`);
                }
              }
            }

            if (items.length > 0) {
              logger.info(`Direct table search found ${items.length} results`);
              logger.info(`First result: ${items[0].text?.substring(0, 100)}...`);
            } else {
              logger.info('Direct table search also found no results');
            }
          }
        } catch (altError) {
          logger.error(`Alternative search approach failed: ${altError}`);
        }
      } else {
        logger.info(`Found ${searchResults.length} results for query: "${query}"`);

        // Display search results
        searchResults.forEach((result, index) => {
          logger.info(`\nResult ${index + 1}:`);
          logger.info(`Document: ${result.documentName} (ID: ${result.documentId})`);
          logger.info(`Relevance Score: ${(1 - result.score).toFixed(4)}`);
          logger.info(`Snippet: "${result.text.length > 100 ? result.text.substring(0, 100) + '...' : result.text}"`);
        });
      }
    }

    logger.info('\nDocument indexing diagnostic test completed');
  } catch (error) {
    logger.error('Error in document indexing test:', error);
  }
}

const indexerInstance = getDocumentIndexer();

if (!indexerInstance.hasOwnProperty('getDb')) {
  Object.defineProperty(indexerInstance, 'getDb', {
    value: async function() {
      try {
        const dbPath = config.lanceDbPath || './lancedb';
        return await lancedb.connect(dbPath);
      } catch (error) {
        logger.error('Error connecting to LanceDB:', error);
        throw error;
      }
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}
// Run the test
testDocumentIndexing();
