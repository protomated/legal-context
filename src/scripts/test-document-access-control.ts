#!/usr/bin/env bun
/**
 * Document Access Control Test Script
 * 
 * This script tests the DocumentAccessControlService to ensure
 * it properly enforces document access permissions
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as readline from 'readline';
import { AppModule } from '../app.module';
import { ClioAuthService } from '../clio/auth/clio-auth.service';
import { ClioDocumentService } from '../clio/api/clio-document.service';
import { DocumentAccessControlService } from '../clio/access/document-access-control.service';
import { DocumentAccessDeniedError } from '../clio/dto/document.dto';

const logger = new Logger('TestDocumentAccessControl');

/**
 * Main function to test the document access control
 */
async function testDocumentAccessControl() {
  logger.log('Starting document access control test');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  try {
    // Get services
    const clioAuthService = app.get(ClioAuthService);
    const clioDocumentService = app.get(ClioDocumentService);
    const accessControlService = app.get(DocumentAccessControlService);

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
      '1. Test document access check\n' +
      '2. Test batch document access check\n' +
      '3. Test filtering document list by access\n' +
      'Enter choice (1-3): ',
      async (choice) => {
        try {
          switch (choice) {
            case '1':
              await testSingleDocumentAccess(clioDocumentService, accessControlService, rl);
              break;
            case '2':
              await testBatchDocumentAccess(clioDocumentService, accessControlService, rl);
              break;
            case '3':
              await testFilterDocuments(clioDocumentService, accessControlService, rl);
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
 * Test access control for a single document
 */
async function testSingleDocumentAccess(
  clioDocumentService,
  accessControlService,
  rl
) {
  rl.question('Enter document ID to check access: ', async (documentId) => {
    try {
      logger.log(`Checking access for document ID: ${documentId}`);

      // First, clear the access cache to ensure a fresh check
      accessControlService.clearAccessCache(documentId);
      
      // Check document access
      const startTime = Date.now();
      const hasAccess = await accessControlService.checkDocumentAccess(documentId);
      const duration = Date.now() - startTime;
      
      logger.log(`Access check result: ${hasAccess ? 'GRANTED' : 'DENIED'}`);
      logger.log(`Access check took ${duration}ms`);
      
      // Try a second time to test caching
      logger.log('Checking access again to test caching...');
      const cacheStartTime = Date.now();
      const cachedAccess = await accessControlService.checkDocumentAccess(documentId);
      const cacheDuration = Date.now() - cacheStartTime;
      
      logger.log(`Cached access check result: ${cachedAccess ? 'GRANTED' : 'DENIED'}`);
      logger.log(`Cached access check took ${cacheDuration}ms`);
      
      // Get some basic document info to verify we can access it
      const documentInfo = await clioDocumentService.getDocument(documentId);
      logger.log(`Document access verified. Document title: "${documentInfo.name}"`);
      
      rl.close();
      process.exit(0);
    } catch (error) {
      if (error instanceof DocumentAccessDeniedError) {
        logger.error(`Access denied to document ${documentId}`);
      } else {
        logger.error(`Error checking document access: ${error.message}`);
      }
      rl.close();
      process.exit(1);
    }
  });
}

/**
 * Test batch access control for multiple documents
 */
async function testBatchDocumentAccess(
  clioDocumentService, 
  accessControlService,
  rl
) {
  try {
    // First, get a list of documents to test with
    logger.log('Fetching documents to test batch access control...');
    
    const documents = await clioDocumentService.listDocuments({
      limit: 10,
      fields: 'id,name',
    });
    
    if (documents.data.length === 0) {
      logger.error('No documents found to test with');
      rl.close();
      process.exit(1);
      return;
    }
    
    // Extract document IDs
    const documentIds = documents.data.map(doc => doc.id);
    
    logger.log(`Testing batch access for ${documentIds.length} documents: ${documentIds.join(', ')}`);
    
    // Clear access cache for accurate testing
    accessControlService.clearAccessCache();
    
    // Test batch access checking
    const startTime = Date.now();
    const accessResults = await accessControlService.checkBatchDocumentAccess(documentIds);
    const duration = Date.now() - startTime;
    
    // Display results
    logger.log(`Batch access check completed in ${duration}ms`);
    logger.log('Access results:');
    
    let accessGranted = 0;
    let accessDenied = 0;
    
    documentIds.forEach(id => {
      const hasAccess = accessResults.get(id);
      logger.log(`Document ${id}: ${hasAccess ? 'GRANTED' : 'DENIED'}`);
      
      if (hasAccess) {
        accessGranted++;
      } else {
        accessDenied++;
      }
    });
    
    logger.log(`Summary: ${accessGranted} granted, ${accessDenied} denied (${accessGranted + accessDenied} total)`);
    
    rl.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Error testing batch document access: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

/**
 * Test filtering document list by access permissions
 */
async function testFilterDocuments(
  clioDocumentService,
  accessControlService,
  rl
) {
  try {
    // First, get a list of documents to test with
    logger.log('Fetching documents to test access filtering...');
    
    const documents = await clioDocumentService.listDocuments({
      limit: 10,
      fields: 'id,name,content_type,created_at,updated_at',
    });
    
    if (documents.data.length === 0) {
      logger.error('No documents found to test with');
      rl.close();
      process.exit(1);
      return;
    }
    
    // Log original document list
    logger.log(`Retrieved ${documents.data.length} documents to filter:`);
    documents.data.forEach((doc, index) => {
      logger.log(`${index + 1}. ${doc.name} (ID: ${doc.id})`);
    });
    
    // Clear access cache for accurate testing
    accessControlService.clearAccessCache();
    
    // Apply access filtering
    logger.log('\nApplying access control filtering...');
    const startTime = Date.now();
    const filteredDocuments = await accessControlService.filterDocumentsByAccess(documents.data);
    const duration = Date.now() - startTime;
    
    // Display filtered results
    logger.log(`Filtering completed in ${duration}ms`);
    logger.log(`Filtered result: ${filteredDocuments.length} of ${documents.data.length} documents accessible`);
    
    if (filteredDocuments.length > 0) {
      logger.log('\nAccessible documents:');
      filteredDocuments.forEach((doc, index) => {
        logger.log(`${index + 1}. ${doc.name} (ID: ${doc.id})`);
      });
    } else {
      logger.log('No documents are accessible with current permissions');
    }
    
    // Calculate removed documents
    if (filteredDocuments.length < documents.data.length) {
      const removedDocIds = documents.data
        .filter(doc => !filteredDocuments.some(filtered => filtered.id === doc.id))
        .map(doc => doc.id);
        
      logger.log('\nDocuments removed by access control:');
      removedDocIds.forEach(id => {
        const doc = documents.data.find(d => d.id === id);
        logger.log(`- ${doc.name} (ID: ${id})`);
      });
    }
    
    rl.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Error testing document filtering: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// Run the test
testDocumentAccessControl().catch(error => {
  logger.error(`Unhandled error: ${error.message}`, error.stack);
  process.exit(1);
});
