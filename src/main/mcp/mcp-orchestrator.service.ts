// src/main/mcp/mcp-orchestrator.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';

/**
 * Service that orchestrates the initialization of MCP components.
 * Ensures that resources and tools are registered before the server connects.
 */
@Injectable()
export class McpOrchestratorService implements OnModuleInit {
  private readonly logger = new Logger(McpOrchestratorService.name);
  
  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly mcpResourcesService: McpResourcesService,
    private readonly mcpToolsService: McpToolsService,
  ) {}
  
  /**
   * Initialize the MCP ecosystem
   */
  async onModuleInit() {
    try {
      this.logger.log('Starting MCP orchestration...');
      
      // Register resources
      await this.mcpResourcesService.registerResources();
      
      // Register tools
      await this.mcpToolsService.registerTools();
      
      // Connect the server to transport
      await this.mcpServerService.connect();
      
      this.logger.log('MCP orchestration completed successfully');
    } catch (error) {
      this.logger.error(`Failed to orchestrate MCP initialization: ${error.message}`, error.stack);
      throw error;
    }
  }
}