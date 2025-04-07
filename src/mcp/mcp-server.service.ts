import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Service that initializes and manages the MCP server.
 * Handles connection via stdio transport for Claude Desktop integration.
 */
@Injectable()
export class McpServerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpServerService.name);
  private server: McpServer;
  private transport: StdioServerTransport;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize the MCP server when the module is loaded
   */
  async onModuleInit() {
    try {
      this.logger.log('Initializing MCP server...');
      
      // Create the MCP server instance
      this.server = new McpServer({
        name: this.configService.get('mcpServer.name', 'LegalContext'),
        version: this.configService.get('mcpServer.version', '1.0.0'),
      });

      this.logger.log('MCP server instance created');

      // Initialize the stdio transport for Claude Desktop
      this.transport = new StdioServerTransport();
      
      this.logger.log('MCP server ready to connect to transport');
    } catch (error) {
      this.logger.error(`Failed to initialize MCP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Clean up resources when the module is destroyed
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect the MCP server to the transport
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      this.logger.warn('MCP server is already connected');
      return;
    }

    try {
      this.logger.log('Connecting MCP server to stdio transport...');
      await this.server.connect(this.transport);
      this.isConnected = true;
      this.logger.log('MCP server connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect MCP server: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Disconnect the MCP server from the transport
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      this.logger.log('Disconnecting MCP server...');
      // The SDK doesn't have a disconnect method, but we can handle cleanup here
      this.isConnected = false;
      this.logger.log('MCP server disconnected successfully');
    } catch (error) {
      this.logger.error(`Failed to disconnect MCP server: ${error.message}`, error.stack);
    }
  }

  /**
   * Get the underlying MCP server instance
   */
  getServer(): McpServer {
    return this.server;
  }

  /**
   * Check if the server is connected
   */
  isServerConnected(): boolean {
    return this.isConnected;
  }
}
