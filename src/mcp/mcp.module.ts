import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpServerService } from './mcp-server.service';
import { McpResourcesService } from './mcp-resources.service';
import { McpToolsService } from './mcp-tools.service';
import { McpOrchestratorService } from './mcp-orchestrator.service';
import { DocumentResourceService } from './resources/document-resource.service';
import { DocumentToolService } from './tools/document-tool.service';
import { Document } from '../database/entities/document.entity';
import { DocumentChunk } from '../database/entities/document-chunk.entity';
import { DocumentVector } from '../database/entities/document-vector.entity';
import { ClioModule } from '../clio/clio.module';
import { DocumentProcessingModule } from '../document-processing/document-processing.module';

/**
 * Module that provides MCP server capabilities.
 * Integrates with the Model Context Protocol TypeScript SDK to connect
 * with Claude Desktop through stdio transport.
 */
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Document, DocumentChunk, DocumentVector]),
    ClioModule,
    DocumentProcessingModule,
  ],
  providers: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
    McpOrchestratorService,
    ConfigService,
    // Add specialized document resources and tools services
    DocumentResourceService,
    DocumentToolService,
  ],
  exports: [
    McpServerService,
    McpResourcesService,
    McpToolsService,
  ],
})
export class McpModule {}
