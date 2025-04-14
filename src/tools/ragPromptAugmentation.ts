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
 * RAG Prompt Augmentation Module
 *
 * This module implements functionality for Story 4.3: Basic RAG Prompt Augmentation.
 * It takes retrieved chunks from LanceDB, formats them into a context string,
 * and constructs a prompt for Claude including the query and retrieved context.
 */

import { logger } from "../logger";
import { SearchResult } from "../documents/documentIndexer";

/**
 * Format a list of search results into a context string
 *
 * @param searchResults - The search results from LanceDB
 * @returns A formatted context string
 */
export function formatChunksToContext(searchResults: SearchResult[]): string {
  if (!searchResults || searchResults.length === 0) {
    logger.warn("No search results provided for context formatting");
    return "No relevant documents found.";
  }

  logger.info(`Formatting ${searchResults.length} chunks into context string`);

  let contextString = `The following information is retrieved from your firm's document management system:\n\n`;

  // Group chunks by document to provide better context
  const documentChunks: { [docId: string]: SearchResult[] } = {};

  // Group chunks by document ID
  searchResults.forEach(result => {
    if (!documentChunks[result.documentId]) {
      documentChunks[result.documentId] = [];
    }
    documentChunks[result.documentId].push(result);
  });

  // Format each document's chunks
  Object.entries(documentChunks).forEach(([docId, chunks], docIndex) => {
    // Sort chunks by relevance (score)
    chunks.sort((a, b) => a.score - b.score);

    const docName = chunks[0].documentName;
    contextString += `DOCUMENT ${docIndex + 1}: ${docName} (ID: ${docId})\n`;

    // Add document metadata if available
    const metadata = chunks[0].metadata;
    if (metadata) {
      if (metadata.contentType) {
        contextString += `Type: ${metadata.contentType}\n`;
      }
      if (metadata.category) {
        contextString += `Category: ${metadata.category}\n`;
      }
      if (metadata.created) {
        contextString += `Created: ${new Date(metadata.created).toLocaleDateString()}\n`;
      }
      if (metadata.updated) {
        contextString += `Updated: ${new Date(metadata.updated).toLocaleDateString()}\n`;
      }
      if (metadata.parentFolder && metadata.parentFolder.name) {
        contextString += `Folder: ${metadata.parentFolder.name}\n`;
      }
    }

    contextString += `\nRelevant content:\n`;

    // Add each chunk's text with a relevance score
    chunks.forEach((chunk, chunkIndex) => {
      const relevancePercentage = ((1 - chunk.score) * 100).toFixed(1);
      contextString += `--- Excerpt ${chunkIndex + 1} (Relevance: ${relevancePercentage}%) ---\n`;
      contextString += `${chunk.text.trim()}\n\n`;
    });

    contextString += `SOURCE: legal://documents/${docId}\n\n`;
  });

  logger.debug(`Generated context string with ${Object.keys(documentChunks).length} documents`);
  return contextString;
}

/**
 * Define a prompt template for RAG
 *
 * @returns The prompt template string with placeholders for context and query
 */
export function getPromptTemplate(): string {
  return `
You are a legal assistant with access to a law firm's document management system.
Please provide a helpful, accurate response based on the following context and query.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

INSTRUCTIONS:
1. Base your response only on the information provided in the CONTEXT section.
2. If the context doesn't contain enough information to answer the query, acknowledge this limitation.
3. Do not make up information or cite documents not mentioned in the context.
4. When referencing specific documents, cite them using the SOURCE information provided.
5. Format your response in a clear, professional manner appropriate for legal communication.
`;
}

/**
 * Create an augmented prompt by populating the template with context and query
 *
 * @param query - The user's query
 * @param searchResults - The search results from LanceDB
 * @returns The augmented prompt string
 */
export function createAugmentedPrompt(query: string, searchResults: SearchResult[]): string {
  logger.info(`Creating augmented prompt for query: "${query}"`);

  // Format chunks into context string
  const contextString = formatChunksToContext(searchResults);

  // Get the prompt template
  const promptTemplate = getPromptTemplate();

  // Populate the template with context and query
  const augmentedPrompt = promptTemplate
    .replace("{{context}}", contextString)
    .replace("{{query}}", query);

  logger.debug("Augmented prompt created successfully");
  return augmentedPrompt;
}
