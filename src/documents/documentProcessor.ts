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
 * Document Processor Module
 * 
 * This module combines the Clio API client with the text extractor to
 * download documents from Clio and extract their text content.
 * It handles document retrieval, content extraction, and caching.
 */

import { logger } from '../logger';
import { getClioApiClient, ClioDocument } from '../clio';
import { extractTextFromBuffer } from './textExtractor';

/**
 * Document processing result interface
 */
export interface ProcessedDocument {
  id: string;
  name: string;
  text: string;
  metadata: {
    contentType?: string;
    category?: string;
    size?: number;
    created: string;
    updated: string;
    parentFolder?: {
      id: string;
      name: string;
    };
  };
}

/**
 * Simple in-memory document cache to avoid repeated downloads
 * Note: For production use, consider using a persistent cache
 */
const documentCache: Map<string, ProcessedDocument> = new Map();

/**
 * Process a document from Clio by ID
 * Downloads the document, extracts text, and returns the processed document
 */
export async function processDocument(documentId: string): Promise<ProcessedDocument> {
  logger.info(`Processing document: ${documentId}`);
  
  // Check cache first
  if (documentCache.has(documentId)) {
    logger.debug(`Document ${documentId} found in cache`);
    return documentCache.get(documentId)!;
  }
  
  // Get the Clio API client
  const clioApiClient = getClioApiClient();
  
  // Check if Clio API client is initialized
  if (!await clioApiClient.initialize()) {
    throw new Error("Clio API client not initialized. Authentication required.");
  }
  
  try {
    // Get document metadata
    logger.debug(`Retrieving metadata for document ${documentId}`);
    const documentData = await clioApiClient.getDocument(documentId);
    const document = documentData.data;
    
    // Download document content
    logger.debug(`Downloading content for document ${documentId}`);
    const documentBuffer = await clioApiClient.downloadDocument(documentId);
    
    // Extract text from document
    logger.debug(`Extracting text from document ${documentId}`);
    const text = await extractTextFromBuffer(documentBuffer, document.name);
    
    // Create processed document
    const processedDocument: ProcessedDocument = {
      id: document.id,
      name: document.name,
      text,
      metadata: {
        contentType: document.content_type,
        category: document.category,
        size: document.size,
        created: document.created_at,
        updated: document.updated_at,
        parentFolder: document.parent_folder,
      }
    };
    
    // Cache the processed document
    documentCache.set(documentId, processedDocument);
    
    logger.info(`Successfully processed document ${documentId}: ${document.name}`);
    return processedDocument;
  } catch (error) {
    logger.error(`Error processing document ${documentId}:`, error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Clear the document cache
 */
export function clearDocumentCache(): void {
  documentCache.clear();
  logger.info("Document cache cleared");
}

/**
 * Get document cache statistics
 */
export function getDocumentCacheStats(): { count: number, size: number } {
  let totalSize = 0;
  
  for (const doc of documentCache.values()) {
    totalSize += doc.text.length;
    totalSize += JSON.stringify(doc.metadata).length;
    totalSize += doc.id.length + doc.name.length;
  }
  
  return {
    count: documentCache.size,
    size: totalSize
  };
}