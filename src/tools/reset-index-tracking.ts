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
 * Reset Index Tracking Tool
 *
 * This script resets the indexed_documents.json file to force the system
 * to reindex documents on the next batch indexing run.
 */

import { logger } from '../logger';
import * as fs from 'fs';

function resetIndexTracking() {
  try {
    logger.info('Starting reset of index tracking');

    const indexedDocsPath = './indexed_documents.json';

    // Backup existing file if it exists
    if (fs.existsSync(indexedDocsPath)) {
      const backupPath = `${indexedDocsPath}.bak.${Date.now()}`;
      fs.copyFileSync(indexedDocsPath, backupPath);
      logger.info(`Created backup of existing index tracking file at ${backupPath}`);

      // Read the current file for information
      const currentContent = fs.readFileSync(indexedDocsPath, 'utf8');
      try {
        const current = JSON.parse(currentContent);
        logger.info(`Current indexed_documents.json contains ${current.documentIds?.length || 0} document IDs`);
        logger.info(`Last updated: ${current.lastUpdated || 'unknown'}`);
      } catch (parseError) {
        logger.error(`Error parsing current file: ${parseError}`);
      }
    } else {
      logger.info('No existing indexed_documents.json file found');
    }

    // Create empty index tracking file
    const emptyContent = {
      documentIds: [],
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(indexedDocsPath, JSON.stringify(emptyContent, null, 2));
    logger.info('Reset index tracking file to empty state');

    return {
      status: 'success',
      message: 'Index tracking reset successfully'
    };
  } catch (error) {
    logger.error('Error resetting index tracking:', error);
    throw error;
  }
}

// Run the reset and handle any errors
resetIndexTracking()
  .then(result => {
    console.log(`
Index Tracking Reset Summary:
--------------------------
Status: ${result.status}
Message: ${result.message}
Timestamp: ${new Date().toISOString()}

Next steps:
1. Run 'bun run index:batch' to reindex all documents
2. If problems persist, run 'bun run src/tools/debug-batch-index.ts' for more detailed diagnostics
`);
  })
  .catch(error => {
    console.error('Failed to reset index tracking:', error);
    process.exit(1);
  });