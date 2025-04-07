#!/bin/sh

# Build the project
echo "Building project..."
bun run build

# Run the test client
echo "Running MCP test client..."
bun run tools/test-client.ts
