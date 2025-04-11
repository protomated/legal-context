// src/clio/dto/document.dto.ts
export interface DocumentListParams {
  fields?: string;
  limit?: number;
  page?: number;
  parent_id?: string; // For folder contents
  updated_since?: string;
  matter_id?: string;
  custom_field_values?: Record<string, any>;
  // New parameters
  sort?: string; // Field to sort by, e.g., 'updated_at'
  order?: 'asc' | 'desc'; // Sort order
  created_since?: string; // ISO date string
  query?: string; // Search query
  document_category_id?: string; // Filter by document category
}

export interface DocumentResponse {
  id: string;
  etag: string;
  name: string;
  content_type: string;
  description?: string;
  parent?: {
    id: string;
    type: string;
  };
  created_at: string;
  updated_at: string;
  size?: number; // Document size in bytes
  document_category?: {
    id: string;
    name: string;
  };
  matter?: {
    id: string;
    display_number: string;
    description: string;
  };
  shared_with?: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  versions?: Array<DocumentVersionResponse>;
  [key: string]: any; // For any additional fields
}

export interface DocumentVersionResponse {
  id: string;
  document_id: string;
  version_number: number;
  created_at: string;
  created_by: {
    id: string;
    name: string;
  };
  size: number;
}

export interface DocumentListResponse {
  data: DocumentResponse[];
  meta: {
    paging: {
      limit: number;
      page: number;
      total_pages: number;
      total_entries: number;
    };
  };
}

// Custom error types
export class DocumentApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorResponse?: any
  ) {
    super(message);
    this.name = 'DocumentApiError';
  }
}

export class DocumentNotFoundError extends DocumentApiError {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found`, 404);
    this.name = 'DocumentNotFoundError';
  }
}

export class DocumentAccessDeniedError extends DocumentApiError {
  constructor(documentId: string) {
    super(`Access denied to document with ID ${documentId}`, 403);
    this.name = 'DocumentAccessDeniedError';
  }
}

export class DocumentApiRateLimitError extends DocumentApiError {
  constructor(
    message: string, 
    public retryAfter?: number
  ) {
    super(`API rate limit exceeded: ${message}`, 429);
    this.name = 'DocumentApiRateLimitError';
  }
}

// Request and response types for document operations
export interface CreateDocumentParams {
  name: string;
  parent_id?: string;
  matter_id?: string;
  description?: string;
  document_category_id?: string;
  original_content_location?: string;
}

export interface UpdateDocumentParams {
  name?: string;
  parent_id?: string;
  matter_id?: string;
  description?: string;
  document_category_id?: string;
}

// Types for document download preferences
export interface DocumentDownloadParams {
  version_id?: string; // Download specific version
  include_metadata?: boolean; // Include document metadata in response
}
