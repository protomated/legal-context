/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config";
import { logger } from "./logger";
import { registerTools } from "./tools";
import { registerResources } from "./resources";

/**
 * LegalContext MCP Server
 *
 * This is the main entry point for the LegalContext MCP server.
 * It creates a secure bridge between a law firm's Clio document management system
 * and Claude Desktop AI assistant using the Model Context Protocol.
 */

async function startServer() {
  logger.info(`Initializing LegalContext MCP server in ${config.nodeEnv} mode...`);
  logger.debug("Configuration loaded:", config);

  // Create an instance of the MCP server
  const server = new McpServer({
    name: "LegalContext", // Identifies the server to clients
    version: "0.1.0",     // MVP version
  });

  logger.info("LegalContext MCP server initialized successfully.");

  // Register MCP resources and tools
  registerResources(server);
  registerTools(server);

  // Set up stdio transport for communication with Claude Desktop
  // IMPORTANT: When using stdio transport, stdout must be reserved exclusively for
  // MCP protocol messages in JSON format. All logging goes to stderr.
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info("LegalContext MCP server connected via stdio transport.");
  } catch (error) {
    logger.error("Failed to connect transport:", error);
    process.exit(1);
  }

  // Setup graceful shutdown
  process.on('SIGINT', () => handleShutdown(server));
  process.on('SIGTERM', () => handleShutdown(server));

  logger.info("LegalContext MCP server is ready to handle requests.");
}

/**
 * Handle graceful shutdown of the server
 */
function handleShutdown(server: McpServer) {
  logger.info("Shutting down LegalContext MCP server...");

  // Note: The McpServer class doesn't have a disconnect method
  // We simply log the shutdown and exit gracefully

  logger.info("Server shutdown complete.");
  process.exit(0);
}

// Start the server
startServer().catch((error) => {
  logger.error("Fatal error starting LegalContext MCP server:", error);
  process.exit(1);
});
