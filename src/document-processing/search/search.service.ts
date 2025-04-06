// src/document-processing/search/search.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';
import { DocumentVector } from '../../database/entities/document-vector.entity';
import { EmbeddingService } from '../embedding/embedding.service';

export interface SearchResult {
  document: Document;
  chunk: DocumentChunk;
  similarity: number;
}

export interface SearchOptions {
  matter_id?: string;
  limit?: number;
  minSimilarity?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
    @InjectRepository(DocumentVector)
    private readonly vectorRepository: Repository<DocumentVector>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Search for document chunks by semantic similarity
   */
  async searchSimilar(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    this.logger.debug(`Searching for documents similar to: ${query}`);

    try {
      const limit = options.limit || 5;
      const minSimilarity = options.minSimilarity || 0.7;

      // In a real implementation, you would use pgvector's cosine similarity search
      // For this example, we'll use a mock approach

      // Generate embedding for the query
      // This uses our mock implementation
      const mockQueryChunk = this.chunkRepository.create({
        content: query,
        startIndex: 0,
        endIndex: query.length,
        document: null,
      });

      const [mockVector] = await this.embeddingService.generateEmbeddings([mockQueryChunk]);

      // In a real implementation with pgvector, you would use:
      // SELECT c.*, d.*, 1 - (v.embedding <=> [query_embedding]) as similarity
      // FROM document_vector v
      // JOIN document_chunk c ON c.id = v.chunk_id
      // JOIN document d ON d.id = c.document_id
      // WHERE 1 - (v.embedding <=> [query_embedding]) > [min_similarity]
      // ORDER BY similarity DESC
      // LIMIT [limit]

      // For the mock implementation, we'll retrieve all vectors and compute similarity in memory
      const allVectors = await this.vectorRepository.find({
        relations: ['chunk', 'chunk.document'],
      });

      // Mock similarity computation (dot product)
      const results: SearchResult[] = allVectors
        .map(vector => {
          // Compute cosine similarity
          const similarity = vector.embedding.reduce(
            (sum, val, i) => sum + val * mockVector.embedding[i],
            0
          );

          return {
            document: vector.chunk.document,
            chunk: vector.chunk,
            similarity,
          };
        })
        .filter(result => result.similarity > minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      if (options.matter_id) {
        // Filter by matter ID if specified
        return results.filter(result => {
          const metadata = result.document.metadata as any;
          return metadata.matter_id === options.matter_id;
        });
      }

      return results;
    } catch (error) {
      this.logger.error(`Error in semantic search: ${error.message}`, error.stack);
      throw new Error(`Failed to perform semantic search: ${error.message}`);
    }
  }

  /**
   * Search for documents by text matching
   */
  async searchText(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    this.logger.debug(`Searching for documents containing text: ${query}`);

    try {
      const limit = options.limit || 5;

      // In a real implementation, you would use full-text search capabilities
      // For this example, we'll use a simple LIKE query

      const chunks = await this.chunkRepository
        .createQueryBuilder('chunk')
        .innerJoinAndSelect('chunk.document', 'document')
        .where('chunk.content ILIKE :query', { query: `%${query}%` })
        .limit(limit)
        .getMany();

      // Create search results with a default similarity score
      const results: SearchResult[] = chunks.map(chunk => ({
        document: chunk.document,
        chunk,
        similarity: 1.0, // Default similarity for text matching
      }));

      if (options.matter_id) {
        // Filter by matter ID if specified
        return results.filter(result => {
          const metadata = result.document.metadata as any;
          return metadata.matter_id === options.matter_id;
        });
      }

      return results;
    } catch (error) {
      this.logger.error(`Error in text search: ${error.message}`, error.stack);
      throw new Error(`Failed to perform text search: ${error.message}`);
    }
  }

  /**
   * Hybrid search combining semantic and text search
   */
  async searchHybrid(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      // Perform both types of search
      const semanticResults = await this.searchSimilar(query, options);
      const textResults = await this.searchText(query, options);

      // Combine results, preferring semantic matches
      const combinedResults = [...semanticResults];

      // Add text results that aren't duplicates
      for (const textResult of textResults) {
        if (!combinedResults.some(result =>
          result.document.id === textResult.document.id &&
          result.chunk.id === textResult.chunk.id
        )) {
          combinedResults.push(textResult);
        }
      }

      // Sort by similarity and limit results
      return combinedResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, options.limit || 5);
    } catch (error) {
      this.logger.error(`Error in hybrid search: ${error.message}`, error.stack);
      throw new Error(`Failed to perform hybrid search: ${error.message}`);
    }
  }
}

