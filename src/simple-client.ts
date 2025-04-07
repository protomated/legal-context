// src/simple-client.ts - A simplified MCP client for testing
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Main function
async function main() {
  console.log('Starting simple MCP client...');
  
  // Create a transport
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/simple-mcp.ts']
  });

  // Create the client
  const client = new Client(
    { 
      name: 'test-client',
      version: '1.0.0' 
    },
    {
      timeout: 3000, // 3 second timeout
      capabilities: {
        resources: {},
        tools: {}
      }
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected successfully');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', resources);

    // Access the info resource
    console.log('Reading info resource...');
    const info = await client.readResource('info://server');
    console.log('Info resource:', info);

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', tools);

    // Call the echo tool
    console.log('Calling echo tool...');
    const echoResult = await client.callTool('echo', {
      message: 'Hello from simple client!'
    });
    console.log('Echo result:', echoResult);

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    console.log('Exiting client...');
    process.exit(0);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});