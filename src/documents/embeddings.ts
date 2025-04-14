// Path: /Users/deletosh/projects/legal-context/src/documents/embeddings.ts

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
 * Enhanced Embeddings Module for Legal Documents
 *
 * This module handles the generation of vector embeddings for legal text chunks
 * with specialized preprocessing for legal terminology and structure.
 */

import { pipeline, env } from '@xenova/transformers';
import { logger } from '../logger';
import { TextChunk } from './textChunker';

// Configure transformers.js to use WASM backend for broader compatibility
// This enables the embedding model to run on CPUs without AVX2 support
env.backends.onnx.wasm.numThreads = 4;

// The embedding model to use - MiniLM-L6-v2 is a good balance of quality and speed
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

// The embedding dimension of the model
export const EMBEDDING_DIMENSION = 384;

// Lazy-loaded pipeline promise
let embeddingPipelinePromise: Promise<any> | null = null;

// Global cache to avoid re-embedding identical text
const embeddingCache: Map<string, number[]> = new Map();

/**
 * Legal-specific normalization patterns for improved embedding
 * These help standardize legal terms and citations before embedding
 */
const LEGAL_NORMALIZATION_PATTERNS: [RegExp, string][] = [
  // Standardize case citations
  [/([A-Za-z\s.,']+)\s+v\.\s+([A-Za-z\s.,']+),\s+(\d+)\s+(?:F\.|U\.S\.|S\.Ct\.|P\.)(?:\d+d?)?\s+(\d+)(?:\s+\([A-Za-z\d\s.]+\s+\d{4}\))?/g, "CASE_CITATION"],

  // Standardize statute citations
  [/(\d+)\s+([A-Za-z.]+)(?:\s+[Cc]ode)?\s+§+\s+(\d+[A-Za-z\d.-]*)/g, "STATUTE_CITATION"],

  // Standardize legal document references
  [/(?:pursuant to|in accordance with|as defined in|as set forth in)\s+(?:Section|Article|Paragraph|Clause)\s+[A-Z0-9.]+/gi, "DOCUMENT_REFERENCE"],

  // Standardize common Latin legal phrases
  [/(?:inter alia|prima facie|de novo|ex parte|in camera|pro se|sua sponte|sub judice|amicus curiae|habeas corpus|res judicata|stare decisis)/gi, "LATIN_PHRASE"],

  // Common legal abbreviations
  [/(?:\b(?:LLC|LLP|Inc\.|Corp\.|P\.A\.|Ltd\.|et al\.|i\.e\.|e\.g\.|etc\.|ibid\.|op\. cit\.|supra|infra)\b)/g, "LEGAL_ABBREV"]
];

/**
 * Get or initialize the embedding pipeline
 */
function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    logger.info(`Initializing embedding model: ${MODEL_NAME}`);
    embeddingPipelinePromise = pipeline('feature-extraction', MODEL_NAME);
  }
  return embeddingPipelinePromise;
}

/**
 * Preprocess legal text before embedding
 * This normalizes legal-specific patterns and enhances embedding quality
 */
function preprocessLegalText(text: string): string {
  // Apply legal-specific normalization patterns
  let processedText = text;

  for (const [pattern, replacement] of LEGAL_NORMALIZATION_PATTERNS) {
    processedText = processedText.replace(pattern, replacement);
  }

  // Handle enumerated lists which are common in legal docs
  processedText = processedText.replace(/^\s*(?:[0-9]+\.|[a-z]\.|[A-Z]\.|\([i|v|x]+\)|\([a-z]\)|\([0-9]+\))\s+/gm, "LIST_ITEM ");

  // Handle legal document sections
  processedText = processedText.replace(/(?:ARTICLE|Section|SECTION|Article)\s+([IVX0-9]+[A-Za-z]?(?:\.[0-9]+)?)/g, "SECTION_REFERENCE");

  return processedText;
}

/**
 * Generate an embedding for a legal text chunk
 *
 * @param textChunk - The text chunk to embed
 * @returns A vector embedding as an array of numbers
 */
export async function generateEmbedding(textChunk: string | TextChunk): Promise<number[]> {
  try {
    // Get text content from chunk or use directly if string
    const text = typeof textChunk === 'string' ? textChunk : textChunk.text;

    // Check cache first
    const cacheKey = text.slice(0, 1000); // Use first 1000 chars as cache key to avoid excessive memory usage
    if (embeddingCache.has(cacheKey)) {
      return embeddingCache.get(cacheKey)!;
    }

    // Preprocess the text with legal-specific normalizations
    const preprocessedText = preprocessLegalText(text);

    // Get the pipeline instance
    const embeddingPipeline = await getEmbeddingPipeline();

    // Generate embedding
    const output = await embeddingPipeline(preprocessedText, {
      pooling: 'mean', // Average pooling for sentence embeddings
      normalize: true   // Normalize the embeddings
    });

    // Convert to standard JavaScript array
    const embedding = Array.from(output.data as Float32Array);

    // Add to cache
    embeddingCache.set(cacheKey, embedding);

    return embedding;
  } catch (error) {
    logger.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate an embedding for a search query
 * This adds legal-specific query preprocessing
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    // Preprocess the query for legal search
    const enhancedQuery = enhanceQueryForLegalSearch(query);

    // Generate the embedding
    return generateEmbedding(enhancedQuery);
  } catch (error) {
    logger.error('Error generating query embedding:', error);
    throw new Error(`Failed to generate query embedding: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Enhance a query for legal search by adding relevant legal terminology
 * and expanding common legal abbreviations
 */
function enhanceQueryForLegalSearch(query: string): string {
  let enhancedQuery = query;

  // Expand common legal abbreviations to improve matching
  enhancedQuery = enhancedQuery
    .replace(/\bP\.A\./g, "Professional Association")
    .replace(/\bLLC\b/g, "Limited Liability Company")
    .replace(/\bLLP\b/g, "Limited Liability Partnership")
    .replace(/\bv\.\b/g, "versus")
    .replace(/\bet al\.\b/g, "and others")
    .replace(/\bi\.e\.\b/g, "that is")
    .replace(/\be\.g\.\b/g, "for example");

  // Apply legal-specific preprocessing
  return preprocessLegalText(enhancedQuery);
}

/**
 * Clear the embedding cache to free memory
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  logger.info('Embedding cache cleared');
}

/**
 * Get embedding cache statistics
 */
export function getEmbeddingCacheStats(): { count: number, memoryUsageEstimate: number } {
  let memoryUsage = 0;

  for (const embedding of embeddingCache.values()) {
    // Each number is a Float32 (4 bytes)
    memoryUsage += embedding.length * 4;
  }

  // Add overhead for keys
  for (const key of embeddingCache.keys()) {
    // Each character is 2 bytes in JavaScript
    memoryUsage += key.length * 2;
  }

  return {
    count: embeddingCache.size,
    memoryUsageEstimate: memoryUsage
  };
}
