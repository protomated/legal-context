// src/clio/api/clio-document-batch.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClioDocumentService } from './clio-document.service';
import { DocumentResponse, DocumentApiError, DocumentListParams } from '../dto/document.dto';

/**
 * Service for handling batch operations on documents
 * Provides methods for operating on multiple documents efficiently
 */
@Injectable()
export class ClioDocumentBatchService {
  private readonly logger = new Logger(ClioDocumentBatchService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly documentService: ClioDocumentService,
  ) {}

  /**
   * Batch download multiple documents
   * @returns Map of document IDs to their content buffers
   */
  async batchDownloadDocuments(documentIds: string[]): Promise<Map<string, Buffer>> {
    this.logger.debug(`Batch downloading ${documentIds.length} documents`);
    
    const result = new Map<string, Buffer>();
    const errors: Record<string, string> = {};
    
    // Process documents in batches of 5 to avoid overwhelming the API
    const batchSize = 5;
    
    for (let i = 0; i < documentIds.length; i += batchSize) {
      const batch = documentIds.slice(i, i + batchSize);
      
      // Create download promises for each document in the batch
      const downloadPromises = batch.map(async (id) => {
        try {
          const content = await this.documentService.downloadDocument(id);
          result.set(id, content);
        } catch (error) {
          this.logger.error(`Failed to download document ID ${id}: ${error.message}`);
          errors[id] = error instanceof DocumentApiError 
            ? error.message 
            : `Unknown error: ${error.message}`;
        }
      });
      
      // Wait for all downloads in this batch to complete
      await Promise.all(downloadPromises);
      
      // Check if we need to wait for rate limit
      if (this.documentService.isRateLimitWarning()) {
        this.logger.warn('Rate limit warning detected, adding delay before next batch');
        // Add a 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Log summary
    this.logger.log(
      `Batch download complete: ${result.size} successful, ${Object.keys(errors).length} failed`
    );
    
    if (Object.keys(errors).length > 0) {
      this.logger.debug(`Batch download errors: ${JSON.stringify(errors)}`);
    }
    
    return result;
  }

  /**
   * Move multiple documents to a new folder
   */
  async batchMoveDocuments(documentIds: string[], targetFolderId: string): Promise<DocumentResponse[]> {
    this.logger.debug(`Moving ${documentIds.length} documents to folder ID ${targetFolderId}`);
    
    const results: DocumentResponse[] = [];
    const errors: Record<string, string> = {};
    
    // Process documents in batches of 10
    const batchSize = 10;
    
    for (let i = 0; i < documentIds.length; i += batchSize) {
      const batch = documentIds.slice(i, i + batchSize);
      
      // Create update promises for each document in the batch
      const updatePromises = batch.map(async (id) => {
        try {
          const updatedDoc = await this.documentService.updateDocument(id, {
            parent_id: targetFolderId
          });
          
          results.push(updatedDoc);
        } catch (error) {
          this.logger.error(`Failed to move document ID ${id}: ${error.message}`);
          errors[id] = error instanceof DocumentApiError 
            ? error.message 
            : `Unknown error: ${error.message}`;
        }
      });
      
      // Wait for all updates in this batch to complete
      await Promise.all(updatePromises);
      
      // Check if we need to wait for rate limit
      if (this.documentService.isRateLimitWarning()) {
        this.logger.warn('Rate limit warning detected, adding delay before next batch');
        // Add a 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Log summary
    this.logger.log(
      `Batch move complete: ${results.length} successful, ${Object.keys(errors).length} failed`
    );
    
    if (Object.keys(errors).length > 0) {
      this.logger.debug(`Batch move errors: ${JSON.stringify(errors)}`);
    }
    
    return results;
  }

  /**
   * Batch update document metadata
   */
  async batchUpdateDocuments(
    updates: Array<{ id: string, metadata: Record<string, any> }>
  ): Promise<DocumentResponse[]> {
    this.logger.debug(`Batch updating metadata for ${updates.length} documents`);
    
    const results: DocumentResponse[] = [];
    const errors: Record<string, string> = {};
    
    // Process documents in batches of 10
    const batchSize = 10;
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      // Create update promises for each document in the batch
      const updatePromises = batch.map(async ({ id, metadata }) => {
        try {
          const updatedDoc = await this.documentService.updateDocument(id, metadata);
          results.push(updatedDoc);
        } catch (error) {
          this.logger.error(`Failed to update document ID ${id}: ${error.message}`);
          errors[id] = error instanceof DocumentApiError 
            ? error.message 
            : `Unknown error: ${error.message}`;
        }
      });
      
      // Wait for all updates in this batch to complete
      await Promise.all(updatePromises);
      
      // Check if we need to wait for rate limit
      if (this.documentService.isRateLimitWarning()) {
        this.logger.warn('Rate limit warning detected, adding delay before next batch');
        // Add a 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Log summary
    this.logger.log(
      `Batch update complete: ${results.length} successful, ${Object.keys(errors).length} failed`
    );
    
    if (Object.keys(errors).length > 0) {
      this.logger.debug(`Batch update errors: ${JSON.stringify(errors)}`);
    }
    
    return results;
  }

  /**
   * Fetch document content for multiple documents
   * Returns a map of document ID to { metadata, content }
   */
  async fetchDocumentsWithContent(
    documentIds: string[]
  ): Promise<Map<string, { metadata: DocumentResponse, content: Buffer }>> {
    this.logger.debug(`Fetching metadata and content for ${documentIds.length} documents`);
    
    const result = new Map<string, { metadata: DocumentResponse, content: Buffer }>();
    const errors: Record<string, string> = {};
    
    // Process documents in batches of 5
    const batchSize = 5;
    
    for (let i = 0; i < documentIds.length; i += batchSize) {
      const batch = documentIds.slice(i, i + batchSize);
      
      // Create fetch promises for each document in the batch
      const fetchPromises = batch.map(async (id) => {
        try {
          // Fetch metadata and content in parallel
          const [metadata, content] = await Promise.all([
            this.documentService.getDocument(id),
            this.documentService.downloadDocument(id)
          ]);
          
          result.set(id, { metadata, content });
        } catch (error) {
          this.logger.error(`Failed to fetch document ID ${id}: ${error.message}`);
          errors[id] = error instanceof DocumentApiError 
            ? error.message 
            : `Unknown error: ${error.message}`;
        }
      });
      
      // Wait for all fetches in this batch to complete
      await Promise.all(fetchPromises);
      
      // Check if we need to wait for rate limit
      if (this.documentService.isRateLimitWarning()) {
        this.logger.warn('Rate limit warning detected, adding delay before next batch');
        // Add a 3-second delay
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Log summary
    this.logger.log(
      `Batch fetch complete: ${result.size} successful, ${Object.keys(errors).length} failed`
    );
    
    if (Object.keys(errors).length > 0) {
      this.logger.debug(`Batch fetch errors: ${JSON.stringify(errors)}`);
    }
    
    return result;
  }

  /**
   * Copy documents to a different folder
   * This creates a new document with the same content
   */
  async batchCopyDocuments(
    documentIds: string[], 
    targetFolderId: string
  ): Promise<DocumentResponse[]> {
    this.logger.debug(`Copying ${documentIds.length} documents to folder ID ${targetFolderId}`);
    
    const results: DocumentResponse[] = [];
    const errors: Record<string, string> = {};
    
    // First, download all documents with their metadata
    const documents = await this.fetchDocumentsWithContent(documentIds);
    
    // Process each document
    for (const [id, { metadata, content }] of documents.entries()) {
      try {
        // Create new document with same name and content
        const newDoc = await this.documentService.uploadDocument(
          metadata.name,
          content,
          {
            name: metadata.name,
            parent_id: targetFolderId,
            matter_id: metadata.matter?.id,
            description: metadata.description,
            document_category_id: metadata.document_category?.id
          }
        );
        
        results.push(newDoc);
      } catch (error) {
        this.logger.error(`Failed to copy document ID ${id}: ${error.message}`);
        errors[id] = error instanceof DocumentApiError 
          ? error.message 
          : `Unknown error: ${error.message}`;
      }
      
      // Check if we need to wait for rate limit
      if (this.documentService.isRateLimitWarning()) {
        this.logger.warn('Rate limit warning detected, adding delay before next operation');
        // Add a 3-second delay
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Log summary
    this.logger.log(
      `Batch copy complete: ${results.length} successful, ${Object.keys(errors).length} failed`
    );
    
    if (Object.keys(errors).length > 0) {
      this.logger.debug(`Batch copy errors: ${JSON.stringify(errors)}`);
    }
    
    return results;
  }

  /**
   * Batch delete multiple documents
   */
  async batchDeleteDocuments(documentIds: string[]): Promise<string[]> {
    this.logger.debug(`Deleting ${documentIds.length} documents`);
    
    const successfulDeletes: string[] = [];
    const errors: Record<string, string> = {};
    
    // Process documents in batches of 10
    const batchSize = 10;
    
    for (let i = 0; i < documentIds.length; i += batchSize) {
      const batch = documentIds.slice(i, i + batchSize);
      
      // Create delete promises for each document in the batch
      const deletePromises = batch.map(async (id) => {
        try {
          await this.documentService.deleteDocument(id);
          successfulDeletes.push(id);
        } catch (error) {
          this.logger.error(`Failed to delete document ID ${id}: ${error.message}`);
          errors[id] = error instanceof DocumentApiError 
            ? error.message 
            : `Unknown error: ${error.message}`;
        }
      });
      
      // Wait for all deletes in this batch to complete
      await Promise.all(deletePromises);
      
      // Check if we need to wait for rate limit
      if (this.documentService.isRateLimitWarning()) {
        this.logger.warn('Rate limit warning detected, adding delay before next batch');
        // Add a 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Log summary
    this.logger.log(
      `Batch delete complete: ${successfulDeletes.length} successful, ${Object.keys(errors).length} failed`
    );
    
    if (Object.keys(errors).length > 0) {
      this.logger.debug(`Batch delete errors: ${JSON.stringify(errors)}`);
    }
    
    return successfulDeletes;
  }

  /**
   * Process a large list of documents in batches with a specified operation
   */
  async processBatch<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    batchSize: number = 10,
    delayMs: number = 2000
  ): Promise<{ results: R[], errors: Record<number, string> }> {
    const results: R[] = [];
    const errors: Record<number, string> = {};
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      // Create operation promises for each item in the batch
      const operationPromises = batch.map(async (item, index) => {
        try {
          const result = await operation(item);
          return { success: true, result };
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : String(error),
            index: i + index
          };
        }
      });
      
      // Wait for all operations in this batch to complete
      const batchResults = await Promise.all(operationPromises);
      
      // Process batch results
      for (const result of batchResults) {
        if (result.success) {
          results.push(result.result);
        } else {
          errors[result.index] = result.error;
        }
      }
      
      // Check if we need to wait for rate limit
      if (i + batchSize < items.length) {
        if (this.documentService.isRateLimitWarning()) {
          this.logger.warn('Rate limit warning detected, adding extended delay before next batch');
          await new Promise(resolve => setTimeout(resolve, delayMs * 2));
        } else {
          // Standard delay between batches
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    return { results, errors };
  }
}
