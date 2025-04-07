/**
 * Simple MCP test client to verify server functionality
 * Run with: bun run tools/test-client.ts
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  console.log('Starting MCP test client...');
  
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/demo-mcp.ts'],
    debug: true // Enable transport debugging
  });

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
    console.log('Connecting to MCP server...');
    await client.connect(transport);
    console.log('Connected to MCP server');

    // List resources
    console.log('Listing resources...');
    const resources = await client.listResources();
    console.log('Resources:', JSON.stringify(resources, null, 2));

    // Test info resource
    console.log('Reading info resource...');
    const infoResource = await client.readResource('info://server');
    console.log('Info resource:', JSON.stringify(infoResource, null, 2));

    // List tools
    console.log('Listing tools...');
    const tools = await client.listTools();
    console.log('Tools:', JSON.stringify(tools, null, 2));

    // Test echo tool
    console.log('Calling echo tool...');
    const echoResult = await client.callTool("echo", {
      message: 'Hello from test client!'
    });
    console.log('Echo result:', JSON.stringify(echoResult, null, 2));

    console.log('Tests completed successfully');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Disconnect
    process.exit(0);
  }
}

main();