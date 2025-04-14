// src/tools/legalPromptTemplates.ts

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
 * Legal Prompt Templates
 *
 * This module provides specialized prompt templates for different legal document types
 * and tasks. It ensures proper legal terminology, citation formatting, and
 * domain-specific instructions for legal queries.
 */

import { logger } from '../logger';
import { SearchResult } from '../documents/documentIndexer';

/**
 * Types of legal templates available
 */
export enum LegalPromptType {
  GENERAL = 'general',
  CONTRACT_ANALYSIS = 'contract_analysis',
  CASE_LAW = 'case_law',
  STATUTE = 'statute',
  LEGAL_RESEARCH = 'legal_research',
  DOCUMENT_SUMMARY = 'document_summary',
  REGULATORY_COMPLIANCE = 'regulatory_compliance',
}

/**
 * Interface for prompt template options
 */
export interface PromptTemplateOptions {
  includeBlueBookCitations?: boolean;
  includeAnalysisGuidance?: boolean;
  includeLegalDisclaimer?: boolean;
  formality?: 'formal' | 'standard' | 'simplified';
  jurisdiction?: string;
}

/**
 * Detects the document type from search results to determine appropriate prompt template
 */
export function detectDocumentType(searchResults: SearchResult[]): LegalPromptType {
  // Default to general template
  if (!searchResults || searchResults.length === 0) {
    return LegalPromptType.GENERAL;
  }

  // Combine text from the top 3 results for analysis
  const combinedText = searchResults
    .slice(0, 3)
    .map(result => result.text)
    .join(' ')
    .toLowerCase();

  // Check for patterns indicating document type
  if (
    combinedText.includes('contract') ||
    combinedText.includes('agreement') ||
    combinedText.includes('parties') && combinedText.includes('clause') ||
    combinedText.includes('terms and conditions')
  ) {
    return LegalPromptType.CONTRACT_ANALYSIS;
  }

  if (
    combinedText.includes('court') &&
    (combinedText.includes('plaintiff') || combinedText.includes('defendant') ||
      combinedText.includes('petitioner') || combinedText.includes('respondent')) ||
    combinedText.includes('v.') || combinedText.includes('versus')
  ) {
    return LegalPromptType.CASE_LAW;
  }

  if (
    combinedText.includes('statute') ||
    combinedText.includes('u.s.c.') ||
    combinedText.includes('code §') ||
    combinedText.includes('section') && combinedText.includes('amended')
  ) {
    return LegalPromptType.STATUTE;
  }

  if (
    combinedText.includes('research') ||
    combinedText.includes('precedent') ||
    combinedText.includes('authorities') ||
    combinedText.includes('citation') && combinedText.includes('authority')
  ) {
    return LegalPromptType.LEGAL_RESEARCH;
  }

  if (
    combinedText.includes('regulation') ||
    combinedText.includes('compliance') ||
    combinedText.includes('regulatory') ||
    combinedText.includes('requirements')
  ) {
    return LegalPromptType.REGULATORY_COMPLIANCE;
  }

  // If no specific type detected, check if it's a document summary request
  if (searchResults.length === 1 && searchResults[0].text.length > 1000) {
    return LegalPromptType.DOCUMENT_SUMMARY;
  }

  return LegalPromptType.GENERAL;
}

/**
 * Gets the appropriate legal citation format instructions
 */
function getCitationFormatInstructions(blueBook: boolean = true): string {
  if (blueBook) {
    return `
Citation Instructions:
1. Use proper Bluebook citation format for all legal authorities
2. For cases, use: [Case Name], [Volume] [Reporter] [Page], [Pincite] [(Court) Year]
   Example: Smith v. Jones, 123 F.3d 456, 460 (9th Cir. 1999)
3. For statutes, use: [Title] [Source] § [Section] [(Year)]
   Example: 42 U.S.C. § 1983 (2021)
4. For regulations, use: [Volume] [Source] § [Section] [(Year)]
   Example: 17 C.F.R. § 240.10b-5 (2023)
5. For internal document citations, include document name and section/page references
   Example: "Johnson Agreement, § 3.2" or "Acme Settlement, p. 4"
6. Use "id." for immediately repeated citations
7. Use "supra note [n]" for previously cited sources
`;
  } else {
    return `
Citation Instructions:
1. Use clear citation format for all references
2. For cases, include: case name, court, and year
3. For statutes, include: name of law, section number, and jurisdiction
4. For internal documents, include: document name and specific section or page reference
5. Always provide the source information for any direct quotes
`;
  }
}

/**
 * Gets the legal disclaimer text
 */
function getLegalDisclaimerText(): string {
  return `
LEGAL DISCLAIMER:
The following response is based solely on the documents provided in the CONTEXT section. This information:
1. Is not legal advice and does not create an attorney-client relationship
2. May not reflect current legal developments or changes in the law
3. Should be verified against original source documents before use in legal proceedings
4. May not be comprehensive or address all relevant legal issues for your specific situation

Always consult with a qualified attorney for legal advice specific to your circumstances.
`;
}

/**
 * Gets specialized prompt template for different legal document types
 */
export function getLegalPromptTemplate(
  type: LegalPromptType,
  options: PromptTemplateOptions = {},
): string {
  // Default options
  const includeBlueBookCitations = options.includeBlueBookCitations ?? true;
  const includeAnalysisGuidance = options.includeAnalysisGuidance ?? true;
  const includeLegalDisclaimer = options.includeLegalDisclaimer ?? true;
  const formality = options.formality ?? 'formal';
  const jurisdiction = options.jurisdiction;

  // Base template parts
  const disclaimer = includeLegalDisclaimer ? getLegalDisclaimerText() : '';
  const citationFormat = includeBlueBookCitations ?
    getCitationFormatInstructions(true) :
    getCitationFormatInstructions(false);

  // Select template based on document type
  switch (type) {
    case LegalPromptType.CONTRACT_ANALYSIS:
      return `
You are a legal assistant with expertise in contract analysis. Please provide a thorough assessment of the contract information in the CONTEXT section below.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

${includeAnalysisGuidance ? `
CONTRACT ANALYSIS GUIDANCE:
1. Identify the key provisions and their implications
2. Flag any unusual, ambiguous, or potentially problematic clauses
3. Note any missing standard provisions that would typically be included
4. Analyze risk allocation between the parties
5. Consider enforceability issues in relevant jurisdiction${jurisdiction ? ` (${jurisdiction})` : ''}
6. Compare against industry standard terms where applicable
` : ''}

${citationFormat}

INSTRUCTIONS:
1. Structure your analysis logically with clear sections
2. Maintain professional legal terminology appropriate for ${formality === 'formal' ? 'formal legal documents' : formality === 'simplified' ? 'client explanations' : 'standard legal communications'}
3. Base your analysis exclusively on the provided context
4. Cite specific contract sections and provisions by number/name
5. If the context is insufficient to answer any aspect of the query, acknowledge this limitation
6. Do not make assumptions about terms not present in the context

${disclaimer}`;

    case LegalPromptType.CASE_LAW:
      return `
You are a legal assistant with expertise in case law analysis. Please analyze the case information provided in the CONTEXT section below.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

${includeAnalysisGuidance ? `
CASE LAW ANALYSIS GUIDANCE:
1. Identify the key facts, issues, and procedural history
2. Analyze the court's holdings and reasoning
3. Explain the precedential value${jurisdiction ? ` in ${jurisdiction}` : ''}
4. Discuss how this case relates to other relevant authorities
5. Consider implications for future cases and legal practice
` : ''}

${citationFormat}

INSTRUCTIONS:
1. Structure your analysis with clear sections (Facts, Issues, Holding, Reasoning, Significance)
2. Use precise legal terminology appropriate for ${formality === 'formal' ? 'formal legal briefs' : formality === 'simplified' ? 'client explanations' : 'standard legal communications'}
3. Base your analysis exclusively on the provided context
4. Cite specific passages and paragraphs from the case
5. If the context is insufficient to answer any aspect of the query, acknowledge this limitation
6. Maintain objectivity in analyzing the court's reasoning

${disclaimer}`;

    case LegalPromptType.STATUTE:
      return `
You are a legal assistant with expertise in statutory interpretation. Please analyze the statutory provisions in the CONTEXT section below.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

${includeAnalysisGuidance ? `
STATUTORY ANALYSIS GUIDANCE:
1. Identify the key provisions and their requirements
2. Explain the statutory structure and how sections relate to each other
3. Consider definitions of key terms provided in the statute
4. Note effective dates and amendments if mentioned
5. Discuss regulatory authority and enforcement mechanisms
6. Consider how courts have interpreted similar provisions if mentioned
` : ''}

${citationFormat}

INSTRUCTIONS:
1. Structure your analysis by section and subsection
2. Use precise legal terminology appropriate for ${formality === 'formal' ? 'formal legal memoranda' : formality === 'simplified' ? 'client explanations' : 'standard legal communications'}
3. Base your analysis exclusively on the provided context
4. Cite specific statutory sections, subsections, and paragraphs
5. If the context is insufficient to answer any aspect of the query, acknowledge this limitation
6. Avoid inserting personal policy preferences into statutory interpretation

${disclaimer}`;

    case LegalPromptType.LEGAL_RESEARCH:
      return `
You are a legal assistant with expertise in legal research. Please analyze the research materials in the CONTEXT section below.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

${includeAnalysisGuidance ? `
LEGAL RESEARCH GUIDANCE:
1. Identify the relevant legal authorities and their significance
2. Analyze how these authorities support or challenge particular positions
3. Consider the hierarchy of authorities (Supreme Court vs. Circuit Courts, etc.)
4. Note any circuit splits or conflicting authorities
5. Discuss the recency and continued validity of cited authorities
6. Consider how these authorities would apply to specific fact patterns if mentioned
` : ''}

${citationFormat}

INSTRUCTIONS:
1. Structure your response with clear sections organizing the research by topic or issue
2. Use precise legal terminology appropriate for ${formality === 'formal' ? 'formal legal briefs' : formality === 'simplified' ? 'client explanations' : 'standard legal communications'}
3. Base your analysis exclusively on the provided context
4. Provide full and proper citations for all authorities mentioned
5. If the context is insufficient to answer any aspect of the query, acknowledge this limitation
6. Present multiple perspectives where authorities conflict

${disclaimer}`;

    case LegalPromptType.DOCUMENT_SUMMARY:
      return `
You are a legal assistant tasked with summarizing legal documents. Please summarize the document(s) in the CONTEXT section below.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

${includeAnalysisGuidance ? `
DOCUMENT SUMMARY GUIDANCE:
1. Identify the document type and its primary purpose
2. Summarize the key provisions, terms, or findings
3. Highlight significant legal obligations or rights established
4. Note important dates, deadlines, or temporal conditions
5. Identify the parties involved and their roles
6. Flag any unusual or noteworthy provisions
` : ''}

${citationFormat}

INSTRUCTIONS:
1. Provide a concise executive summary followed by key points
2. Use clear language appropriate for ${formality === 'formal' ? 'formal legal summaries' : formality === 'simplified' ? 'client explanations' : 'standard legal communications'}
3. Base your summary exclusively on the provided context
4. Reference specific sections, paragraphs, or pages from the original document
5. If the context is insufficient to provide a complete summary, acknowledge this limitation
6. Maintain objectivity and avoid interpretation beyond what is explicitly stated

${disclaimer}`;

    case LegalPromptType.REGULATORY_COMPLIANCE:
      return `
You are a legal assistant with expertise in regulatory compliance. Please analyze the regulatory information in the CONTEXT section below.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

${includeAnalysisGuidance ? `
REGULATORY COMPLIANCE GUIDANCE:
1. Identify the relevant regulatory requirements and obligations
2. Explain compliance deadlines and reporting requirements
3. Discuss potential penalties or consequences of non-compliance
4. Note record-keeping and documentation requirements
5. Identify responsible regulatory agencies and their authority
6. Consider risk mitigation strategies if mentioned
` : ''}

${citationFormat}

INSTRUCTIONS:
1. Structure your response with clear sections for each regulatory requirement
2. Use precise regulatory terminology appropriate for ${formality === 'formal' ? 'formal compliance documents' : formality === 'simplified' ? 'client explanations' : 'standard legal communications'}
3. Base your analysis exclusively on the provided context
4. Cite specific regulatory provisions, sections, and subsections
5. If the context is insufficient to answer any aspect of the query, acknowledge this limitation
6. Present information objectively without minimizing compliance obligations

${disclaimer}`;

    case LegalPromptType.GENERAL:
    default:
      return `
You are a legal assistant with access to a law firm's document management system.
Please provide a precise, legally sound response based on the following context and query.

CONTEXT:
{{context}}

USER QUERY:
{{query}}

${citationFormat}

INSTRUCTIONS:
1. Base your response only on the information provided in the CONTEXT section
2. If the context doesn't contain enough information to answer the query, acknowledge this limitation clearly
3. Do not make up information or cite documents not mentioned in the context
4. When referencing specific documents, cite them properly using the SOURCE information provided
5. Use proper legal terminology appropriate for ${formality === 'formal' ? 'formal legal communications' : formality === 'simplified' ? 'client explanations' : 'standard legal communications'}
6. Where legal citations are present in the context, reference them correctly using standard legal citation format
7. Format your response in a clear, professional manner appropriate for legal communication

${disclaimer}`;
  }
}

/**
 * Creates a fully formatted legal prompt with the appropriate template
 */
export function createLegalPrompt(
  query: string,
  searchResults: SearchResult[],
  context: string,
  options: PromptTemplateOptions = {},
): string {
  logger.info(`Creating specialized legal prompt for query type`);

  // Detect document type from search results
  const documentType = detectDocumentType(searchResults);
  logger.debug(`Detected document type: ${documentType}`);

  // Get specialized template
  const template = getLegalPromptTemplate(documentType, options);

  // Populate the template with context and query
  const prompt = template
    .replace('{{context}}', context)
    .replace('{{query}}', query);

  logger.debug(`Created specialized legal prompt for ${documentType}`);
  return prompt;
}
