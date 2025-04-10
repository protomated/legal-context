// src/clio/api/clio-document.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClioAuthService } from '../auth/clio-auth.service';
import { 
  DocumentListParams, 
  DocumentListResponse, 
  DocumentResponse,
  DocumentVersionResponse,
  DocumentApiError,
  DocumentNotFoundError,
  DocumentAccessDeniedError,
  DocumentApiRateLimitError,
  CreateDocumentParams,
  UpdateDocumentParams,
  DocumentDownloadParams
} from '../dto/document.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClioDocumentService {
  private readonly logger = new Logger(ClioDocumentService.name);
  private rateLimitRemaining: number = 1000; // Default arbitrary high value
  private rateLimitReset: number = 0;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: ClioAuthService,
  ) {}

  /**
   * Process and update rate limit information from response headers
   */
  private processRateLimitHeaders(headers: any): void {
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitRemaining = parseInt(headers['x-ratelimit-remaining'], 10);
    }

    if (headers['x-ratelimit-reset']) {
      this.rateLimitReset = parseInt(headers['x-ratelimit-reset'], 10);
    }

    // Log rate limit info if it's getting low
    if (this.rateLimitRemaining < 50) {
      this.logger.warn(`Clio API rate limit is getting low: ${this.rateLimitRemaining} requests remaining`);
    }
  }

  /**
   * Check and handle rate limiting before making API requests
   */
  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitRemaining <= 0) {
      const now = Math.floor(Date.now() / 1000);
      if (this.rateLimitReset > now) {
        const waitTime = this.rateLimitReset - now;
        this.logger.warn(`Rate limit exceeded, reset in ${waitTime} seconds`);
        throw new DocumentApiRateLimitError(`Reset in ${waitTime} seconds`, waitTime);
      }
    }
  }

  /**
   * Handle errors from Clio API responses
   */
  private handleApiError(error: any, context: string): never {
    // Log the error
    this.logger.error(`${context}: ${error.message}`, error.stack);

    // Process API error response if available
    if (error.response) {
      // Process rate limit headers if available
      if (error.response.headers) {
        this.processRateLimitHeaders(error.response.headers);
      }

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          throw new DocumentApiError('Authentication failed or token expired', 401, error.response.data);
        case 403:
          throw new DocumentAccessDeniedError(context.includes('ID') ? context.split('ID ')[1] : 'unknown');
        case 404:
          throw new DocumentNotFoundError(context.includes('ID') ? context.split('ID ')[1] : 'unknown');
        case 429:
          // Rate limit exceeded
          const retryAfter = error.response.headers['retry-after'] 
            ? parseInt(error.response.headers['retry-after'], 10) 
            : 60;
          throw new DocumentApiRateLimitError(`${error.response.data?.message || 'Too many requests'}`, retryAfter);
        default:
          throw new DocumentApiError(
            `API Error (${error.response.status}): ${error.response.data?.message || error.message}`,
            error.response.status,
            error.response.data
          );
      }
    } else if (error.request) {
      // No response received
      throw new DocumentApiError('No response received from Clio API', 0);
    } else {
      // Error in setting up the request
      throw new DocumentApiError(`Request error: ${error.message}`, 0);
    }
  }

  /**
   * Make an authenticated GET request to Clio API
   */
  private async apiGet<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Get access token
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');
      
      const response = await lastValueFrom(
        this.httpService.get<T>(`${apiUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
        })
      );

      // Process rate limit headers
      if (response.headers) {
        this.processRateLimitHeaders(response.headers);
      }

      return response.data;
    } catch (error) {
      return this.handleApiError(error, `GET ${endpoint}`);
    }
  }

  /**
   * Make an authenticated POST request to Clio API
   */
  private async apiPost<T>(endpoint: string, data: any, params: Record<string, any> = {}): Promise<T> {
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Get access token
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');
      
      const response = await lastValueFrom(
        this.httpService.post<T>(`${apiUrl}${endpoint}`, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params,
        })
      );

      // Process rate limit headers
      if (response.headers) {
        this.processRateLimitHeaders(response.headers);
      }

      return response.data;
    } catch (error) {
      return this.handleApiError(error, `POST ${endpoint}`);
    }
  }

  /**
   * Make an authenticated PUT request to Clio API
   */
  private async apiPut<T>(endpoint: string, data: any, params: Record<string, any> = {}): Promise<T> {
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Get access token
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');
      
      const response = await lastValueFrom(
        this.httpService.put<T>(`${apiUrl}${endpoint}`, data, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params,
        })
      );

      // Process rate limit headers
      if (response.headers) {
        this.processRateLimitHeaders(response.headers);
      }

      return response.data;
    } catch (error) {
      return this.handleApiError(error, `PUT ${endpoint}`);
    }
  }

  /**
   * Make an authenticated DELETE request to Clio API
   */
  private async apiDelete<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Get access token
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');
      
      const response = await lastValueFrom(
        this.httpService.delete<T>(`${apiUrl}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params,
        })
      );

      // Process rate limit headers
      if (response.headers) {
        this.processRateLimitHeaders(response.headers);
      }

      return response.data;
    } catch (error) {
      return this.handleApiError(error, `DELETE ${endpoint}`);
    }
  }

  /**
   * List documents with optional filtering
   */
  async listDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
    this.logger.debug(`Listing documents with params: ${JSON.stringify(params)}`);
    
    // Prepare parameters
    const queryParams = {
      fields: params.fields || 'id,etag,name,content_type,created_at,updated_at,parent',
      limit: params.limit || 100,
      page: params.page || 1,
    };

    // Add optional parameters
    if (params.sort) queryParams['sort'] = params.sort;
    if (params.order) queryParams['order'] = params.order;
    if (params.matter_id) queryParams['matter_id'] = params.matter_id;
    if (params.updated_since) queryParams['updated_since'] = params.updated_since;
    if (params.created_since) queryParams['created_since'] = params.created_since;
    if (params.query) queryParams['query'] = params.query;
    if (params.document_category_id) queryParams['document_category_id'] = params.document_category_id;
    
    // Add custom field values if present
    if (params.custom_field_values) {
      Object.entries(params.custom_field_values).forEach(([key, value]) => {
        queryParams[`custom_field_values[${key}]`] = value;
      });
    }

    return this.apiGet<DocumentListResponse>('/documents', queryParams);
  }

  /**
   * Process a paginated request, fetching all pages and combining results
   */
  async getAllPaginatedDocuments(params: DocumentListParams = {}): Promise<DocumentResponse[]> {
    this.logger.debug(`Fetching all paginated documents with params: ${JSON.stringify(params)}`);
    
    const allDocuments: DocumentResponse[] = [];
    let currentPage = params.page || 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await this.listDocuments({
        ...params,
        page: currentPage,
      });

      // Add documents to result array
      allDocuments.push(...response.data);

      // Check if there are more pages
      hasMorePages = currentPage < response.meta.paging.total_pages;
      currentPage++;

      // Safety check to prevent infinite loops
      if (currentPage > 100) {
        this.logger.warn('Reached maximum page limit of 100 when fetching all documents');
        break;
      }
    }

    return allDocuments;
  }

  /**
   * List contents of a folder
   */
  async listFolderContents(folderId: string, params: DocumentListParams = {}): Promise<DocumentListResponse> {
    this.logger.debug(`Listing contents of folder ID ${folderId}`);
    
    // Prepare parameters
    const queryParams = {
      fields: params.fields || 'id,etag,name,content_type,created_at,updated_at,parent',
      parent_id: folderId,
      limit: params.limit || 100,
      page: params.page || 1,
    };

    // Add optional parameters (same as listDocuments)
    if (params.sort) queryParams['sort'] = params.sort;
    if (params.order) queryParams['order'] = params.order;
    if (params.matter_id) queryParams['matter_id'] = params.matter_id;
    if (params.updated_since) queryParams['updated_since'] = params.updated_since;
    if (params.created_since) queryParams['created_since'] = params.created_since;
    if (params.query) queryParams['query'] = params.query;
    if (params.document_category_id) queryParams['document_category_id'] = params.document_category_id;

    return this.apiGet<DocumentListResponse>('/folders/list', queryParams);
  }

  /**
   * Get document metadata
   */
  async getDocument(documentId: string, fields?: string): Promise<DocumentResponse> {
    this.logger.debug(`Getting metadata for document ID ${documentId}`);
    
    const response = await this.apiGet<{ data: DocumentResponse }>(`/documents/${documentId}`, {
      fields: fields || 'id,etag,name,content_type,created_at,updated_at,parent,description,size,document_category,matter,shared_with',
    });

    return response.data;
  }

  /**
   * Download document content
   */
  async downloadDocument(documentId: string, params: DocumentDownloadParams = {}): Promise<Buffer> {
    this.logger.debug(`Downloading content for document ID ${documentId}`);
    
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Get access token
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');
      
      // Build URL and params
      let url = `${apiUrl}/documents/${documentId}/download`;
      
      // Add version ID if specified
      const queryParams: Record<string, any> = {};
      if (params.version_id) {
        queryParams.version_id = params.version_id;
      }
      if (params.include_metadata) {
        queryParams.include_metadata = 'true';
      }
      
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: queryParams,
          responseType: 'arraybuffer',
        })
      );

      // Process rate limit headers
      if (response.headers) {
        this.processRateLimitHeaders(response.headers);
      }

      return Buffer.from(response.data);
    } catch (error) {
      return this.handleApiError(error, `Download document ID ${documentId}`);
    }
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(documentId: string): Promise<DocumentVersionResponse[]> {
    this.logger.debug(`Getting versions for document ID ${documentId}`);
    
    const response = await this.apiGet<{ data: DocumentVersionResponse[] }>(`/documents/${documentId}/versions`);
    return response.data;
  }

  /**
   * Upload a new document
   */
  async uploadDocument(
    fileName: string, 
    fileContent: Buffer, 
    params: CreateDocumentParams
  ): Promise<DocumentResponse> {
    this.logger.debug(`Uploading new document: ${fileName}`);
    
    try {
      // Check rate limit before making request
      await this.checkRateLimit();

      // Get access token
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');
      
      // Create form data
      const FormData = require('form-data');
      const form = new FormData();
      
      // Add file content
      form.append('file', fileContent, {
        filename: fileName,
        contentType: 'application/octet-stream',
      });
      
      // Add document params as JSON
      form.append('data', JSON.stringify({
        name: params.name,
        parent_id: params.parent_id,
        matter_id: params.matter_id,
        description: params.description,
        document_category_id: params.document_category_id,
        original_content_location: params.original_content_location,
      }));
      
      const response = await lastValueFrom(
        this.httpService.post<{ data: DocumentResponse }>(
          `${apiUrl}/documents`, 
          form,
          {
            headers: {
              ...form.getHeaders(),
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
      );

      // Process rate limit headers
      if (response.headers) {
        this.processRateLimitHeaders(response.headers);
      }

      return response.data.data;
    } catch (error) {
      return this.handleApiError(error, `Upload document ${fileName}`);
    }
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    documentId: string, 
    params: UpdateDocumentParams
  ): Promise<DocumentResponse> {
    this.logger.debug(`Updating metadata for document ID ${documentId}`);
    
    const response = await this.apiPut<{ data: DocumentResponse }>(
      `/documents/${documentId}`,
      { data: params }
    );

    return response.data;
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    this.logger.debug(`Deleting document ID ${documentId}`);
    
    await this.apiDelete(`/documents/${documentId}`);
  }

  /**
   * Create a new document folder
   */
  async createFolder(
    name: string, 
    parentId?: string, 
    matterId?: string
  ): Promise<DocumentResponse> {
    this.logger.debug(`Creating new folder: ${name}`);
    
    const data = {
      data: {
        name,
        parent_id: parentId,
        matter_id: matterId,
        type: 'Folder',
      }
    };
    
    const response = await this.apiPost<{ data: DocumentResponse }>(
      '/documents',
      data
    );

    return response.data;
  }

  /**
   * Search for documents
   */
  async searchDocuments(
    query: string, 
    params: DocumentListParams = {}
  ): Promise<DocumentListResponse> {
    this.logger.debug(`Searching for documents with query: "${query}"`);
    
    return this.listDocuments({
      ...params,
      query,
    });
  }

  /**
   * Check if the API rate limit is close to being exceeded
   */
  isRateLimitWarning(): boolean {
    return this.rateLimitRemaining < 20;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitInfo(): { remaining: number, resetTimestamp: number } {
    return {
      remaining: this.rateLimitRemaining,
      resetTimestamp: this.rateLimitReset
    };
  }
}
