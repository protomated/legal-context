/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { config } from './config';
import { logger } from './logger';
import { registerTools } from './tools';
import { registerResources } from './resources';
import { initializeClioIntegration, shutdownClioIntegration } from './clio';
import { getDocumentIndexer } from './documents/documentIndexer';
import { secureTokenStorage } from './clio/tokenStorage';
import { forceReauthentication } from './clio/authStatus';

/**
 * LegalContext MCP Server
 *
 * This is the main entry point for the LegalContext MCP server.
 * It creates a secure bridge between a law firm's Clio document management system
 * and Claude Desktop AI assistant using the Model Context Protocol.
 */

async function startServer() {
  // Display environment variables for debugging (redacting sensitive values)
  logger.debug('Loaded CLIO_CLIENT_ID:', process.env.CLIO_CLIENT_ID ? 'Present (not shown for security)' : 'Missing');
  logger.debug('Loaded CLIO_CLIENT_SECRET:', process.env.CLIO_CLIENT_SECRET ? 'Present (not shown for security)' : 'Missing');
  logger.debug('Loaded CLIO_REDIRECT_URI:', process.env.CLIO_REDIRECT_URI);
  logger.debug('Loaded CLIO_API_REGION:', process.env.CLIO_API_REGION);

  logger.info(`Initializing LegalContext MCP server in ${config.nodeEnv} mode...`);
  logger.debug('Configuration loaded:', config);

  // Initialize LanceDB connection first to ensure documents can be indexed
  logger.info('Initializing document indexer...');
  try {
    const documentIndexer = getDocumentIndexer();
    await documentIndexer.initialize();
    logger.info('Document indexer initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize document indexer:', error);
    logger.warn('Continuing with server startup but document indexing capabilities will be limited');
  }

  // Initialize Clio integration
  logger.info('Initializing Clio integration...');
  try {
    const clioInitialized = await initializeClioIntegration();
    if (clioInitialized) {
      logger.info('Clio integration initialized successfully.');
    } else {
      logger.warn('Clio integration not fully initialized. Some document features may be limited.');
      logger.info('Starting OAuth server for authentication...');

      // Check if there are existing tokens that need to be cleared
      const tokensExist = await secureTokenStorage.tokensExist();
      if (tokensExist) {
        logger.warn('Existing tokens found but authentication failed. Tokens may be invalid or expired.');

        // Force re-authentication by deleting corrupt tokens
        await forceReauthentication();
        logger.info('Tokens have been deleted. A new authentication will be required.');
      }

      // Output URL for authentication
      const port = config.port || 3001;
      logger.info(`To authenticate with Clio, visit: http://localhost:${port}/clio/auth`);
    }
  } catch (error) {
    logger.error('Failed to initialize Clio integration:', error);
    logger.warn('Continuing with server startup without Clio integration.');
  }

  // Create an instance of the MCP server
  const server = new McpServer({
    name: 'LegalContext', // Identifies the server to clients
    version: '0.1.0',     // MVP version
    description: 'Secure semantic search for legal document management that bridges Clio and Claude Desktop',
  });

  logger.info('LegalContext MCP server initialized successfully.');

  // Register MCP resources and tools
  registerResources(server);
  registerTools(server);

  // Set up stdio transport for communication with Claude Desktop
  // IMPORTANT: When using stdio transport, stdout must be reserved exclusively for
  // MCP protocol messages in JSON format. All logging goes to stderr.
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('LegalContext MCP server connected via stdio transport.');
  } catch (error) {
    logger.error('Failed to connect transport:', error);
    process.exit(1);
  }

  // Setup graceful shutdown
  process.on('SIGINT', () => handleShutdown(server));
  process.on('SIGTERM', () => handleShutdown(server));

  logger.info('LegalContext MCP server is ready to handle requests.');
}

/**
 * Handle graceful shutdown of the server
 */
async function handleShutdown(server: McpServer) {
  logger.info('Shutting down LegalContext MCP server...');

  // Shutdown document indexer
  try {
    const documentIndexer = getDocumentIndexer();
    await documentIndexer.close();
    logger.info('Document indexer shutdown complete');
  } catch (error) {
    logger.error('Error shutting down document indexer:', error);
  }

  // Shutdown Clio integration
  try {
    shutdownClioIntegration();
    logger.info('Clio integration shutdown complete.');
  } catch (error) {
    logger.error('Error shutting down Clio integration:', error);
  }

  logger.info('Server shutdown complete.');
  process.exit(0);
}

// Start the server
startServer().catch((error) => {
  logger.error('Fatal error starting LegalContext MCP server:', error);
  process.exit(1);
});
