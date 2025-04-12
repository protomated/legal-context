/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
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

/**
 * Extract text from a document buffer
 */
export async function extractTextFromBuffer(
  buffer: Buffer, 
  fileName: string
): Promise<string> {
  try {
    // Check file size before processing
    if (buffer.length > config.maxDocumentSize) {
      throw new Error(`Document size (${buffer.length} bytes) exceeds maximum allowed size (${config.maxDocumentSize} bytes)`);
    }
    
    // Determine file type from file name or MIME type (if available)
    // This helps the extractor choose the appropriate method
    const fileType = fileName.split('.').pop()?.toLowerCase() || '';
    
    logger.debug(`Extracting text from ${fileName} (${buffer.length} bytes, type: ${fileType})`);
    
    const extractor = getExtractor();
    const text = await extractor.extractText({
      input: buffer,
      type: 'buffer',
      fileType: fileType || undefined
    });
    
    // Clean up the extracted text
    const cleanedText = cleanExtractedText(text);
    
    logger.debug(`Successfully extracted ${cleanedText.length} characters from ${fileName}`);
    
    return cleanedText;
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
