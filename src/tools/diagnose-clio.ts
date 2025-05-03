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
 * Clio Diagnostics Tool
 *
 * This script tests direct document retrieval from Clio and provides detailed diagnostic
 * information about the documents available in the Clio account.
 */

import { logger } from '../logger';
import { getClioApiClient, isProcessableDocument } from '../clio';

async function runDiagnostics() {
  try {
    logger.info('Starting Clio diagnostics');

    // Get the Clio API client
    const clioApiClient = getClioApiClient();

    // Check if Clio API client is initialized
    if (!await clioApiClient.initialize()) {
      logger.error('Failed to initialize Clio API client. Authentication required.');
      return;
    }

    logger.info('Clio API client initialized successfully');

    // Retrieve documents from Clio with a higher limit to see what's available
    logger.info('Retrieving documents from Clio');
    const documentsResponse = await clioApiClient.listDocuments(1, 50);

    // Log detailed information about the response
    logger.info(`API response received: ${documentsResponse.data.length} documents in current page`);
    logger.info(`Total documents in Clio: ${documentsResponse.meta.paging.total_entries}`);
    logger.info(`Total pages: ${documentsResponse.meta.paging.total_pages}`);
    logger.info(`Current page: ${documentsResponse.meta.paging.page}`);

    // Check for processable documents
    const processableDocuments = documentsResponse.data.filter(doc => isProcessableDocument(doc));
    logger.info(`Found ${processableDocuments.length} processable documents out of ${documentsResponse.data.length} total documents`);

    // Log details of each document for inspection
    logger.info('Document details:');
    documentsResponse.data.forEach((doc, index) => {
      const isProcessable = isProcessableDocument(doc);
      logger.info(`Document ${index + 1}:`);
      logger.info(`- ID: ${doc.id}`);
      logger.info(`- Name: ${doc.name || 'No name'}`);
      logger.info(`- Content Type: ${doc.content_type || 'No content type'}`);
      logger.info(`- Processable: ${isProcessable ? 'Yes' : 'No'}`);
      logger.info(`- Created: ${doc.created_at}`);
      logger.info(`- Updated: ${doc.updated_at}`);
      logger.info(`---------------------------`);
    });

    // Check if indexed_documents.json exists and read it
    const fs = await import('fs');
    const indexedDocsPath = './indexed_documents.json';

    if (fs.existsSync(indexedDocsPath)) {
      const indexedDocsContent = fs.readFileSync(indexedDocsPath, 'utf8');
      const indexedDocs = JSON.parse(indexedDocsContent);

      logger.info(`Found indexed_documents.json with ${indexedDocs.documentIds.length} document IDs`);

      // Compare indexed documents with available documents
      const indexedSet = new Set(indexedDocs.documentIds.map(String));
      const availableSet = new Set(documentsResponse.data.map(doc => String(doc.id)));

      // Find documents in Clio that aren't indexed yet
      const notIndexedDocs = documentsResponse.data.filter(doc => !indexedSet.has(String(doc.id)));
      logger.info(`Found ${notIndexedDocs.length} documents in Clio that aren't indexed yet`);

      if (notIndexedDocs.length > 0) {
        logger.info('Documents not indexed:');
        notIndexedDocs.forEach(doc => {
          logger.info(`- ID: ${doc.id}, Name: ${doc.name || 'No name'}, Content Type: ${doc.content_type || 'No content type'}`);
        });
      }

      // Find indexed documents that no longer exist in Clio
      const indexedButNotInClio = [...indexedSet].filter(id => !availableSet.has(id));
      logger.info(`Found ${indexedButNotInClio.length} indexed document IDs that no longer exist in Clio`);

      if (indexedButNotInClio.length > 0) {
        logger.info('Indexed documents not found in Clio:');
        indexedButNotInClio.forEach(id => {
          logger.info(`- ID: ${id}`);
        });
      }
    } else {
      logger.warn('indexed_documents.json not found');
    }

    logger.info('Clio diagnostics completed');
  } catch (error) {
    logger.error('Error running Clio diagnostics:', error);
  }
}

// Run the diagnostics
runDiagnostics().catch(error => {
  logger.error('Unhandled error in Clio diagnostics:', error);
});