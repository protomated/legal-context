import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClioDocumentService } from '../api/clio-document.service';
import { ClioAuthService } from '../auth/clio-auth.service';
import { DocumentResponse, DocumentAccessDeniedError } from '../dto/document.dto';

/**
 * Service for handling document access control
 * Enforces Clio's permissions to ensure document access remains secure
 */
@Injectable()
export class DocumentAccessControlService {
  private readonly logger = new Logger(DocumentAccessControlService.name);
  private accessCache = new Map<string, { 
    granted: boolean; 
    timestamp: number; 
    documentInfo?: Partial<DocumentResponse>
  }>();
  private readonly cacheTTL: number; // Cache time-to-live in milliseconds

  constructor(
    private readonly configService: ConfigService,
    private readonly clioDocumentService: ClioDocumentService,
    private readonly clioAuthService: ClioAuthService,
  ) {
    // Default cache TTL to 5 minutes, configurable through environment
    this.cacheTTL = this.configService.get('clio.accessCacheTtl', 5 * 60 * 1000);
    this.logger.log(`Document access cache TTL set to ${this.cacheTTL}ms`);
  }

  /**
   * Check if the current user has access to a document
   * @param documentId The Clio document ID to check
   * @returns True if access is allowed, throws DocumentAccessDeniedError otherwise
   */
  async checkDocumentAccess(documentId: string): Promise<boolean> {
    // Check cache first
    const cachedAccess = this.getCachedAccess(documentId);
    if (cachedAccess !== undefined) {
      this.logger.debug(`Using cached access result for document ${documentId}: ${cachedAccess.granted}`);
      
      // If access was denied in cache, throw the appropriate error
      if (!cachedAccess.granted) {
        this.logAccessDenied(documentId);
        throw new DocumentAccessDeniedError(documentId);
      }
      
      return true;
    }

    try {
      // Verify authentication is valid
      const hasValidToken = await this.clioAuthService.hasValidToken();
      if (!hasValidToken) {
        this.logger.warn('No valid authentication token available');
        this.cacheAccessResult(documentId, false);
        this.logAccessDenied(documentId, 'No valid authentication token');
        throw new DocumentAccessDeniedError(documentId);
      }

      // Try to get the document which will throw DocumentAccessDeniedError if permission is denied
      const documentInfo = await this.clioDocumentService.getDocument(documentId);
      
      // Access is granted if we got here
      this.cacheAccessResult(documentId, true, documentInfo);
      this.logAccessGranted(documentId, documentInfo);
      
      return true;
    } catch (error) {
      if (error instanceof DocumentAccessDeniedError) {
        // Cache the access denied result
        this.cacheAccessResult(documentId, false);
        this.logAccessDenied(documentId);
        throw error;
      }
      
      // For other errors, don't cache the result and rethrow
      this.logger.error(`Error checking document access for ${documentId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check batch document access for multiple documents
   * @param documentIds Array of document IDs to check
   * @returns Map of document IDs to access results
   */
  async checkBatchDocumentAccess(documentIds: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    this.logger.debug(`Checking batch access for ${documentIds.length} documents`);

    // Process documents in parallel for better performance
    const accessPromises = documentIds.map(async (id) => {
      try {
        const hasAccess = await this.checkDocumentAccess(id);
        return { id, hasAccess };
      } catch (error) {
        if (error instanceof DocumentAccessDeniedError) {
          return { id, hasAccess: false };
        }
        this.logger.error(`Error in batch access check for document ${id}: ${error.message}`);
        return { id, hasAccess: false, error };
      }
    });

    const accessResults = await Promise.all(accessPromises);
    
    // Compile results into a map
    accessResults.forEach(({ id, hasAccess }) => {
      results.set(id, hasAccess);
    });

    return results;
  }

  /**
   * Filter a list of documents by access permissions
   * @param documents List of documents to filter
   * @returns Array containing only the documents the user has access to
   */
  async filterDocumentsByAccess(documents: DocumentResponse[]): Promise<DocumentResponse[]> {
    if (!documents || documents.length === 0) {
      return [];
    }

    this.logger.debug(`Filtering ${documents.length} documents by access permissions`);
    
    // Extract document IDs
    const documentIds = documents.map(doc => doc.id);
    
    // Check access for all documents
    const accessResults = await this.checkBatchDocumentAccess(documentIds);
    
    // Filter the documents based on access results
    const filteredDocuments = documents.filter(doc => accessResults.get(doc.id) === true);
    
    this.logger.log(`Access filter removed ${documents.length - filteredDocuments.length} of ${documents.length} documents`);
    
    return filteredDocuments;
  }

  /**
   * Create a request context for logging
   */
  private getRequestContext(): { userId: string; timestamp: string } {
    return {
      userId: 'system', // In a real implementation, this would be the authenticated user
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log when access is granted
   */
  private logAccessGranted(documentId: string, documentInfo?: Partial<DocumentResponse>): void {
    const context = this.getRequestContext();
    
    this.logger.log(
      `ACCESS GRANTED: User ${context.userId} accessed document ${documentId} at ${context.timestamp}`
    );
    
    // In a production environment, you would want to store these logs in a database
    // for audit purposes, especially for sensitive legal documents
  }

  /**
   * Log when access is denied
   */
  private logAccessDenied(documentId: string, reason?: string): void {
    const context = this.getRequestContext();
    
    this.logger.warn(
      `ACCESS DENIED: User ${context.userId} attempted to access document ${documentId} at ${context.timestamp}${reason ? ` - Reason: ${reason}` : ''}`
    );
    
    // In a production environment, you would want to store these access denial events
    // in a database and potentially trigger alerts for suspicious activity
  }

  /**
   * Check the cache for a document access result
   */
  private getCachedAccess(documentId: string): { granted: boolean; documentInfo?: any } | undefined {
    const cachedResult = this.accessCache.get(documentId);
    
    if (!cachedResult) {
      return undefined;
    }
    
    // Check if cache entry has expired
    const now = Date.now();
    if (now - cachedResult.timestamp > this.cacheTTL) {
      // Remove expired cache entry
      this.accessCache.delete(documentId);
      return undefined;
    }
    
    // Return the cached result without the timestamp
    const { timestamp, ...result } = cachedResult;
    return result;
  }

  /**
   * Cache the result of an access check
   */
  private cacheAccessResult(documentId: string, granted: boolean, documentInfo?: Partial<DocumentResponse>): void {
    this.accessCache.set(documentId, {
      granted,
      timestamp: Date.now(),
      documentInfo
    });
  }

  /**
   * Clear the access cache for a specific document or all documents
   */
  clearAccessCache(documentId?: string): void {
    if (documentId) {
      this.accessCache.delete(documentId);
      this.logger.debug(`Cleared access cache for document ${documentId}`);
    } else {
      this.accessCache.clear();
      this.logger.debug('Cleared all document access cache entries');
    }
  }
}
