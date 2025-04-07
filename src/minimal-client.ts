// src/minimal-client.ts - A minimal MCP client implementation
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('Starting minimal MCP client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/minimal-mcp.ts'],
    debug: true // Enable debugging
  });

  // Create a client with minimal capabilities
  const client = new Client(
    {
      name: 'minimal-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {}
      },
      timeout: 3000 // 3 second timeout
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to server...');
    await client.connect(transport);
    console.log('Connected to server');

    // List available resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Read the info resource
    console.log('Reading info resource...');
    const info = await client.readResource('info://server');
    console.log('Info resource content:', JSON.stringify(info, null, 2));

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    console.log('Exiting client...');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});