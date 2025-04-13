/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: ask@protomated.com
 * Website: protomated.com
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
import { ClioDocument, getClioApiClient, isProcessableDocument } from '../clio';
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
    durationMs: 0,
  };

  try {
    // Get the Clio API client
    const clioApiClient = getClioApiClient();

    // Check if Clio API client is initialized
    if (!await clioApiClient.initialize()) {
      throw new Error('Clio API client not initialized. Authentication required.');
    }

    // Get the document indexer
    const documentIndexer = getDocumentIndexer();

    // Initialize the document indexer if needed
    if (!documentIndexer.isInitialized()) {
      logger.info('Initializing document indexer');
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
    // Retrieve documents from Clio (first page with remaining capacity)
    logger.info(`Retrieving up to ${remainingCapacity} documents from Clio`);
    const documentsResponse = await clioApiClient.listDocuments(1, remainingCapacity);
    const allDocuments = documentsResponse.data;

// Log raw document data to help debug
    logger.debug(`Retrieved ${allDocuments.length} raw documents from Clio`);
    if (allDocuments.length > 0) {
      logger.debug(`Sample document: ${JSON.stringify(allDocuments[0], null, 2)}`);
    }

// Filter out documents that are not processable
    const documents = allDocuments.filter(doc => isProcessableDocument(doc));

    result.totalDocuments = allDocuments.length;
    const skippedDocuments = allDocuments.length - documents.length;
    if (skippedDocuments > 0) {
      logger.info(`Retrieved ${allDocuments.length} documents from Clio, filtered out ${skippedDocuments} non-processable documents`);
    } else {
      logger.info(`Retrieved ${documents.length} documents from Clio`);
    }

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

        try {
          // Process the document (download, extract text)
          logger.debug(`Fetching and extracting content for document: ${document.id}`);
          const processedDocument = await processDocument(document.id);

          // Check if the document has content
          if (!processedDocument.text || processedDocument.text.trim().length === 0) {
            logger.warn(`Document ${document.id} has no text content to index`);
            result.failedDocuments++;
            result.errors.push({
              documentId: document.id,
              error: `Document has no text content to index: ${document.name}`,
            });
            result.processedDocuments++;
            continue;
          }

          // Log document content size
          logger.debug(`Document ${document.id} has ${processedDocument.text.length} characters of text content`);

          // Index the document (chunk, embed, store)
          logger.debug(`Indexing document: ${document.id}`);
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
        } catch (processingError) {
          // Handle errors during document processing
          result.failedDocuments++;

          // Create a descriptive error message based on the error type
          let errorMessage: string;

          if (processingError instanceof Error) {
            // If it's a standard error, use its message
            errorMessage = `Error processing document ${document.id} (${document.name}): ${processingError.message}`;

            // Add stack trace to debug log
            logger.debug(`Stack trace for document ${document.id} error:`, processingError.stack);
          } else {
            // For other error types
            errorMessage = `Error processing document ${document.id} (${document.name}): ${String(processingError)}`;
          }

          // Record the error in the results
          result.errors.push({ documentId: document.id, error: errorMessage });
          logger.error(errorMessage);

          // Log document metadata for debugging
          try {
            logger.debug(`Document metadata: ${JSON.stringify({
              id: document.id,
              name: document.name,
              content_type: document.content_type,
              size: document.size,
              created_at: document.created_at,
              updated_at: document.updated_at,
            })}`);
          } catch (metadataError) {
            logger.debug(`Could not log document metadata: ${String(metadataError)}`);
          }
        }
      } catch (outerError) {
        // Handle errors in the outer loop (should be rare)
        result.failedDocuments++;
        const errorMessage = `Unexpected error while processing document batch: ${outerError instanceof Error ? outerError.message : String(outerError)}`;
        result.errors.push({ documentId: document.id, error: errorMessage });
        logger.error(errorMessage);
      }

      result.processedDocuments++;
    }

    // Get final index statistics
    const finalIndexStats = await documentIndexer.getIndexStats();
    logger.info(`Document index now contains ${finalIndexStats.documentCount} documents with ${finalIndexStats.chunkCount} chunks`);

    // Check if we've reached the document limit
    if (finalIndexStats.documentCount >= MAX_DOCUMENTS) {
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

    // Use the successful documents count from our result as a fallback
    // if the database query doesn't return the correct count
    const currentDocumentCount = indexStats.documentCount > 0 ?
      indexStats.documentCount : result.successfulDocuments;

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
      ``,
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

