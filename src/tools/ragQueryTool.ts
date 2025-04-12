/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * RAG Query Tool
 *
 * This module implements the MCP tool for RAG-based legal queries.
 * It retrieves relevant document chunks from LanceDB, augments the prompt with context,
 * and returns the augmented prompt for Claude to generate a grounded answer.
 *
 * Implementation of Story 4.3: Basic RAG Prompt Augmentation
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "../logger";
import { config } from "../config";
import { getDocumentIndexer } from "../documents/documentIndexer";
import { SearchResult } from "../documents/documentIndexer";
import { createAugmentedPrompt } from "./ragPromptAugmentation";

/**
 * Extract citation metadata from search results
 *
 * @param searchResults - The search results from the document indexer
 * @param query - The original user query
 * @returns An object containing citation metadata
 */
function extractCitationMetadata(searchResults: SearchResult[], query: string): Record<string, any> {
  // Group chunks by document
  const documentMap: Record<string, {
    documentId: string;
    documentName: string;
    uri: string;
    relevance: number;
    metadata?: Record<string, any>;
    chunks: Array<{
      text: string;
      relevance: number;
    }>;
  }> = {};

  // Process each search result
  searchResults.forEach(result => {
    const docId = result.documentId;
    const relevancePercentage = ((1 - result.score) * 100);

    // Create or update document entry
    if (!documentMap[docId]) {
      documentMap[docId] = {
        documentId: docId,
        documentName: result.documentName,
        uri: `legal://documents/${docId}`,
        relevance: relevancePercentage,
        metadata: result.metadata,
        chunks: []
      };
    } else {
      // Update document relevance if this chunk is more relevant
      if (relevancePercentage > documentMap[docId].relevance) {
        documentMap[docId].relevance = relevancePercentage;
      }
    }

    // Add chunk information
    documentMap[docId].chunks.push({
      text: result.text.substring(0, 100) + "...", // Include a preview of the text
      relevance: relevancePercentage
    });
  });

  // Convert to array and sort by relevance
  const citations = Object.values(documentMap)
    .sort((a, b) => b.relevance - a.relevance);

  return {
    query,
    citations,
    totalDocuments: citations.length,
    totalChunks: searchResults.length
  };
}

// Daily query counter for free tier limitation
let queryCount = 0;
let queryDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

/**
 * Register the RAG query tool with the MCP server
 */
export function registerRagQueryTool(server: McpServer): void {
  logger.info("Registering RAG query tool...");

  server.tool(
    "rag_query", // Tool name used by Claude
    "Process legal queries using Retrieval-Augmented Generation (RAG) to provide grounded answers based on the firm's document repository.",
    { // Input schema validation using Zod
      query: z.string().describe("The natural language legal query from the user."),
      limit: z.number().min(1).max(20).optional().describe("Maximum number of document chunks to retrieve (default: 5).")
    },
    async ({ query, limit = 5 }) => { // Handler function receiving validated arguments
      logger.info(`Received RAG query: ${query} with limit ${limit}`);

      // Check and update daily query count for free tier limitation
      const today = new Date().toISOString().split('T')[0];
      if (today !== queryDate) {
        // Reset counter for new day
        queryCount = 0;
        queryDate = today;
        logger.debug("Reset daily query counter for new day");
      }

      // Check if we've exceeded the daily query limit
      if (queryCount >= config.maxQueriesPerDay) {
        logger.warn(`Daily query limit (${config.maxQueriesPerDay}) exceeded`);
        return {
          content: [{
            type: "text",
            text: `You have reached the daily limit of ${config.maxQueriesPerDay} queries for the free tier. Please try again tomorrow or upgrade to the premium version.`
          }],
          isError: true,
        };
      }

      // Increment query counter
      queryCount++;
      logger.debug(`Query count for today: ${queryCount}/${config.maxQueriesPerDay}`);

      try {
        // Get the document indexer
        const documentIndexer = getDocumentIndexer();

        // Initialize the indexer if needed
        if (!documentIndexer.isInitialized()) {
          await documentIndexer.initialize();
        }

        // Get index statistics
        const indexStats = await documentIndexer.getIndexStats();

        // Check if there are any documents in the index
        if (indexStats.documentCount === 0 && indexStats.chunkCount === 0) {
          return {
            content: [{
              type: "text",
              text: "No documents have been indexed yet. Please index some documents before performing RAG queries."
            }]
          };
        }

        // Retrieve relevant chunks from LanceDB using semantic search
        logger.info(`Retrieving relevant chunks for query: "${query}"`);
        const searchResults = await documentIndexer.searchDocuments(query, limit);

        // Handle scenarios with few or no results gracefully
        if (searchResults.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No documents found that semantically match the query: "${query}". Try a different query or index more documents.`
            }]
          };
        }

        // Create augmented prompt with retrieved context and query
        const augmentedPrompt = createAugmentedPrompt(query, searchResults);

        // Extract citation metadata from search results
        const citationMetadata = extractCitationMetadata(searchResults, query);

        // Return the augmented prompt and citation metadata as a CallToolResult
        return {
          content: [
            // Include the augmented prompt as TextContent
            {
              type: "text",
              text: augmentedPrompt
            },
            // Include citation metadata as structured data
            {
              type: "text",
              text: JSON.stringify(citationMetadata, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error("Error processing RAG query:", error);
        return {
          content: [{ type: "text", text: "An error occurred while processing your query." }],
          isError: true,
        };
      }
    }
  );

  logger.info("RAG query tool registered successfully");
}
