/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Batch Document Indexing Module
 *
 * This module implements a batch indexing workflow for Clio documents.
 * It retrieves documents from Clio, processes them, and indexes them in LanceDB.
 * The process is limited to the first 100 documents to respect free tier limitations.
 */

import { logger } from '../logger';
import { getClioApiClient } from '../clio';
import { processDocument } from './documentProcessor';
import { getDocumentIndexer } from './documentIndexer';
import { config } from '../config';

// Maximum number of documents to process in a batch
export const MAX_DOCUMENTS = 100;

/**
 * Interface for batch indexing results
 */
export interface BatchIndexingResult {
  totalDocuments: number;
  processedDocuments: number;
  successfulDocuments: number;
  failedDocuments: number;
  errors: Array<{ documentId: string; error: string }>;
  startTime: Date;
  endTime: Date;
  durationMs: number;
}

/**
 * Main function to perform batch indexing of Clio documents
 * Retrieves documents from Clio, processes them, and indexes them in LanceDB
 * Enforces the document volume limit (MAX_DOCUMENTS)
 */
export async function batchIndexDocuments(): Promise<BatchIndexingResult> {
  const startTime = new Date();
  logger.info(`Starting batch document indexing process at ${startTime.toISOString()}`);

  // Initialize result object
  const result: BatchIndexingResult = {
    totalDocuments: 0,
    processedDocuments: 0,
    successfulDocuments: 0,
    failedDocuments: 0,
    errors: [],
    startTime,
    endTime: new Date(),
    durationMs: 0
  };

  try {
    // Get the Clio API client
    const clioApiClient = getClioApiClient();

    // Check if Clio API client is initialized
    if (!await clioApiClient.initialize()) {
      throw new Error("Clio API client not initialized. Authentication required.");
    }

    // Get the document indexer
    const documentIndexer = getDocumentIndexer();

    // Initialize the document indexer if needed
    if (!documentIndexer.isInitialized()) {
      logger.info("Initializing document indexer");
      await documentIndexer.initialize();
    }

    // Get current document count from the index
    const indexStats = await documentIndexer.getIndexStats();
    const currentDocumentCount = indexStats.documentCount;
    logger.info(`Current document count in index: ${currentDocumentCount}/${MAX_DOCUMENTS}`);

    // Check if we've already reached the document limit
    if (currentDocumentCount >= MAX_DOCUMENTS) {
      logger.warn(`Document limit (${MAX_DOCUMENTS}) already reached. No new documents will be indexed.`);
      result.totalDocuments = 0;
      return result;
    }

    // Calculate how many more documents we can index
    const remainingCapacity = MAX_DOCUMENTS - currentDocumentCount;
    logger.info(`Remaining document capacity: ${remainingCapacity}`);

    // Retrieve documents from Clio (first page with remaining capacity)
    logger.info(`Retrieving up to ${remainingCapacity} documents from Clio`);
    const documentsResponse = await clioApiClient.listDocuments(1, remainingCapacity);
    const documents = documentsResponse.data;

    result.totalDocuments = documents.length;
    logger.info(`Retrieved ${documents.length} documents from Clio`);

    // Process each document
    for (const document of documents) {
      try {
        // Check if we've reached the document limit before processing each document
        const currentStats = await documentIndexer.getIndexStats();
        if (currentStats.documentCount >= MAX_DOCUMENTS) {
          logger.warn(`Document limit (${MAX_DOCUMENTS}) reached. Stopping indexing process.`);
          break;
        }

        logger.info(`Processing document ${result.processedDocuments + 1}/${documents.length}: ${document.id} - ${document.name}`);

        // Process the document (download, extract text)
        const processedDocument = await processDocument(document.id);

        // Index the document (chunk, embed, store)
        const indexed = await documentIndexer.indexDocument(processedDocument);

        if (indexed) {
          result.successfulDocuments++;
          logger.info(`Successfully indexed document: ${document.id} - ${document.name}`);
        } else {
          result.failedDocuments++;
          const errorMessage = `Failed to index document: ${document.id} - ${document.name}`;
          result.errors.push({ documentId: document.id, error: errorMessage });
          logger.error(errorMessage);
        }
      } catch (error) {
        result.failedDocuments++;
        const errorMessage = `Error processing document ${document.id}: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push({ documentId: document.id, error: errorMessage });
        logger.error(errorMessage);
      }

      result.processedDocuments++;
    }

    // Get index statistics
    const indexStats = await documentIndexer.getIndexStats();
    logger.info(`Document index now contains ${indexStats.documentCount} documents with ${indexStats.chunkCount} chunks`);

    // Check if we've reached the document limit
    if (indexStats.documentCount >= MAX_DOCUMENTS) {
      logger.warn(`Document limit (${MAX_DOCUMENTS}) has been reached. No more documents will be indexed until some are removed.`);
    } else {
      logger.info(`Document capacity remaining: ${MAX_DOCUMENTS - indexStats.documentCount} of ${MAX_DOCUMENTS}`);
    }

  } catch (error) {
    const errorMessage = `Batch indexing process failed: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(errorMessage);
    result.errors.push({ documentId: 'batch', error: errorMessage });
  }

  // Calculate duration and set end time
  const endTime = new Date();
  result.endTime = endTime;
  result.durationMs = endTime.getTime() - startTime.getTime();

  // Log summary
  logger.info(`Batch indexing completed in ${result.durationMs / 1000} seconds`);
  logger.info(`Documents processed: ${result.processedDocuments}/${result.totalDocuments}`);
  logger.info(`Documents successfully indexed: ${result.successfulDocuments}`);
  logger.info(`Documents failed: ${result.failedDocuments}`);

  return result;
}

/**
 * Run the batch indexing process and return a formatted summary
 * This function is designed to be called from a script or scheduler
 */
export async function runBatchIndexing(): Promise<string> {
  try {
    const result = await batchIndexDocuments();

    // Get current document count from the index
    const documentIndexer = getDocumentIndexer();
    const indexStats = await documentIndexer.getIndexStats();
    const currentDocumentCount = indexStats.documentCount;

    // Format a summary for display/logging
    const summary = [
      `Batch Document Indexing Summary:`,
      `------------------------------`,
      `Start time: ${result.startTime.toISOString()}`,
      `End time: ${result.endTime.toISOString()}`,
      `Duration: ${(result.durationMs / 1000).toFixed(2)} seconds`,
      ``,
      `Documents:`,
      `  Total retrieved: ${result.totalDocuments}`,
      `  Successfully processed: ${result.successfulDocuments}`,
      `  Failed: ${result.failedDocuments}`,
      ``,
      `Document Limit Status:`,
      `  Current document count: ${currentDocumentCount}/${MAX_DOCUMENTS}`,
      `  Remaining capacity: ${Math.max(0, MAX_DOCUMENTS - currentDocumentCount)}`,
      `  Limit reached: ${currentDocumentCount >= MAX_DOCUMENTS ? 'Yes' : 'No'}`,
      ``
    ];

    if (result.errors.length > 0) {
      summary.push(`Errors:`);
      result.errors.forEach(err => {
        summary.push(`  - Document ${err.documentId}: ${err.error}`);
      });
    }

    return summary.join('\n');
  } catch (error) {
    return `Failed to run batch indexing: ${error instanceof Error ? error.message : String(error)}`;
  }
}
