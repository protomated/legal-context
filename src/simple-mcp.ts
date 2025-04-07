// src/simple-mcp.ts - A simpler implementation of the MCP server
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Create an MCP server
const server = new McpServer({
  name: "LegalContext",
  version: "1.0.0"
});

// Add a simple info resource
server.resource(
  'info',
  'info://server',
  (uri) => {
    console.log('Handling info resource request:', uri.href);
    return {
      contents: [{
        uri: uri.href,
        text: 'LegalContext MCP Server - A simple test server'
      }]
    };
  }
);

// Add an echo tool
server.tool(
  'echo',
  { message: 'string' },
  (params) => {
    console.log('Handling echo tool request:', params);
    return {
      content: [{ type: "text", text: `Echo: ${params.message}` }]
    };
  }
);

// Connect to the transport
console.log('Creating stdio transport...');
const transport = new StdioServerTransport();

console.log('Connecting to the transport...');
server.connect(transport)
  .then(() => {
    console.log('MCP server connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect MCP server:', error);
    process.exit(1);
  });

// Keep the server alive
process.on('SIGINT', () => {
  console.log('Shutting down MCP server...');
  process.exit(0);
});