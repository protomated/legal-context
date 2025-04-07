// src/run-direct-server.js
const { exec } = require('child_process');
const path = require('path');

// Run the server in a separate process
const server = exec('node src/direct-server.js', {
  cwd: process.cwd(),
  env: process.env
});

// Log the server's output
server.stdout.on('data', (data) => {
  console.log(`Server output: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server error: ${data}`);
});

// Keep the process alive
console.log('Server started in background. Press Ctrl+C to exit.');
process.stdin.resume();

// Clean up when exiting
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill();
  process.exit(0);
});
