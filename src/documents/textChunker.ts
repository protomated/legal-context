/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Text Chunking Module
 * 
 * This module handles splitting document text into appropriate chunks for embedding.
 * It ensures chunks are meaningful (preserving paragraph structure where possible)
 * and appropriately sized for the embedding model.
 */

import { config } from '../config';
import { logger } from '../logger';

/**
 * Interface for a text chunk
 */
export interface TextChunk {
  text: string;
  // Metadata to track the position in the document
  index: number;
  sourceDocId: string;
  sourceName: string;
}

/**
 * Split text into chunks of appropriate size for embedding
 */
export function chunkText(
  text: string,
  documentId: string,
  documentName: string
): TextChunk[] {
  logger.debug(`Chunking document text (${text.length} characters) into chunks`);
  
  if (!text || text.trim().length === 0) {
    logger.warn(`Document ${documentId} (${documentName}) has no text content`);
    return [];
  }
  
  // Get the configuration values
  const maxChunkSize = config.chunkSize;
  const chunkOverlap = config.chunkOverlap;
  
  // First split text by paragraphs
  const paragraphs = splitIntoParagraphs(text);
  
  // Then merge paragraphs into chunks of appropriate size
  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph.length === 0) continue;
    
    // If adding this paragraph would exceed the chunk size, create a new chunk
    if (currentChunk.length + trimmedParagraph.length + 1 > maxChunkSize && currentChunk.length > 0) {
      // Add the current chunk to the list
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex++,
        sourceDocId: documentId,
        sourceName: documentName
      });
      
      // Start a new chunk with overlap from the previous chunk
      if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
        const overlapText = currentChunk.slice(-chunkOverlap);
        currentChunk = overlapText + '\n' + trimmedParagraph;
      } else {
        currentChunk = trimmedParagraph;
      }
    } else {
      // Add paragraph to the current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n';
      }
      currentChunk += trimmedParagraph;
    }
  }
  
  // Add the final chunk if it's not empty
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
      sourceDocId: documentId,
      sourceName: documentName
    });
  }
  
  logger.debug(`Created ${chunks.length} chunks from document ${documentId} (${documentName})`);
  
  return chunks;
}

/**
 * Split text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  // Split on double newlines as a paragraph separator
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}
