#!/usr/bin/env bun
/**
 * MCP Document Integration Test Script
 *
 * This script tests the integration between the MCP server, document resources,
 * and document tools to ensure they work together correctly.
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as readline from 'readline';
import { AppModule } from '../app.module';
import { McpServerService } from '../mcp/mcp-server.service';
import { McpResourcesService } from '../mcp/mcp-resources.service';
import { McpToolsService } from '../mcp/mcp-tools.service';
import { ClioDocumentService } from '../clio/api/clio-document.service';
import { DocumentResourceService } from '../mcp/resources/document-resource.service';
import { DocumentToolService } from '../mcp/tools/document-tool.service';
import { DocumentProcessorService } from '../document-processing/document-processor.service';

const logger = new Logger('TestMcpDocumentIntegration');

/**
 * Main function to test the document integration with MCP
 */
async function testMcpDocumentIntegration() {
  process.env.NODE_ENV = 'development'; // Ensure we're in development mode
  logger.log('Starting MCP document integration test');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  try {
    // Get required services
    const mcpServerService = app.get(McpServerService);
    const mcpResourcesService = app.get(McpResourcesService);
    const mcpToolsService = app.get(McpToolsService);
    const clioDocumentService = app.get(ClioDocumentService);
    const documentResourceService = app.get(DocumentResourceService);
    const documentToolService = app.get(DocumentToolService);
    const documentProcessorService = app.get(DocumentProcessorService);

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Show options menu
    rl.question(
      'Select a test to run:\n' +
      '1. Test document list resource\n' +
      '2. Test document content resource\n' +
      '3. Test document search resource\n' +
      '4. Test matter documents resource\n' +
      '5. Test document search tool\n' +
      '6. Test document processing tool\n' +
      '7. Test citation generation tool\n' +
      '8. Test semantic search tool\n' +
      'Enter choice (1-8): ',
      async (choice) => {
        try {
          // Initialize server and register resources/tools
          const server = mcpServerService.getServer();
          
          // Register resources manually
          await mcpResourcesService.registerResources();
          
          // Register tools manually
          await mcpToolsService.registerTools();
          
          // Register document resources
          await documentResourceService.registerResources();
          
          // Register document tools
          await documentToolService.registerTools();
          
          switch (choice) {
            case '1':
              await testDocumentListResource(documentResourceService, rl);
              break;
            case '2':
              await testDocumentContentResource(documentResourceService, clioDocumentService, rl);
              break;
            case '3':
              await testDocumentSearchResource(documentResourceService, rl);
              break;
            case '4':
              await testMatterDocumentsResource(documentResourceService, rl);
              break;
            case '5':
              await testDocumentSearchTool(documentToolService, rl);
              break;
            case '6':
              await testDocumentProcessingTool(documentToolService, documentProcessorService, rl);
              break;
            case '7':
              await testCitationGenerationTool(documentToolService, rl);
              break;
            case '8':
              await testSemanticSearchTool(documentToolService, rl);
              break;
            default:
              logger.log('Invalid choice. Exiting.');
              rl.close();
              await app.close();
          }
        } catch (error) {
          logger.error(`Error during test: ${error.message}`, error.stack);
          rl.close();
          await app.close();
        }
      }
    );
  } catch (error) {
    logger.error(`Error initializing test: ${error.message}`, error.stack);
    await app.close();
  }
}

/**
 * Test the document list resource
 */
async function testDocumentListResource(documentResourceService: DocumentResourceService, rl: readline.Interface) {
  rl.question('Enter filter (or "all"): ', async (filter) => {
    try {
      logger.log(`Testing document list resource with filter: ${filter}`);
      
      // Simulate resource request
      const uri = { href: `documents://list/${filter}/1` };
      const params = { filter, page: '1' };
      
      try {
        // We'll use the document resource service directly
        const result = await documentResourceService.handleResourceRequest('document-list', uri, params);
        
        if (!result) {
          throw new Error('Document list resource not registered or returned no result');
        }
        
        // Display result
        logger.log('Resource result:');
        logger.log(JSON.stringify(result, null, 2));
        
        // Display content if available
        if (result.contents && result.contents.length > 0) {
          logger.log('\nContent:');
          logger.log(result.contents[0].text);
        }
        
        process.exit(0);
      } catch (error) {
        logger.error(`Error testing document list resource: ${error.message}`, error.stack);
        process.exit(1);
      }
    } catch (error) {
      logger.error(`Error testing document list resource: ${error.message}`, error.stack);
      process.exit(1);
    }
  });
}

/**
 * Test the document content resource
 */
async function testDocumentContentResource(documentResourceService: DocumentResourceService, clioDocumentService: ClioDocumentService, rl: readline.Interface) {
  // First, get a list of documents to choose from
  try {
    const documents = await clioDocumentService.listDocuments({
      limit: 5,
      fields: 'id,name',
    });
    
    if (documents.data.length === 0) {
      logger.log('No documents found in Clio.');
      process.exit(1);
      return;
    }
    
    // Display available documents
    logger.log('Available documents:');
    documents.data.forEach((doc, index) => {
      logger.log(`${index + 1}. ${doc.name} (ID: ${doc.id})`);
    });
    
    // Prompt for document selection
    rl.question('Enter document ID or number from list: ', async (selection) => {
      try {
        // Determine document ID
        let documentId: string;
        
        // Check if selection is a number
        if (/^\d+$/.test(selection)) {
          const index = parseInt(selection, 10) - 1;
          if (index >= 0 && index < documents.data.length) {
            documentId = documents.data[index].id;
          } else {
            throw new Error('Invalid selection');
          }
        } else {
          documentId = selection;
        }
        
        logger.log(`Testing document content resource with ID: ${documentId}`);
        
        // Simulate resource request
        const uri = { href: `document://${documentId}` };
        const params = { id: documentId };
        
        // Use the document resource service directly
        const result = await documentResourceService.handleResourceRequest('document', uri, params);
        
        if (!result) {
          throw new Error('Document content resource not registered or returned no result');
        }
        
        // Display result
        logger.log('Resource result:');
        logger.log(JSON.stringify(result, null, 2));
        
        // Display preview of content if available
        if (result.contents && result.contents.length > 0) {
          const content = result.contents[0].text;
          logger.log('\nContent preview (first 500 chars):');
          logger.log(content.substring(0, 500) + '...');
        }
        
        process.exit(0);
      } catch (error) {
        logger.error(`Error testing document content resource: ${error.message}`, error.stack);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error(`Error listing documents: ${error.message}`, error.stack);
    process.exit(1);
  }
}

/**
 * Test the document search resource
 */
async function testDocumentSearchResource(documentResourceService: DocumentResourceService, rl: readline.Interface) {
  rl.question('Enter search query: ', async (query) => {
    try {
      logger.log(`Testing document search resource with query: ${query}`);
      
      // Encode the query for URI
      const encodedQuery = encodeURIComponent(query);
      
      // Simulate resource request
      const uri = { href: `documents://search/${encodedQuery}/1` };
      const params = { query: encodedQuery, page: '1' };
      
      // Use the document resource service directly
      const result = await documentResourceService.handleResourceRequest('document-search', uri, params);
      
      if (!result) {
        throw new Error('Document search resource not registered or returned no result');
      }
      
      // Display result
      logger.log('Resource result:');
      logger.log(JSON.stringify(result, null, 2));
      
      // Display content if available
      if (result.contents && result.contents.length > 0) {
        logger.log('\nContent:');
        logger.log(result.contents[0].text);
      }
      
      process.exit(0);
    } catch (error) {
      logger.error(`Error testing document search resource: ${error.message}`, error.stack);
      process.exit(1);
    }
  });
}

/**
 * Test the matter documents resource
 */
async function testMatterDocumentsResource(documentResourceService: DocumentResourceService, rl: readline.Interface) {
  rl.question('Enter matter ID: ', async (matterId) => {
    try {
      logger.log(`Testing matter documents resource with matter ID: ${matterId}`);
      
      // Simulate resource request
      const uri = { href: `matter://${matterId}/documents/1` };
      const params = { matter_id: matterId, page: '1' };
      
      // Use the document resource service directly
      const result = await documentResourceService.handleResourceRequest('matter-documents', uri, params);
      
      if (!result) {
        throw new Error('Matter documents resource not registered or returned no result');
      }
      
      // Display result
      logger.log('Resource result:');
      logger.log(JSON.stringify(result, null, 2));
      
      // Display content if available
      if (result.contents && result.contents.length > 0) {
        logger.log('\nContent:');
        logger.log(result.contents[0].text);
      }
      
      process.exit(0);
    } catch (error) {
      logger.error(`Error testing matter documents resource: ${error.message}`, error.stack);
      process.exit(1);
    }
  });
}

/**
 * Test the document search tool
 */
async function testDocumentSearchTool(documentToolService: DocumentToolService, rl: readline.Interface) {
  rl.question('Enter search query: ', (query) => {
    rl.question('Enter matter ID (optional): ', async (matterId) => {
      try {
        logger.log(`Testing document search tool with query: ${query}, matter ID: ${matterId || 'none'}`);
        
        // Prepare tool parameters
        const params: any = { query };
        if (matterId) {
          params.matter_id = matterId;
        }
        
        // Use the document tool service directly
        const result = await documentToolService.handleToolExecution('search-documents', params);
        
        if (!result) {
          throw new Error('Document search tool not registered or returned no result');
        }
        
        // Display result
        logger.log('Tool result:');
        logger.log(JSON.stringify(result, null, 2));
        
        process.exit(0);
      } catch (error) {
        logger.error(`Error testing document search tool: ${error.message}`, error.stack);
        process.exit(1);
      }
    });
  });
}

/**
 * Test the document processing tool
 */
async function testDocumentProcessingTool(documentToolService: DocumentToolService, documentProcessorService: DocumentProcessorService, rl: readline.Interface) {
  // Get a random document to process
  try {
    const documents = await documentProcessorService.searchDocuments('');
    
    if (documents.length === 0) {
      logger.log('No documents found to process.');
      process.exit(1);
      return;
    }
    
    // Display available documents
    logger.log('Available documents:');
    documents.forEach((doc, index) => {
      logger.log(`${index + 1}. ${doc.title} (ID: ${doc.clioId})`);
    });
    
    // Prompt for document selection
    rl.question('Enter document ID or number from list: ', async (selection) => {
      try {
        // Determine document ID
        let documentId: string;
        
        // Check if selection is a number
        if (/^\d+$/.test(selection)) {
          const index = parseInt(selection, 10) - 1;
          if (index >= 0 && index < documents.length) {
            documentId = documents[index].clioId;
          } else {
            throw new Error('Invalid selection');
          }
        } else {
          documentId = selection;
        }
        
        logger.log(`Testing document processing tool with ID: ${documentId}`);
        
        // Prepare tool parameters
        const params = { document_id: documentId, force_refresh: true };
        
        // Use the document tool service directly
        const result = await documentToolService.handleToolExecution('process-document', params);
        
        if (!result) {
          throw new Error('Document processing tool not registered or returned no result');
        }
        
        // Display result
        logger.log('Tool result:');
        logger.log(JSON.stringify(result, null, 2));
        
        process.exit(0);
      } catch (error) {
        logger.error(`Error testing document processing tool: ${error.message}`, error.stack);
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error(`Error listing documents: ${error.message}`, error.stack);
    process.exit(1);
  }
}

/**
 * Test the citation generation tool
 */
async function testCitationGenerationTool(documentToolService: DocumentToolService, rl: readline.Interface) {
  rl.question('Enter document ID: ', (documentId) => {
    rl.question('Enter citation format (standard, bluebook, apa): ', (format) => {
      rl.question('Enter section (optional): ', async (section) => {
        try {
          logger.log(`Testing citation generation tool with document ID: ${documentId}, format: ${format}, section: ${section || 'none'}`);
          
          // Prepare tool parameters
          const params: any = { document_id: documentId };
          if (format) {
            params.format = format;
          }
          if (section) {
            params.section = section;
          }
          
          // Use the document tool service directly
          const result = await documentToolService.handleToolExecution('generate-citation', params);
          
          if (!result) {
            throw new Error('Citation generation tool not registered or returned no result');
          }
          
          // Display result
          logger.log('Tool result:');
          logger.log(JSON.stringify(result, null, 2));
          
          process.exit(0);
        } catch (error) {
          logger.error(`Error testing citation generation tool: ${error.message}`, error.stack);
          process.exit(1);
        }
      });
    });
  });
}

/**
 * Test the semantic search tool
 */
async function testSemanticSearchTool(documentToolService: DocumentToolService, rl: readline.Interface) {
  rl.question('Enter search query: ', (query) => {
    rl.question('Enter search type (semantic, hybrid, text): ', (searchType) => {
      rl.question('Enter limit (default 5): ', async (limitStr) => {
        try {
          const limit = limitStr ? parseInt(limitStr, 10) : 5;
          
          logger.log(`Testing semantic search tool with query: ${query}, type: ${searchType || 'hybrid'}, limit: ${limit}`);
          
          // Prepare tool parameters
          const params: any = { query, limit };
          if (searchType) {
            params.search_type = searchType;
          }
          
          // Use the document tool service directly
          const result = await documentToolService.handleToolExecution('semantic-search', params);
          
          if (!result) {
            throw new Error('Semantic search tool not registered or returned no result');
          }
          
          // Display result
          logger.log('Tool result:');
          logger.log(JSON.stringify(result, null, 2));
          
          process.exit(0);
        } catch (error) {
          logger.error(`Error testing semantic search tool: ${error.message}`, error.stack);
          process.exit(1);
        }
      });
    });
  });
}

// Run the test
testMcpDocumentIntegration().catch(error => {
  logger.error(`Unhandled error: ${error.message}`, error.stack);
  process.exit(1);
});
