// src/clio/dto/document.dto.ts
export interface DocumentListParams {
  fields?: string;
  limit?: number;
  page?: number;
  parent_id?: string; // For folder contents
  updated_since?: string;
  matter_id?: string;
  custom_field_values?: Record<string, any>;
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
  [key: string]: any; // For any additional fields
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

