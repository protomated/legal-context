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
 * Test Script for Text Extraction from PDF and DOCX files
 *
 * This script tests the text extraction functionality using office-text-extractor
 * for PDF and DOCX files. It creates sample buffers and tests the extraction process.
 *
 * Usage:
 * bun run src/tests/testTextExtraction.ts
 */

import { extractTextFromBuffer } from '../documents/textExtractor';
import { logger } from '../logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Test text extraction from a file
 */
async function testExtraction(filePath: string): Promise<void> {
  try {
    logger.info(`Testing text extraction for file: ${filePath}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error(`File not found: ${filePath}`);
      return;
    }

    // Get file information
    const fileStats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();

    logger.info(`File: ${fileName}, Size: ${fileStats.size} bytes, Type: ${fileExtension}`);

    // Read file as buffer
    const buffer = fs.readFileSync(filePath);

    // Extract text
    logger.info('Extracting text...');
    const startTime = Date.now();
    const extractedText = await extractTextFromBuffer(buffer, fileName);
    const endTime = Date.now();

    // Log results
    logger.info(`Extraction completed in ${endTime - startTime}ms`);
    logger.info(`Extracted ${extractedText.length} characters of text`);

    // Log a preview of the extracted text
    const textPreview = extractedText.length > 500
      ? extractedText.substring(0, 500) + '...'
      : extractedText;

    logger.info('Text preview:');
    logger.info('----------------------------------------');
    logger.info(textPreview);
    logger.info('----------------------------------------');

    logger.info(`Text extraction test for ${fileName} completed successfully`);
    return;
  } catch (error) {
    logger.error(`Error testing text extraction for file:`, error);
  }
}

/**
 * Main test function
 */
async function testTextExtraction(): Promise<void> {
  logger.info('Starting text extraction tests');

  // Define test files
  // Note: You need to provide paths to actual PDF and DOCX files on your system
  const testFiles = [
    // Replace these with paths to actual test files
    './test-files/sample.pdf',
    './test-files/sample.docx',
  ];

  // Create test-files directory if it doesn't exist
  const testFilesDir = './test-files';
  if (!fs.existsSync(testFilesDir)) {
    logger.info(`Creating directory: ${testFilesDir}`);
    fs.mkdirSync(testFilesDir);
  }

  // Check if test files exist
  let testFilesExist = true;
  for (const filePath of testFiles) {
    if (!fs.existsSync(filePath)) {
      logger.warn(`Test file not found: ${filePath}`);
      testFilesExist = false;
    }
  }

  // If test files don't exist, create sample files with instructions
  if (!testFilesExist) {
    logger.info('Test files not found. Creating instruction files...');

    // Create instruction for PDF
    fs.writeFileSync(
      './test-files/README.txt',
      'To test text extraction, place sample PDF and DOCX files in this directory.\n' +
      'Then update the file paths in testTextExtraction.ts to point to your test files.\n\n' +
      'Example test files:\n' +
      '- sample.pdf: A sample PDF document\n' +
      '- sample.docx: A sample DOCX document\n'
    );

    logger.info('Created instruction file: ./test-files/README.txt');
    logger.info('Please add test files and update the file paths in this script before running again.');
    return;
  }

  // Test each file
  for (const filePath of testFiles) {
    await testExtraction(filePath);
    logger.info('');  // Add a blank line between tests
  }

  logger.info('All text extraction tests completed');
}

// Run the tests
testTextExtraction();
