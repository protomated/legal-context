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
 * Enhanced legal-specific normalization patterns for improved embedding
 * These help standardize legal terms and citations before embedding
 * while preserving semantic meaning for vector representation
 */
const LEGAL_NORMALIZATION_PATTERNS: [RegExp, string][] = [
  // Standardize case citations with more comprehensive pattern
  [/([A-Za-z\s.,']+)\s+v\.\s+([A-Za-z\s.,']+),\s+(\d+)\s+(?:F\.|U\.S\.|S\.Ct\.|P\.|A\.|Cal\.|N\.Y\.|Tex\.|Ill\.|Pa\.|Ohio|Fla\.|Mass\.|N\.J\.|Wash\.|Mich\.|Ga\.|N\.C\.|Va\.)(?:\d+d?)?\s+(\d+)(?:\s+\([A-Za-z\d\s.]+\s+\d{4}\))?/g, 'CASE_CITATION'],

  // Standardize statute citations with expanded coverage
  [/(\d+)\s+([A-Za-z.]+)(?:\s+[Cc]ode)?\s+§+\s+(\d+[A-Za-z\d.-]*)/g, 'STATUTE_CITATION'],

  // Additional statute citation formats
  [/(?:U\.S\.C\.|C\.F\.R\.|Fed\. Reg\.)\s+§+\s+(\d+[A-Za-z\d.-]*)/g, 'FEDERAL_STATUTE_CITATION'],

  // State statute citations
  [/(?:[A-Z][a-z]+\.)\s+(?:Rev\.|Gen\.|Ann\.|Comp\.)\s+(?:Stat\.|Code|Laws)\s+§+\s+(\d+[A-Za-z\d.-]*)/g, 'STATE_STATUTE_CITATION'],

  // Standardize legal document references with expanded patterns
  [/(?:pursuant to|in accordance with|as defined in|as set forth in|as provided in|as required by|as contemplated by|as described in|as specified in)\s+(?:Section|Article|Paragraph|Clause|Schedule|Exhibit|Appendix)\s+[A-Z0-9.]+/gi, 'DOCUMENT_REFERENCE'],

  // Standardize common Latin legal phrases with expanded list
  [/(?:inter alia|prima facie|de novo|ex parte|in camera|pro se|sua sponte|sub judice|amicus curiae|habeas corpus|res judicata|stare decisis|quid pro quo|bona fide|mens rea|actus reus|voir dire|per curiam|certiorari|mandamus|ab initio|in personam|in rem|lex loci|modus operandi|pendente lite|pro rata|pro tanto|quantum meruit|sine qua non|ultra vires)/gi, 'LATIN_PHRASE'],

  // Common legal abbreviations with expanded list
  [/(?:\b(?:LLC|LLP|Inc\.|Corp\.|P\.A\.|Ltd\.|PLLC|PC|DBA|et al\.|i\.e\.|e\.g\.|etc\.|ibid\.|op\. cit\.|supra|infra|viz\.|cf\.|et seq\.|ff\.|id\.|n\.b\.)\b)/g, 'LEGAL_ABBREV'],

  // Legal document types
  [/(?:\b(?:Agreement|Contract|Memorandum|Affidavit|Declaration|Stipulation|Order|Judgment|Decree|Opinion|Brief|Motion|Petition|Complaint|Answer|Reply|Interrogatory|Deposition|Subpoena|Warrant|Indictment|Verdict|Settlement|Release|Waiver|Amendment|Addendum|Exhibit|Appendix|Schedule|Annex)\b)/g, 'LEGAL_DOCUMENT_TYPE'],

  // Legal parties and roles
  [/(?:\b(?:Plaintiff|Defendant|Petitioner|Respondent|Appellant|Appellee|Claimant|Prosecutor|Counsel|Attorney|Judge|Justice|Magistrate|Arbitrator|Mediator|Trustee|Executor|Administrator|Guardian|Witness|Expert|Jury)\b)/g, 'LEGAL_ROLE'],

  // Contract-specific terminology
  [/(?:\b(?:Consideration|Offer|Acceptance|Performance|Breach|Damages|Remedy|Indemnification|Warranty|Representation|Covenant|Condition|Term|Termination|Default|Force Majeure|Assignment|Severability|Waiver|Amendment|Governing Law|Jurisdiction|Venue|Arbitration|Mediation|Dispute Resolution|Confidentiality|Non-Disclosure|Non-Compete|Intellectual Property|Limitation of Liability)\b)/g, 'CONTRACT_TERM'],
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
 * Enhanced preprocessing for legal text before embedding
 * This normalizes legal-specific patterns and enhances embedding quality
 * with specialized handling for legal document structure and terminology
 */
function preprocessLegalText(text: string): string {
  // Apply legal-specific normalization patterns
  let processedText = text;

  // First, preserve important legal context by marking key sections
  // This helps maintain semantic meaning in the embeddings
  processedText = markLegalSections(processedText);

  // Apply normalization patterns to standardize legal terminology
  for (const [pattern, replacement] of LEGAL_NORMALIZATION_PATTERNS) {
    processedText = processedText.replace(pattern, replacement);
  }

  // Handle enumerated lists which are common in legal docs
  // Enhanced to handle more list formats common in legal documents
  processedText = processedText.replace(
    /^\s*(?:[0-9]+\.|[a-z]\.|[A-Z]\.|\([i|v|x]+\)|\([a-z]\)|\([0-9]+\)|\d+\)\s|\([a-zA-Z]\)\s|[a-zA-Z]\)\s)/gm,
    'LIST_ITEM '
  );

  // Handle legal document sections with more comprehensive patterns
  processedText = processedText.replace(
    /(?:ARTICLE|Section|SECTION|Article|Part|PART|Chapter|CHAPTER|Clause|CLAUSE)\s+([IVX0-9]+[A-Za-z]?(?:\.[0-9]+)?)/g,
    'SECTION_REFERENCE'
  );

  // Handle legal definitions which are important for semantic understanding
  processedText = processedText.replace(
    /["']([^"']+)["']\s+(?:means|shall mean|refers to|is defined as|shall be defined as)/g,
    'LEGAL_DEFINITION'
  );

  // Handle legal conditions and requirements
  processedText = processedText.replace(
    /(?:provided that|subject to|conditioned upon|notwithstanding|except as|unless otherwise|to the extent that)/gi,
    'LEGAL_CONDITION'
  );

  // Handle legal obligations and permissions
  processedText = processedText.replace(
    /(?:shall|must|will|may|is entitled to|is obligated to|is required to|is permitted to|is prohibited from)/g,
    'LEGAL_MODAL'
  );

  // Handle dates in legal documents
  processedText = processedText.replace(
    /(?:dated as of|effective as of|as of the date|on the \d+(?:st|nd|rd|th) day of|dated this \d+(?:st|nd|rd|th) day)/g,
    'LEGAL_DATE_REFERENCE'
  );

  // Handle monetary amounts in legal documents
  processedText = processedText.replace(
    /\$\d+(?:,\d+)*(?:\.\d+)?(?:\s+(?:USD|dollars|US dollars))?/g,
    'MONETARY_AMOUNT'
  );

  // Handle percentage values in legal documents
  processedText = processedText.replace(
    /\d+(?:\.\d+)?(?:\s+)?(?:percent|%)/g,
    'PERCENTAGE_VALUE'
  );

  // Handle time periods in legal documents
  processedText = processedText.replace(
    /(?:\d+(?:\s+))?(?:days|months|years|weeks|hours|minutes)(?:\s+(?:after|from|following|prior to|before))?/g,
    'TIME_PERIOD'
  );

  return processedText;
}

/**
 * Mark important legal sections to preserve context
 * This helps maintain the semantic structure of legal documents
 */
function markLegalSections(text: string): string {
  let markedText = text;

  // Mark document title/header
  const titleMatch = markedText.match(/^(.{0,500}?)(?:\n\n|\r\n\r\n)/);
  if (titleMatch && titleMatch[1]) {
    markedText = markedText.replace(titleMatch[1], `DOCUMENT_TITLE: ${titleMatch[1]}`);
  }

  // Mark recitals/whereas clauses
  markedText = markedText.replace(
    /(WHEREAS[^;]+;)/gi,
    'RECITAL: $1'
  );

  // Mark definitions section
  markedText = markedText.replace(
    /(?:Definitions|DEFINITIONS)(?:\.|:)(?:\s+|$)((?:.+?\n)+?)(?:\n\n|\r\n\r\n)/,
    'DEFINITIONS_SECTION: $1'
  );

  // Mark signature blocks
  markedText = markedText.replace(
    /(?:IN WITNESS WHEREOF|EXECUTED as of the date|The parties have executed this Agreement)(.+?)(?:$|(?:\n\n|\r\n\r\n))/s,
    'SIGNATURE_BLOCK: $1'
  );

  return markedText;
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

    // Make sure we have some text to embed
    if (!text || text.trim().length === 0) {
      logger.warn('Empty text provided for embedding, returning zero vector');
      return Array(EMBEDDING_DIMENSION).fill(0);
    }

    // Check cache first
    const cacheKey = text.slice(0, 1000); // Use first 1000 chars as cache key to avoid excessive memory usage
    if (embeddingCache.has(cacheKey)) {
      return embeddingCache.get(cacheKey)!;
    }

    // Preprocess the text with legal-specific normalizations
    const preprocessedText = preprocessLegalText(text);
    logger.debug(`Generating embedding for text (${preprocessedText.length} chars)`);

    // Get the pipeline instance
    const embeddingPipeline = await getEmbeddingPipeline();

    // Generate embedding with detailed error handling
    try {
      // Generate embedding
      const output = await embeddingPipeline(preprocessedText, {
        pooling: 'mean', // Average pooling for sentence embeddings
        normalize: true,   // Normalize the embeddings
      });

      // Convert to standard JavaScript array
      const embedding = Array.from(output.data as Float32Array);

      // Validate embedding and ensure normalization
      if (!embedding || embedding.length === 0) {
        logger.error('Empty embedding generated');
        return Array(EMBEDDING_DIMENSION).fill(0.1); // Return a fallback embedding
      }

      if (embedding.some(val => isNaN(val))) {
        logger.error('Embedding contains NaN values');
        return Array(EMBEDDING_DIMENSION).fill(0.1); // Return a fallback embedding
      }

      // Log embedding stats for debugging
      const sum = embedding.reduce((acc, val) => acc + val, 0);
      const mag = Math.sqrt(embedding.reduce((acc, val) => acc + val * val, 0));
      logger.debug(`Embedding stats: sum=${sum.toFixed(2)}, magnitude=${mag.toFixed(2)}, dimension=${embedding.length}`);

      // Ensure normalized embedding
      if (Math.abs(mag - 1.0) > 0.01) {
        logger.debug('Re-normalizing embedding vector');
        // Re-normalize if not already normalized
        const normalizedEmbedding = embedding.map(val => val / mag);
        embeddingCache.set(cacheKey, normalizedEmbedding);
        return normalizedEmbedding;
      }

      // Add to cache
      embeddingCache.set(cacheKey, embedding);
      return embedding;
    } catch (pipelineError) {
      logger.error(`Pipeline error generating embedding: ${pipelineError}`);
      throw pipelineError;
    }
  } catch (error) {
    logger.error('Error generating embedding:', error);
    // Return a fallback embedding of the correct dimension
    return Array(EMBEDDING_DIMENSION).fill(0.1);
  }
}

/**
 * Generate an embedding for a search query
 * This adds legal-specific query preprocessing
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    if (!query || query.trim().length === 0) {
      logger.warn('Empty query provided for embedding, returning zero vector');
      return Array(EMBEDDING_DIMENSION).fill(0);
    }

    // Preprocess the query for legal search
    const enhancedQuery = enhanceQueryForLegalSearch(query);

    // Generate the embedding
    return generateEmbedding(enhancedQuery);
  } catch (error) {
    logger.error('Error generating query embedding:', error);
    // Return a fallback embedding of the correct dimension
    return Array(EMBEDDING_DIMENSION).fill(0.1);
  }
}

/**
 * Enhanced query preprocessing for legal search
 * This function improves matching between queries and legal documents by:
 * 1. Expanding legal abbreviations and terminology
 * 2. Identifying legal concepts in the query
 * 3. Adding relevant legal context
 * 4. Applying specialized preprocessing for legal search
 */
function enhanceQueryForLegalSearch(query: string): string {
  let enhancedQuery = query;

  // Expand common legal abbreviations to improve matching
  enhancedQuery = enhancedQuery
    // Legal entity types
    .replace(/\bP\.A\./g, 'Professional Association')
    .replace(/\bLLC\b/g, 'Limited Liability Company')
    .replace(/\bLLP\b/g, 'Limited Liability Partnership')
    .replace(/\bInc\b/g, 'Incorporated')
    .replace(/\bCorp\b/g, 'Corporation')
    .replace(/\bLtd\b/g, 'Limited')
    .replace(/\bPLLC\b/g, 'Professional Limited Liability Company')
    .replace(/\bPC\b/g, 'Professional Corporation')
    .replace(/\bDBA\b/g, 'Doing Business As')

    // Legal citation abbreviations
    .replace(/\bv\.\b/g, 'versus')
    .replace(/\bet al\.\b/g, 'and others')
    .replace(/\bet seq\.\b/g, 'and the following')
    .replace(/\bex rel\.\b/g, 'on behalf of')
    .replace(/\bid\.\b/g, 'the same')
    .replace(/\bibid\.\b/g, 'in the same place')
    .replace(/\bsupra\b/g, 'above')
    .replace(/\binfra\b/g, 'below')

    // General Latin abbreviations
    .replace(/\bi\.e\.\b/g, 'that is')
    .replace(/\be\.g\.\b/g, 'for example')
    .replace(/\bviz\.\b/g, 'namely')
    .replace(/\bcf\.\b/g, 'compare')

    // Common legal document abbreviations
    .replace(/\bK\b/g, 'contract')
    .replace(/\bAgmt\b/g, 'agreement')
    .replace(/\bAmend\b/g, 'amendment');

  // Identify and enhance legal concepts in the query

  // Contract-related queries
  if (/\b(?:contract|agreement|clause|provision|term|condition)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' contract agreement provision term condition clause';
  }

  // Litigation-related queries
  if (/\b(?:case|lawsuit|litigation|plaintiff|defendant|court|judge|ruling|decision)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' case lawsuit litigation court legal proceeding';
  }

  // Intellectual property queries
  if (/\b(?:patent|trademark|copyright|intellectual property|IP|trade secret)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' intellectual property IP rights protection';
  }

  // Employment-related queries
  if (/\b(?:employee|employment|hire|termination|compensation|benefits|salary)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' employment employee employer workplace';
  }

  // Real estate queries
  if (/\b(?:property|real estate|lease|tenant|landlord|rent|mortgage)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' property real estate land building';
  }

  // Corporate/business queries
  if (/\b(?:corporation|company|business|merger|acquisition|shareholder|stock|board|director)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' corporation company business entity';
  }

  // Regulatory/compliance queries
  if (/\b(?:regulation|compliance|regulatory|law|statute|rule|requirement)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' regulation compliance legal requirement';
  }

  // Handle specific legal document section queries
  if (/\b(?:section|article|clause|paragraph|provision)\s+(\d+|[IVX]+|[A-Z])\b/i.test(enhancedQuery)) {
    enhancedQuery += ' SECTION_REFERENCE';
  }

  // Handle definition queries
  if (/\bdefin(?:e|ition|ed)\b/i.test(enhancedQuery)) {
    enhancedQuery += ' LEGAL_DEFINITION means shall mean is defined as';
  }

  // Apply legal-specific preprocessing
  return preprocessLegalText(enhancedQuery);
}

/**
 * Clear the embedding cache to free memory
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  // Also reset the pipeline promise to force reloading the model
  embeddingPipelinePromise = null;
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
    memoryUsageEstimate: memoryUsage,
  };
}
