#!/bin/sh

# LegalContext Demo Script
# This script builds and runs the LegalContext MCP server and then connects a test client to it

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo "${BLUE}=======================================${NC}"
echo "${BLUE}     LegalContext MCP Server Demo     ${NC}"
echo "${BLUE}=======================================${NC}"
echo ""

# Check for bun
echo "${BLUE}Checking prerequisites...${NC}"
if ! command -v bun &> /dev/null
then
    echo "${RED}Bun is not installed. Please install Bun first:${NC}"
    echo "  curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Install dependencies if needed
echo "${BLUE}Installing dependencies...${NC}"
bun install

# Run the demo client
echo "${BLUE}Starting demo client...${NC}"
echo "${BLUE}This will initialize the MCP server and connect a test client to it.${NC}"
echo ""

# Start the demo client
bun run demo

echo ""
echo "${GREEN}Demo completed!${NC}"
echo ""
echo "To integrate with Claude Desktop, follow the instructions in:"
echo "  docs/mcp-client-integration.md"
echo ""
echo "${BLUE}=======================================${NC}"
