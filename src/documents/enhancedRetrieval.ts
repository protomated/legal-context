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
 * Enhanced Retrieval Module
 *
 * This module implements advanced retrieval strategies including:
 * - Hybrid retrieval (combining vector and keyword search)
 * - Re-ranking of retrieved documents for improved relevance
 * - Context window optimization to maximize relevant information
 */

import { logger } from '../logger';
import { SearchResult, getDocumentIndexer } from './documentIndexer';

/**
 * Interface for keyword match result
 */
interface KeywordMatchResult {
  documentId: string;
  text: string;
  score: number;
  matchedTerms: string[];
}

/**
 * Options for hybrid retrieval
 */
export interface HybridRetrievalOptions {
  vectorWeight?: number; // Weight for vector search (0-1), default 0.7
  keywordWeight?: number; // Weight for keyword search (0-1), default 0.3
  minKeywordScore?: number; // Minimum score for keyword matches to be considered
  reranking?: boolean; // Whether to apply re-ranking
  contextWindowSize?: number; // Maximum size of context window in characters
}

/**
 * Extracts keywords from a query for keyword-based search
 */
function extractKeywords(query: string): string[] {
  // Convert to lowercase and remove special characters
  const cleanedQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ');

  // Split into words
  const words = cleanedQuery.split(/\s+/).filter(word => word.length > 0);

  // Filter out stopwords
  const stopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'to', 'from', 'in',
    'on', 'at', 'by', 'for', 'with', 'about', 'of'
  ]);

  return words.filter(word => !stopwords.has(word) && word.length > 2);
}

/**
 * Performs keyword-based search on text chunks
 */
async function keywordSearch(query: string, limit: number): Promise<KeywordMatchResult[]> {
  // Extract keywords from the query
  const keywords = extractKeywords(query);

  if (keywords.length === 0) {
    logger.debug('No meaningful keywords extracted from query');
    return [];
  }

  logger.debug(`Extracted keywords for search: ${keywords.join(', ')}`);

  // Get all documents from the index for keyword matching
  // In a production environment, this should be optimized to avoid loading all documents
  const documentIndexer = getDocumentIndexer();
  const allDocuments = await documentIndexer.searchDocuments('', { limit: 1000 });

  // Score documents based on keyword matches
  const results: KeywordMatchResult[] = [];

  for (const doc of allDocuments) {
    // Count keyword occurrences
    const text = doc.text.toLowerCase();
    const matchedTerms: string[] = [];
    let matchScore = 0;

    for (const keyword of keywords) {
      // Use regex to find whole word matches
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);

      if (matches && matches.length > 0) {
        matchedTerms.push(keyword);
        // Score is based on term frequency and weighted by term length
        matchScore += matches.length * (keyword.length / 4);
      }
    }

    // Only include documents with at least one match
    if (matchedTerms.length > 0) {
      results.push({
        documentId: doc.documentId,
        text: doc.text,
        score: matchScore,
        matchedTerms
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Return top results
  return results.slice(0, limit);
}

/**
 * Re-ranks search results using a more sophisticated algorithm
 * that considers:
 * - Term proximity (terms appearing close together rank higher)
 * - Document attributes (newer documents rank higher)
 * - Keyword density
 * - Document length normalization
 */
function reRankResults(results: SearchResult[], query: string): SearchResult[] {
  logger.debug(`Re-ranking ${results.length} search results`);

  const keywords = extractKeywords(query);
  if (keywords.length === 0) return results;

  // Clone results to avoid modifying originals
  const rerankedResults = [...results];

  for (const result of rerankedResults) {
    let bonusScore = 0;
    const text = result.text.toLowerCase();

    // 1. Term proximity - Check if keywords appear close to each other
    for (let i = 0; i < keywords.length; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        const idx1 = text.indexOf(keywords[i]);
        const idx2 = text.indexOf(keywords[j]);

        if (idx1 >= 0 && idx2 >= 0) {
          // Calculate proximity - closer terms get higher bonus
          const distance = Math.abs(idx1 - idx2);
          if (distance < 50) bonusScore += (50 - distance) / 100;
        }
      }
    }

    // 2. Document recency bonus (if date is available)
    if (result.metadata?.updated) {
      const updatedDate = new Date(result.metadata.updated);
      const now = new Date();
      const ageInDays = (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Documents less than 30 days old get a bonus
      if (ageInDays < 30) bonusScore += (30 - ageInDays) / 100;
    }

    // 3. Legal relevance bonus (if the document is a legal document type)
    if (result.metadata?.category) {
      const legalCategories = ['contract', 'agreement', 'filing', 'case', 'brief', 'opinion', 'legislation'];
      if (legalCategories.some(cat => result.metadata?.category?.toLowerCase().includes(cat))) {
        bonusScore += 0.1;
      }
    }

    // 4. Keyword density
    let keywordCount = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) keywordCount += matches.length;
    }

    const density = keywordCount / (text.length / 100); // Keywords per 100 chars
    bonusScore += density / 20; // Normalized bonus

    // Apply the combined bonus (reducing the original score - lower is better)
    result.score = Math.max(0, result.score - bonusScore * 0.3);
  }

  // Sort by adjusted score (ascending because lower scores are better)
  rerankedResults.sort((a, b) => a.score - b.score);

  logger.debug('Results re-ranked based on enhanced criteria');
  return rerankedResults;
}

/**
 * Optimizes the context window by:
 * 1. Ensuring most relevant chunks are included
 * 2. Trimming overlapping content
 * 3. Keeping within token limits
 * 4. Preserving document boundaries
 */
function optimizeContextWindow(results: SearchResult[], maxSize: number = 10000): SearchResult[] {
  logger.debug(`Optimizing context window for ${results.length} chunks, max size: ${maxSize} chars`);

  if (results.length === 0) return [];

  // Group by document to preserve document boundaries
  const docGroups: { [docId: string]: SearchResult[] } = {};

  for (const result of results) {
    if (!docGroups[result.documentId]) {
      docGroups[result.documentId] = [];
    }
    docGroups[result.documentId].push(result);
  }

  // Sort chunks within each document by relevance
  for (const docId in docGroups) {
    docGroups[docId].sort((a, b) => a.score - b.score);
  }

  // Calculate total size
  let totalSize = 0;
  const optimizedResults: SearchResult[] = [];

  // First pass: add highest ranked chunk from each document
  for (const docId in docGroups) {
    if (docGroups[docId].length > 0) {
      const topChunk = docGroups[docId][0];
      optimizedResults.push(topChunk);
      totalSize += topChunk.text.length;
      // Remove the added chunk
      docGroups[docId].shift();
    }
  }

  // Second pass: continue adding chunks until we hit the size limit
  // Add chunks in rounds, taking the most relevant chunk from each document
  while (totalSize < maxSize) {
    let added = false;

    for (const docId in docGroups) {
      if (docGroups[docId].length > 0) {
        const nextChunk = docGroups[docId][0];

        // Check if adding this chunk exceeds the limit
        if (totalSize + nextChunk.text.length <= maxSize) {
          optimizedResults.push(nextChunk);
          totalSize += nextChunk.text.length;
          docGroups[docId].shift();
          added = true;
        }
      }
    }

    // If we couldn't add any more chunks, break
    if (!added) break;
  }

  // Sort final results by relevance
  optimizedResults.sort((a, b) => a.score - b.score);

  logger.debug(`Context window optimized to ${optimizedResults.length} chunks, total size: ${totalSize} chars`);
  return optimizedResults;
}

/**
 * Performs hybrid retrieval combining vector search and keyword search
 */
export async function hybridRetrieval(
  query: string,
  limit: number = 5,
  options: HybridRetrievalOptions = {}
): Promise<SearchResult[]> {
  logger.info(`Performing hybrid retrieval for query: "${query}" with limit ${limit}`);

  // Set default options
  const vectorWeight = options.vectorWeight ?? 0.7;
  const keywordWeight = options.keywordWeight ?? 0.3;
  const minKeywordScore = options.minKeywordScore ?? 0.1;
  const useReranking = options.reranking ?? true;
  const contextSize = options.contextWindowSize ?? 10000;

  // Get vector search results
  const documentIndexer = getDocumentIndexer();
  const vectorResults = await documentIndexer.searchDocuments(query, { limit: limit * 2 });

  logger.debug(`Vector search returned ${vectorResults.length} results`);

  // Get keyword search results
  const keywordResults = await keywordSearch(query, limit * 2);
  logger.debug(`Keyword search returned ${keywordResults.length} results`);

  // Normalize scores for both result sets
  // For vector results, lower score means more similar
  const maxVectorScore = Math.max(...vectorResults.map(r => r.score), 0.0001);
  for (const result of vectorResults) {
    result.score = result.score / maxVectorScore;
  }

  // For keyword results, higher score means more relevant
  const maxKeywordScore = Math.max(...keywordResults.map(r => r.score), 0.0001);

  // Combine results
  const combinedResults = new Map<string, SearchResult>();

  // Add vector results to combined map
  for (const result of vectorResults) {
    combinedResults.set(result.documentId, {
      ...result,
      score: result.score * vectorWeight // Lower is better
    });
  }

  // Merge in keyword results
  for (const result of keywordResults) {
    const normalizedScore = 1 - (result.score / maxKeywordScore); // Convert to "lower is better"

    // Only include keyword results with scores above the minimum threshold
    if (normalizedScore <= (1 - minKeywordScore)) {
      const existingResult = combinedResults.get(result.documentId);

      if (existingResult) {
        // Combine scores
        existingResult.score = (existingResult.score * vectorWeight) + (normalizedScore * keywordWeight);
      } else {
        // Add new result
        combinedResults.set(result.documentId, {
          documentId: result.documentId,
          documentName: result.documentId, // We don't have the name in keyword results, will be fixed later
          text: result.text,
          score: normalizedScore * keywordWeight,
          metadata: {}
        });
      }
    }
  }

  // Convert map to array
  let results = Array.from(combinedResults.values());

  // Apply re-ranking if enabled
  if (useReranking) {
    results = reRankResults(results, query);
  }

  // Optimize for context window
  results = optimizeContextWindow(results, contextSize);

  // Return top results based on limit
  return results.slice(0, limit);
}
