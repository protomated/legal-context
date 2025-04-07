// src/direct-server.js
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');

// Create a simple server
const server = new McpServer({
  name: "Direct Server",
  version: "1.0.0"
});

// Add a simple info resource
server.resource('info', 'info://server', async (uri) => {
  console.log('INFO RESOURCE ACCESSED');
  return {
    contents: [{
      uri: uri.href,
      text: "This is a direct MCP server."
    }]
  };
});

// Add a simple echo tool
server.tool('echo', { message: 'string' }, async (params) => {
  console.log('ECHO TOOL CALLED');
  return {
    content: [{ type: "text", text: `Echo: ${params.message}` }]
  };
});

// Start the server
const transport = new StdioServerTransport();

console.log('Starting direct MCP server...');
server.connect(transport)
  .then(() => {
    console.log('MCP server connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect MCP server:', error);
    process.exit(1);
  });

// Keep the process alive
process.stdin.resume();
