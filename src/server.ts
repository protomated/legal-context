/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: ask@protomated.com
 * Website: protomated.com
 */
/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: ask@protomated.com
 * Website: protomated.com
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config";
import { logger } from "./logger";
import { registerTools } from "./tools";
import { registerResources } from "./resources";
import { initializeClioIntegration, shutdownClioIntegration } from "./clio";

// Explicitly load environment variables
import { join } from "path";
import { readFileSync } from "fs";

// Function to explicitly load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(import.meta.dir, '../.env');
    logger.info(`Loading environment variables from: ${envPath}`);

    const envContent = readFileSync(envPath, 'utf8');
    const envVars = envContent.split('\n');

    for (const line of envVars) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, value] = trimmedLine.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        }
      }
    }

    logger.info('Environment variables loaded successfully');
  } catch (error) {
    logger.error('Failed to load environment variables:', error);
  }
}

/**
 * LegalContext MCP Server
 *
 * This is the main entry point for the LegalContext MCP server.
 * It creates a secure bridge between a law firm's Clio document management system
 * and Claude Desktop AI assistant using the Model Context Protocol.
 */

async function startServer() {
  // Explicitly load .env variables first
  loadEnvFile();

  // Display environment variables for debugging
  logger.debug('Loaded CLIO_CLIENT_ID:', process.env.CLIO_CLIENT_ID ? 'Present (not shown for security)' : 'Missing');
  logger.debug('Loaded CLIO_CLIENT_SECRET:', process.env.CLIO_CLIENT_SECRET ? 'Present (not shown for security)' : 'Missing');
  logger.debug('Loaded CLIO_REDIRECT_URI:', process.env.CLIO_REDIRECT_URI);
  logger.debug('Loaded CLIO_API_REGION:', process.env.CLIO_API_REGION);

  logger.info(`Initializing LegalContext MCP server in ${config.nodeEnv} mode...`);
  logger.debug("Configuration loaded:", config);

  // Initialize Clio integration
  logger.info("Initializing Clio integration...");
  try {
    const clioInitialized = await initializeClioIntegration();
    if (clioInitialized) {
      logger.info("Clio integration initialized successfully.");
    } else {
      logger.warn("Clio integration not fully initialized. Some document features may be limited.");
      // Continue with server startup even if Clio integration is not fully initialized
      // This allows users to authenticate later via the OAuth server
    }
  } catch (error) {
    logger.error("Failed to initialize Clio integration:", error);
    logger.warn("Continuing with server startup without Clio integration.");
    // Continue with server startup even if Clio integration fails completely
  }

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

  // Shutdown Clio integration
  try {
    shutdownClioIntegration();
    logger.info("Clio integration shutdown complete.");
  } catch (error) {
    logger.error("Error shutting down Clio integration:", error);
  }

  logger.info("Server shutdown complete.");
  process.exit(0);
}

// Start the server
startServer().catch((error) => {
  logger.error("Fatal error starting LegalContext MCP server:", error);
  process.exit(1);
});
