// src/tools/ragQueryTool.ts

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
 * Enhanced RAG Query Tool for Legal Documents
 *
 * This module implements an improved MCP tool for RAG-based legal queries.
 * It provides specialized handling for legal terminology, enhanced citation metadata,
 * and optimized context construction for legal materials.
 */

import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../logger';
import { config } from '../config';
import { getDocumentIndexer } from '../documents/documentIndexer';
import { hybridRetrieval, HybridRetrievalOptions } from '../documents/enhancedRetrieval';
import {
  LegalPromptType,
  detectDocumentType,
  getLegalPromptTemplate,
  PromptTemplateOptions,
} from './legalPromptTemplates';
import {
  createCitations,
  generateCitationMetadata,
  createCitedContext,
  CitationFormat,
} from '../documents/citationTracker';
import { existsSync } from 'fs';
import { getLegalContextFilePath } from '../utils/paths';

// File path for storing query counter data in the .legalcontext directory
const QUERY_COUNTER_FILE = getLegalContextFilePath('query_counter.json');

// Daily query counter for free tier limitation
let queryCount = 0;
let queryDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

/**
 * Load query counter data from file
 */
function loadQueryCounter() {
  try {
    if (existsSync(QUERY_COUNTER_FILE)) {
      const data = Bun.file(QUERY_COUNTER_FILE);
      const counterData = JSON.parse(data.toString());
      queryCount = counterData.count || 0;
      queryDate = counterData.date || new Date().toISOString().split('T')[0];
      logger.debug(`Loaded query counter from file: ${queryCount} queries on ${queryDate}`);
    } else {
      logger.debug('No query counter file found, using default values');
    }
  } catch (error) {
    logger.error('Error loading query counter from file:', error);
    // Continue with default values if file can't be read
  }
}

/**
 * Save query counter data to file
 */
async function saveQueryCounter() {
  try {
    const counterData = {
      count: queryCount,
      date: queryDate,
    };
    await Bun.write(QUERY_COUNTER_FILE, JSON.stringify(counterData, null, 2));
    logger.debug(`Saved query counter to file: ${queryCount} queries on ${queryDate}`);
  } catch (error) {
    logger.error('Error saving query counter to file:', error);
  }
}

// Initialize counter from file on module load
loadQueryCounter();

/**
 * Specialized legal query preprocessing
 * Identifies and expands legal terminology to improve search results
 */
function preprocessLegalQuery(query: string): string {
  // Convert to lowercase for processing
  const lowerQuery = query.toLowerCase();

  // Common legal terms dictionary
  const legalTerms: Record<string, string[]> = {
    'nda': ['non-disclosure agreement', 'confidentiality agreement'],
    'ip': ['intellectual property', 'patents', 'trademarks', 'copyrights'],
    'toc': ['table of contents', 'contents section'],
    'rep': ['representation', 'warranty'],
    'reps and warranties': ['representations and warranties'],
    'io': ['indemnification obligation'],
    'loi': ['letter of intent'],
    'mou': ['memorandum of understanding'],
    'poa': ['power of attorney'],
    'k': ['contract', 'agreement'],
    'sla': ['service level agreement'],
    'dpa': ['data processing agreement', 'data protection agreement'],
    'eula': ['end user license agreement'],
    'tos': ['terms of service', 'terms and conditions'],
    'sow': ['statement of work', 'scope of work'],
    'msa': ['master service agreement', 'master services agreement'],
  };

  // Check for legal abbreviations and expand them
  let expandedQuery = query;

  for (const [abbr, expansions] of Object.entries(legalTerms)) {
    // Look for the abbreviation as a standalone word
    const regex = new RegExp(`\\b${abbr}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      // Add expanded terms to the query
      expandedQuery += ' ' + expansions.join(' ');
      logger.debug(`Expanded legal term "${abbr}" to "${expansions.join(', ')}"`);
    }
  }

  // Check for jurisdiction-specific terms
  if (lowerQuery.includes('state law') ||
    lowerQuery.includes('california') ||
    lowerQuery.includes('new york') ||
    lowerQuery.includes('texas') ||
    lowerQuery.includes('florida')) {
    expandedQuery += ' jurisdiction state-specific governing-law state-law';
  }

  if (lowerQuery.includes('federal') ||
    lowerQuery.includes('federal law') ||
    lowerQuery.includes('federal court')) {
    expandedQuery += ' federal-law federal-jurisdiction federal-court';
  }

  // Check for document type inquiries
  if (lowerQuery.includes('agreement') ||
    lowerQuery.includes('contract') ||
    lowerQuery.includes('terms')) {
    expandedQuery += ' legal-document agreement contract legal-agreement';
  }

  if (lowerQuery.includes('case') ||
    lowerQuery.includes('lawsuit') ||
    lowerQuery.includes('litigation')) {
    expandedQuery += ' legal-case lawsuit litigation legal-proceeding';
  }

  // Return original query if no expansions were made
  if (expandedQuery === query) {
    return query;
  }

  logger.debug(`Preprocessed legal query: "${query}" -> "${expandedQuery}"`);
  return expandedQuery;
}

/**
 * Register the enhanced RAG query tool with the MCP server
 */
export function registerRagQueryTool(server: McpServer): void {
  logger.info('Registering enhanced legal RAG query tool...');

  server.tool(
    'rag_query', // Tool name used by Claude
    'Process legal queries using Retrieval-Augmented Generation (RAG) to provide grounded answers based on the firm\'s document repository.',
    { // Input schema validation using Zod
      query: z.string().describe('The natural language legal query from the user.'),
      limit: z.number().min(1).max(20).optional().describe('Maximum number of document chunks to retrieve (default: 5).'),
      documentType: z.string().optional().describe('Optional filter for specific document types (e.g., \'contract\', \'nda\', \'employment\').'),
      jurisdiction: z.string().optional().describe('Optional jurisdiction filter for legal documents.'),
      citationFormat: z.enum(['bluebook', 'simple', 'apa', 'alwd']).optional().describe('Citation format to use in the response.'),
    },
    async ({ query, limit = 5, documentType, jurisdiction, citationFormat = 'bluebook' }) => { // Handler function receiving validated arguments
      logger.info(`Received RAG query: ${query} with limit ${limit}${documentType ? `, document type: ${documentType}` : ''}${jurisdiction ? `, jurisdiction: ${jurisdiction}` : ''}`);

      // Check and update daily query count for free tier limitation
      const today = new Date().toISOString().split('T')[0];
      if (today !== queryDate) {
        // Reset counter for new day
        queryCount = 0;
        queryDate = today;
        logger.debug('Reset daily query counter for new day');

        // Save updated counter
        await saveQueryCounter();
      }

      // Check if we've exceeded the daily query limit
      if (queryCount >= config.maxQueriesPerDay) {
        logger.warn(`Daily query limit (${config.maxQueriesPerDay}) exceeded`);
        return {
          content: [{
            type: 'text',
            text: `You have reached the daily limit of ${config.maxQueriesPerDay} queries for the free tier. Please try again tomorrow or upgrade to the premium version.`,
          }],
          isError: true,
        };
      }

      // Increment query counter
      queryCount++;
      logger.debug(`Query count for today: ${queryCount}/${config.maxQueriesPerDay}`);

      // Save updated counter
      await saveQueryCounter();

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
              type: 'text',
              text: 'No documents have been indexed yet. Please index some documents before performing RAG queries.',
            }],
          };
        }

        // Preprocess the query for legal terminology
        const preprocessedQuery = preprocessLegalQuery(query);
        logger.debug(`Original query: "${query}" -> Preprocessed query: "${preprocessedQuery}"`);

        // Prepare search options
        const searchOptions: HybridRetrievalOptions = {
          reranking: true,
          contextWindowSize: 8000, // Optimize context window for Claude
        };

        // Add filters if specified
        if (documentType || jurisdiction) {
          searchOptions.filter = {};

          if (documentType) {
            searchOptions.filter.clauseType = documentType;
          }

          if (jurisdiction) {
            searchOptions.filter.jurisdiction = jurisdiction;
          }
        }

        // Retrieve relevant chunks using hybrid retrieval
        logger.info(`Retrieving relevant chunks for query using enhanced hybrid retrieval`);
        const searchResults = await hybridRetrieval(preprocessedQuery, limit, searchOptions);

        // Handle scenarios with few or no results gracefully
        if (searchResults.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `No documents found that semantically match the query: "${query}". Try a different query or index more documents.`,
            }],
          };
        }

        // Create context with enhanced citation markers
        const citedContext = createCitedContext(searchResults);

        // Detect document type and prepare prompt options
        const documentType = detectDocumentType(searchResults);
        const promptOptions: PromptTemplateOptions = {
          includeBlueBookCitations: citationFormat === 'bluebook',
          includeAnalysisGuidance: true,
          includeLegalDisclaimer: true,
          formality: 'formal',
          jurisdiction: jurisdiction,
        };

        // Get specialized legal prompt template
        const template = getLegalPromptTemplate(documentType, promptOptions);

        // Create augmented prompt with context and query
        const augmentedPrompt = template
          .replace('{{context}}', citedContext)
          .replace('{{query}}', query);

        // Create enhanced citations for metadata
        const citations = createCitations(searchResults);

        // Generate citation metadata for Claude
        const citationMetadata = generateCitationMetadata(query, citations, searchResults);

        // Return the augmented prompt and citation metadata as a CallToolResult
        return {
          content: [
            // Include the augmented prompt as TextContent
            {
              type: 'text',
              text: augmentedPrompt,
            },
            // Include enhanced citation metadata as structured data
            {
              type: 'text',
              text: JSON.stringify(citationMetadata, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error('Error processing enhanced legal RAG query:', error);
        return {
          content: [{ type: 'text', text: 'An error occurred while processing your legal query.' }],
          isError: true,
        };
      }
    },
  );

  logger.info('Enhanced legal RAG query tool registered successfully');
}
