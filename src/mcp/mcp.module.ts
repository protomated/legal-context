// src/mcp/mcp.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpServerService } from './mcp-server.service';
import { DocumentResourceService } from './resources/document-resource.service';
import { DocumentToolService } from './tools/document-tool.service';
import { ClioModule } from '../clio/clio.module';
import { DocumentProcessingModule } from '../document-processing/document-processing.module';
import { DatabaseModule } from '../database/database.module';
import { Document } from '../database/entities/document.entity';
import { DocumentChunk } from '../database/entities/document-chunk.entity';
import { DocumentVector } from '../database/entities/document-vector.entity';

@Module({
  imports: [
    ConfigModule,
    ClioModule,
    DocumentProcessingModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Document, DocumentChunk, DocumentVector]),
  ],
  providers: [
    McpServerService,
    DocumentResourceService,
    DocumentToolService,
  ],
  exports: [
    McpServerService,
  ],
})
export class McpModule {
}
