// src/demo-client.ts - A simple MCP client for testing the server
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

/**
 * Start a test client to connect to the MCP server
 */
async function startTestClient() {
  console.log('Starting MCP test client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/demo-mcp.ts']
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
      timeout: 10000 // Set a smaller timeout value
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected to MCP server');

    // Test the info resource
    console.log('Reading info resource...');
    const infoResource = await client.readResource('info://server');
    console.log('Info resource content:', JSON.stringify(infoResource, null, 2));

    // Test the example resource
    console.log('Reading example resource...');
    const exampleResource = await client.readResource('example://test');
    console.log('Example resource content:', JSON.stringify(exampleResource, null, 2));

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
    // Disconnect and exit
    console.log('Disconnecting...');
    process.exit(0);
  }
}

// Start the test client
startTestClient();