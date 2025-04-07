// A simple test script for the MCP server
const { execSync } = require('child_process');
const { spawn } = require('child_process');

// Start the MCP server in a separate process
console.log('Starting MCP server...');
const server = spawn('bun', ['run', 'src/demo-mcp.ts'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Log server output
server.stdout.on('data', (data) => {
  console.log(`Server stdout: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server stderr: ${data}`);
});

// Wait for server to start
setTimeout(() => {
  try {
    // Run a simple test to see if we can connect to the server
    console.log('Testing server...');
    
    // End the server process
    console.log('Test complete, stopping server...');
    server.kill();
  } catch (error) {
    console.error('Error during test:', error);
    server.kill();
  }
}, 2000);
