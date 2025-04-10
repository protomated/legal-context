import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';
import { McpOrchestratorService } from './mcp-orchestrator.service';

/**
 * Module that provides MCP server capabilities.
 * Integrates with the Model Context Protocol TypeScript SDK to connect
 * with Claude Desktop through stdio transport.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
    McpOrchestratorService,
    ConfigService,
  ],
  exports: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
  ],
})
export class McpModule {}
