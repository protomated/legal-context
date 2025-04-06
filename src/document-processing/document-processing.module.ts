// src/document-processing/document-processing.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../database/entities/document.entity';
import { DocumentChunk } from '../database/entities/document-chunk.entity';
import { DocumentVector } from '../database/entities/document-vector.entity';
import { TextExtractorService } from './extractors/text-extractor.service';
import { ChunkingService } from './chunking/chunking.service';
import { EmbeddingService } from './embedding/embedding.service';
import { DocumentProcessorService } from './document-processor.service';
import { SearchService } from './search/search.service';
import { ClioModule } from '../clio/clio.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Document, DocumentChunk, DocumentVector]),
    ClioModule,
  ],
  providers: [
    TextExtractorService,
    ChunkingService,
    EmbeddingService,
    DocumentProcessorService,
    SearchService,
  ],
  exports: [
    TextExtractorService,
    ChunkingService,
    EmbeddingService,
    DocumentProcessorService,
    SearchService,
  ],
})
export class DocumentProcessingModule {
}
