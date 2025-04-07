import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChunkingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  preserveParagraphs?: boolean;
}

export interface DocumentChunkData {
  content: string;
  startIndex: number;
  endIndex: number;
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Split document text into chunks with optional overlap
   */
  chunk(text: string, options?: ChunkingOptions): DocumentChunkData[] {
    const defaultChunkSize = this.configService.get<number>('documentProcessing.chunkSize', 1000);
    const defaultChunkOverlap = this.configService.get<number>('documentProcessing.chunkOverlap', 200);
    
    const chunkSize = options?.chunkSize ?? defaultChunkSize;
    const chunkOverlap = options?.chunkOverlap ?? defaultChunkOverlap;
    const preserveParagraphs = options?.preserveParagraphs !== undefined ? options.preserveParagraphs : true;

    this.logger.debug(`Chunking document with size: ${chunkSize}, overlap: ${chunkOverlap}, preserveParagraphs: ${preserveParagraphs}`);

    if (preserveParagraphs) {
      return this.chunkByParagraphs(text, chunkSize, chunkOverlap);
    } else {
      return this.chunkBySize(text, chunkSize, chunkOverlap);
    }
  }

  /**
   * Split text into chunks of approximately equal size
   */
  private chunkBySize(text: string, chunkSize: number, chunkOverlap: number): DocumentChunkData[] {
    const chunks: DocumentChunkData[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);

      chunks.push({
        content: text.substring(startIndex, endIndex),
        startIndex,
        endIndex,
      });

      startIndex = endIndex - chunkOverlap;

      // Prevent infinite loop if overlap >= chunkSize
      if (startIndex <= chunks[chunks.length - 1].startIndex) {
        startIndex = chunks[chunks.length - 1].endIndex;
      }
    }

    return chunks;
  }

  /**
   * Split text by paragraphs, keeping paragraphs together when possible
   */
  private chunkByParagraphs(text: string, chunkSize: number, chunkOverlap: number): DocumentChunkData[] {
    // Split text into paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: DocumentChunkData[] = [];

    let currentChunk = '';
    let chunkStartIndex = 0;
    let currentIndex = 0;

    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed chunk size and we already have content,
      // create a new chunk
      if (currentChunk.length + paragraph.length + 2 > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk,
          startIndex: chunkStartIndex,
          endIndex: currentIndex - 2, // Subtract 2 for the paragraph separator
        });

        // Calculate new start index with overlap
        const overlapStart = Math.max(currentIndex - chunkOverlap, chunkStartIndex);
        const overlapContent = text.substring(overlapStart, currentIndex - 2);

        currentChunk = overlapContent;
        chunkStartIndex = overlapStart;
      }

      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n\n';
        currentIndex += 2;
      }

      currentChunk += paragraph;
      currentIndex += paragraph.length;
    }

    // Add the last chunk if it has content
    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk,
        startIndex: chunkStartIndex,
        endIndex: currentIndex,
      });
    }

    return chunks;
  }
}
