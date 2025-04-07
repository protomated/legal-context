// src/standalone/client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createLogger } from '../utils/logger';

// Create a logger that writes to stderr
const logger = createLogger('MCP-Client');

/**
 * Test client for the LegalContext MCP server
 */
async function main() {
  logger.info('Starting LegalContext MCP test client...');
  
  // Create a transport that spawns the server process
  const transport = new StdioClientTransport({
    command: 'bun',
    args: ['run', 'src/standalone/server.ts'],
    debug: true
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
      timeout: 5000 // 5 second timeout
    }
  );

  try {
    // Connect to the server
    logger.info('Connecting to MCP server...');
    await client.connect(transport);
    logger.info('Connected successfully');

    // Test basic capabilities
    await runTests(client);
    
    logger.info('All tests completed successfully');
  } catch (error) {
    logger.error('Error during test:', error);
  } finally {
    logger.info('Exiting client...');
    process.exit(0);
  }
}

/**
 * Run test suite against the MCP server
 */
async function runTests(client: Client) {
  // Test 1: List resources
  logger.info('\n--- Test 1: List Resources ---');
  const resources = await client.listResources();
  logger.info('Resources:', resources);

  // Test 2: Read info resource
  logger.info('\n--- Test 2: Read Info Resource ---');
  const infoResource = await client.readResource('info://server');
  logger.info('Info resource:', infoResource);

  // Test 3: Read document resource
  logger.info('\n--- Test 3: Read Document Resource ---');
  const documentResource = await client.readResource('document://test-doc-123');
  logger.info('Document resource:', documentResource);

  // Test 4: List tools
  logger.info('\n--- Test 4: List Tools ---');
  const tools = await client.listTools();
  logger.info('Tools:', tools);

  // Test 5: Call echo tool
  logger.info('\n--- Test 5: Call Echo Tool ---');
  const echoResult = await client.callTool('echo', {
    message: 'Hello from the test client!'
  });
  logger.info('Echo result:', echoResult);

  // Test 6: Call search tool
  logger.info('\n--- Test 6: Call Search Tool ---');
  const searchResult = await client.callTool('search', {
    query: 'legal documents',
    limit: 3
  });
  logger.info('Search result:', searchResult);
}

// Run the main function
main().catch(error => {
  logger.error('Unhandled error in MCP client:', error);
  process.exit(1);
});
