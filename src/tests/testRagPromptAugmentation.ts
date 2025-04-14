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
 * Test Script for RAG Prompt Augmentation
 *
 * This script demonstrates how to use the RAG prompt augmentation functionality.
 * It indexes a sample document, performs a semantic search, and creates an augmented prompt.
 *
 * Usage:
 * bun run src/tests/testRagPromptAugmentation.ts
 */

import { getDocumentIndexer } from '../documents/documentIndexer';
import { formatChunksToContext, getPromptTemplate, createAugmentedPrompt } from '../tools/ragPromptAugmentation';
import { logger } from '../logger';

/**
 * Create a mock document for testing
 */
function createMockDocument() {
  return {
    id: 'mock-doc-1',
    name: 'Sample Legal Contract',
    text: `
      EMPLOYMENT AGREEMENT
      
      This Employment Agreement (the "Agreement") is made and entered into as of January 15, 2023 (the "Effective Date"), 
      by and between ABC Corporation, a Delaware corporation (the "Company"), and Jane Doe, an individual ("Employee").
      
      1. EMPLOYMENT POSITION AND DUTIES
      
      1.1 Position. The Company agrees to employ Employee as Senior Legal Counsel. Employee shall report directly to the 
      General Counsel of the Company. Employee accepts such employment on the terms and conditions set forth in this Agreement.
      
      1.2 Duties. Employee shall perform all duties normally associated with the position of Senior Legal Counsel and such 
      other duties as may be assigned by the General Counsel or the Company's Board of Directors. Employee shall devote 
      Employee's full business time and effort to the performance of Employee's duties for the Company.
      
      2. COMPENSATION
      
      2.1 Base Salary. As compensation for Employee's services, the Company shall pay Employee a base salary at the annual 
      rate of $175,000 (the "Base Salary"), payable in accordance with the Company's standard payroll practices.
      
      2.2 Bonus. Employee shall be eligible to receive an annual performance bonus of up to 20% of Employee's Base Salary, 
      based on the achievement of individual and Company performance goals established by the Company.
      
      3. NON-COMPETE AND CONFIDENTIALITY
      
      3.1 Non-Competition. During the term of Employee's employment and for a period of one (1) year following the termination 
      of Employee's employment, Employee shall not, directly or indirectly, engage in or have any interest in any entity that 
      competes with the business of the Company in any jurisdiction where the Company does business.
      
      3.2 Confidentiality. Employee acknowledges that, during the course of Employee's employment, Employee will have access 
      to confidential information relating to the business of the Company. Employee agrees to maintain the confidentiality of 
      all such information and not to disclose any such information to any third party without the prior written consent of the Company.
      
      4. TERM AND TERMINATION
      
      4.1 Term. This Agreement shall commence on the Effective Date and shall continue until terminated in accordance with the 
      provisions of this Agreement.
      
      4.2 Termination. This Agreement may be terminated at any time by the Company with or without cause, or by Employee with 
      30 days' written notice to the Company.
      
      5. GENERAL PROVISIONS
      
      5.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, 
      without giving effect to any choice of law or conflict of law provisions.
      
      5.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties relating to the subject matter hereof.
      
      IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.
    `,
    metadata: {
      contentType: 'application/pdf',
      category: 'Employment',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      parentFolder: {
        id: 'folder-1',
        name: 'Contracts'
      }
    }
  };
}

/**
 * Main test function
 */
async function testRagPromptAugmentation() {
  try {
    logger.info('Starting RAG prompt augmentation test');

    // Initialize the document indexer
    const documentIndexer = getDocumentIndexer();
    await documentIndexer.initialize();

    // Create and index a mock document
    const document = createMockDocument();
    logger.info(`Indexing document: ${document.id} - ${document.name}`);
    const indexResult = await documentIndexer.indexDocument(document);

    if (!indexResult) {
      throw new Error(`Failed to index document ${document.id}`);
    }

    logger.info(`Successfully indexed document ${document.id}`);

    // Get index statistics
    const indexStats = await documentIndexer.getIndexStats();
    logger.info(`Index statistics: ${indexStats.documentCount} documents, ${indexStats.chunkCount} chunks`);

    // Define test queries
    const testQueries = [
      'What are the non-compete terms in the employment agreement?',
      'How much is the base salary and bonus?',
      'What are the termination conditions?'
    ];

    // Test each query
    for (const query of testQueries) {
      logger.info(`\n--- Testing RAG prompt augmentation for query: "${query}" ---`);

      // Perform semantic search to retrieve relevant chunks
      logger.info(`Performing semantic search for query: "${query}"`);
      const searchResults = await documentIndexer.searchDocuments(query, 3);
      logger.info(`Retrieved ${searchResults.length} relevant chunks`);

      // Format chunks into context string
      logger.info('Formatting chunks into context string');
      const contextString = formatChunksToContext(searchResults);
      logger.info('Context string created');
      logger.debug(`Context string: ${contextString.substring(0, 200)}...`);

      // Get prompt template
      logger.info('Getting prompt template');
      const promptTemplate = getPromptTemplate();
      logger.info('Prompt template retrieved');

      // Create augmented prompt
      logger.info('Creating augmented prompt');
      const augmentedPrompt = createAugmentedPrompt(query, searchResults);
      logger.info('Augmented prompt created');

      // Log the augmented prompt (truncated for readability)
      const maxPromptLength = 500;
      logger.info(`\nAugmented Prompt (truncated):\n${augmentedPrompt.length > maxPromptLength ? 
        augmentedPrompt.substring(0, maxPromptLength) + '...' : 
        augmentedPrompt}`);

      // In a real scenario, this prompt would be sent to Claude for a response
      logger.info('In a production environment, this prompt would be sent to Claude for a response');
    }

    logger.info('\nRAG prompt augmentation test completed successfully');
  } catch (error) {
    logger.error('Error in RAG prompt augmentation test:', error);
  }
}

// Run the test
testRagPromptAugmentation();
