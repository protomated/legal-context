import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';

/**
 * Service that orchestrates the initialization of MCP components.
 * Ensures that resources and tools are registered before the server connects.
 */
@Injectable()
export class McpOrchestratorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpOrchestratorService.name);
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly mcpResourcesService: McpResourcesService,
    private readonly mcpToolsService: McpToolsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initialize the MCP ecosystem
   */
  async onModuleInit() {
    try {
      this.logger.log('Starting MCP orchestration...');

      // Check the environment
      const environment = this.configService.get<string>('environment');
      this.logger.log(`Running in ${environment} environment`);

      // 1. Register resources
      this.logger.log('Registering MCP resources...');
      await this.mcpResourcesService.registerResources();

      // 2. Register tools
      this.logger.log('Registering MCP tools...');
      await this.mcpToolsService.registerTools();

      // 3. Connect the server to transport
      this.logger.log('Connecting MCP server to transport...');
      await this.mcpServerService.connect();

      // 4. Set up health check if in production
      if (environment === 'production') {
        this.setupHealthCheck();
      }

      this.logger.log('MCP orchestration completed successfully');
    } catch (error) {
      this.logger.error(`Failed to orchestrate MCP initialization: ${error.message}`, error.stack);

      // Attempt to properly shut down any initialized components
      try {
        await this.mcpServerService.disconnect();
      } catch (cleanupError) {
        this.logger.error('Error during cleanup after failed initialization', cleanupError);
      }

      throw error;
    }
  }

  /**
   * Clean up resources when the module is destroyed
   */
  async onModuleDestroy() {
    this.logger.log('Cleaning up MCP orchestrator...');

    // Clear health check interval if it exists
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Disconnect from transport
    try {
      await this.mcpServerService.disconnect();
    } catch (error) {
      this.logger.error(`Error during MCP server disconnect: ${error.message}`, error.stack);
    }

    this.logger.log('MCP orchestrator cleanup completed');
  }

  /**
   * Set up periodic health checks for the MCP server
   */
  private setupHealthCheck() {
    const healthCheckIntervalMs = this.configService.get<number>('healthCheck.intervalMs', 60000); // Default to 1 minute

    this.logger.log(`Setting up MCP health check with interval of ${healthCheckIntervalMs}ms`);

    this.healthCheckInterval = setInterval(() => {
      try {
        const isConnected = this.mcpServerService.isServerConnected();

        if (!isConnected) {
          this.logger.warn('MCP server connection lost, attempting to reconnect...');

          // Attempt to reconnect
          this.mcpServerService.connect()
            .then(() => this.logger.log('MCP server reconnected successfully'))
            .catch(error => this.logger.error(`Failed to reconnect MCP server: ${error.message}`, error.stack));
        }
      } catch (error) {
        this.logger.error(`Error during MCP health check: ${error.message}`, error.stack);
      }
    }, healthCheckIntervalMs);

    this.logger.log('MCP health check initialized');
  }
}
