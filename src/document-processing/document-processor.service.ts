// src/document-processing/document-processor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../database/entities/document.entity';
import { DocumentChunk } from '../database/entities/document-chunk.entity';
import { TextExtractorService } from './extractors/text-extractor.service';
import { ChunkingService } from './chunking/chunking.service';
import { EmbeddingService } from './embedding/embedding.service';
import { ClioDocumentService } from '../clio/api/clio-document.service';

@Injectable()
export class DocumentProcessorService {
  private readonly logger = new Logger(DocumentProcessorService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    private readonly textExtractorService: TextExtractorService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly clioDocumentService: ClioDocumentService,
  ) {}

  /**
   * Process a document from Clio and store it in the local database
   */
  async processDocument(clioDocumentId: string): Promise<Document> {
    this.logger.debug(`Processing document ${clioDocumentId}`);

    try {
      // Check if document already exists
      let document = await this.documentRepository.findOne({
        where: { clioId: clioDocumentId },
        relations: ['chunks'],
      });

      if (document) {
        this.logger.debug(`Document ${clioDocumentId} already exists, updating...`);

        // Update document if it exists
        const documentMeta = await this.clioDocumentService.getDocument(clioDocumentId);

        if (new Date(documentMeta.updated_at) <= document.updatedAt) {
          this.logger.debug(`Document ${clioDocumentId} is up to date, skipping processing`);
          return document;
        }

        // Update document metadata
        document.title = documentMeta.name;
        document.mimeType = documentMeta.content_type;
        document.metadata = documentMeta;

        await this.documentRepository.save(document);
      } else {
        // Create new document
        this.logger.debug(`Document ${clioDocumentId} is new, creating...`);

        // Fetch document metadata
        const documentMeta = await this.clioDocumentService.getDocument(clioDocumentId);

        // Create document entity
        document = this.documentRepository.create({
          clioId: clioDocumentId,
          title: documentMeta.name,
          mimeType: documentMeta.content_type,
          metadata: documentMeta,
        });

        await this.documentRepository.save(document);
      }

      // Download document
      const documentContent = await this.clioDocumentService.downloadDocument(clioDocumentId);

      // Extract text
      const text = await this.textExtractorService.extract(documentContent, document.mimeType);

      // Delete existing chunks if any
      if (document.chunks && document.chunks.length > 0) {
        await this.chunkRepository.remove(document.chunks);
      }

      // Create chunks
      const chunkDataList = this.chunkingService.chunk(text);

      const chunks: DocumentChunk[] = [];

      for (const chunkData of chunkDataList) {
        const chunk = this.chunkRepository.create({
          document,
          content: chunkData.content,
          startIndex: chunkData.startIndex,
          endIndex: chunkData.endIndex,
        });

        chunks.push(await this.chunkRepository.save(chunk));
      }

      // Generate embeddings
      await this.embeddingService.generateEmbeddings(chunks);

      // Update document with chunks relation
      document.chunks = chunks;
      await this.documentRepository.save(document);

      this.logger.debug(`Document ${clioDocumentId} processed successfully with ${chunks.length} chunks`);

      return document;
    } catch (error) {
      this.logger.error(`Error processing document ${clioDocumentId}: ${error.message}`, error.stack);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  /**
   * Search for documents using semantic search
   */
  async searchDocuments(query: string, limit: number = 5): Promise<Document[]> {
    // In a real implementation, you would use vector similarity search
    // For this example, we'll use a simple text search

    this.logger.debug(`Searching documents with query: ${query}`);

    try {
      // Simple search by title for demonstration
      const documents = await this.documentRepository
        .createQueryBuilder('document')
        .where('document.title ILIKE :query', { query: `%${query}%` })
        .limit(limit)
        .getMany();

      return documents;
    } catch (error) {
      this.logger.error(`Error searching documents: ${error.message}`, error.stack);
      throw new Error(`Failed to search documents: ${error.message}`);
    }
  }
}

