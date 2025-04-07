// src/basic-mcp.ts - A minimal implementation of the MCP server
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * Start the MCP server with basic resources and tools for demonstration
 */
async function startMcpServer() {
  console.log('Creating MCP server...');
  
  // Create an MCP server
  const server = new McpServer({
    name: "LegalContext",
    version: "1.0.0"
  });

  // Add a simple info resource
  server.resource(
    'info',
    'info://server',
    async (uri) => {
      console.log('Handling info resource request:', uri.href);
      return {
        contents: [{
          uri: uri.href,
          text: 'LegalContext MCP Server'
        }]
      };
    }
  );

  // Add a simple echo tool
  server.tool(
    'echo',
    { message: z.string() },
    async ({ message }) => ({
      content: [{ type: "text", text: `Echo: ${message}` }]
    })
  );

  console.log('Starting MCP server with stdio transport...');
  const transport = new StdioServerTransport();
  
  try {
    await server.connect(transport);
    console.log('MCP server connected successfully');
    
    // Keep the process running
    process.stdin.resume();
    
    process.on('SIGINT', () => {
      console.log('Shutting down MCP server...');
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error connecting MCP server: ${error.message}`);
    process.exit(1);
  }
}

// Start the server when the file is executed
console.log('Starting basic MCP server...');
startMcpServer().catch(error => {
  console.error(`Failed to start MCP server: ${error.message}`);
  process.exit(1);
});