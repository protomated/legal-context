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
 * Rebuild Index Tool
 *
 * This script completely resets and rebuilds the document index
 * from scratch. It's useful for fixing corruption or compatibility issues.
 */

import { logger } from '../logger';
import { getDocumentIndexer } from '../documents/documentIndexer';
import { runBatchIndexing } from '../documents/batchIndexer';
import * as fs from 'fs';

async function rebuildIndex() {
  try {
    logger.info('Starting complete index rebuild');

    // Get the document indexer
    const documentIndexer = getDocumentIndexer();

    // Reset the document indexer
    logger.info('Resetting document indexer - this will delete all indexed data');
    const resetResult = await documentIndexer.reset();

    if (!resetResult) {
      throw new Error('Failed to reset document indexer');
    }

    // Delete indexed_documents.json tracking file
    const indexedDocsPath = './indexed_documents.json';
    if (fs.existsSync(indexedDocsPath)) {
      logger.info('Deleting indexed_documents.json tracking file');
      fs.unlinkSync(indexedDocsPath);
    }

    // Create empty indexed_documents.json file
    logger.info('Creating new empty indexed_documents.json tracking file');
    fs.writeFileSync(indexedDocsPath, JSON.stringify({
      documentIds: [],
      lastUpdated: new Date().toISOString(),
    }, null, 2));

    // Run batch indexing to rebuild the index
    logger.info('Running batch indexing to rebuild the index');
    const indexingResult = await runBatchIndexing();

    logger.info('Index rebuild complete');
    console.log('\nIndex Rebuild Summary:');
    console.log(indexingResult);

    return {
      success: true,
      message: 'Index rebuilt successfully',
    };
  } catch (error) {
    logger.error('Error rebuilding index:', error);
    return {
      success: false,
      message: `Failed to rebuild index: ${error}`,
    };
  }
}

// Run if executed directly
if (import.meta.url === Bun.main) {
  console.log('\nDocument Index Rebuild Tool');
  console.log('=========================');
  console.log('Warning: This will delete and rebuild the entire document index!');
  console.log('Make sure you have backups of any important data before proceeding.\n');

  // Ask for confirmation
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Are you sure you want to proceed? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\nProceeding with index rebuild...\n');
      const result = await rebuildIndex();

      if (result.success) {
        console.log('\nIndex rebuild completed successfully!');
      } else {
        console.error('\nIndex rebuild failed:', result.message);
        process.exit(1);
      }
    } else {
      console.log('\nIndex rebuild cancelled.');
    }

    rl.close();
    process.exit(0);
  });
}

// Export for programmatic usage
export { rebuildIndex };