/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * LegalContext MCP Server
 *
 * This is the main entry point for the LegalContext MCP server.
 * It creates a secure bridge between a law firm's Clio document management system,
 * and AI assistant using the Model Context Protocol.
 */

async function startServer() {
  console.log("Initializing LegalContext MCP server...");

  // Create an instance of the MCP server
  const server = new McpServer({
    name: "LegalContext", // Identifies the server to clients
    version: "0.1.0",     // MVP version
  });

  console.log("LegalContext MCP server initialized successfully.");

  // Set up stdio transport for communication with Claude Desktop
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("LegalContext MCP server connected via stdio transport.");
  } catch (error) {
    console.error("Failed to connect transport:", error);
    process.exit(1);
  }

  console.log("LegalContext MCP server is ready to handle requests.");
}

// Start the server
startServer().catch((error) => {
  console.error("Fatal error starting LegalContext MCP server:", error);
  process.exit(1);
});
