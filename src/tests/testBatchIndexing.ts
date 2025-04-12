/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Test Script for Batch Document Indexing
 *
 * This script tests the batch document indexing functionality.
 * It verifies that the batch indexing process can retrieve documents from Clio,
 * process them, and index them in LanceDB.
 */

import { logger } from '../logger';
import { getClioApiClient } from '../clio';
import { getDocumentIndexer } from '../documents/documentIndexer';
import { batchIndexDocuments, MAX_DOCUMENTS } from '../documents/batchIndexer';

/**
 * Main test function
 */
async function testBatchIndexing(): Promise<void> {
  logger.info('Starting batch indexing test');

  try {
    // Initialize Clio API client
    logger.info('Initializing Clio API client');
    const clioApiClient = getClioApiClient();

    if (!await clioApiClient.initialize()) {
      logger.error('Failed to initialize Clio API client. Authentication required.');
      process.exit(1);
    }

    // Initialize document indexer
    logger.info('Initializing document indexer');
    const documentIndexer = getDocumentIndexer();

    if (!await documentIndexer.initialize()) {
      logger.error('Failed to initialize document indexer');
      process.exit(1);
    }

    // Check if there are documents available in Clio
    logger.info('Checking for documents in Clio');
    const documentsResponse = await clioApiClient.listDocuments(1, 1);

    if (documentsResponse.data.length === 0) {
      logger.warn('No documents found in Clio. Test cannot proceed.');
      logger.info('Please add at least one document to Clio and try again.');
      process.exit(0);
    }

    // Run the batch indexing process
    logger.info(`Running batch indexing process (max ${MAX_DOCUMENTS} documents)`);
    const result = await batchIndexDocuments();

    // Log the results
    logger.info('Batch indexing completed with the following results:');
    logger.info(`Total documents: ${result.totalDocuments}`);
    logger.info(`Successfully processed: ${result.successfulDocuments}`);
    logger.info(`Failed: ${result.failedDocuments}`);
    logger.info(`Duration: ${result.durationMs / 1000} seconds`);

    if (result.errors.length > 0) {
      logger.warn(`Encountered ${result.errors.length} errors during indexing:`);
      result.errors.forEach((err, index) => {
        logger.warn(`  ${index + 1}. Document ${err.documentId}: ${err.error}`);
      });
    }

    // Verify that documents were indexed
    const indexStats = await documentIndexer.getIndexStats();
    logger.info(`Document index now contains ${indexStats.documentCount} documents with ${indexStats.chunkCount} chunks`);

    if (indexStats.documentCount > 0) {
      logger.info('Test passed: Documents were successfully indexed');
    } else {
      logger.error('Test failed: No documents were indexed');
      process.exit(1);
    }

    logger.info('Batch indexing test completed successfully');
  } catch (error) {
    logger.error('Batch indexing test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === Bun.main) {
  testBatchIndexing().catch(error => {
    logger.error('Unhandled error in batch indexing test:', error);
    process.exit(1);
  });
}

// Export for programmatic usage
export { testBatchIndexing };
