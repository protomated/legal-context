#!/bin/sh
# Run the build command first
echo "Building the project..."
bun run build

# Run the test client
echo "Running the test client..."
bun run test:client
