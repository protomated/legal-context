/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */
/**
 * Resources Module
 * 
 * This module exports all MCP resources for the LegalContext server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerLegalDocumentResources } from "./legalDocumentResource";
import { registerCaseLawResources } from "./caseLawResource";
import { logger } from "../logger";

/**
 * Register all resources with the MCP server
 */
export function registerResources(server: McpServer): void {
  logger.info("Registering all MCP resources...");
  
  // Register each category of resources
  registerLegalDocumentResources(server);
  registerCaseLawResources(server);
  
  logger.info("All MCP resources registered successfully");
}
