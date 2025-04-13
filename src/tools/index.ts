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
 * Tools Module
 *
 * This module exports all MCP tools for the LegalContext server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerLegalQueryTool } from "./legalQuery";
import { registerDocumentAnalysisTools } from "./documentAnalysisTool";
import { registerLegalResearchTools } from "./legalResearchTool";
import { registerDocumentSearchTools } from "./documentSearchTool";
import { registerRagQueryTool } from "./ragQueryTool";
import { logger } from "../logger";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  logger.info("Registering all MCP tools...");

  // Register each category of tools
  registerLegalQueryTool(server);
  registerDocumentAnalysisTools(server);
  registerLegalResearchTools(server);
  registerDocumentSearchTools(server);
  registerRagQueryTool(server);

  logger.info("All MCP tools registered successfully");
}
