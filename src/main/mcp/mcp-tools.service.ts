// src/main/mcp/mcp-tools.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { McpServerService } from './mcp-server.service';

/**
 * Service that manages MCP tools.
 * Tools in the Model Context Protocol enable the LLM to perform
 * actions like searching documents or retrieving specific information.
 */
@Injectable()
export class McpToolsService {
  private readonly logger = new Logger(McpToolsService.name);
  
  constructor(private readonly mcpServerService: McpServerService) {}
  
  /**
   * Register all tools with the MCP server
   */
  async registerTools(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register tools: MCP server not initialized');
      return;
    }
    
    try {
      // Register a simple example tool to verify functionality
      this.registerExampleTool(server);
      
      this.logger.log('MCP tools registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register MCP tools: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Register a simple example tool for testing purposes
   */
  private registerExampleTool(server: any): void {
    // Example echo tool
    server.tool(
      'echo',
      { message: z.string() },
      async (params: any) => {
        const { message } = params;
        return {
          content: [{ type: "text", text: `Echo: ${message}` }]
        };
      }
    );
    
    this.logger.log('Example tools registered');
  }
}