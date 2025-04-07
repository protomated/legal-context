// src/example/echo-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('Starting Echo client...');
  
  // Create a transport to connect to the Echo server
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/example/echo-server.ts'],
    debug: true
  });

  // Create a client
  const client = new Client(
    {
      name: 'echo-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        resources: {},
        tools: {}
      },
      timeout: 5000 // 5s timeout
    }
  );

  try {
    // Connect to the server
    console.log('Connecting to Echo server...');
    await client.connect(transport);
    console.log('Connected successfully');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Read a resource
    console.log('Reading echo resource...');
    const resourceResult = await client.readResource('echo://hello');
    console.log('Resource result:', JSON.stringify(resourceResult, null, 2));

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', JSON.stringify(tools, null, 2));

    // Call a tool
    console.log('Calling echo tool...');
    const toolResult = await client.callTool('echo', { message: 'Hello from tool call!' });
    console.log('Tool result:', JSON.stringify(toolResult, null, 2));

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Clean exit
    console.log('Exiting client...');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});