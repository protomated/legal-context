// Path: /Users/deletosh/projects/legal-context/src/documents/documentProcessor.ts

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
 * Enhanced Document Processor Module
 *
 * This module combines the Clio API client with the text extractor to
 * download documents from Clio and extract their text content.
 * It handles document retrieval, content extraction, metadata enrichment,
 * and caching with improved performance.
 */

import { logger } from '../logger';
import { getClioApiClient, ClioDocument } from '../clio';
import { extractTextFromBuffer } from './textExtractor';
import crypto from 'crypto';

/**
 * Document processing result interface with enhanced metadata
 */
export interface ProcessedDocument {
  id: string;
  name: string;
  text: string;
  contentHash: string; // Added for change detection
  metadata: {
    contentType?: string;
    category?: string;
    size?: number;
    created: string;
    updated: string;
    importedAt: string; // When the document was last processed
    parentFolder?: {
      id?: string;
      name?: string;
    };
  };
}

/**
 * Configuration for document processing
 */
export interface DocumentProcessingOptions {
  forceRefresh?: boolean; // Skip cache and reprocess
  extractMetadata?: boolean; // Extract additional metadata from document content
  maxCacheAge?: number; // Maximum age of cached documents in milliseconds
}

/**
 * Enhanced cache for processed documents
 * It stores not just the processed document but also additional metadata for cache invalidation
 */
interface DocumentCacheEntry {
  document: ProcessedDocument;
  timestamp: number; // When the document was cached
  contentHash: string; // Hash of the document content for change detection
}

/**
 * Document cache with age-based invalidation and change detection
 */
class DocumentCache {
  private cache: Map<string, DocumentCacheEntry> = new Map();
  private maxEntries: number = 100; // Default cache size

  /**
   * Set the maximum number of entries in the cache
   */
  setMaxEntries(maxEntries: number): void {
    this.maxEntries = maxEntries;
    this.pruneCache();
  }

  /**
   * Get a document from the cache
   */
  get(documentId: string, maxAge?: number): ProcessedDocument | null {
    const entry = this.cache.get(documentId);

    if (!entry) {
      return null;
    }

    // Check if the cache entry is too old
    if (maxAge && Date.now() - entry.timestamp > maxAge) {
      logger.debug(`Cache entry for document ${documentId} is too old, removing from cache`);
      this.cache.delete(documentId);
      return null;
    }

    return entry.document;
  }

  /**
   * Add a document to the cache
   */
  set(documentId: string, document: ProcessedDocument): void {
    // Calculate content hash if not provided
    const contentHash = document.contentHash || this.calculateContentHash(document.text);

    // Create cache entry
    const entry: DocumentCacheEntry = {
      document: {
        ...document,
        contentHash,
      },
      timestamp: Date.now(),
      contentHash,
    };

    // Add to cache
    this.cache.set(documentId, entry);

    // Prune cache if necessary
    this.pruneCache();
  }

  /**
   * Remove a document from the cache
   */
  delete(documentId: string): void {
    this.cache.delete(documentId);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { count: number, size: number, newest: number, oldest: number } {
    let totalSize = 0;
    let oldest = Date.now();
    let newest = 0;

    for (const entry of this.cache.values()) {
      // Calculate approximate size of cached document
      const entrySize = entry.document.text.length // Text content
        + JSON.stringify(entry.document.metadata).length // Metadata
        + entry.document.id.length // ID
        + entry.document.name.length; // Name

      totalSize += entrySize;

      // Track oldest and newest entries
      if (entry.timestamp < oldest) {
        oldest = entry.timestamp;
      }

      if (entry.timestamp > newest) {
        newest = entry.timestamp;
      }
    }

    return {
      count: this.cache.size,
      size: totalSize,
      newest: newest || Date.now(),
      oldest: this.cache.size > 0 ? oldest : Date.now(),
    };
  }

  /**
   * Check if a document has changed by comparing content hashes
   */
  hasDocumentChanged(documentId: string, newContentHash: string): boolean {
    const entry = this.cache.get(documentId);

    if (!entry) {
      return true; // Not in cache, so assume changed
    }

    return entry.contentHash !== newContentHash;
  }

  /**
   * Calculate a hash of the document content for change detection
   */
  private calculateContentHash(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Prune the cache if it exceeds the maximum size
   * Removes the oldest entries first
   */
  private pruneCache(): void {
    if (this.cache.size <= this.maxEntries) {
      return;
    }

    const entries = Array.from(this.cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    const entriesToRemove = entries.slice(0, this.cache.size - this.maxEntries);

    for (const [id] of entriesToRemove) {
      this.cache.delete(id);
    }

    logger.debug(`Pruned ${entriesToRemove.length} entries from document cache`);
  }
}

// Create document cache
const documentCache = new DocumentCache();

// Default maximum cache age (1 hour)
const DEFAULT_MAX_CACHE_AGE = 60 * 60 * 1000;

/**
 * Process a document from Clio by ID with enhanced caching and performance
 */
export async function processDocument(
  documentId: string,
  options: DocumentProcessingOptions = {},
): Promise<ProcessedDocument> {
  logger.info(`Processing document: ${documentId}, forceRefresh: ${options.forceRefresh || false}`);

  // Apply default options
  const forceRefresh = options.forceRefresh || false;
  const maxCacheAge = options.maxCacheAge !== undefined ? options.maxCacheAge : DEFAULT_MAX_CACHE_AGE;

  // Check cache first (unless force refresh is requested)
  if (!forceRefresh) {
    const cachedDocument = documentCache.get(documentId, maxCacheAge);
    if (cachedDocument) {
      logger.debug(`Document ${documentId} found in cache (age: ${Date.now() - new Date(cachedDocument.metadata.importedAt).getTime()}ms)`);
      return cachedDocument;
    }
  }

  // Get the Clio API client
  const clioApiClient = getClioApiClient();

  // Check if Clio API client is initialized
  if (!await clioApiClient.initialize()) {
    throw new Error('Clio API client not initialized. Authentication required.');
  }

  try {
    // Get document metadata
    logger.debug(`Retrieving metadata for document ${documentId}`);
    const documentData = await clioApiClient.getDocument(documentId);
    const document = documentData.data;

    // Add debug output to see raw document data
    logger.debug(`Document metadata: ${JSON.stringify(document, null, 2)}`);

    // Download document content
    logger.debug(`Downloading content for document ${documentId}`);
    const documentBuffer = await clioApiClient.downloadDocument(documentId);

    // Log buffer size to help debug
    logger.debug(`Downloaded document size: ${documentBuffer.length} bytes`);

    // Calculate content hash for change detection
    const contentHash = crypto.createHash('md5').update(documentBuffer).digest('hex');

    // Check if we already have this exact document in cache
    if (!forceRefresh) {
      const cachedDocument = documentCache.get(documentId);
      if (cachedDocument && !documentCache.hasDocumentChanged(documentId, contentHash)) {
        logger.debug(`Document ${documentId} content unchanged, using cached version`);

        // Update the cached document's importedAt date
        cachedDocument.metadata.importedAt = new Date().toISOString();
        documentCache.set(documentId, cachedDocument);

        return cachedDocument;
      }
    }

    // Extract text from document
    logger.debug(`Extracting text from document ${documentId}`);
    const text = await extractTextFromBuffer(documentBuffer, document.name || `Document ${document.id}`);

    // Log text length to help debug
    logger.debug(`Extracted text length: ${text.length} characters`);
    if (text.length === 0) {
      logger.warn(`No text could be extracted from document ${documentId}`);
    }

    // Create processed document
    const processedDocument: ProcessedDocument = {
      id: document.id,
      name: document.name || `Document ${document.id}`,
      text,
      contentHash,
      metadata: {
        contentType: document.content_type,
        category: document.category,
        size: document.size,
        created: document.created_at,
        updated: document.updated_at,
        importedAt: new Date().toISOString(),
        parentFolder: document.parent_folder ? {
          id: document.parent_folder.id,
          name: document.parent_folder.name,
        } : undefined,
      },
    };

    // Extract additional metadata if requested
    if (options.extractMetadata) {
      // Add extracted document type based on content analysis
      if (text.includes('EMPLOYMENT AGREEMENT') || text.includes('Employment Contract')) {
        processedDocument.metadata.category = 'Employment';
      } else if (text.includes('SETTLEMENT AGREEMENT') || text.includes('Settlement and Release')) {
        processedDocument.metadata.category = 'Settlement';
      } else if (text.includes('NON-DISCLOSURE AGREEMENT') || text.includes('Confidentiality Agreement')) {
        processedDocument.metadata.category = 'NDA';
      } else if (text.includes('SOFTWARE LICENSE') || text.includes('LICENSING AGREEMENT')) {
        processedDocument.metadata.category = 'Licensing';
      } else if (text.includes('MERGER') && text.includes('ACQUISITION')) {
        processedDocument.metadata.category = 'M&A';
      }
    }

    // Cache the processed document
    documentCache.set(documentId, processedDocument);

    logger.info(`Successfully processed document ${documentId}: ${processedDocument.name}`);
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
  logger.info('Document cache cleared');
}

/**
 * Get document cache statistics
 */
export function getDocumentCacheStats(): { count: number, size: number, newestTimestamp: Date, oldestTimestamp: Date } {
  const stats = documentCache.getStats();

  return {
    count: stats.count,
    size: stats.size,
    newestTimestamp: new Date(stats.newest),
    oldestTimestamp: new Date(stats.oldest),
  };
}

/**
 * Set maximum document cache size
 */
export function setMaxDocumentCacheSize(maxSize: number): void {
  documentCache.setMaxEntries(maxSize);
  logger.info(`Document cache max size set to ${maxSize} entries`);
}
