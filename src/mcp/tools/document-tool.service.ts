import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { z } from 'zod';
import { McpServerService } from '../mcp-server.service';
import { ClioDocumentService } from '../../clio/api/clio-document.service';
import { ClioDocumentMetadataService } from '../../clio/api/clio-document-metadata.service';
import { DocumentProcessorService } from '../../document-processing/document-processor.service';
import { SearchService } from '../../document-processing/search/search.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';
import { ConfigService } from '@nestjs/config';

/**
 * Service that registers and handles document-related MCP tools.
 * Allows Claude to search, process, and cite documents through the MCP protocol.
 */
@Injectable()
export class DocumentToolService implements OnModuleInit {
  private readonly logger = new Logger(DocumentToolService.name);

  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly clioDocumentService: ClioDocumentService,
    private readonly clioDocumentMetadataService: ClioDocumentMetadataService,
    private readonly documentProcessorService: DocumentProcessorService,
    private readonly searchService: SearchService,
    private readonly configService: ConfigService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  /**
   * Register document tools when the module initializes
   */
  async onModuleInit() {
    await this.registerTools();
  }

  /**
   * Register document-related MCP tools
   */
  async registerTools(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register document tools: MCP server not initialized');
      return;
    }

    try {
      // Register document search tool
      this.registerDocumentSearchTool(server);

      // Register document processing tool
      this.registerDocumentProcessingTool(server);

      // Register citation generation tool
      this.registerCitationTool(server);

      // Register semantic search tool
      this.registerSemanticSearchTool(server);

      this.logger.log('Document tools registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register document tools: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Register a tool for searching documents
   * Uses the Clio API directly for keyword-based searches
   */
  private registerDocumentSearchTool(server: any): void {
    server.tool(
      'search-documents',
      {
        query: z.string().describe('The search query text'),
        matter_id: z.string().optional().describe('Optional matter ID to filter by'),
        limit: z.number().min(1).max(50).optional().default(10).describe('Maximum number of results to return'),
      },
      async ({ query, matter_id, limit }) => {
        this.logger.debug(`Document search tool called with query: ${query}, matter_id: ${matter_id}, limit: ${limit}`);

        try {
          // Search documents in Clio
          const result = await this.clioDocumentService.searchDocuments(query, {
            limit,
            fields: 'id,name,content_type,created_at,updated_at,description,matter',
            matter_id,
          });

          // Format the response
          if (result.data.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `No documents found matching the query: "${query}"`
              }]
            };
          }

          // Generate structured results
          const responseText = `Found ${result.data.length} documents matching "${query}":\n\n` +
            result.data.map((doc, index) => {
              let docInfo = `${index + 1}. ${doc.name} (${doc.content_type})\n`;
              docInfo += `   ID: ${doc.id}\n`;

              if (doc.matter) {
                docInfo += `   Matter: ${doc.matter.display_number}: ${doc.matter.description}\n`;
              }

              docInfo += `   Updated: ${new Date(doc.updated_at).toLocaleString()}\n`;

              if (doc.description) {
                docInfo += `   Description: ${doc.description}\n`;
              }

              docInfo += `   URI: document://${doc.id}`;
              return docInfo;
            }).join('\n\n');

          return {
            content: [{
              type: 'text',
              text: responseText
            }]
          };
        } catch (error) {
          this.logger.error(`Error in search-documents tool: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error searching documents: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    this.logger.log('Document search tool registered');
  }

  /**
   * Register a tool for processing documents (fetching and preparing for use)
   * This enables documents to be processed on-demand for improved performance
   */
  private registerDocumentProcessingTool(server: any): void {
    server.tool(
      'process-document',
      {
        document_id: z.string().describe('The Clio document ID to process'),
        force_refresh: z.boolean().optional().default(false).describe('Whether to force reprocessing even if already processed'),
      },
      async ({ document_id, force_refresh }) => {
        this.logger.debug(`Document processing tool called for ID: ${document_id}`);

        try {
          // Check if document already exists and is up to date
          let document = await this.documentRepository.findOne({
            where: { clioId: document_id },
          });

          if (document && !force_refresh) {
            return {
              content: [{
                type: 'text',
                text: `Document "${document.title}" (ID: ${document_id}) is already processed and ready to use. Access it with URI: document://${document_id}`
              }]
            };
          }

          // Process the document
          document = await this.documentProcessorService.processDocument(document_id);

          return {
            content: [{
              type: 'text',
              text: `Successfully processed document "${document.title}" (ID: ${document_id}). The document has been indexed and is ready to use. Access it with URI: document://${document_id}`
            }]
          };
        } catch (error) {
          this.logger.error(`Error in process-document tool: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error processing document: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    this.logger.log('Document processing tool registered');
  }

  /**
   * Register a tool for generating citations
   * Supports multiple citation formats for legal documents
   */
  private registerCitationTool(server: any): void {
    server.tool(
      'generate-citation',
      {
        document_id: z.string().describe('The Clio document ID to cite'),
        format: z.enum(['standard', 'bluebook', 'apa']).optional().default('standard').describe('Citation format to use'),
        section: z.string().optional().describe('Optional section or page to cite specifically'),
      },
      async ({ document_id, format, section }) => {
        this.logger.debug(`Citation generation tool called for document ID: ${document_id}`);

        try {
          // Get document metadata
          const documentMeta = await this.clioDocumentService.getDocument(document_id);

          // Get normalized metadata
          const normalizedMeta = await this.clioDocumentMetadataService.normalizeDocumentMetadata(documentMeta);

          // Format citation based on requested format
          let citation = '';

          switch (format) {
            case 'bluebook':
              citation = this.formatBluebookCitation(normalizedMeta, section);
              break;
            case 'apa':
              citation = this.formatApaCitation(normalizedMeta, section);
              break;
            case 'standard':
            default:
              citation = this.formatStandardCitation(normalizedMeta, section);
              break;
          }

          return {
            content: [{
              type: 'text',
              text: citation
            }]
          };
        } catch (error) {
          this.logger.error(`Error in generate-citation tool: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error generating citation: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    this.logger.log('Citation generation tool registered');
  }

  /**
   * Register a tool for semantic search
   * Uses pgvector-based similarity search on document chunks
   */
  private registerSemanticSearchTool(server: any): void {
    server.tool(
      'semantic-search',
      {
        query: z.string().describe('The search query text'),
        matter_id: z.string().optional().describe('Optional matter ID to filter by'),
        search_type: z.enum(['semantic', 'hybrid', 'text']).optional().default('hybrid').describe('Search type to use'),
        limit: z.number().min(1).max(20).optional().default(5).describe('Maximum number of results to return'),
      },
      async ({ query, matter_id, search_type, limit }) => {
        this.logger.debug(`Semantic search tool called with query: ${query}, type: ${search_type}`);

        try {
          // Set up search options
          const searchOptions = {
            matter_id,
            limit,
            minSimilarity: 0.6, // Minimum similarity threshold
          };

          // Perform the search
          let results;
          switch (search_type) {
            case 'semantic':
              results = await this.searchService.searchSimilar(query, searchOptions);
              break;
            case 'text':
              results = await this.searchService.searchText(query, searchOptions);
              break;
            case 'hybrid':
            default:
              results = await this.searchService.searchHybrid(query, searchOptions);
              break;
          }

          if (results.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `No documents found matching the query: "${query}"`
              }]
            };
          }

          // Format the response
          const responseText = `Found ${results.length} results for "${query}" using ${search_type} search:\n\n` +
            results.map((result, index) => {
              let docInfo = `${index + 1}. ${result.document.title} (Similarity: ${result.similarity.toFixed(2)})\n`;
              docInfo += `   ID: ${result.document.clioId}\n`;

              // Add excerpt from the matching chunk
              const excerpt = result.chunk.content.length > 150
                ? result.chunk.content.substring(0, 150) + '...'
                : result.chunk.content;

              docInfo += `   Excerpt: "${excerpt}"\n`;
              docInfo += `   URI: document://${result.document.clioId}`;

              return docInfo;
            }).join('\n\n');

          return {
            content: [{
              type: 'text',
              text: responseText
            }]
          };
        } catch (error) {
          this.logger.error(`Error in semantic-search tool: ${error.message}`, error.stack);

          return {
            content: [{
              type: 'text',
              text: `Error performing semantic search: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    this.logger.log('Semantic search tool registered');
  }

  /**
   * Format a standard citation
   */
  private formatStandardCitation(metadata: any, section?: string): string {
    const citationParts = [];

    // Document title
    citationParts.push(`"${metadata.name}"`);

    // Matter reference if available
    if (metadata.matter) {
      citationParts.push(`Matter: ${metadata.matter.number} - ${metadata.matter.description}`);
    }

    // Document ID
    citationParts.push(`Document ID: ${metadata.id}`);

    // Section if provided
    if (section) {
      citationParts.push(`Section: "${section}"`);
    }

    // Date
    citationParts.push(`Last updated: ${new Date(metadata.updatedAt).toLocaleDateString()}`);

    return citationParts.join(', ');
  }

  /**
   * Format a Bluebook citation (simplified)
   */
  private formatBluebookCitation(metadata: any, section?: string): string {
    let citation = '';

    // Document title in italics
    citation += `${metadata.name}, `;

    // Matter reference if available
    if (metadata.matter) {
      citation += `${metadata.matter.number}, `;
    }

    // Document type and ID
    citation += `Document ${metadata.id}, `;

    // Author/owner information if available
    if (metadata.metadata?.created_by) {
      citation += `${metadata.metadata.created_by}, `;
    }

    // Date with pincite if section is provided
    if (section) {
      citation += `${new Date(metadata.updatedAt).toLocaleDateString()} at ${section}`;
    } else {
      citation += `${new Date(metadata.updatedAt).toLocaleDateString()}`;
    }

    return citation;
  }

  /**
   * Format an APA citation
   */
  private formatApaCitation(metadata: any, section?: string): string {
    let citation = '';

    // Author/creator if available, otherwise organization
    if (metadata.metadata?.created_by) {
      citation += `${metadata.metadata.created_by}. `;
    }

    // Date in parentheses
    citation += `(${new Date(metadata.updatedAt).getFullYear()}). `;

    // Title
    citation += `${metadata.name}. `;

    // Matter reference if available
    if (metadata.matter) {
      citation += `Matter ${metadata.matter.number}: ${metadata.matter.description}. `;
    }

    // Document ID as source identifier
    citation += `Document ID: ${metadata.id}`;

    // Section if provided
    if (section) {
      citation += `, Section: ${section}`;
    }

    return citation;
  }
}
