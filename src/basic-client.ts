// src/basic-client.ts - A minimal MCP client for testing
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Start a test client to connect to the MCP server
 */
async function startClient() {
  console.log('Starting MCP client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/basic-mcp.ts']
  });

  // Create the client
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      },
      timeout: 5000, // Set a smaller timeout value
      debug: true // Enable debug mode for more information
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected to MCP server');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Test the info resource
    console.log('Reading info resource...');
    const infoResource = await client.readResource('info://server');
    console.log('Info resource content:', JSON.stringify(infoResource, null, 2));

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', JSON.stringify(tools, null, 2));

    // Test the echo tool
    console.log('Calling echo tool...');
    const echoResult = await client.callTool("echo", {
      message: 'Hello from test client!'
    });
    console.log('Echo tool result:', JSON.stringify(echoResult, null, 2));

    console.log('Tests completed successfully');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    console.log('Disconnecting...');
    process.exit(0);
  }
}

// Start the client
startClient();