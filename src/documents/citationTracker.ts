/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */

import { SearchResult } from './documentIndexer';
import { logger } from '../logger';

/**
 * Enum for citation format styles
 */
export enum CitationFormat {
  BLUEBOOK = 'bluebook',
  SIMPLE = 'simple',
  APA = 'apa',
  ALWD = 'alwd'
}

/**
 * Interface for document citation metadata
 */
export interface DocumentCitation {
  documentId: string;
  documentName: string;
  sections?: string[];
  paragraphs?: string[];
  pages?: string[];
  uri?: string;
  sourceUrl?: string;
}

/**
 * Extract section, paragraph, and page references from text
 */
export function extractReferences(text: string): { sections: string[], paragraphs: string[], pages: string[] } {
  const sections: string[] = [];
  const paragraphs: string[] = [];
  const pages: string[] = [];

  // Extract section references (§ or Section followed by numbers)
  const sectionRegex = /(?:§|Section)\s*(\d+(?:\.\d+)*)/gi;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(text)) !== null) {
    if (sectionMatch[1] && !sections.includes(sectionMatch[1])) {
      sections.push(sectionMatch[1]);
    }
  }

  // Extract paragraph references (¶ followed by numbers)
  const paragraphRegex = /¶\s*(\d+(?:\.\d+)*)/gi;
  let paragraphMatch;
  while ((paragraphMatch = paragraphRegex.exec(text)) !== null) {
    if (paragraphMatch[1] && !paragraphs.includes(paragraphMatch[1])) {
      paragraphs.push(paragraphMatch[1]);
    }
  }

  // Extract page references (p. or page followed by numbers)
  const pageRegex = /(?:p\.|page)\s*(\d+)/gi;
  let pageMatch;
  while ((pageMatch = pageRegex.exec(text)) !== null) {
    if (pageMatch[1] && !pages.includes(pageMatch[1])) {
      pages.push(pageMatch[1]);
    }
  }

  return { sections, paragraphs, pages };
}

/**
 * Format a citation according to the specified format
 */
export function formatCitation(citation: DocumentCitation, format: CitationFormat): string {
  if (!citation) {
    return 'Unknown Source';
  }

  switch (format) {
    case CitationFormat.BLUEBOOK:
      return `${citation.documentName}, ${citation.sections?.length ? `§ ${citation.sections.join(', ')}` : ''}`;

    case CitationFormat.APA:
      return `${citation.documentName} (${citation.pages?.length ? `p. ${citation.pages.join(', ')}` : ''})`;

    case CitationFormat.ALWD:
      return `${citation.documentName}, ${citation.sections?.length ? `§ ${citation.sections.join(', ')}` : ''}`;

    case CitationFormat.SIMPLE:
    default:
      return citation.documentName;
  }
}

/**
 * Create citation objects from search results
 */
export function createCitations(searchResults: SearchResult[]): DocumentCitation[] {
  logger.debug(`Creating citations from ${searchResults.length} search results`);

  if (!searchResults || searchResults.length === 0) {
    return [];
  }

  // Group by document ID
  const documentGroups: { [docId: string]: SearchResult[] } = {};
  searchResults.forEach(result => {
    if (!documentGroups[result.documentId]) {
      documentGroups[result.documentId] = [];
    }
    documentGroups[result.documentId].push(result);
  });

  // Create citations for each document
  const citations: DocumentCitation[] = [];

  Object.entries(documentGroups).forEach(([docId, chunks]) => {
    const allSections: string[] = [];
    const allParagraphs: string[] = [];
    const allPages: string[] = [];

    // Extract references from all chunks
    chunks.forEach(chunk => {
      const { sections, paragraphs, pages } = extractReferences(chunk.text);

      sections.forEach(section => {
        if (!allSections.includes(section)) {
          allSections.push(section);
        }
      });

      paragraphs.forEach(paragraph => {
        if (!allParagraphs.includes(paragraph)) {
          allParagraphs.push(paragraph);
        }
      });

      pages.forEach(page => {
        if (!allPages.includes(page)) {
          allPages.push(page);
        }
      });
    });

    // Sort references numerically
    allSections.sort((a, b) => parseFloat(a) - parseFloat(b));
    allParagraphs.sort((a, b) => parseFloat(a) - parseFloat(b));
    allPages.sort((a, b) => parseInt(a) - parseInt(b));

    // Create citation object
    citations.push({
      documentId: docId,
      documentName: chunks[0].documentName,
      sections: allSections.length > 0 ? allSections : undefined,
      paragraphs: allParagraphs.length > 0 ? allParagraphs : undefined,
      pages: allPages.length > 0 ? allPages : undefined
    });
  });

  return citations;
}

/**
 * Generate citation metadata for Claude
 */
export function generateCitationMetadata(query: string, citations: DocumentCitation[]): any {
  return {
    query,
    citations,
    format: "antml:cite",
    totalDocuments: citations.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a formatted context string with enhanced citation markers
 * for use in RAG prompts with proper citation support
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
    contextString += `DOCUMENT ${docIndex}: ${docName} [${formatCitation(citation, CitationFormat.SIMPLE)}]\n`;

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

    // Get references from citation
    const sectionRefs = citation.sections?.length ? `§ ${citation.sections.join(', § ')}` : '';
    const pageRefs = citation.pages?.length ? `p. ${citation.pages.join(', p. ')}` : '';
    const refs = [sectionRefs, pageRefs].filter(r => r).join('; ');

    if (refs) {
      contextString += `References: ${refs}\n`;
    }

    contextString += `\nRelevant content:\n`;

    // Add each chunk's text with appropriate indexing for citation
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

      // Add specially formatted chunk for proper citation
      contextString += `--- Excerpt ${chunkIndex}${refText} (Relevance: ${relevancePercentage}%, DocIndex: ${docIndex}, ChunkIndex: ${chunkIndex}) ---\n`;

      // Split the text into sentences for easier citation
      const sentences = chunk.text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

      sentences.forEach((sentence, sentenceIndex) => {
        contextString += `[${docIndex}-${sentenceIndex}] ${sentence.trim()}\n`;
      });

      contextString += "\n";
    });

    // Add Clio document URL in the format requested
    contextString += `SOURCE: https://app.clio.com/nc/#/documents/${docId}/details\n\n`;
  });

  return contextString;
}
