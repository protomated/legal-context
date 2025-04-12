/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: ask@protomated.com
 * Website: protomated.com
 */
/**
 * Clio API Integration Test
 * 
 * This script tests the integration with the Clio API.
 * It verifies token validity, performs basic API calls, and tests document listing and metadata retrieval.
 */

import { logger } from "../logger";
import { clioApiClient, ClioDocument } from "../clio/apiClient";
import { processDocument } from "../documents/documentProcessor";

// Set colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Main function to run Clio API integration tests
 */
async function testClioIntegration() {
  console.log(`\n${colors.bright}${colors.cyan}=== Clio API Integration Test ===${colors.reset}\n`);
  
  console.log(`${colors.yellow}Initializing Clio API client...${colors.reset}`);
  
  // Initialize the Clio API client
  const initialized = await clioApiClient.initialize();
  if (!initialized) {
    console.error(`${colors.red}✗ Failed to initialize Clio API client. Authentication required.${colors.reset}`);
    console.log(`Please run 'bun run auth:simple' to authenticate with Clio.`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✓ Clio API client initialized successfully${colors.reset}`);
  
  try {
    // Test 1: List documents
    console.log(`\n${colors.cyan}Test 1: Listing Documents${colors.reset}`);
    
    console.log(`Fetching first page of documents (limit: 10)...`);
    const documents = await clioApiClient.listDocuments(1, 10);
    
    console.log(`${colors.green}✓ Successfully retrieved ${documents.data.length} documents${colors.reset}`);
    console.log(`Total documents available: ${documents.meta.paging.total_entries}`);
    console.log(`Pagination info: Page ${documents.meta.paging.page} of ${documents.meta.paging.total_pages}`);
    
    if (documents.data.length === 0) {
      console.log(`${colors.yellow}⚠ No documents found in the Clio account${colors.reset}`);
    } else {
      // Display first few documents
      console.log(`\nDocument listing:`);
      documents.data.slice(0, 5).forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.name} (ID: ${doc.id})`);
      });
    }
    
    // Test 2: Get a specific document's metadata
    if (documents.data.length > 0) {
      console.log(`\n${colors.cyan}Test 2: Retrieving Document Metadata${colors.reset}`);
      
      const firstDoc = documents.data[0];
      console.log(`Fetching metadata for document: "${firstDoc.name}" (ID: ${firstDoc.id})...`);
      
      const documentDetails = await clioApiClient.getDocument(firstDoc.id);
      
      console.log(`${colors.green}✓ Successfully retrieved document metadata${colors.reset}`);
      console.log(`Document Name: ${documentDetails.data.name}`);
      console.log(`Content Type: ${documentDetails.data.content_type || 'Not specified'}`);
      console.log(`Size: ${documentDetails.data.size ? formatBytes(documentDetails.data.size) : 'Unknown'}`);
      console.log(`Created: ${new Date(documentDetails.data.created_at).toLocaleString()}`);
      console.log(`Updated: ${new Date(documentDetails.data.updated_at).toLocaleString()}`);
      
      // Test 3: Download document and extract text (optional)
      console.log(`\n${colors.cyan}Test 3: Document Processing Test${colors.reset}`);
      
      const processAnswer = await question(`Do you want to test downloading and processing this document? (y/n): `);
      if (processAnswer.toLowerCase() === 'y' || processAnswer.toLowerCase() === 'yes') {
        try {
          console.log(`Processing document...`);
          const processedDoc = await processDocument(firstDoc.id);
          
          console.log(`${colors.green}✓ Successfully processed document${colors.reset}`);
          console.log(`Extracted ${processedDoc.text.length} characters of text`);
          
          // Show text preview
          if (processedDoc.text.length > 0) {
            const previewLength = Math.min(processedDoc.text.length, 200);
            console.log(`\nText preview: "${processedDoc.text.substring(0, previewLength)}${processedDoc.text.length > previewLength ? '...' : ''}"`);
          } else {
            console.log(`${colors.yellow}⚠ No text was extracted from the document${colors.reset}`);
          }
        } catch (processError) {
          console.error(`${colors.red}✗ Error processing document: ${processError instanceof Error ? processError.message : String(processError)}${colors.reset}`);
        }
      }
    }
    
    // Test 4: List folders
    console.log(`\n${colors.cyan}Test 4: Listing Folders${colors.reset}`);
    
    console.log(`Fetching first page of folders (limit: 10)...`);
    const folders = await clioApiClient.listFolders(1, 10);
    
    console.log(`${colors.green}✓ Successfully retrieved ${folders.data.length} folders${colors.reset}`);
    console.log(`Total folders available: ${folders.meta.paging.total_entries}`);
    
    if (folders.data.length === 0) {
      console.log(`${colors.yellow}⚠ No folders found in the Clio account${colors.reset}`);
    } else {
      // Display first few folders
      console.log(`\nFolder listing:`);
      folders.data.slice(0, 5).forEach((folder, index) => {
        console.log(`${index + 1}. ${folder.name} (ID: ${folder.id})`);
      });
      
      // Test 5: Get folder contents
      if (folders.data.length > 0) {
        console.log(`\n${colors.cyan}Test 5: Retrieving Folder Contents${colors.reset}`);
        
        const firstFolder = folders.data[0];
        console.log(`Fetching contents for folder: "${firstFolder.name}" (ID: ${firstFolder.id})...`);
        
        const folderContents = await clioApiClient.getFolderContents(firstFolder.id);
        
        console.log(`${colors.green}✓ Successfully retrieved folder contents${colors.reset}`);
        console.log(`Documents in folder: ${folderContents.documents.data.length}`);
        console.log(`Subfolders in folder: ${folderContents.folders.data.length}`);
      }
    }
    
    // Summary
    console.log(`\n${colors.bright}${colors.green}All Clio API tests completed successfully!${colors.reset}`);
    console.log(`Your Clio integration is working properly and ready for use with LegalContext.`);
    
  } catch (error) {
    console.error(`\n${colors.red}✗ Error during Clio API tests: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Helper function to get user input
 */
async function question(query: string): Promise<string> {
  const readline = await import('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Format bytes to a human-readable string
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Run the tests
testClioIntegration().catch(error => {
  logger.error("Error during Clio API tests:", error);
  process.exit(1);
});
