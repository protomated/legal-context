/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Configuration module for LegalContext
 * 
 * This module loads and validates environment variables from .env files
 * using Bun's built-in support. It provides a centralized configuration
 * object for use throughout the application.
 */

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
  // Bun automatically loads .env files, so we can access process.env directly
  
  // Create the config object with default values
  const config: Config = {
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    
    clioClientId: process.env.CLIO_CLIENT_ID,
    clioClientSecret: process.env.CLIO_CLIENT_SECRET,
    clioRedirectUri: process.env.CLIO_REDIRECT_URI,
    clioApiRegion: (process.env.CLIO_API_REGION as 'us' | 'eu' | 'ca' | 'au') || 'us',
    
    lanceDbPath: process.env.LANCEDB_DB_PATH || './lancedb',
    
    secretKey: process.env.SECRET_KEY,
    
    maxDocuments: process.env.MAX_DOCUMENTS ? parseInt(process.env.MAX_DOCUMENTS, 10) : 100,
    maxQueriesPerDay: process.env.MAX_QUERIES_PER_DAY ? parseInt(process.env.MAX_QUERIES_PER_DAY, 10) : 50,
    
    chunkSize: process.env.CHUNK_SIZE ? parseInt(process.env.CHUNK_SIZE, 10) : 1000,
    chunkOverlap: process.env.CHUNK_OVERLAP ? parseInt(process.env.CHUNK_OVERLAP, 10) : 200,
    maxDocumentSize: process.env.MAX_DOCUMENT_SIZE ? parseInt(process.env.MAX_DOCUMENT_SIZE, 10) : 5242880, // 5MB
  };
  
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
  
  if (missingClioVars.length > 0) {
    throw new Error(`Missing required Clio API configuration: ${missingClioVars.join(', ')}`);
  }
}