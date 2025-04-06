// src/mcp/tools/document-tool.service.ts (updated)
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { z } from 'zod';
import { McpServerService } from '../mcp-server.service';
import { ClioDocumentService } from '../../clio/api/clio-document.service';
import { DocumentProcessorService } from '../../document-processing/document-processor.service';
import { SearchService } from '../../document-processing/search/search.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';

@Injectable()
export class DocumentToolService implements OnModuleInit {
  private readonly logger = new Logger(DocumentToolService.name);

  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly clioDocumentService: ClioDocumentService,
    private readonly documentProcessorService: DocumentProcessorService,
    private readonly searchService: SearchService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
  }

  async onModuleInit() {
    this.registerTools();
  }

  /**
   * Register document-related MCP tools
   */
  registerTools() {
    const server = this.mcpServerService.getServer();

    // Advanced document search tool using our search service
    server.tool(
      'search-documents',
      {
        query: z.string(),
        matter_id: z.string().optional(),
        limit: z.number().optional(),
        search_type: z.enum(['semantic', 'text', 'hybrid']).optional(),
      },
      async ({ query, matter_id, limit = 5, search_type = 'hybrid' }) => {
        this.logger.debug(`Searching documents with query: ${query}, type: ${search_type}`);

        try {
          const searchOptions = {
            matter_id,
            limit,
          };

          let searchResults;

          // Use the appropriate search method based on the search_type
          switch (search_type) {
            case 'semantic':
              searchResults = await this.searchService.searchSimilar(query, searchOptions);
              break;
            case 'text':
              searchResults = await this.searchService.searchText(query, searchOptions);
              break;
            case 'hybrid':
            default:
              searchResults = await this.searchService.searchHybrid(query, searchOptions);
              break;
          }

          if (searchResults.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `No documents found matching '${query}'. Try a different search term or use the document-list resource to browse available documents.`,
              }],
            };
          }

          // Format the search results
          const formattedResults = searchResults.map(result => ({
            documentId: result.document.clioId,
            documentTitle: result.document.title,
            similarity: result.similarity.toFixed(2),
            excerpt: result.chunk.content.length > 150
              ? result.chunk.content.substring(0, 150) + '...'
              : result.chunk.content,
            uri: `document://${result.document.clioId}`,
          }));

          return {
            content: [{
              type: 'text',
              text: `Found ${formattedResults.length} results matching '${query}':\n\n` +
                formattedResults.map((r, i) =>
                  `${i + 1}. **${r.documentTitle}** (Similarity: ${r.similarity})\n` +
                  `   "${r.excerpt}"\n` +
                  `   URI: ${r.uri}`,
                ).join('\n\n'),
            }],
          };
        } catch (error) {
          this.logger.error(`Document search error: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error searching documents: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
    );

    // Document processing tool to explicitly process a document
    server.tool(
      'process-document',
      {
        document_id: z.string(),
      },
      async ({ document_id }) => {
        this.logger.debug(`Processing document: ${document_id}`);

        try {
          const document = await this.documentProcessorService.processDocument(document_id);

          return {
            content: [{
              type: 'text',
              text: `Document "${document.title}" processed successfully with ${document.chunks.length} chunks.`,
            }],
          };
        } catch (error) {
          this.logger.error(`Document processing error: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error processing document: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
    );

    // Citation tool (unchanged from previous implementation)
    server.tool(
      'generate-citation',
      {
        document_id: z.string(),
        section: z.string().optional(),
      },
      async ({ document_id, section }) => {
        this.logger.debug(`Generating citation for document ${document_id}, section: ${section}`);

        try {
          const documentMeta = await this.clioDocumentService.getDocument(document_id);

          // Basic citation format
          const citationText = section
            ? `${documentMeta.name}, Section: "${section}", ${new Date(documentMeta.updated_at).toLocaleDateString()}, Document ID: ${document_id}`
            : `${documentMeta.name}, ${new Date(documentMeta.updated_at).toLocaleDateString()}, Document ID: ${document_id}`;

          return {
            content: [{
              type: 'text',
              text: citationText,
            }],
          };
        } catch (error) {
          this.logger.error(`Citation generation error: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error generating citation: ${error.message}`,
            }],
            isError: true,
          };
        }
      },
    );

    this.logger.log('Document tools registered');
  }
}
