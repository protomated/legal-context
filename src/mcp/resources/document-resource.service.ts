// src/mcp/resources/document-resource.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerService } from '../mcp-server.service';
import { ClioDocumentService } from '../../clio/api/clio-document.service';
import { TextExtractorService } from '../../document-processing/extractors/text-extractor.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';

@Injectable()
export class DocumentResourceService implements OnModuleInit {
  private readonly logger = new Logger(DocumentResourceService.name);

  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly clioDocumentService: ClioDocumentService,
    private readonly textExtractorService: TextExtractorService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
  }

  async onModuleInit() {
    this.registerResources();
  }

  /**
   * Register document-related MCP resources
   */
  registerResources() {
    const server = this.mcpServerService.getServer();

    // Document list resource
    server.resource(
      'document-list',
      new ResourceTemplate('documents://list/{filter}/{page}', { list: undefined }),
      async (uri, { filter, page }) => {
        this.logger.debug(`Handling document list resource request: ${uri.href}`);

        try {
          const pageNum = parseInt(page || '1', 10);
          const filterParams = filter ? JSON.parse(decodeURIComponent(filter)) : {};

          const documents = await this.clioDocumentService.listDocuments({
            ...filterParams,
            page: pageNum,
            limit: 20,
            fields: 'id,name,content_type,created_at,updated_at,description',
          });

          const documentList = documents.data.map(doc =>
            `Document: ${doc.name} (ID: ${doc.id})
Type: ${doc.content_type}
Created: ${new Date(doc.created_at).toLocaleString()}
Updated: ${new Date(doc.updated_at).toLocaleString()}
${doc.description ? `Description: ${doc.description}` : ''}`,
          ).join('\n\n');

          const metaInfo = `Page ${pageNum} of ${documents.meta.paging.total_pages} (${documents.meta.paging.total_entries} documents total)`;

          return {
            contents: [{
              uri: uri.href,
              text: `# Document List\n\n${documentList}\n\n${metaInfo}`,
            }],
          };
        } catch (error) {
          this.logger.error(`Error handling document list request: ${error.message}`, error.stack);

          return {
            contents: [{
              uri: uri.href,
              text: `Error retrieving document list: ${error.message}`,
            }],
          };
        }
      },
    );

    // Document content resource
    server.resource(
      'document',
      new ResourceTemplate('document://{id}', { list: undefined }),
      async (uri, { id }) => {
        this.logger.debug(`Handling document content resource request: ${uri.href}`);

        try {
          // Check if document exists in local database
          let document = await this.documentRepository.findOne({ where: { clioId: id } });

          if (!document) {
            // Fetch document metadata from Clio
            const documentMeta = await this.clioDocumentService.getDocument(id);

            // Download document content
            const documentContent = await this.clioDocumentService.downloadDocument(id);

            // Extract text
            const text = await this.textExtractorService.extract(documentContent, documentMeta.content_type);

            // Create document entity
            document = this.documentRepository.create({
              clioId: id,
              title: documentMeta.name,
              mimeType: documentMeta.content_type,
              metadata: documentMeta,
            });

            await this.documentRepository.save(document);

            return {
              contents: [{
                uri: uri.href,
                text: `# ${documentMeta.name}\n\n${text}`,
              }],
            };
          } else {
            // Use cached document if available
            // In a real implementation, you would retrieve the processed text from your database
            // For this example, we'll download and process again
            const documentMeta = await this.clioDocumentService.getDocument(id);
            const documentContent = await this.clioDocumentService.downloadDocument(id);
            const text = await this.textExtractorService.extract(documentContent, documentMeta.content_type);

            return {
              contents: [{
                uri: uri.href,
                text: `# ${documentMeta.name}\n\n${text}`,
              }],
            };
          }
        } catch (error) {
          this.logger.error(`Error handling document content request: ${error.message}`, error.stack);

          return {
            contents: [{
              uri: uri.href,
              text: `Error retrieving document content: ${error.message}`,
            }],
          };
        }
      },
    );

    this.logger.log('Document resources registered');
  }
}
