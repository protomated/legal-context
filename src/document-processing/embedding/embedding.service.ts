// src/document-processing/embedding/embedding.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { DocumentVector } from '../../database/entities/document-vector.entity';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(
    @InjectRepository(DocumentVector)
    private readonly vectorRepository: Repository<DocumentVector>,
  ) {
  }

  /**
   * Generate vector embeddings for document chunks
   * In a real implementation, you would use a model like OpenAI's embeddings API
   */
  async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentVector[]> {
    this.logger.debug(`Generating embeddings for ${chunks.length} chunks`);

    const vectors: DocumentVector[] = [];

    for (const chunk of chunks) {
      // In a real implementation, you would call an embedding API
      // This is a placeholder that generates random embeddings
      const embedding = this.mockEmbeddingGeneration(chunk.content);

      const vector = this.vectorRepository.create({
        chunk,
        embedding,
      });

      vectors.push(await this.vectorRepository.save(vector));
    }

    return vectors;
  }

  /**
   * Mock embedding generation for demonstration purposes
   * In a real implementation, you would use a proper embedding model
   */
  private mockEmbeddingGeneration(text: string): number[] {
    // Generate a fixed-size random embedding (1536-dim for demonstration)
    const embedding = Array(1536).fill(0).map(() => Math.random() * 2 - 1);

    // Normalize the embedding to unit length
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }
}
