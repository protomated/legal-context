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
import { ClioDocument, isProcessableDocument } from '../clio';
import { config } from '../config';
import * as path from 'path';
import * as fs from 'fs';

// Maximum number of documents to process in a batch
export const MAX_DOCUMENTS = 100;

// Path to store the list of indexed documents
const INDEXED_DOCS_PATH = path.join(process.cwd(), 'indexed_documents.json');

/**
 * Interface for batch indexing results
 */
export interface BatchIndexingResult {
  totalDocuments: number;
  processedDocuments: number;
  successfulDocuments: number;
  failedDocuments: number;
  skippedDocuments: number; // Added to track skipped documents
  errors: Array<{ documentId: string; error: string }>;
  startTime: Date;
  endTime: Date;
  durationMs: number;
}

/**
 * Load previously indexed document IDs
 */
async function loadIndexedDocumentIds(): Promise<Set<string>> {
  try {
    if (fs.existsSync(INDEXED_DOCS_PATH)) {
      const data = await Bun.file(INDEXED_DOCS_PATH).text();
      const parsed = JSON.parse(data);
      const ids = new Set(parsed.documentIds || []);
      logger.info(`Loaded ${ids.size} previously indexed document IDs`);
      return ids;
    }
  } catch (error) {
    logger.warn(`Error loading indexed document IDs: ${error}`);
  }

  logger.info('No previously indexed documents found or error loading them');
  return new Set();
}

/**
 * Save the list of indexed document IDs
 */
async function saveIndexedDocumentIds(documentIds: Set<string>): Promise<void> {
  try {
    const saveData = {
      documentIds: Array.from(documentIds),
      lastUpdated: new Date().toISOString(),
    };

    await Bun.write(INDEXED_DOCS_PATH, JSON.stringify(saveData, null, 2));
    logger.info(`Saved ${documentIds.size} indexed document IDs to tracking file`);
  } catch (error) {
    logger.error(`Error saving indexed document IDs: ${error}`);
  }
}

/**
 * Add document IDs to the tracking list and save
 */
async function updateIndexedDocumentsList(newDocumentIds: string[]): Promise<void> {
  try {
    // Load existing indexed document IDs
    const indexedDocIds = await loadIndexedDocumentIds();

    // Add new document IDs
    newDocumentIds.forEach(id => indexedDocIds.add(id));

    // Save the updated set
    await saveIndexedDocumentIds(indexedDocIds);
  } catch (error) {
    logger.error(`Error updating indexed documents list: ${error}`);
  }
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
    skippedDocuments: 0, // Initialize skipped documents counter
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
    if (!documentIndexer.isInitialized) {
      await documentIndexer.initialize();
    }

    // Load previously indexed document IDs
    const indexedDocIds = await loadIndexedDocumentIds();
    logger.info(`Loaded ${indexedDocIds.size} previously indexed document IDs`);

    // Retrieve documents from Clio
    logger.info(`Retrieving documents from Clio (limit: ${MAX_DOCUMENTS})`);
    const documentsResponse = await clioApiClient.listDocuments(1, MAX_DOCUMENTS);

    // Filter out documents that are not processable
    const allDocuments = documentsResponse.data || [];
    result.totalDocuments = allDocuments.length;

    const processableDocuments = allDocuments.filter(doc => isProcessableDocument(doc));
    logger.info(`Found ${processableDocuments.length} processable documents out of ${allDocuments.length} total documents`);

    // Track successfully indexed document IDs
    const successfulDocumentIds: string[] = [];

    // Process each document, but skip already indexed ones
    for (const document of processableDocuments) {
      // Skip already indexed documents
      if (indexedDocIds.has(document.id)) {
        logger.debug(`Skipping already indexed document: ${document.id} - ${document.name || 'No name'}`);
        result.skippedDocuments++;
        continue;
      }

      result.processedDocuments++;

      try {
        // Get the full document details
        logger.debug(`Getting full details for document ${document.id}`);
        const fullDocumentResponse = await clioApiClient.getDocument(document.id);
        const fullDocument = fullDocumentResponse.data;

        // Process and index the document
        logger.info(`Processing document: ${fullDocument.id} - ${fullDocument.name || 'No name'}`);
        const processedDocument = await processDocument(fullDocument.id);

        // Index the document
        logger.info(`Indexing document: ${processedDocument.id} - ${processedDocument.name}`);
        const indexed = await documentIndexer.indexDocument(processedDocument);

        // Track the result
        if (indexed) {
          result.successfulDocuments++;
          successfulDocumentIds.push(fullDocument.id);
          logger.info(`Successfully indexed document: ${fullDocument.id} - ${fullDocument.name || 'No name'}`);
        } else {
          result.failedDocuments++;
          result.errors.push({
            documentId: fullDocument.id,
            error: 'Indexing failed for unknown reason',
          });
          logger.error(`Failed to index document: ${fullDocument.id} - ${fullDocument.name || 'No name'}`);
        }
      } catch (docError) {
        result.failedDocuments++;
        result.errors.push({
          documentId: document.id,
          error: docError instanceof Error ? docError.message : String(docError),
        });
        logger.error(`Error processing document ${document.id}: ${docError}`);
      }

      // Enforce document limits for free tier
      if (result.processedDocuments >= MAX_DOCUMENTS) {
        logger.info(`Reached maximum document limit (${MAX_DOCUMENTS}). Stopping batch process.`);
        break;
      }
    }

    // Update the list of indexed documents with the new successfully indexed ones
    if (successfulDocumentIds.length > 0) {
      await updateIndexedDocumentsList(successfulDocumentIds);
    }

    // Calculate final statistics
    result.endTime = new Date();
    result.durationMs = result.endTime.getTime() - result.startTime.getTime();

    logger.info(`Batch document indexing completed in ${result.durationMs / 1000} seconds`);
    logger.info(`Total documents: ${result.totalDocuments}, Processed: ${result.processedDocuments}, Successful: ${result.successfulDocuments}, Failed: ${result.failedDocuments}, Skipped: ${result.skippedDocuments}`);

    if (result.errors.length > 0) {
      logger.warn(`Encountered ${result.errors.length} errors during indexing`);
    }

    return result;
  } catch (error) {
    result.endTime = new Date();
    result.durationMs = result.endTime.getTime() - result.startTime.getTime();

    logger.error('Error during batch document indexing:', error);

    result.errors.push({
      documentId: 'batch_process',
      error: error instanceof Error ? error.message : String(error),
    });

    return result;
  }
}

/**
 * Check if there are new documents to index
 */
export async function checkForNewDocuments(): Promise<{ hasNew: boolean, newCount: number, totalCount: number }> {
  try {
    // Get the Clio API client
    const clioApiClient = getClioApiClient();

    // Check if Clio API client is initialized
    if (!await clioApiClient.initialize()) {
      throw new Error('Clio API client not initialized. Authentication required.');
    }

    // Load previously indexed document IDs
    const indexedDocIds = await loadIndexedDocumentIds();

    // Convert to strings to ensure consistent comparison
    const indexedIdsAsStrings = new Set(Array.from(indexedDocIds).map(String));

    // Retrieve documents from Clio
    logger.info(`Checking for new documents in Clio`);
    const documentsResponse = await clioApiClient.listDocuments(1, MAX_DOCUMENTS);

    // Log total documents for debugging
    logger.info(`Retrieved ${documentsResponse.data.length} documents from Clio (total: ${documentsResponse.meta.paging.total_entries})`);

    // Filter out documents that are not processable
    const allDocuments = documentsResponse.data || [];
    const processableDocuments = allDocuments.filter(doc => isProcessableDocument(doc));

    logger.info(`Found ${processableDocuments.length} processable documents out of ${allDocuments.length} total documents`);

    // Count new documents (processable documents not already indexed)
    // Make sure to convert IDs to strings to ensure consistent comparison
    const newDocuments = processableDocuments.filter(doc => !indexedIdsAsStrings.has(String(doc.id)));
    const newCount = newDocuments.length;

    // Log the first few new documents to help with debugging
    if (newCount > 0) {
      logger.info(`First few new documents:`);
      newDocuments.slice(0, 3).forEach(doc => {
        logger.info(`- ID: ${doc.id}, Name: ${doc.name || 'No name'}, Type: ${doc.content_type || 'Unknown'}`);
      });
    }

    logger.info(`Found ${newCount} new documents out of ${processableDocuments.length} processable documents in Clio`);

    // If there are no new documents, skip processing
    return {
      hasNew: newCount > 0,
      newCount,
      totalCount: processableDocuments.length,
    };
  } catch (error) {
    logger.error(`Error checking for new documents: ${error}`);
    // Return that there are new documents if we encounter an error
    // This ensures we don't skip indexing due to an error in the check
    return {
      hasNew: true,
      newCount: 1, // Assume at least one new document
      totalCount: 1,
    };
  }
}
/**
 * Run the batch indexing process and return a formatted summary
 * This function is designed to be called from a script or scheduler
 */
export async function runBatchIndexing(): Promise<string> {
  try {
    // Check if there are new documents before starting the full process
    const newDocumentsCheck = await checkForNewDocuments();

    if (!newDocumentsCheck.hasNew) {
      return `Batch Document Indexing Summary:
------------------------------
No new documents found in Clio. Skipping indexing process.
Total documents in Clio: ${newDocumentsCheck.totalCount}
Current time: ${new Date().toISOString()}`;
    }

    // Proceed with full batch indexing if new documents were found
    logger.info(`Found ${newDocumentsCheck.newCount} new documents to index. Proceeding with indexing...`);
    const result = await batchIndexDocuments();

    // Format the summary
    const summary = `Batch Document Indexing Summary:
------------------------------
Start time: ${result.startTime.toISOString()}
End time: ${result.endTime.toISOString()}
Duration: ${(result.durationMs / 1000).toFixed(2)} seconds

Documents:
- Total from Clio: ${result.totalDocuments}
- Processed: ${result.processedDocuments}
- Successfully indexed: ${result.successfulDocuments}
- Failed: ${result.failedDocuments}
- Skipped (already indexed): ${result.skippedDocuments}

${result.errors.length > 0 ? `Errors (${result.errors.length}):
${result.errors.map((err, i) => `${i + 1}. Document ${err.documentId}: ${err.error}`).join('\n')}` : 'No errors encountered during indexing.'}`;

    return summary;
  } catch (error) {
    return `Failed to run batch indexing: ${error instanceof Error ? error.message : String(error)}`;
  }
}
