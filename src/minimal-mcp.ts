// src/minimal-mcp.ts - A minimal MCP server implementation
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourcesResultSchema,
  ReadResourceResultSchema
} from '@modelcontextprotocol/sdk/types.js';

// Create a basic server
const server = new Server(
  {
    name: "MinimalMCP",
    version: "1.0.0"
  },
  {
    capabilities: {
      resources: {}
    }
  }
);

// Set up handlers for resource-related requests
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  console.log('Handling ListResourcesRequest');
  return {
    resources: [
      {
        uri: "info://server",
        name: "info"
      }
    ]
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  console.log('Handling ReadResourceRequest:', request.params.uri);
  
  if (request.params.uri === 'info://server') {
    return {
      contents: [
        {
          uri: "info://server",
          text: "This is a minimal MCP server."
        }
      ]
    };
  }
  
  throw new Error(`Resource not found: ${request.params.uri}`);
});

// Connect to the transport
const transport = new StdioServerTransport();

console.log('Starting minimal MCP server...');
server.connect(transport)
  .then(() => {
    console.log('Server connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect server:', error);
    process.exit(1);
  });

// Keep the server alive
process.stdin.resume();
