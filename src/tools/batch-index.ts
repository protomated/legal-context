/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Batch Document Indexing Tool
 *
 * This script runs the batch document indexing process.
 * It retrieves up to 100 documents from Clio, processes them,
 * and indexes them in LanceDB for semantic search.
 *
 * Usage: bun run src/tools/batch-index.ts
 */

import { logger } from '../logger';
import { runBatchIndexing } from '../documents/batchIndexer';

async function main() {
  try {
    logger.info('Starting batch document indexing tool');

    // Run the batch indexing process
    const summary = await runBatchIndexing();

    // Print the summary to the console
    console.log('\n' + summary);

    logger.info('Batch document indexing tool completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Batch document indexing tool failed:', error);
    console.error('Batch document indexing failed:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error in batch indexing tool:', error);
  console.error('Unhandled error:', error);
  process.exit(1);
});
