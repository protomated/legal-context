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
 * Scheduled Document Indexing Tool
 *
 * This script runs the batch document indexing process on a schedule.
 * It retrieves up to 100 documents from Clio, processes them,
 * and indexes them in LanceDB for semantic search.
 *
 * By default, it runs the indexing process daily at midnight.
 * The schedule can be configured using the INDEXING_SCHEDULE environment variable.
 *
 * Usage: bun run src/tools/scheduled-index.ts
 *
 * Note: This script requires node-cron to be installed:
 * bun add node-cron @types/node-cron
 */

import { logger } from '../logger';
import { runBatchIndexing } from '../documents/batchIndexer';
import { config } from '../config';

// Default schedule: run daily at midnight
const DEFAULT_SCHEDULE = '0 0 * * *';

// Try to import node-cron, but don't fail if it's not installed
let cron: any;
try {
  // Using dynamic import to avoid static dependency
  cron = await import('node-cron');
} catch (error) {
  logger.warn('node-cron is not installed. Running in manual mode only.');
  logger.warn('To enable scheduling, install node-cron: bun add node-cron @types/node-cron');
}

/**
 * Run the batch indexing process once
 */
async function runIndexingProcess() {
  try {
    logger.info('Starting scheduled batch document indexing process');

    // Run the batch indexing process
    const summary = await runBatchIndexing();

    // Print the summary to the console
    console.log('\n' + summary);

    logger.info('Scheduled batch document indexing completed successfully');
    return true;
  } catch (error) {
    logger.error('Scheduled batch document indexing failed:', error);
    console.error('Batch document indexing failed:', error);
    return false;
  }
}

/**
 * Start the scheduled indexing process
 */
async function startScheduledIndexing() {
  // Get the schedule from environment variable or use default
  const schedule = process.env.INDEXING_SCHEDULE || DEFAULT_SCHEDULE;

  if (!cron) {
    logger.warn('Scheduled indexing is not available without node-cron.');
    logger.info('Running indexing process once in manual mode...');
    await runIndexingProcess();
    logger.info('Manual indexing completed. Exiting.');
    return;
  }

  logger.info(`Starting scheduled document indexing with schedule: ${schedule}`);

  // Validate the schedule
  if (!cron.validate(schedule)) {
    logger.error(`Invalid cron schedule: ${schedule}`);
    logger.info('Using default schedule instead: ' + DEFAULT_SCHEDULE);
    cron.schedule(DEFAULT_SCHEDULE, runIndexingProcess);
  } else {
    cron.schedule(schedule, runIndexingProcess);
  }

  // Run immediately on startup if requested
  if (process.env.RUN_ON_STARTUP === 'true') {
    logger.info('Running initial indexing process on startup...');
    await runIndexingProcess();
  }

  logger.info('Scheduled indexing service is running. Press Ctrl+C to stop.');
}

// Check if this script is being run directly
if (import.meta.url === Bun.main) {
  // Handle process termination gracefully
  process.on('SIGINT', () => {
    logger.info('Scheduled indexing service stopped by user');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Scheduled indexing service terminated');
    process.exit(0);
  });

  // Start the scheduled indexing
  startScheduledIndexing().catch(error => {
    logger.error('Unhandled error in scheduled indexing:', error);
    process.exit(1);
  });
}

// Export for programmatic usage
export { runIndexingProcess, startScheduledIndexing };
