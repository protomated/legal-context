/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Clio API Client
 * 
 * This module implements a client for interacting with the Clio API V4.
 * It handles authentication, fetching data, and provides methods for 
 * working with documents, folders, and other Clio resources.
 */

import { logger } from "../logger";
import { secureTokenStorage } from "./tokenStorage";
import { ClioTokens, getClioBaseUrl, isTokenExpired, refreshAccessToken } from "./oauthClient";

// API rate limit constants
const MAX_RATE_LIMIT_RETRIES = 3;
const RATE_LIMIT_RETRY_DELAY = 2000; // 2 seconds

// Clio API response interfaces
export interface ClioDocument {
  id: string;
  uuid: string;
  name: string;
  content_type?: string;
  date?: string;
  category?: string;
  size?: number;
  parent_folder?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

export interface ClioFolder {
  id: string;
  name: string;
  parent_folder?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    paging: {
      page: number;
      per_page: number;
      total_entries: number;
      total_pages: number;
    }
  }
}

/**
 * Clio API Client class
 */
export class ClioApiClient {
  private tokens: ClioTokens | null = null;
  private baseUrl: string;
  
  constructor() {
    try {
      this.baseUrl = getClioBaseUrl();
    } catch (error) {
      // Default to US region if Clio config validation fails
      this.baseUrl = 'https://app.clio.com';
      logger.warn('Using default Clio API base URL due to missing configuration');
    }
  }
  
  /**
   * Initialize the client by loading tokens
   */
  async initialize(): Promise<boolean> {
    try {
      // Try to load existing tokens
      this.tokens = await secureTokenStorage.loadTokens();
      
      if (!this.tokens) {
        logger.warn("No Clio tokens found. Authentication required.");
        return false;
      }
      
      // Check if tokens need to be refreshed
      if (isTokenExpired(this.tokens)) {
        logger.info("Access token expired. Attempting to refresh...");
        
        try {
          this.tokens = await refreshAccessToken(this.tokens.refresh_token);
          await secureTokenStorage.saveTokens(this.tokens);
          logger.info("Token refreshed successfully");
        } catch (error) {
          logger.error("Failed to refresh token. Re-authentication required.");
          return false;
        }
      }
      
      logger.info("Clio API client initialized successfully");
      return true;
    } catch (error) {
      logger.error("Error initializing Clio API client:", error);
      return false;
    }
  }
  
  /**
   * Make an authenticated request to the Clio API
   */
  private async makeRequest<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any,
    contentType: string = 'application/json'
  ): Promise<T> {
    // Ensure we have valid tokens
    if (!this.tokens) {
      throw new Error("Not authenticated. Initialize the client first.");
    }
    
    // Check if token needs refreshing
    if (isTokenExpired(this.tokens)) {
      logger.info("Access token expired. Refreshing...");
      this.tokens = await refreshAccessToken(this.tokens.refresh_token);
      await secureTokenStorage.saveTokens(this.tokens);
    }
    
    // Prepare request headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.tokens.access_token}`,
      'Accept': 'application/json'
    };
    
    // Add content-type header for non-GET requests with body
    if (method !== 'GET' && data) {
      headers['Content-Type'] = contentType;
    }
    
    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
      redirect: 'follow',
    };
    
    // Add body for non-GET requests with data
    if (method !== 'GET' && data) {
      if (contentType === 'application/json') {
        options.body = JSON.stringify(data);
      } else if (contentType === 'application/x-www-form-urlencoded') {
        options.body = data instanceof URLSearchParams ? data.toString() : new URLSearchParams(data).toString();
      } else {
        options.body = data;
      }
    }
    
    // Make the request with rate limit handling
    let retries = 0;
    while (true) {
      try {
        const url = new URL(`/api/v4/${endpoint}`, this.baseUrl);
        
        // For GET requests, add query parameters
        if (method === 'GET' && data) {
          Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
              url.searchParams.append(key, String(value));
            }
          });
        }
        
        const response = await fetch(url.toString(), options);
        
        // Handle rate limiting
        if (response.status === 429) {
          if (retries < MAX_RATE_LIMIT_RETRIES) {
            retries++;
            const retryAfter = response.headers.get('Retry-After') || String(RATE_LIMIT_RETRY_DELAY / 1000);
            const delay = parseInt(retryAfter, 10) * 1000 || RATE_LIMIT_RETRY_DELAY;
            
            logger.warn(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error(`Rate limit exceeded after ${MAX_RATE_LIMIT_RETRIES} retries`);
          }
        }
        
        // Handle authentication errors
        if (response.status === 401) {
          logger.warn("Authentication failed. Token might be invalid.");
          throw new Error("Authentication failed");
        }
        
        // Handle other errors
        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`API request failed: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        // Parse response
        return await response.json() as T;
      } catch (error) {
        logger.error(`Error making request to ${endpoint}:`, error);
        throw error;
      }
    }
  }
  
  /**
   * Get a list of documents with pagination
   */
  async listDocuments(
    page: number = 1, 
    perPage: number = 100,
    query?: string
  ): Promise<PaginatedResponse<ClioDocument>> {
    const params: Record<string, any> = { 
      page, 
      per_page: perPage,
    };
    
    // Add optional query parameter
    if (query) {
      params.query = query;
    }
    
    return this.makeRequest<PaginatedResponse<ClioDocument>>(
      'documents.json',
      'GET',
      params
    );
  }
  
  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<{ data: ClioDocument }> {
    return this.makeRequest<{ data: ClioDocument }>(
      `documents/${id}.json`,
      'GET'
    );
  }
  
  /**
   * Get document download information
   * Returns a redirect URL to download the document
   */
  async getDocumentDownloadUrl(id: string): Promise<string> {
    const response = await this.makeRequest<{ url: string }>(
      `documents/${id}/download.json`,
      'GET'
    );
    
    return response.url;
  }
  
  /**
   * Download document content
   */
  async downloadDocument(id: string): Promise<Buffer> {
    try {
      // First, get the download URL
      const downloadUrl = await this.getDocumentDownloadUrl(id);
      
      // Then, download the document
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${this.tokens!.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
      }
      
      // Get the binary content
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      logger.error(`Error downloading document ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a list of folders with pagination
   */
  async listFolders(
    page: number = 1, 
    perPage: number = 100,
    query?: string
  ): Promise<PaginatedResponse<ClioFolder>> {
    const params: Record<string, any> = { 
      page, 
      per_page: perPage,
    };
    
    // Add optional query parameter
    if (query) {
      params.query = query;
    }
    
    return this.makeRequest<PaginatedResponse<ClioFolder>>(
      'folders.json',
      'GET',
      params
    );
  }
  
  /**
   * Get a single folder by ID
   */
  async getFolder(id: string): Promise<{ data: ClioFolder }> {
    return this.makeRequest<{ data: ClioFolder }>(
      `folders/${id}.json`,
      'GET'
    );
  }
  
  /**
   * Get contents of a folder (documents and subfolders)
   */
  async getFolderContents(
    id: string,
    page: number = 1, 
    perPage: number = 100
  ): Promise<{
    documents: PaginatedResponse<ClioDocument>,
    folders: PaginatedResponse<ClioFolder>
  }> {
    // Get documents in the folder
    const documents = await this.makeRequest<PaginatedResponse<ClioDocument>>(
      'documents.json',
      'GET',
      {
        folder_id: id,
        page,
        per_page: perPage
      }
    );
    
    // Get subfolders in the folder
    const folders = await this.makeRequest<PaginatedResponse<ClioFolder>>(
      'folders.json',
      'GET',
      {
        parent_id: id,
        page,
        per_page: perPage
      }
    );
    
    return { documents, folders };
  }
}

// Export a singleton instance
export const clioApiClient = new ClioApiClient();
