// src/demo-mcp.ts - A simple implementation of the MCP server for demonstration
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * Start the MCP server with basic resources and tools for demonstration
 */
async function startMcpServer() {
  // Create an MCP server
  const server = new McpServer({
    name: "LegalContext",
    version: "1.0.0"
  });

  // Add an info resource
  server.resource(
    'info',
    'info://server',
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: 'LegalContext MCP Server - A secure bridge between law firms\' document management systems and AI assistants.'
      }]
    })
  );

  // Add a dynamic example resource
  server.resource(
    'example',
    new ResourceTemplate("example://{parameter}", { list: undefined }),
    async (uri, params) => {
      const { parameter } = params;
      return {
        contents: [{
          uri: uri.href,
          text: `Example resource with parameter: ${parameter}`
        }]
      };
    }
  );

  // Add an echo tool
  server.tool(
    'echo',
    { message: z.string() },
    async ({ message }) => ({
      content: [{ type: "text", text: `Echo: ${message}` }]
    })
  );

  // Start the server
  console.log('Starting MCP server...');
  const transport = new StdioServerTransport();
  
  // Add debug logging
  console.log('Transport created, connecting to client...');
  
  // Connect to transport
  await server.connect(transport);
  console.log('MCP server connected successfully');

  return server;
}

// Start the server when the file is executed
startMcpServer().catch(error => {
  console.error(`Failed to start MCP server: ${error.message}`);
  process.exit(1);
});