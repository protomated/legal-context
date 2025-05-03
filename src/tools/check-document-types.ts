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
 * Document Content Type Check Tool
 *
 * This script examines the content types of documents in Clio to
 * determine which types need to be supported.
 */

import { logger } from '../logger';
import { getClioApiClient } from '../clio';

async function checkDocumentTypes() {
  try {
    logger.info('Starting document content type check');

    // Get the Clio API client
    const clioApiClient = getClioApiClient();

    // Check if Clio API client is initialized
    if (!await clioApiClient.initialize()) {
      throw new Error('Clio API client not initialized. Authentication required.');
    }

    // Retrieve documents from Clio
    logger.info('Retrieving documents from Clio');
    const documentsResponse = await clioApiClient.listDocuments(1, 50);

    // Log detailed information about the response
    logger.info(`API response received: ${documentsResponse.data.length} documents in current page`);

    // Map to collect unique content types
    const contentTypes = new Map<string, number>();

    // Count documents by content type
    documentsResponse.data.forEach(doc => {
      const contentType = doc.content_type || 'unknown';
      contentTypes.set(contentType, (contentTypes.get(contentType) || 0) + 1);
    });

    // Log content type distribution
    logger.info('Content type distribution:');
    for (const [type, count] of contentTypes.entries()) {
      logger.info(`- ${type}: ${count} documents`);
    }

    // Log specific document details to help diagnose
    logger.info('\nSample documents:');
    documentsResponse.data.slice(0, 5).forEach((doc, index) => {
      logger.info(`Document ${index + 1}:`);
      logger.info(`- ID: ${doc.id}`);
      logger.info(`- Name: ${doc.name || 'No name'}`);
      logger.info(`- Content Type: ${doc.content_type || 'No content type'}`);
      logger.info(`- Size: ${doc.size || 'Unknown'} bytes`);
      logger.info(`- Created: ${doc.created_at}`);
      logger.info(`- Updated: ${doc.updated_at}`);
      logger.info(`---------------------------`);
    });

    logger.info('Document content type check completed');
  } catch (error) {
    logger.error('Error checking document types:', error);
  }
}

// Run the check
checkDocumentTypes().catch(error => {
  logger.error('Unhandled error in document type check:', error);
});