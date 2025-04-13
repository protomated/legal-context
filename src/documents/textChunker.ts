// Path: /Users/deletosh/projects/legal-context/src/documents/textChunker.ts

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
 * Enhanced Legal Document Text Chunking Module
 *
 * This module handles splitting document text into appropriate chunks for embedding.
 * It is specifically optimized for legal documents, preserving section structure,
 * handling legal citations, and maintaining clause integrity.
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
  // Additional metadata to help with legal document structure
  sectionTitle?: string;
  sectionNumber?: string;
  isHeading?: boolean;
  // Legal-specific metadata
  citations?: string[];
  caseReferences?: string[];
  statuteReferences?: string[];
  clauseType?: string;
}

/**
 * Legal document section patterns for improved chunking
 */
const LEGAL_SECTION_PATTERNS = [
  // Article/Section patterns with Roman or Arabic numerals
  /(?:ARTICLE|Section|SECTION|Article)\s+([IVX0-9]+[A-Za-z]?(?:\.[0-9]+)?)\s*[.-]?\s*([^\n]+)/g,
  // Numbered paragraph patterns (e.g., "1. Introduction")
  /([0-9]+(?:\.[0-9]+)?)\s+([A-Z][^\n.]+\.)/g,
  // Roman numeral patterns (e.g., "I. Introduction")
  /([IVX]+)\.\s+([A-Z][^\n.]+\.)/g,
  // Lettered paragraph patterns (e.g., "A. Definitions")
  /([A-Z])\.\s+([A-Z][^\n.]+\.)/g,
  // Common legal document section headers
  /^(WITNESSETH|RECITALS|DEFINITIONS|REPRESENTATIONS AND WARRANTIES|COVENANTS|CONDITIONS PRECEDENT|INDEMNIFICATION|TERMINATION|MISCELLANEOUS|EXHIBITS|APPENDIX|SCHEDULE|ANNEX):?$/gmi
];

/**
 * Citation and reference patterns for legal documents
 */
const LEGAL_CITATION_PATTERNS = [
  // Case citations (e.g., "Smith v. Jones, 123 F.3d 456 (9th Cir. 1999)")
  /([A-Za-z\s.,']+)\s+v\.\s+([A-Za-z\s.,']+),\s+(\d+)\s+(F\.|U\.S\.|S\.Ct\.|P\.)(\d+d?)?\s+(\d+)(?:\s+\(([A-Za-z\d\s.]+)\s+(\d{4})\))?/g,
  // Statute citations (e.g., "42 U.S.C. § 1983")
  /(\d+)\s+([A-Za-z.]+)(?:\s+[Cc]ode)?\s+§+\s+(\d+[A-Za-z\d.-]*)/g,
  // Regulation citations (e.g., "17 C.F.R. § 240.10b-5")
  /(\d+)\s+([A-Za-z.]+)\s+§+\s+(\d+\.\d+[A-Za-z\d.-]*)/g
];

/**
 * Common legal clause types for categorization
 */
const LEGAL_CLAUSE_TYPES = [
  {pattern: /indemnif(?:y|ication|ied)/i, type: "indemnification"},
  {pattern: /terminat(?:e|ion)/i, type: "termination"},
  {pattern: /confidential(?:ity)?/i, type: "confidentiality"},
  {pattern: /warrant(?:y|ies)/i, type: "warranty"},
  {pattern: /represent(?:s|ation)/i, type: "representation"},
  {pattern: /covenant(?:s)?/i, type: "covenant"},
  {pattern: /non[- ]compete/i, type: "non-compete"},
  {pattern: /governing\s+law/i, type: "governing-law"},
  {pattern: /arbitration/i, type: "dispute-resolution"},
  {pattern: /force\s+majeure/i, type: "force-majeure"},
  {pattern: /assignment/i, type: "assignment"},
  {pattern: /severability/i, type: "severability"},
  {pattern: /entire\s+agreement/i, type: "entire-agreement"},
  {pattern: /amendment/i, type: "amendment"},
  {pattern: /waiver/i, type: "waiver"},
  {pattern: /notice/i, type: "notice"},
  {pattern: /compliance\s+with\s+laws/i, type: "compliance"},
  {pattern: /intellectual\s+property/i, type: "intellectual-property"},
];

/**
 * Extract section titles and numbers from legal documents
 * This helps preserve document structure in chunks
 */
function extractSectionInfo(text: string): { title: string, number: string } | null {
  for (const pattern of LEGAL_SECTION_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    const match = pattern.exec(text);
    if (match) {
      return {
        number: match[1] || '',
        title: match[2]?.trim() || match[1] || ''
      };
    }
  }
  return null;
}

/**
 * Extract legal citations from text
 */
function extractLegalCitations(text: string): string[] {
  const citations: string[] = [];

  for (const pattern of LEGAL_CITATION_PATTERNS) {
    pattern.lastIndex = 0; // Reset regex state
    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Get the full matched citation
      const citation = match[0];
      if (citation && !citations.includes(citation)) {
        citations.push(citation);
      }
    }
  }

  return citations;
}

/**
 * Identify the clause type from text content
 */
function identifyClauseType(text: string): string | undefined {
  for (const clause of LEGAL_CLAUSE_TYPES) {
    if (clause.pattern.test(text)) {
      return clause.type;
    }
  }
  return undefined;
}

/**
 * Split text into chunks of appropriate size for embedding using recursive character splitting
 * This implementation is specifically optimized for legal documents
 */
export async function chunkText(
  text: string,
  documentId: string,
  documentName: string
): Promise<TextChunk[]> {
  logger.debug(`Chunking legal document text (${text.length} characters) into chunks`);

  if (!text || text.trim().length === 0) {
    logger.warn(`Document ${documentId} (${documentName}) has no text content`);
    return [];
  }

  // Get the configuration values
  const maxChunkSize = config.chunkSize;
  const chunkOverlap = config.chunkOverlap;

  // Define separators in order of priority, optimized for legal documents
  const separators = [
    "\n\n\n", // Triple line breaks (usually indicate major sections)
    "\n\n",   // Double line breaks (usually indicate paragraphs)
    "\n",     // Single line breaks
    ". ",     // End of sentences
    "; ",     // List items or clauses
    ", ",     // Phrases
    " ",      // Words
    ""        // Characters
  ];

  // Split the text recursively
  const rawChunks = recursiveTextSplit(
    text,
    separators,
    maxChunkSize,
    chunkOverlap
  );

  // Process raw chunks to add metadata and structure
  const enrichedChunks: TextChunk[] = [];

  rawChunks.forEach((chunkText, index) => {
    const trimmedText = chunkText.trim();

    // Skip empty chunks
    if (trimmedText.length === 0) {
      return;
    }

    // Create base chunk
    const chunk: TextChunk = {
      text: trimmedText,
      index,
      sourceDocId: documentId,
      sourceName: documentName
    };

    // Extract section information if available
    const sectionInfo = extractSectionInfo(trimmedText);
    if (sectionInfo) {
      chunk.sectionTitle = sectionInfo.title;
      chunk.sectionNumber = sectionInfo.number;

      // Check if this chunk is primarily a heading
      if (trimmedText.length < 100 && sectionInfo.title.length / trimmedText.length > 0.5) {
        chunk.isHeading = true;
      }
    }

    // Extract legal citations
    const citations = extractLegalCitations(trimmedText);
    if (citations.length > 0) {
      chunk.citations = citations;
    }

    // Identify clause type
    const clauseType = identifyClauseType(trimmedText);
    if (clauseType) {
      chunk.clauseType = clauseType;
    }

    enrichedChunks.push(chunk);
  });

  logger.debug(`Created ${enrichedChunks.length} legal document chunks from document ${documentId} (${documentName})`);

  return enrichedChunks;
}

/**
 * Recursively split text using a list of separators
 * With optimization for legal document structure
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

    // Special handling for legal document structures
    // If this split contains a section header or important clause, try to keep it intact
    const containsSection = LEGAL_SECTION_PATTERNS.some(pattern => {
      pattern.lastIndex = 0;
      return pattern.test(split);
    });

    const containsImportantClause = LEGAL_CLAUSE_TYPES.some(clause =>
      clause.pattern.test(split)
    );

    // If this is an important legal section and isn't too big on its own, keep it together
    if ((containsSection || containsImportantClause) && split.length <= maxChunkSize * 1.2) {
      // If we have existing content in the current chunk, finalize it first
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      // If the section itself is too large, split it further
      if (split.length > maxChunkSize) {
        const sectionChunks = recursiveTextSplit(split, nextSeparators, maxChunkSize, chunkOverlap);
        chunks = chunks.concat(sectionChunks);
      } else {
        // Otherwise keep the section as a single chunk
        chunks.push(split);
      }
      continue;
    }

    // Normal handling for regular content
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
        // For legal documents, try to maintain semantic boundaries in the overlap
        // Find a clean boundary (period, semi-colon, colon, etc) for the overlap if possible
        let overlapText = currentChunk.slice(-chunkOverlap);
        const boundaryMatch = overlapText.match(/[.;:]\s+[A-Z]/);

        if (boundaryMatch && boundaryMatch.index && boundaryMatch.index > chunkOverlap / 2) {
          // If we found a good boundary point, use that
          overlapText = currentChunk.slice(-(boundaryMatch.index + 2));
        }

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
