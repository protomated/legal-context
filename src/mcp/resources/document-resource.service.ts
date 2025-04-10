import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServerService } from '../mcp-server.service';
import { ClioDocumentService } from '../../clio/api/clio-document.service';
import { ClioDocumentMetadataService } from '../../clio/api/clio-document-metadata.service';
import { DocumentAccessControlService } from '../../clio/access/document-access-control.service';
import { DocumentAccessDeniedError } from '../../clio/dto/document.dto';
import { TextExtractorService } from '../../document-processing/extractors/text-extractor.service';
import { DocumentProcessorService } from '../../document-processing/document-processor.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';
import { DocumentChunk } from '../../database/entities/document-chunk.entity';

/**
 * Service that registers and handles document-related MCP resources.
 * Allows Claude to access firm documents securely through the MCP protocol.
 */
@Injectable()
export class DocumentResourceService implements OnModuleInit {
  private readonly logger = new Logger(DocumentResourceService.name);

  constructor(
    private readonly mcpServerService: McpServerService,
    private readonly clioDocumentService: ClioDocumentService,
    private readonly clioDocumentMetadataService: ClioDocumentMetadataService, 
    private readonly textExtractorService: TextExtractorService,
    private readonly documentProcessorService: DocumentProcessorService,
    private readonly accessControlService: DocumentAccessControlService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private readonly chunkRepository: Repository<DocumentChunk>,
  ) {}

  /**
   * Register document resources when the module initializes
   */
  async onModuleInit() {
    await this.registerResources();
  }

  /**
   * Register document-related MCP resources
   */
  async registerResources(): Promise<void> {
    const server = this.mcpServerService.getServer();
    if (!server) {
      this.logger.error('Cannot register document resources: MCP server not initialized');
      return;
    }

    try {
      // Register document list resource
      this.registerDocumentListResource(server);
      
      // Register document content resource
      this.registerDocumentContentResource(server);
      
      // Register document search resource
      this.registerDocumentSearchResource(server);
      
      // Register matter document list resource
      this.registerMatterDocumentsResource(server);
      
      this.logger.log('Document resources registered successfully');
    } catch (error) {
      this.logger.error(`Failed to register document resources: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Register a resource for listing available documents
   */
  private registerDocumentListResource(server: any): void {
    server.resource(
      'document-list',
      new ResourceTemplate("documents://list/{filter}/{page}", { list: undefined }),
      async (uri: any, params: any) => {
        const { filter, page } = params;
        const pageNum = page ? parseInt(page, 10) : 1;
        
        this.logger.debug(`Handling document list resource request with filter: ${filter}, page: ${pageNum}`);
        
        try {
          // Parse filter if provided
          const filterParams: any = {};
          if (filter && filter !== 'all') {
            try {
              // Decode the filter parameter (it might be URL-encoded JSON)
              const decodedFilter = decodeURIComponent(filter);
              Object.assign(filterParams, JSON.parse(decodedFilter));
            } catch (e) {
              this.logger.warn(`Failed to parse filter parameter: ${e.message}`);
            }
          }
          
          // Get documents list from Clio
          let result = await this.clioDocumentService.listDocuments({
            ...filterParams,
            page: pageNum,
            limit: 20,
            fields: 'id,name,content_type,created_at,updated_at,description,matter',
          });
          
          // Apply access controls to filter documents by permission
          result.data = await this.accessControlService.filterDocumentsByAccess(result.data);
          
          // Format the response
          let content = `# Available Documents (Page ${pageNum})\n\n`;
          
          if (result.data.length === 0) {
            content += 'No documents found matching your criteria.';
          } else {
            // Group documents by matter if possible
            const documentsByMatter: Record<string, any[]> = {};
            
            result.data.forEach(doc => {
              const matterKey = doc.matter ? 
                `${doc.matter.display_number}: ${doc.matter.description}` : 
                'Unassigned';
                
              if (!documentsByMatter[matterKey]) {
                documentsByMatter[matterKey] = [];
              }
              
              documentsByMatter[matterKey].push(doc);
            });
            
            // Format documents by matter
            for (const [matter, docs] of Object.entries(documentsByMatter)) {
              content += `## ${matter}\n\n`;
              
              docs.forEach(doc => {
                content += `### ${doc.name}\n`;
                content += `- **ID**: ${doc.id}\n`;
                content += `- **Type**: ${doc.content_type}\n`;
                content += `- **Created**: ${new Date(doc.created_at).toLocaleString()}\n`;
                content += `- **Updated**: ${new Date(doc.updated_at).toLocaleString()}\n`;
                
                if (doc.description) {
                  content += `- **Description**: ${doc.description}\n`;
                }
                
                // Add a reference to access the full document
                content += `- **URI**: document://${doc.id}\n\n`;
              });
            }
            
            // Add pagination info
            content += `\n---\n\nShowing ${result.data.length} of ${result.meta.paging.total_entries} documents`;
            content += ` (Page ${pageNum} of ${result.meta.paging.total_pages})`;
            
            if (pageNum < result.meta.paging.total_pages) {
              content += `\n\nNext page: documents://list/${filter || 'all'}/${pageNum + 1}`;
            }
            
            if (pageNum > 1) {
              content += `\n\nPrevious page: documents://list/${filter || 'all'}/${pageNum - 1}`;
            }
          }
          
          return {
            contents: [{
              uri: uri.href,
              text: content
            }]
          };
        } catch (error) {
          this.logger.error(`Error handling document list request: ${error.message}`, error.stack);
          
          return {
            contents: [{
              uri: uri.href,
              text: `Error retrieving document list: ${error.message}`
            }]
          };
        }
      }
    );
    
    this.logger.log('Document list resource registered');
  }
  
  /**
   * Register a resource for accessing document content
   */
  private registerDocumentContentResource(server: any): void {
    server.resource(
      'document',
      new ResourceTemplate("document://{id}", { list: undefined }),
      async (uri: any, params: any) => {
        const { id } = params;
        
        this.logger.debug(`Handling document content resource request for ID: ${id}`);
        
        try {
        // Check access permission first
          await this.accessControlService.checkDocumentAccess(id);
          
          // Process and prepare the document
          const document = await this.documentProcessorService.processDocument(id);
          
          // Get all chunks for this document
          const chunks = await this.chunkRepository.find({
            where: { document: { id: document.id } },
            order: { startIndex: 'ASC' }
          });
          
          if (!chunks || chunks.length === 0) {
            throw new Error('Document content not available');
          }
          
          // Combine all chunks into a single text
          const documentContent = chunks.map(chunk => chunk.content).join('\n\n');
          
          // Format the response
          const content = `# ${document.title}\n\n${documentContent}`;
          
          return {
            contents: [{
              uri: uri.href,
              text: content
            }]
          };
        } catch (error) {
          this.logger.error(`Error handling document content request: ${error.message}`, error.stack);
          
          return {
            contents: [{
              uri: uri.href,
              text: `Error retrieving document content: ${error.message}`
            }]
          };
        }
      }
    );
    
    this.logger.log('Document content resource registered');
  }
  
  /**
   * Register a resource for searching documents
   */
  private registerDocumentSearchResource(server: any): void {
    server.resource(
      'document-search',
      new ResourceTemplate("documents://search/{query}/{page}", { list: undefined }),
      async (uri: any, params: any) => {
        const { query, page } = params;
        const pageNum = page ? parseInt(page, 10) : 1;
        
        this.logger.debug(`Handling document search resource request for query: ${query}, page: ${pageNum}`);
        
        try {
          // Search documents in Clio
          let result = await this.clioDocumentService.searchDocuments(
            decodeURIComponent(query),
            {
              page: pageNum,
              limit: 20,
              fields: 'id,name,content_type,created_at,updated_at,description,matter',
            }
          );
          
          // Apply access controls to filter search results
          result.data = await this.accessControlService.filterDocumentsByAccess(result.data);
          
          // Format the response
          let content = `# Search Results for "${decodeURIComponent(query)}"\n\n`;
          
          if (result.data.length === 0) {
            content += 'No documents found matching your search.';
          } else {
            result.data.forEach(doc => {
              content += `## ${doc.name}\n`;
              content += `- **ID**: ${doc.id}\n`;
              content += `- **Type**: ${doc.content_type}\n`;
              
              if (doc.matter) {
                content += `- **Matter**: ${doc.matter.display_number}: ${doc.matter.description}\n`;
              }
              
              content += `- **Created**: ${new Date(doc.created_at).toLocaleString()}\n`;
              content += `- **Updated**: ${new Date(doc.updated_at).toLocaleString()}\n`;
              
              if (doc.description) {
                content += `- **Description**: ${doc.description}\n`;
              }
              
              // Add a reference to access the full document
              content += `- **URI**: document://${doc.id}\n\n`;
            });
            
            // Add pagination info
            content += `\n---\n\nShowing ${result.data.length} of ${result.meta.paging.total_entries} documents`;
            content += ` (Page ${pageNum} of ${result.meta.paging.total_pages})`;
            
            if (pageNum < result.meta.paging.total_pages) {
              content += `\n\nNext page: documents://search/${query}/${pageNum + 1}`;
            }
            
            if (pageNum > 1) {
              content += `\n\nPrevious page: documents://search/${query}/${pageNum - 1}`;
            }
          }
          
          return {
            contents: [{
              uri: uri.href,
              text: content
            }]
          };
        } catch (error) {
          this.logger.error(`Error handling document search request: ${error.message}`, error.stack);
          
          return {
            contents: [{
              uri: uri.href,
              text: `Error searching documents: ${error.message}`
            }]
          };
        }
      }
    );
    
    this.logger.log('Document search resource registered');
  }
  
  /**
   * Register a resource for listing documents by matter
   */
  private registerMatterDocumentsResource(server: any): void {
    server.resource(
      'matter-documents',
      new ResourceTemplate("matter://{matter_id}/documents/{page}", { list: undefined }),
      async (uri: any, params: any) => {
        const { matter_id, page } = params;
        const pageNum = page ? parseInt(page, 10) : 1;
        
        this.logger.debug(`Handling matter documents resource request for matter ID: ${matter_id}, page: ${pageNum}`);
        
        try {
          // Get matter documents from metadata service
          let documents = await this.clioDocumentMetadataService.getDocumentsByMatter(matter_id, {
            limit: 20,
            page: pageNum,
            sort: 'updated_at',
            order: 'desc'
          });
          
          // Apply access controls to filter documents
          documents = await this.accessControlService.filterDocumentsByAccess(documents);
          
          if (documents.length === 0) {
            return {
              contents: [{
                uri: uri.href,
                text: `# No Documents Found\n\nNo documents found for matter ID: ${matter_id}`
              }]
            };
          }
          
          // Format the response
          let content = `# Documents for Matter\n\n`;
          
          // Get the matter name from the first document
          if (documents[0].matter) {
            content = `# Documents for Matter: ${documents[0].matter.display_number} - ${documents[0].matter.description}\n\n`;
          }
          
          // Group documents by content type for better organization
          const docsByType: Record<string, any[]> = {};
          
          documents.forEach(doc => {
            // Simplify content type for grouping
            let type = doc.content_type;
            if (type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml')) {
              type = 'Word Document';
            } else if (type === 'application/pdf') {
              type = 'PDF Document';
            } else if (type === 'text/plain') {
              type = 'Text Document';
            } else if (type === 'application/rtf') {
              type = 'Rich Text Document';
            } else {
              type = 'Other Document';
            }
            
            if (!docsByType[type]) {
              docsByType[type] = [];
            }
            
            docsByType[type].push(doc);
          });
          
          // Format documents by type
          for (const [type, docs] of Object.entries(docsByType)) {
            content += `## ${type} (${docs.length})\n\n`;
            
            docs.forEach(doc => {
              content += `### ${doc.name}\n`;
              content += `- **ID**: ${doc.id}\n`;
              content += `- **Updated**: ${new Date(doc.updated_at).toLocaleString()}\n`;
              
              if (doc.description) {
                content += `- **Description**: ${doc.description}\n`;
              }
              
              // Add a reference to access the full document
              content += `- **URI**: document://${doc.id}\n\n`;
            });
          }
          
          return {
            contents: [{
              uri: uri.href,
              text: content
            }]
          };
        } catch (error) {
          this.logger.error(`Error handling matter documents request: ${error.message}`, error.stack);
          
          return {
            contents: [{
              uri: uri.href,
              text: `Error retrieving matter documents: ${error.message}`
            }]
          };
        }
      }
    );
    
    this.logger.log('Matter documents resource registered');
  }
}
