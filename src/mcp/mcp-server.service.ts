// src/mcp/mcp-server.service.ts
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

@Injectable()
export class McpServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpServerService.name);
  private server: McpServer;
  private transport: StdioServerTransport;

  constructor(
    private readonly configService: ConfigService,
  ) {
  }

  async onModuleInit() {
    this.logger.log('Initializing MCP server');

    this.server = new McpServer({
      name: this.configService.get('mcpServer.name'),
      version: this.configService.get('mcpServer.version'),
    });

    // Resources and tools will be registered by other services

    // Use stdio transport for Claude Desktop compatibility
    this.transport = new StdioServerTransport();

    try {
      await this.server.connect(this.transport);
      this.logger.log('MCP server connected and ready');
    } catch (error) {
      this.logger.error(`Failed to connect MCP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down MCP server');

    if (this.transport) {
      try {
        await this.transport.close();
        this.logger.log('MCP transport closed');
      } catch (error) {
        this.logger.error(`Error closing MCP transport: ${error.message}`, error.stack);
      }
    }
  }

  /**
   * Get the MCP server instance
   */
  getServer(): McpServer {
    return this.server;
  }
}


