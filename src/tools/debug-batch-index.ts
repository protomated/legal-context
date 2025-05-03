// Path: src/tools/debug-batch-index.ts

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
 * Debug Batch Indexing Tool
 *
 * This script runs the batch document indexing process with extra debugging
 * information and a modified isProcessableDocument function to accept all content types.
 */

import { logger } from '../logger';
import { getClioApiClient, ClioDocument } from '../clio';
import { processDocument } from '../documents/documentProcessor';
import { getDocumentIndexer } from '../documents/documentIndexer';
import * as fs from 'fs';

// Override isProcessableDocument to accept all content types
function isAllDocumentsProcessable(doc: ClioDocument): boolean {
  logger.info(`Checking document: ${doc.id} - ${doc.name || 'No name'} - ${doc.content_type || 'No content type'}`);
  return true; // Accept all documents
}

async function debugBatchIndex() {
  try {
    logger.info('Starting debug batch indexing with all documents processable');

    // Get the Clio API client
    const clioApiClient = getClioApiClient();

    // Check if Clio API client is initialized
    if (!await clioApiClient.initialize()) {
      throw new Error('Clio API client not initialized. Authentication required.');
    }

    // Get the document indexer
    const documentIndexer = getDocumentIndexer();
    await documentIndexer.initialize();

    // Retrieve documents from Clio
    logger.info('Retrieving documents from Clio');
    const MAX_DOCUMENTS = 100; // Free tier limit
    const documentsResponse = await clioApiClient.listDocuments(1, MAX_DOCUMENTS);

    // Log all document details
    logger.info(`Retrieved ${documentsResponse.data.length} documents from Clio`);
    documentsResponse.data.forEach((doc, index) => {
      logger.info(`Document ${index + 1}:`);
      logger.info(`- ID: ${doc.id}`);
      logger.info(`- Name: ${doc.name || 'No name'}`);
      logger.info(`- Content Type: ${doc.content_type || 'No content type'}`);
      logger.info(`- Size: ${doc.size || 'Unknown'} bytes`);
    });

    // Use our custom processable function that accepts all documents
    const allDocuments = documentsResponse.data || [];
    const processableDocuments = allDocuments.filter(isAllDocumentsProcessable);

    logger.info(`Using debug mode: all ${processableDocuments.length} documents are considered processable`);

    // Check indexed documents
    const indexedDocsPath = './indexed_documents.json';
    let indexedDocIds = new Set<string>();

    if (fs.existsSync(indexedDocsPath)) {
      const indexedDocsContent = fs.readFileSync(indexedDocsPath, 'utf8');
      const indexedDocs = JSON.parse(indexedDocsContent);
      indexedDocIds = new Set(indexedDocs.documentIds.map(String));
      logger.info(`Found ${indexedDocIds.size} previously indexed document IDs`);
    } else {
      logger.info('No indexed_documents.json file found');
    }

    // Find new documents
    const newDocuments = processableDocuments.filter(doc => !indexedDocIds.has(String(doc.id)));
    logger.info(`Found ${newDocuments.length} new documents to index`);

    // Process and index each new document
    let successful = 0;
    let failed = 0;
    const successfulIds = Array.from(indexedDocIds);

    for (const doc of newDocuments) {
      try {
        logger.info(`Processing document ${doc.id}: ${doc.name || 'No name'} (${doc.content_type || 'No content type'})`);

        // Process the document (with potential errors properly logged)
        try {
          const processedDoc = await processDocument(doc.id, { forceRefresh: true });

          // Index with force flag
          const indexed = await documentIndexer.indexDocument(processedDoc, true);

          if (indexed) {
            successful++;
            successfulIds.push(String(doc.id));
            logger.info(`Successfully indexed document ${doc.id}`);
          } else {
            failed++;
            logger.error(`Failed to index document ${doc.id}`);
          }
        } catch (processError) {
          logger.error(`Error processing document ${doc.id}:`, processError);
          failed++;
        }
      } catch (error) {
        failed++;
        logger.error(`Error with document ${doc.id}:`, error);
      }

      // Limit to free tier maximum
      if (successful + failed >= MAX_DOCUMENTS) {
        logger.info(`Reached maximum document limit (${MAX_DOCUMENTS}). Stopping process.`);
        break;
      }
    }

    // Update the indexed documents file with successfully indexed documents
    if (successful > 0) {
      fs.writeFileSync(indexedDocsPath, JSON.stringify({
        documentIds: successfulIds,
        lastUpdated: new Date().toISOString()
      }, null, 2));
      logger.info(`Updated indexed documents file with ${successfulIds.length} document IDs`);
    }

    // Log results
    logger.info(`Debug batch indexing completed`);
    logger.info(`Total documents: ${allDocuments.length}`);
    logger.info(`Processable documents: ${processableDocuments.length}`);
    logger.info(`New documents: ${newDocuments.length}`);
    logger.info(`Successfully indexed: ${successful}`);
    logger.info(`Failed: ${failed}`);

    return {
      successful,
      failed,
      total: allDocuments.length,
      processable: processableDocuments.length,
      new: newDocuments.length
    };
  } catch (error) {
    logger.error('Error during debug batch indexing:', error);
    throw error;
  }
}

// Run the debug batch indexing and handle any errors
debugBatchIndex()
  .then(results => {
    console.log(`
Debug Batch Indexing Summary:
---------------------------
Total documents in Clio: ${results.total}
Processable documents: ${results.processable}
New documents: ${results.new}
Successfully indexed: ${results.successful}
Failed: ${results.failed}
Completed at: ${new Date().toISOString()}
`);
  })
  .catch(error => {
    console.error('Debug batch indexing failed:', error);
    process.exit(1);
  });