// src/example/echo-server.ts
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create a simple Echo server
const server = new McpServer({
  name: "Echo",
  version: "1.0.0"
});

// Add an echo resource
server.resource(
  'echo',
  new ResourceTemplate('echo://{message}', { list: undefined }),
  (uri, params) => {
    console.log('Resource request received:', uri.href, params);
    return {
      contents: [{
        uri: uri.href,
        text: `Resource echo: ${params.message}`
      }]
    };
  }
);

// Add an echo tool
server.tool(
  'echo',
  { message: z.string() },
  (params) => {
    console.log('Tool request received:', params);
    return {
      content: [{ type: "text", text: `Tool echo: ${params.message}` }]
    };
  }
);

// Start the server
console.log('Starting Echo server...');
const transport = new StdioServerTransport();
server.connect(transport)
  .then(() => {
    console.log('Server connected');
  })
  .catch(error => {
    console.error('Connection error:', error);
    process.exit(1);
  });

console.log('Server initialization complete');
