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
 * Citation Tracker Module
 *
 * This module provides enhanced citation tracking for legal documents,
 * including paragraph/section references, proper Bluebook formatting,
 * and citation verification.
 */

import { logger } from '../logger';
import { SearchResult } from '../documents/documentIndexer';

/**
 * Represents a citation to a source document
 */
export interface DocumentCitation {
  documentId: string;
  documentName: string;
  uri: string;
  sections?: string[];
  paragraphs?: string[];
  pages?: string[];
  quoteText?: string;
  quoteLocation?: string;
}

/**
 * Citation formats supported
 */
export enum CitationFormat {
  BLUEBOOK = 'bluebook',
  APA = 'apa',
  ALWD = 'alwd',
  SIMPLE = 'simple'
}

/**
 * Regular expressions for detecting section and paragraph references
 */
const SECTION_PATTERNS = [
  /(?:Section|§)\s+(\d+(?:\.\d+)*[a-z]?)/gi,
  /Article\s+([IVX]+(?:\.\d+)*)/gi,
  /Part\s+([A-Z](?:\.\d+)*)/gi
];

const PARAGRAPH_PATTERNS = [
  /¶\s*(\d+(?:\.\d+)*[a-z]?)/gi,
  /Paragraph\s+(\d+(?:\.\d+)*[a-z]?)/gi,
  /Para(?:\.|graph)?\s+(\d+(?:\.\d+)*[a-z]?)/gi
];

const PAGE_PATTERNS = [
  /page\s+(\d+)/gi,
  /p\.\s*(\d+)/gi,
  /pp\.\s*(\d+)(?:\s*[-–]\s*(\d+))?/gi
];

/**
 * Extracts section, paragraph, and page references from text
 */
function extractReferences(text: string): {
  sections: string[];
  paragraphs: string[];
  pages: string[];
} {
  const sections: string[] = [];
  const paragraphs: string[] = [];
  const pages: string[] = [];

  // Extract section references
  for (const pattern of SECTION_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && !sections.includes(match[1])) {
        sections.push(match[1]);
      }
    }
  }

  // Extract paragraph references
  for (const pattern of PARAGRAPH_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1] && !paragraphs.includes(match[1])) {
        paragraphs.push(match[1]);
      }
    }
  }

  // Extract page references
  for (const pattern of PAGE_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        if (match[2]) {
          // Range of pages
          pages.push(`${match[1]}-${match[2]}`);
        } else if (!pages.includes(match[1])) {
          pages.push(match[1]);
        }
      }
    }
  }

  return { sections, paragraphs, pages };
}

/**
 * Extracts quotes from text with a maximum length limit
 */
function extractQuote(text: string, maxLength: number = 50): string | undefined {
  // Find quoted text
  const quoteMatches = text.match(/"([^"]{10,100})"/);
  if (quoteMatches && quoteMatches[1]) {
    // Limit quote length
    if (quoteMatches[1].length > maxLength) {
      return quoteMatches[1].substring(0, maxLength) + '...';
    }
    return quoteMatches[1];
  }

  // If no quote, take a representative snippet
  if (text.length > 0) {
    // Find a sentence
    const sentenceMatches = text.match(/[^.!?]+[.!?]/);
    if (sentenceMatches && sentenceMatches[0]) {
      const sentence = sentenceMatches[0].trim();
      if (sentence.length > maxLength) {
        return sentence.substring(0, maxLength) + '...';
      }
      return sentence;
    }

    // Last resort: take the first part of the text
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }

  return undefined;
}

/**
 * Creates citation objects from search results
 */
export function createCitations(searchResults: SearchResult[]): DocumentCitation[] {
  logger.debug(`Creating citations from ${searchResults.length} search results`);

  const citationMap = new Map<string, DocumentCitation>();

  for (const result of searchResults) {
    // Extract references from text
    const { sections, paragraphs, pages } = extractReferences(result.text);
    const quoteText = extractQuote(result.text);

    // Get or create citation
    let citation = citationMap.get(result.documentId);

    if (!citation) {
      citation = {
        documentId: result.documentId,
        documentName: result.documentName,
        uri: `legal://documents/${result.documentId}`,
        sections: [],
        paragraphs: [],
        pages: []
      };
      citationMap.set(result.documentId, citation);
    }

    // Add references without duplicates
    sections.forEach(section => {
      if (!citation!.sections!.includes(section)) {
        citation!.sections!.push(section);
      }
    });

    paragraphs.forEach(paragraph => {
      if (!citation!.paragraphs!.includes(paragraph)) {
        citation!.paragraphs!.push(paragraph);
      }
    });

    pages.forEach(page => {
      if (!citation!.pages!.includes(page)) {
        citation!.pages!.push(page);
      }
    });

    // Add quote if not already set
    if (!citation.quoteText && quoteText) {
      citation.quoteText = quoteText;
      citation.quoteLocation = sections.length > 0 ? `§ ${sections[0]}` :
                               paragraphs.length > 0 ? `¶ ${paragraphs[0]}` :
                               pages.length > 0 ? `p. ${pages[0]}` : undefined;
    }
  }

  return Array.from(citationMap.values());
}

/**
 * Formats citations according to the requested style
 */
export function formatCitation(citation: DocumentCitation, format: CitationFormat = CitationFormat.BLUEBOOK): string {
  switch(format) {
    case CitationFormat.BLUEBOOK:
      return formatBluebookCitation(citation);
    case CitationFormat.APA:
      return formatApaCitation(citation);
    case CitationFormat.ALWD:
      return formatAlwdCitation(citation);
    case CitationFormat.SIMPLE:
    default:
      return formatSimpleCitation(citation);
  }
}

/**
 * Formats citation in Bluebook style
 */
function formatBluebookCitation(citation: DocumentCitation): string {
  let cite = citation.documentName;

  // Add sections if available
  if (citation.sections && citation.sections.length > 0) {
    cite += ` § ${citation.sections.join(', § ')}`;
  }

  // Add page references if available
  if (citation.pages && citation.pages.length > 0) {
    if (citation.pages.length === 1) {
      cite += `, at ${citation.pages[0]}`;
    } else {
      cite += `, at ${citation.pages.join('-')}`;
    }
  }

  // Add parenthetical with quote if available
  if (citation.quoteText) {
    cite += ` (stating "${citation.quoteText}")`;
  }

  return cite;
}

/**
 * Formats citation in APA style
 */
function formatApaCitation(citation: DocumentCitation): string {
  let cite = citation.documentName;

  // Add in-text location references
  const locations: string[] = [];

  if (citation.sections && citation.sections.length > 0) {
    locations.push(`Section ${citation.sections.join(', Section ')}`);
  }

  if (citation.paragraphs && citation.paragraphs.length > 0) {
    locations.push(`para. ${citation.paragraphs.join(', para. ')}`);
  }

  if (citation.pages && citation.pages.length > 0) {
    locations.push(`p. ${citation.pages.join(', p. ')}`);
  }

  if (locations.length > 0) {
    cite += `, ${locations.join('; ')}`;
  }

  // Add quote if available
  if (citation.quoteText) {
    cite += `: "${citation.quoteText}"`;
  }

  return cite;
}

/**
 * Formats citation in ALWD style
 */
function formatAlwdCitation(citation: DocumentCitation): string {
  let cite = citation.documentName;

  // Add sections if available
  if (citation.sections && citation.sections.length > 0) {
    cite += `, § ${citation.sections.join(', § ')}`;
  }

  // Add page references if available
  if (citation.pages && citation.pages.length > 0) {
    cite += `, at ${citation.pages.join('-')}`;
  }

  // Add parenthetical with quote if available
  if (citation.quoteText) {
    cite += ` (noting that "${citation.quoteText}")`;
  }

  return cite;
}

/**
 * Formats citation in simplified style
 */
function formatSimpleCitation(citation: DocumentCitation): string {
  let cite = citation.documentName;

  // Add location reference if available
  if (citation.sections && citation.sections.length > 0) {
    cite += ` (Section ${citation.sections.join(', Section ')})`;
  } else if (citation.paragraphs && citation.paragraphs.length > 0) {
    cite += ` (Paragraph ${citation.paragraphs.join(', Paragraph ')})`;
  } else if (citation.pages && citation.pages.length > 0) {
    cite += ` (Page ${citation.pages.join(', Page ')})`;
  }

  return cite;
}

/**
 * Generates citation metadata for Claude in MCP response
 */
export function generateCitationMetadata(
  query: string,
  citations: DocumentCitation[],
  searchResults: SearchResult[]
): any {
  return {
    query,
    citations: citations.map(citation => ({
      documentId: citation.documentId,
      documentName: citation.documentName,
      uri: citation.uri,
      sections: citation.sections,
      paragraphs: citation.paragraphs,
      pages: citation.pages,
      quote: citation.quoteText,
      quoteLocation: citation.quoteLocation,
      bluebookCitation: formatCitation(citation, CitationFormat.BLUEBOOK),
      simpleCitation: formatCitation(citation, CitationFormat.SIMPLE)
    })),
    totalDocuments: citations.length,
    totalResults: searchResults.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a formatted context string with enhanced citation markers
 */
export function createCitedContext(searchResults: SearchResult[]): string {
  logger.debug(`Creating cited context from ${searchResults.length} search results`);

  if (!searchResults || searchResults.length === 0) {
    return 'No relevant legal documents found.';
  }

  let contextString = `The following information is retrieved from your law firm's document management system:\n\n`;

  // Group chunks by document for better organization
  const documentChunks: { [docId: string]: SearchResult[] } = {};

  // Group chunks by document ID
  searchResults.forEach(result => {
    if (!documentChunks[result.documentId]) {
      documentChunks[result.documentId] = [];
    }
    documentChunks[result.documentId].push(result);
  });

  // Process citations
  const citations = createCitations(searchResults);
  const citationsByDocId: {[docId: string]: DocumentCitation} = {};
  citations.forEach(citation => {
    citationsByDocId[citation.documentId] = citation;
  });

  // Format each document's chunks with citation markers
  Object.entries(documentChunks).forEach(([docId, chunks], docIndex) => {
    // Sort chunks by relevance (score)
    chunks.sort((a, b) => a.score - b.score);

    const docName = chunks[0].documentName;
    const citation = citationsByDocId[docId];

    // Document header with citation
    contextString += `DOCUMENT ${docIndex + 1}: ${docName} [${formatCitation(citation, CitationFormat.SIMPLE)}]\n`;

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
    }

    // Get references from citation
    const sectionRefs = citation.sections?.length ? `§ ${citation.sections.join(', § ')}` : '';
    const pageRefs = citation.pages?.length ? `p. ${citation.pages.join(', p. ')}` : '';
    const refs = [sectionRefs, pageRefs].filter(r => r).join('; ');

    if (refs) {
      contextString += `References: ${refs}\n`;
    }

    contextString += `\nRelevant content:\n`;

    // Add each chunk's text with relevance score
    chunks.forEach((chunk, chunkIndex) => {
      const relevancePercentage = ((1 - chunk.score) * 100).toFixed(1);

      // Extract references for this chunk
      const { sections, paragraphs, pages } = extractReferences(chunk.text);
      let refText = '';

      if (sections.length > 0) {
        refText += ` [§ ${sections.join(', § ')}]`;
      }

      if (paragraphs.length > 0) {
        refText += ` [¶ ${paragraphs.join(', ¶ ')}]`;
      }

      if (pages.length > 0) {
        refText += ` [p. ${pages.join(', p. ')}]`;
      }

      contextString += `--- Excerpt ${chunkIndex + 1}${refText} (Relevance: ${relevancePercentage}%) ---\n`;
      contextString += `${chunk.text.trim()}\n\n`;
    });

    contextString += `SOURCE: ${citation.uri}\n\n`;
  });

  return contextString;
}
