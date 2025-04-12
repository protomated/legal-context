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
 * Text Chunking Module
 *
 * This module handles splitting document text into appropriate chunks for embedding.
 * It ensures chunks are meaningful (preserving paragraph structure where possible)
 * and appropriately sized for the embedding model.
 *
 * Implements advanced recursive text chunking with multiple separator types.
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
 * Split text into chunks of appropriate size for embedding using recursive character splitting
 * This implementation mimics the behavior of RecursiveCharacterTextSplitter from langchain
 */
export async function chunkText(
  text: string,
  documentId: string,
  documentName: string
): Promise<TextChunk[]> {
  logger.debug(`Chunking document text (${text.length} characters) into chunks`);

  if (!text || text.trim().length === 0) {
    logger.warn(`Document ${documentId} (${documentName}) has no text content`);
    return [];
  }

  // Get the configuration values
  const maxChunkSize = config.chunkSize;
  const chunkOverlap = config.chunkOverlap;

  // Define separators in order of priority
  const separators = ["\n\n", "\n", ". ", ", ", " ", ""];

  // Split the text recursively
  const chunks = recursiveTextSplit(
    text,
    separators,
    maxChunkSize,
    chunkOverlap
  ).map((chunkText, index) => ({
    text: chunkText.trim(),
    index,
    sourceDocId: documentId,
    sourceName: documentName
  }));

  logger.debug(`Created ${chunks.length} chunks from document ${documentId} (${documentName})`);

  return chunks;
}

/**
 * Recursively split text using a list of separators
 */
function recursiveTextSplit(
  text: string,
  separators: string[],
  maxChunkSize: number,
  chunkOverlap: number
): string[] {
  // If we're at the last separator or the text is small enough, return it as a chunk
  if (separators.length === 0 || text.length <= maxChunkSize) {
    return [text];
  }

  const separator = separators[0];
  const nextSeparators = separators.slice(1);

  // Split by the current separator
  const splits = text.split(separator);

  // If splitting didn't help, try the next separator
  if (splits.length === 1) {
    return recursiveTextSplit(text, nextSeparators, maxChunkSize, chunkOverlap);
  }

  // Process each split with the next level of separators if needed
  let chunks: string[] = [];
  let currentChunk = "";

  for (const split of splits) {
    // Skip empty splits
    if (split.trim().length === 0) continue;

    // If adding this split would exceed the chunk size, process the current chunk
    if (currentChunk.length + split.length + separator.length > maxChunkSize && currentChunk.length > 0) {
      // If the current chunk is still too large, recursively split it
      if (currentChunk.length > maxChunkSize) {
        chunks = chunks.concat(
          recursiveTextSplit(currentChunk, nextSeparators, maxChunkSize, chunkOverlap)
        );
      } else {
        chunks.push(currentChunk);
      }

      // Start a new chunk with overlap from the previous chunk
      if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
        const overlapText = currentChunk.slice(-chunkOverlap);
        currentChunk = overlapText + separator + split;
      } else {
        currentChunk = split;
      }
    } else {
      // Add split to the current chunk
      if (currentChunk.length > 0) {
        currentChunk += separator;
      }
      currentChunk += split;
    }
  }

  // Process the final chunk
  if (currentChunk.trim().length > 0) {
    if (currentChunk.length > maxChunkSize) {
      chunks = chunks.concat(
        recursiveTextSplit(currentChunk, nextSeparators, maxChunkSize, chunkOverlap)
      );
    } else {
      chunks.push(currentChunk);
    }
  }

  return chunks;
}

