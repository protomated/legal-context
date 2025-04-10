/**
 * Clio Documents Test Script
 *
 * This script tests the ClioDocumentService to ensure it can connect to Clio
 * and retrieve document information.
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as readline from 'readline';
import { AppModule } from '../app.module';
import { ClioAuthService } from '../clio/auth/clio-auth.service';
import { ClioDocumentService } from '../clio/api/clio-document.service';
import { ClioDocumentMetadataService } from '../clio/api/clio-document-metadata.service';

const logger = new Logger('TestClioDocuments');

/**
 * Main function to test the Clio documents API
 */
async function testClioDocuments() {
  logger.log('Starting Clio documents API test');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  try {
    // Get services
    const clioAuthService = app.get(ClioAuthService);
    const clioDocumentService = app.get(ClioDocumentService);
    const clioDocumentMetadataService = app.get(ClioDocumentMetadataService);

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Check if we have a valid token
    const hasToken = await clioAuthService.hasValidToken();
    if (!hasToken) {
      logger.error('No valid authentication token found. Please run test-clio-auth.ts first.');
      rl.close();
      await app.close();
      return;
    }

    logger.log('Successfully authenticated with Clio');

    // Show options menu
    rl.question(
      'Select an operation to test:\n' +
      '1. List documents\n' +
      '2. Get document details\n' +
      '3. Document hierarchy\n' +
      '4. Recent documents\n' +
      '5. Search documents\n' +
      'Enter choice (1-5): ',
      async (choice) => {
        try {
          switch (choice) {
            case '1':
              await testListDocuments(clioDocumentService, rl);
              break;
            case '2':
              await testGetDocument(clioDocumentService, clioDocumentMetadataService, rl);
              break;
            case '3':
              await testDocumentHierarchy(clioDocumentMetadataService, rl);
              break;
            case '4':
              await testRecentDocuments(clioDocumentMetadataService, rl);
              break;
            case '5':
              await testSearchDocuments(clioDocumentService, rl);
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
 * Test listing documents
 */
async function testListDocuments(
  clioDocumentService: ClioDocumentService,
  rl: readline.Interface
) {
  try {
    logger.log('Testing document listing...');
    
    // Get first page of documents
    const documents = await clioDocumentService.listDocuments({
      limit: 10,
      fields: 'id,name,content_type,created_at,updated_at',
    });
    
    // Display results
    logger.log(`Found ${documents.meta.paging.total_entries} total documents (showing first ${documents.data.length}):`);
    
    // Format and display each document
    documents.data.forEach((doc, index) => {
      logger.log(`${index + 1}. ${doc.name} (${doc.content_type})`);
      logger.log(`   ID: ${doc.id}`);
      logger.log(`   Created: ${new Date(doc.created_at).toLocaleString()}`);
      logger.log(`   Updated: ${new Date(doc.updated_at).toLocaleString()}`);
      logger.log('---');
    });
    
    rl.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Error listing documents: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

/**
 * Test getting document details
 */
async function testGetDocument(
  clioDocumentService: ClioDocumentService,
  clioDocumentMetadataService: ClioDocumentMetadataService,
  rl: readline.Interface
) {
  rl.question('Enter document ID: ', async (documentId) => {
    try {
      logger.log(`Getting details for document ID: ${documentId}`);
      
      // Get document details
      const document = await clioDocumentService.getDocument(documentId);
      
      // Display document details
      logger.log('Document details:');
      logger.log(`Name: ${document.name}`);
      logger.log(`Type: ${document.content_type}`);
      logger.log(`Created: ${new Date(document.created_at).toLocaleString()}`);
      logger.log(`Updated: ${new Date(document.updated_at).toLocaleString()}`);
      
      if (document.description) {
        logger.log(`Description: ${document.description}`);
      }
      
      if (document.size) {
        logger.log(`Size: ${document.size} bytes`);
      }
      
      // Get document path
      const path = await clioDocumentMetadataService.getDocumentPath(documentId);
      logger.log(`Path: ${path}`);
      
      // Normalize metadata
      const metadata = clioDocumentMetadataService.normalizeDocumentMetadata(document);
      logger.log('Normalized metadata:');
      logger.log(JSON.stringify(metadata, null, 2));
      
      rl.close();
      process.exit(0);
    } catch (error) {
      logger.error(`Error getting document: ${error.message}`);
      rl.close();
      process.exit(1);
    }
  });
}

/**
 * Test document hierarchy
 */
async function testDocumentHierarchy(
  clioDocumentMetadataService: ClioDocumentMetadataService,
  rl: readline.Interface
) {
  rl.question('Enter folder ID (or leave blank for root): ', async (folderId) => {
    try {
      const targetFolder = folderId || 'root';
      
      logger.log(`Getting document hierarchy for folder: ${targetFolder}`);
      
      // Get document hierarchy
      const hierarchy = await clioDocumentMetadataService.getDocumentHierarchy(targetFolder);
      
      // Display results
      logger.log('Document hierarchy:');
      logger.log(JSON.stringify(hierarchy, null, 2));
      
      // Report counts
      logger.log(`Folders: ${hierarchy.folders.length}`);
      logger.log(`Documents: ${hierarchy.documents.length}`);
      
      rl.close();
      process.exit(0);
    } catch (error) {
      logger.error(`Error getting document hierarchy: ${error.message}`);
      rl.close();
      process.exit(1);
    }
  });
}

/**
 * Test recent documents
 */
async function testRecentDocuments(
  clioDocumentMetadataService: ClioDocumentMetadataService,
  rl: readline.Interface
) {
  rl.question('Enter number of days to look back (default 7): ', async (daysStr) => {
    try {
      const days = daysStr ? parseInt(daysStr, 10) : 7;
      
      if (isNaN(days) || days <= 0) {
        logger.error('Invalid number of days. Please enter a positive number.');
        rl.close();
        process.exit(1);
        return;
      }
      
      logger.log(`Getting documents modified in the last ${days} days...`);
      
      // Get recent documents
      const documents = await clioDocumentMetadataService.getRecentlyModifiedDocuments(days);
      
      // Display results
      logger.log(`Found ${documents.length} documents modified in the last ${days} days:`);
      
      // Format and display each document
      documents.forEach((doc, index) => {
        logger.log(`${index + 1}. ${doc.name} (${doc.content_type})`);
        logger.log(`   ID: ${doc.id}`);
        logger.log(`   Updated: ${new Date(doc.updated_at).toLocaleString()}`);
        logger.log('---');
      });
      
      rl.close();
      process.exit(0);
    } catch (error) {
      logger.error(`Error getting recent documents: ${error.message}`);
      rl.close();
      process.exit(1);
    }
  });
}

/**
 * Test searching documents
 */
async function testSearchDocuments(
  clioDocumentService: ClioDocumentService,
  rl: readline.Interface
) {
  rl.question('Enter search query: ', async (query) => {
    try {
      logger.log(`Searching for documents matching: "${query}"`);
      
      // Search documents
      const searchResults = await clioDocumentService.searchDocuments(query, {
        limit: 10,
        fields: 'id,name,content_type,created_at,updated_at',
      });
      
      // Display results
      logger.log(`Found ${searchResults.meta.paging.total_entries} matching documents (showing first ${searchResults.data.length}):`);
      
      // Format and display each document
      searchResults.data.forEach((doc, index) => {
        logger.log(`${index + 1}. ${doc.name} (${doc.content_type})`);
        logger.log(`   ID: ${doc.id}`);
        logger.log(`   Created: ${new Date(doc.created_at).toLocaleString()}`);
        logger.log(`   Updated: ${new Date(doc.updated_at).toLocaleString()}`);
        logger.log('---');
      });
      
      rl.close();
      process.exit(0);
    } catch (error) {
      logger.error(`Error searching documents: ${error.message}`);
      rl.close();
      process.exit(1);
    }
  });
}

// Run the test
testClioDocuments().catch(error => {
  logger.error(`Unhandled error: ${error.message}`, error.stack);
  process.exit(1);
});
