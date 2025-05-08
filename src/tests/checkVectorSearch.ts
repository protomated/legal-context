// Path: src/tests/checkVectorSearch.ts

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
 * Simple Vector Search Testing Tool
 *
 * This script directly tests the LanceDB vector search functionality
 * with raw vectors to help diagnose search issues.
 */

import { getDocumentIndexer } from '../documents/documentIndexer';
import { generateEmbedding } from '../documents/embeddings';
import { logger } from '../logger';
import * as lancedb from '@lancedb/lancedb';
import { config } from '../config';
import { getLegalContextFilePath } from '../utils/paths';

async function testVectorSearch() {
  try {
    logger.info('=======================================');
    logger.info('Starting direct vector search test');
    logger.info('=======================================');

    // Try to connect directly to LanceDB
    const dbPath = config.lanceDbPath || getLegalContextFilePath('lancedb');
    logger.info(`Connecting directly to LanceDB at ${dbPath}`);
    const db = await lancedb.connect(dbPath);

    // List tables
    const tables = await db.tableNames();
    logger.info(`Tables in database: ${tables.join(', ')}`);

    // Check if vectors table exists
    if (!tables.includes('vectors')) {
      logger.error('No vectors table found in database');
      return;
    }

    // Open the vectors table
    logger.info('Opening vectors table');
    const table = await db.openTable('vectors');

    // Count rows
    const countResult = await table.countRows();
    const rowCount = typeof countResult === 'number' ? countResult :
      (countResult && countResult.count ? countResult.count : 0);
    logger.info(`Table contains ${rowCount} rows`);

    // Sample query text
    const queryText = "What are the non-compete terms in this agreement?";
    logger.info(`Generating embedding for query: "${queryText}"`);

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(queryText);
    logger.info(`Generated query embedding with dimension: ${queryEmbedding.length}`);

    // Directly perform vector search
    logger.info('Performing direct vector search (no filtering)');
    const searchResults = await table.search(queryEmbedding, 'vector')
      .limit(10)
      .execute();

    // Log detailed result information
    logger.info(`Search results type: ${typeof searchResults}`);
    logger.info(`Search results stringified: ${JSON.stringify(searchResults).substring(0, 200)}...`);

    // Try to directly access the promisedInner property using .then()
    if (searchResults && typeof searchResults === 'object' && searchResults.promisedInner) {
      logger.info('Found promisedInner property, trying to resolve it directly');

      // Use .then() to handle the promise
      searchResults.promisedInner.then((innerResult: any) => {
        logger.info(`PromisedInner resolved, type: ${typeof innerResult}`);
        logger.info(`PromisedInner keys: ${innerResult ? Object.keys(innerResult).join(', ') : 'null'}`);

        let items: any[] = [];

        if (Array.isArray(innerResult)) {
          items = innerResult;
          logger.info(`Retrieved ${items.length} results (promisedInner array)`);
        } else if (innerResult && innerResult.inner && Array.isArray(innerResult.inner)) {
          items = innerResult.inner;
          logger.info(`Retrieved ${items.length} results (promisedInner.inner)`);
        } else if (innerResult && innerResult.data && Array.isArray(innerResult.data)) {
          items = innerResult.data;
          logger.info(`Retrieved ${items.length} results (promisedInner.data)`);
        }

        if (items.length > 0) {
          logger.info('Result sample:');
          console.log(JSON.stringify(items[0], null, 2));
        } else {
          logger.info('No items found in promisedInner');
        }
      }).catch((error: any) => {
        logger.error(`Error resolving promisedInner with .then(): ${error}`);
      });

      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Extract items from results based on format (fallback approach)
    let items: any[] = [];

    if (Array.isArray(searchResults)) {
      items = searchResults;
      logger.info(`Retrieved ${items.length} results (array)`);
    } else if (searchResults && typeof searchResults === 'object') {
      if (searchResults.data && Array.isArray(searchResults.data)) {
        items = searchResults.data;
        logger.info(`Retrieved ${items.length} results (data property)`);
      } else if (searchResults.inner && Array.isArray(searchResults.inner)) {
        // Handle new LanceDB result format with inner property
        items = searchResults.inner;
        logger.info(`Retrieved ${items.length} results (inner property)`);
      }
    }

    // Log a sample result if available
    if (items.length > 0) {
      logger.info('Result sample (fallback approach):');
      console.log(JSON.stringify(items[0], null, 2));
    } else {
      logger.info('No results found in search (fallback approach)');
    }

    // Try a full scan of the table (skip vector similarity)
    logger.info('Performing full table scan');
    let fullScanResults;
    try {
      fullScanResults = await table.query().execute();

      // Extract items from results based on format
      let items: any[] = [];

      if (Array.isArray(fullScanResults)) {
        items = fullScanResults;
        logger.info(`Full scan returned ${items.length} rows (array)`);
      } else if (fullScanResults && typeof fullScanResults === 'object') {
        logger.info(`Full scan result type: ${typeof fullScanResults}`);
        logger.info(`Full scan result keys: ${Object.keys(fullScanResults).join(', ')}`);

        if (fullScanResults.data && Array.isArray(fullScanResults.data)) {
          items = fullScanResults.data;
          logger.info(`Full scan returned ${items.length} rows (data property)`);
        } else if (fullScanResults.inner && Array.isArray(fullScanResults.inner)) {
          // Handle new LanceDB result format with inner property
          items = fullScanResults.inner;
          logger.info(`Full scan returned ${items.length} rows (inner property)`);
        } else if (fullScanResults.promisedInner && typeof fullScanResults.promisedInner === 'object') {
          // Try to extract from promisedInner if available
          try {
            const innerResult = await fullScanResults.promisedInner;
            if (Array.isArray(innerResult)) {
              items = innerResult;
              logger.info(`Full scan returned ${items.length} rows (promisedInner array)`);
            } else if (innerResult && Array.isArray(innerResult.inner)) {
              items = innerResult.inner;
              logger.info(`Full scan returned ${items.length} rows (promisedInner.inner)`);
            }
          } catch (promiseError) {
            logger.error(`Error resolving promisedInner: ${promiseError}`);
          }
        }
      }

      // Process the extracted items
      if (items.length > 0) {
        const docIds = new Set<string>();
        items.forEach(r => {
          if (r.doc_id) docIds.add(String(r.doc_id));
        });

        logger.info(`Documents in table: ${Array.from(docIds).join(', ')}`);
        logger.info('First row sample:');
        console.log(JSON.stringify(items[0], null, 2));
      } else {
        logger.info('No rows found in full table scan');
      }

      // Try a more direct approach using a dummy vector with all 1s
      logger.info('Trying alternative search with dummy vector of all 1s');
      const dummyVector = Array(384).fill(1);
      const altResults = await table.search(dummyVector, 'vector')
        .limit(100)  // Increase limit to catch more results
        .execute();

      // Extract items from results
      let altItems: any[] = [];
      if (Array.isArray(altResults)) {
        altItems = altResults;
      } else if (altResults && typeof altResults === 'object') {
        if (altResults.data && Array.isArray(altResults.data)) {
          altItems = altResults.data;
        } else if (altResults.inner && Array.isArray(altResults.inner)) {
          altItems = altResults.inner;
        } else if (altResults.promisedInner && typeof altResults.promisedInner === 'object') {
          try {
            const innerResult = await altResults.promisedInner;
            if (Array.isArray(innerResult)) {
              altItems = innerResult;
            } else if (innerResult && Array.isArray(innerResult.inner)) {
              altItems = innerResult.inner;
            }
          } catch (promiseError) {
            logger.error(`Error resolving promisedInner: ${promiseError}`);
          }
        }
      }

      if (altItems.length > 0) {
        logger.info(`Alternative search found ${altItems.length} results`);
        logger.info('First result:');
        console.log(JSON.stringify(altItems[0], null, 2));
      } else {
        logger.info('Alternative search found no results');
      }

      // Try a direct SQL-like query
      logger.info('Trying SQL-like query');
      try {
        const sqlResults = await table.query("SELECT * FROM vectors LIMIT 10").execute();

        // Extract items from results
        let sqlItems: any[] = [];
        if (Array.isArray(sqlResults)) {
          sqlItems = sqlResults;
        } else if (sqlResults && typeof sqlResults === 'object') {
          if (sqlResults.data && Array.isArray(sqlResults.data)) {
            sqlItems = sqlResults.data;
          } else if (sqlResults.inner && Array.isArray(sqlResults.inner)) {
            sqlItems = sqlResults.inner;
          } else if (sqlResults.promisedInner && typeof sqlResults.promisedInner === 'object') {
            try {
              const innerResult = await sqlResults.promisedInner;
              if (Array.isArray(innerResult)) {
                sqlItems = innerResult;
              } else if (innerResult && Array.isArray(innerResult.inner)) {
                sqlItems = innerResult.inner;
              }
            } catch (promiseError) {
              logger.error(`Error resolving promisedInner: ${promiseError}`);
            }
          }
        }

        if (sqlItems.length > 0) {
          logger.info(`SQL query found ${sqlItems.length} results`);
          logger.info('First result:');
          console.log(JSON.stringify(sqlItems[0], null, 2));
        } else {
          logger.info('SQL query found no results');
        }
      } catch (sqlError) {
        logger.error(`Error executing SQL query: ${sqlError}`);
      }
    } catch (scanError) {
      logger.error(`Error during full table scan: ${scanError}`);
    }

    logger.info('=======================================');
    logger.info('Vector search test complete');
    logger.info('=======================================');
  } catch (error) {
    logger.error('Error during vector search test:', error);
  }
}

// Run the test
testVectorSearch();
