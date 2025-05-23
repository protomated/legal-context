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
 * Configuration module for LegalContext
 *
 * This module loads and validates environment variables from .env files
 * and Claude Desktop environment variables. It provides a centralized configuration
 * object for use throughout the application.
 */

import * as dotenv from 'dotenv';
import * as os from 'os';
import * as path from 'path';
import { getLegalContextFilePath } from './utils/paths';

// Load .env file first
dotenv.config();

// Define the structure of our configuration
export interface Config {
  // Runtime environment
  nodeEnv: 'development' | 'production';

  // Server configuration
  port?: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';

  // Clio API configuration
  clioClientId?: string;
  clioClientSecret?: string;
  clioRedirectUri?: string;
  clioApiRegion?: 'us' | 'eu' | 'ca' | 'au';

  // LanceDB configuration
  lanceDbPath: string;

  // Security
  secretKey?: string;

  // Free tier limitations
  maxDocuments: number;
  maxQueriesPerDay: number;

  // Document processing
  chunkSize: number;
  chunkOverlap: number;
  maxDocumentSize: number;
}

// Define required environment variables
const requiredEnvVars: Array<keyof Config> = [
  'nodeEnv',
  'logLevel',
  'lanceDbPath',
];

// Load and validate environment variables
function loadConfig(): Config {
  // Output environment variables for debugging
  console.error('Debug: Loading config with env vars:');
  console.error('Debug: CLIO_CLIENT_ID:', process.env.CLIO_CLIENT_ID ? '[PRESENT]' : '[MISSING]');
  console.error('Debug: CLIO_CLIENT_SECRET:', process.env.CLIO_CLIENT_SECRET ? '[PRESENT]' : '[MISSING]');
  console.error('Debug: CLIO_REDIRECT_URI:', process.env.CLIO_REDIRECT_URI);
  console.error('Debug: CLIO_API_REGION:', process.env.CLIO_API_REGION);
  console.error('Debug: LANCEDB_DB_PATH:', process.env.LANCEDB_DB_PATH);

  // Create the config object with default values
  const config: Config = {
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,

    // Prioritize environment variables from Claude Desktop if available
    clioClientId: process.env.CLIO_CLIENT_ID || undefined,
    clioClientSecret: process.env.CLIO_CLIENT_SECRET || undefined,
    clioRedirectUri: process.env.CLIO_REDIRECT_URI || 'http://127.0.0.1:3001/clio/auth/callback',
    clioApiRegion: (process.env.CLIO_API_REGION as 'us' | 'eu' | 'ca' | 'au') || 'us',

    // Default LanceDB path is now in the .legalcontext directory in user's home directory
    lanceDbPath: process.env.LANCEDB_DB_PATH || getLegalContextFilePath('lancedb'),

    secretKey: process.env.SECRET_KEY,

    maxDocuments: process.env.MAX_DOCUMENTS ? parseInt(process.env.MAX_DOCUMENTS, 10) : 100,
    maxQueriesPerDay: process.env.MAX_QUERIES_PER_DAY ? parseInt(process.env.MAX_QUERIES_PER_DAY, 10) : 50,

    // Increased chunk size for legal documents to better maintain context
    chunkSize: process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : 1500,
    // Increased overlap for better semantic continuity between chunks
    chunkOverlap: process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP, 10) : 300,
    maxDocumentSize: process.env.MAX_DOCUMENT_SIZE ? parseInt(process.env.MAX_DOCUMENT_SIZE, 10) : 5242880, // 5MB
  };

  // Log configuration settings for debugging
  console.error('Loaded configuration:');
  console.error('- Clio Client ID:', config.clioClientId ? '[PRESENT]' : '[MISSING]');
  console.error('- Clio Redirect URI:', config.clioRedirectUri);
  console.error('- LanceDB Path:', config.lanceDbPath);

  // Validate required environment variables
  const missingVars = requiredEnvVars.filter(varName => !config[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return config;
}

// Export the configuration
export const config = loadConfig();

// Export a function to validate Clio API configuration when needed
export function validateClioConfig() {
  const requiredClioVars = ['clioClientId', 'clioClientSecret', 'clioRedirectUri', 'clioApiRegion'];
  const missingClioVars = requiredClioVars.filter(varName => !config[varName as keyof Config]);

  // Output configuration status to stderr (won't affect MCP protocol)
  console.error('Validating Clio configuration:');
  console.error('- CLIO_CLIENT_ID:', config.clioClientId ? 'Present' : 'Missing');
  console.error('- CLIO_CLIENT_SECRET:', config.clioClientSecret ? 'Present' : 'Missing');
  console.error('- CLIO_REDIRECT_URI:', config.clioRedirectUri || 'Missing');
  console.error('- CLIO_API_REGION:', config.clioApiRegion || 'Missing');

  if (missingClioVars.length > 0) {
    console.error(`ERROR: Missing required Clio API configuration: ${missingClioVars.join(', ')}`);
    throw new Error(`Missing required Clio API configuration: ${missingClioVars.join(', ')}`);
  }

  console.error('Clio configuration validation successful');
  return true;
}
