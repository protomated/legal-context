#!/bin/bash
# Script to clean up the LegalContext project directory

PROJECT_DIR="/Users/deletosh/projects/legal-context"

echo "Cleaning up LegalContext project at $PROJECT_DIR..."
echo "This will remove standalone scripts, tests, backups (*.bak), and temporary files."
# Add a small pause for the user to read the warning
sleep 3

# Remove specific standalone scripts and backups (some .bak are listed here for clarity)
echo "Removing specific standalone scripts and old backups..."
rm -f "$PROJECT_DIR/demo.sh.bak"
rm -f "$PROJECT_DIR/src/demo-mcp.ts"
rm -f "$PROJECT_DIR/src/demo-client.ts"
rm -f "$PROJECT_DIR/src/basic-mcp.ts"
rm -f "$PROJECT_DIR/src/basic-client.ts"
rm -f "$PROJECT_DIR/src/simple-mcp.ts"
rm -f "$PROJECT_DIR/src/simple-client.ts"
rm -f "$PROJECT_DIR/src/minimal-mcp.ts"
rm -f "$PROJECT_DIR/src/minimal-client.ts"
rm -f "$PROJECT_DIR/src/direct-server.js"
rm -f "$PROJECT_DIR/src/run-direct-server.js"
rm -f "$PROJECT_DIR/src/claude-mcp-server.ts"
rm -f "$PROJECT_DIR/src/setup-clio-auth.ts"
rm -f "$PROJECT_DIR/src/test-clio-auth.ts"
rm -f "$PROJECT_DIR/src/clio/test-document-listing.ts"
rm -f "$PROJECT_DIR/src/clio/test-database-connection.ts"
rm -f "$PROJECT_DIR/src/clio/test-full-integration.ts"
# Explicit .bak removals (though the find command below will also catch them)
rm -f "$PROJECT_DIR/src/clio/dto/document.dto.ts.bak"
rm -f "$PROJECT_DIR/src/clio/test-database-connection.ts.bak"
rm -f "$PROJECT_DIR/src/clio/test-document-listing.ts.bak"
rm -f "$PROJECT_DIR/src/clio/test-full-integration.ts.bak"
rm -f "$PROJECT_DIR/src/standalone/client.ts.bak"
rm -f "$PROJECT_DIR/src/standalone/server.ts.bak"

# --- NEW: Remove ALL .bak files recursively ---
echo "Searching for and removing all *.bak files..."
find "$PROJECT_DIR" -type f -name '*.bak' -delete
# --- End of new command ---

# Remove directories (use -rf for directories)
echo "Removing standalone directories, test directory, and temporary directories..."
rm -rf "$PROJECT_DIR/src/example"
rm -rf "$PROJECT_DIR/src/standalone"
rm -rf "$PROJECT_DIR/scripts"
rm -rf "$PROJECT_DIR/test" # Removes all Jest tests
rm -rf "$PROJECT_DIR/tools" # Contains test-client.ts
rm -rf "$PROJECT_DIR/docker/postgres/Dockerfile" # Removing alternate Dockerfiles
rm -rf "$PROJECT_DIR/docker/postgres/Dockerfile.simple"
rm -rf "$PROJECT_DIR/coverage" # Standard test coverage output
rm -rf "$PROJECT_DIR/.nyc_output" # Standard test coverage output
rm -rf "$PROJECT_DIR/tmp" # Temporary files
rm -rf "$PROJECT_DIR/temp" # Temporary files
rm -rf "$PROJECT_DIR/logs" # Log directory

# Remove general log files if any at top level
echo "Removing top-level log files..."
rm -f "$PROJECT_DIR/*.log"

# Optional: Prune package.json scripts (Manual step recommended)
echo ""
echo "--------------------------------------------------------------------"
echo "ACTION RECOMMENDED: Manually review 'scripts' in package.json"
echo "You may want to remove entries related to the deleted files:"
echo "- demo:*, basic:*, simple:*, minimal:*, example:*, direct:*, standalone:*"
echo "- setup:clio:standalone, setup:clio:server, setup:clio:credentials"
echo "- check:clio, init:dev, test:clio*, test:client"
echo "--------------------------------------------------------------------"
echo ""

echo "Cleanup complete."
echo "The remaining files should form the base for Epic 1 and Epic 2 (Story 2.1) using NestJS."

exit 0
