// src/main/mcp/mcp-resources.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerService } from './mcp-server.service';

/**
 * Service that manages MCP resources.
 * Resources in the Model Context Protocol are used to provide data (like documents)
 * to the LLM for context.
 */
@Injectable()
export class McpResourcesService {
  private readonly logger = new Logger(McpResourcesService.name);
  
  constructor(private readonly mcpServerService: McpServerService) {}

  /**
   * Register all resources with the MCP server
   */
  async registerResources(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register resources: MCP server not initialized');
      return;
    }

    try {
      // Register a simple example resource to verify functionality
      this.registerExampleResource(server);
      
      this.logger.log('MCP resources registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register MCP resources: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Register a simple example resource for testing purposes
   */
  private registerExampleResource(server: any): void {
    // Example static resource
    server.resource(
      'info',
      'info://server',
      async (uri: any) => ({
        contents: [{
          uri: uri.href,
          text: 'LegalContext MCP Server - A secure bridge between law firm document management systems and AI assistants.'
        }]
      })
    );
    
    // Example dynamic resource with parameters
    server.resource(
      'example',
      new ResourceTemplate("example://{parameter}", { list: undefined }),
      async (uri: any, params: any) => {
        const { parameter } = params;
        return {
          contents: [{
            uri: uri.href,
            text: `Example resource with parameter: ${parameter}`
          }]
        };
      }
    );
    
    this.logger.log('Example resources registered');
  }
}