// src/claude-mcp-server.ts
// A clean MCP server implementation specifically for Claude Desktop

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { createLogger } from './utils/logger';

// Create a logger that writes to stderr only
const logger = createLogger('LegalContext');

// Redirect console methods to our logger to avoid stdout pollution
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleDebug = console.debug;

// Override console methods to use our stderr logger
console.log = (...args) => logger.info(...args);
console.info = (...args) => logger.info(...args);
console.warn = (...args) => logger.warn(...args);
console.error = (...args) => logger.error(args[0], args[1] instanceof Error ? args[1] : undefined);
console.debug = (...args) => logger.debug(...args);

/**
 * Main entry point for the LegalContext MCP server
 */
async function main() {
  logger.info('Initializing LegalContext MCP server...');
  
  // Create the MCP server
  const server = new McpServer({
    name: "LegalContext",
    version: "1.0.0"
  });

  // Register resources
  logger.info('Registering resources...');
  
  // Info resource
  server.resource(
    'info',
    'info://server',
    (uri) => {
      logger.debug('Handling info resource request:', uri.href);
      return {
        contents: [{
          uri: uri.href,
          text: "LegalContext MCP Server - A secure bridge between law firm document management systems and AI assistants."
        }]
      };
    }
  );
  
  // Document resource (placeholder)
  server.resource(
    'document',
    new ResourceTemplate('document://{id}', { list: undefined }),
    (uri, params) => {
      logger.debug('Handling document resource request:', uri.href, params);
      const { id } = params;
      return {
        contents: [{
          uri: uri.href,
          text: `Document ${id} content would appear here.`
        }]
      };
    }
  );

  // Register tools
  logger.info('Registering tools...');
  
  // Search tool
  server.tool(
    'search',
    { 
      query: z.string(),
      limit: z.number().optional()
    },
    (params) => {
      logger.debug('Handling search tool request:', params);
      const { query, limit = 5 } = params;
      return {
        content: [{ 
          type: "text", 
          text: `Found ${limit} results for query: "${query}"`
        }]
      };
    }
  );
  
  // Echo tool for testing
  server.tool(
    'echo',
    { message: z.string() },
    (params) => {
      logger.debug('Handling echo tool request:', params);
      return {
        content: [{ 
          type: "text", 
          text: `Echo: ${params.message}`
        }]
      };
    }
  );

  // Connect to stdio transport
  logger.info('Starting server with stdio transport...');
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    logger.info('MCP server successfully connected to transport');
    
    // Keep the process alive
    process.stdin.resume();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down LegalContext MCP server...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error connecting MCP server:', error);
    process.exit(1);
  }
}

// Start the server
main().catch(error => {
  logger.error('Unhandled error in MCP server:', error);
  process.exit(1);
});
