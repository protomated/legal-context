/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Embeddings Module
 * 
 * This module handles the generation of vector embeddings for text chunks
 * using Transformers.js with a local embedding model.
 */

import { pipeline, env } from '@xenova/transformers';
import { logger } from '../logger';

// Configure transformers.js to use WASM backend for broader compatibility
// This enables the embedding model to run on CPUs without AVX2 support
env.backends.onnx.wasm.numThreads = 4;

// The embedding model to use - MiniLM-L6-v2 is a good balance of quality and speed
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

// The embedding dimension of the model
export const EMBEDDING_DIMENSION = 384;

// Lazy-loaded pipeline promise
let embeddingPipelinePromise: Promise<any> | null = null;

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
 * Generate an embedding for a text chunk
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Get the pipeline instance
    const embeddingPipeline = await getEmbeddingPipeline();
    
    // Generate embedding
    const output = await embeddingPipeline(text, {
      pooling: 'mean', // Average pooling for sentence embeddings
      normalize: true   // Normalize the embeddings
    });
    
    // Convert to standard JavaScript array
    return Array.from(output.data as Float32Array);
  } catch (error) {
    logger.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate an embedding for a search query
 * This is kept separate from document embedding to allow for potential future
 * query-specific preprocessing or different embedding techniques
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query);
}
