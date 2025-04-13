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
 * Text Extraction Module
 *
 * This module handles the extraction of text from various document formats.
 * It uses office-text-extractor to support PDF and Office documents.
 */

import { getTextExtractor } from 'office-text-extractor';
import { logger } from '../logger';
import { config } from '../config';

// Initialize text extractor
let extractorInstance: ReturnType<typeof getTextExtractor> | null = null;

/**
 * Get or create the text extractor instance
 */
function getExtractor() {
  if (!extractorInstance) {
    extractorInstance = getTextExtractor();
  }
  return extractorInstance;
}

// Path: src/documents/textExtractor.ts
// Making the text extraction more robust

/**
 * Extract text from a document buffer
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  try {
    // Check file size before processing
    if (buffer.length > config.maxDocumentSize) {
      throw new Error(`Document size (${buffer.length} bytes) exceeds maximum allowed size (${config.maxDocumentSize} bytes)`);
    }

    // Determine a file type from file name or MIME type (if available)
    // This helps the extractor choose the appropriate method
    const fileType = fileName.split('.').pop()?.toLowerCase() || '';

    logger.debug(`Extracting text from ${fileName} (${buffer.length} bytes, type: ${fileType})`);

    // If buffer is empty or too small, return empty string
    if (!buffer || buffer.length < 50) {
      logger.warn(`Document ${fileName} is empty or too small (${buffer?.length || 0} bytes)`);
      return '';
    }

    try {
      const extractor = getExtractor();
      const text = await extractor.extractText({
        input: buffer,
        type: 'buffer',
        fileType: fileType || undefined,
      });

      // Clean up the extracted text
      const cleanedText = cleanExtractedText(text);

      logger.debug(`Successfully extracted ${cleanedText.length} characters from ${fileName}`);

      return cleanedText;
    } catch (extractionError) {
      logger.warn(`Standard extraction failed for ${fileName}, trying fallback method: ${extractionError}`);

      // If regular extraction fails, try a basic text extraction as fallback
      // Just in case it's a plain text file with a different extension
      try {
        const textDecoder = new TextDecoder();
        const text = textDecoder.decode(buffer);
        const cleanedText = cleanExtractedText(text);

        // If we got something meaningful, return it
        if (cleanedText && cleanedText.length > 50) {
          logger.debug(`Fallback extraction successful: ${cleanedText.length} characters from ${fileName}`);
          return cleanedText;
        }
      } catch (fallbackError) {
        // If fallback fails too, ignore and continue with throwing the original error
        logger.debug(`Fallback extraction also failed: ${fallbackError}`);
      }

      // Re-throw the original error if all extraction methods fail
      throw extractionError;
    }
  } catch (error) {
    logger.error(`Error extracting text from ${fileName}:`, error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Clean up extracted text by removing excessive whitespace, etc.
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';

  return text
    // Replace multiple whitespace characters with a single space
    .replace(/\s+/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim leading/trailing whitespace
    .trim();
}
