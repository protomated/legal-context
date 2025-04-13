/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: ask@protomated.com
 * Website: protomated.com
 */
/**
 * Clio API Client
 *
 * This module implements a client for interacting with the Clio API V4.
 * It handles authentication, fetching data, and provides methods for
 * working with documents, folders, and other Clio resources.
 */

import { logger } from '../logger';
import { secureTokenStorage } from './tokenStorage';
import { ClioTokens, getClioBaseUrl, isTokenExpired, refreshAccessToken } from './oauthClient';

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
  };
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
        logger.warn('No Clio tokens found. Authentication required.');
        return false;
      }

      // Check if tokens need to be refreshed
      if (isTokenExpired(this.tokens)) {
        logger.info('Access token expired. Attempting to refresh...');

        try {
          this.tokens = await refreshAccessToken(this.tokens.refresh_token);
          await secureTokenStorage.saveTokens(this.tokens);
          logger.info('Token refreshed successfully');
        } catch (error) {
          logger.error('Failed to refresh token. Re-authentication required.');
          return false;
        }
      }

      logger.info('Clio API client initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing Clio API client:', error);
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
    contentType: string = 'application/json',
  ): Promise<T> {
    // Ensure we have valid tokens
    if (!this.tokens) {
      throw new Error('Not authenticated. Initialize the client first.');
    }

    // Check if token needs refreshing
    if (isTokenExpired(this.tokens)) {
      logger.info('Access token expired. Refreshing...');
      this.tokens = await refreshAccessToken(this.tokens.refresh_token);
      await secureTokenStorage.saveTokens(this.tokens);
    }

    // Prepare request headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.tokens.access_token}`,
      'Accept': 'application/json',
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
          logger.warn('Authentication failed. Token might be invalid.');
          throw new Error('Authentication failed');
        }

        // Handle other errors
        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`API request failed: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        // Parse response
        try {
          return await response.json() as T;
        } catch (jsonError) {
          // Check content type to provide better error message
          const contentType = response.headers.get('Content-Type');

          // Get response text for logging
          let responseText;
          try {
            responseText = await response.text();
          } catch (textError) {
            responseText = `[Could not get response text: ${textError}]`;
          }

          logger.error(`Failed to parse response as JSON: ${jsonError}`, responseText);
          logger.debug(`Response content type: ${contentType}`);

          // If content type suggests this is not JSON, provide a more descriptive error
          if (contentType && !contentType.includes('application/json')) {
            throw new Error(`Received non-JSON response with content type: ${contentType}`);
          }

          throw new Error(`Failed to parse response as JSON: ${jsonError}`);
        }
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
    query?: string,
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
      params,
    );
  }

  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<{ data: ClioDocument }> {
    return this.makeRequest<{ data: ClioDocument }>(
      `documents/${id}.json`,
      'GET',
    );
  }

  /**
   * Get document download information
   * Returns a redirect URL to download the document
   */
  async getDocumentDownloadUrl(id: string): Promise<string> {
    try {
      // Ensure we have valid tokens
      if (!this.tokens) {
        throw new Error('Not authenticated. Initialize the client first.');
      }

      // Check if token needs refreshing
      if (isTokenExpired(this.tokens)) {
        logger.info('Access token expired. Refreshing...');
        this.tokens = await refreshAccessToken(this.tokens.refresh_token);
        await secureTokenStorage.saveTokens(this.tokens);
      }

      // Prepare request headers and options
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.tokens.access_token}`,
        'Accept': 'application/json',
      };

      const options: RequestInit = {
        method: 'GET',
        headers,
        redirect: 'manual', // Important: don't automatically follow redirects
      };

      // Make the request directly instead of using makeRequest
      const url = new URL(`/api/v4/documents/${id}/download.json`, this.baseUrl);
      logger.debug(`Getting download URL for document ${id} from ${url.toString()}`);

      const response = await fetch(url.toString(), options);

      // The download endpoint should return a 303 See Other redirect
      if (response.status === 303) {
        const redirectUrl = response.headers.get('Location');
        if (!redirectUrl) {
          throw new Error('No redirect URL found in headers');
        }
        logger.debug(`Got redirect URL for document ${id}: ${redirectUrl.substring(0, 100)}...`);
        return redirectUrl;
      }

      // If we got a 200 OK, the response could be JSON or the actual document content
      if (response.status === 200) {
        // Check content type to determine how to handle the response
        const contentType = response.headers.get('Content-Type');
        logger.debug(`Response content type for document ${id}: ${contentType}`);

        // If content type indicates JSON, try to parse it
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            if (data && data.url) {
              logger.debug(`Got download URL from JSON response: ${data.url.substring(0, 100)}...`);
              return data.url;
            }
            // If we get here, the response was valid JSON but didn't contain a URL
            throw new Error('Response JSON did not contain a download URL');
          } catch (jsonError) {
            logger.warn(`Failed to parse JSON for document ${id}: ${jsonError}`);
            throw new Error(`Failed to parse JSON response: ${jsonError}`);
          }
        } else {
          // If response is not JSON, it might be the document content directly
          // For this case, we need to handle differently - let's throw an error for now
          // and improve the downloadDocument method to handle this case
          throw new Error(`Received non-JSON response with content type: ${contentType}`);
        }
      }

      // Handle other status codes
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }

      logger.error(`Failed to get download URL for document ${id}: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to get download URL: ${response.status} ${response.statusText}`);
    } catch (error) {
      logger.error(`Error getting download URL for document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Download document content
   */
  async downloadDocument(id: string): Promise<Buffer> {
    try {
      logger.debug(`Downloading document ${id}`);

      try {
        // First, try to get the download URL
        const downloadUrl = await this.getDocumentDownloadUrl(id);

        // Then, download the document
        logger.debug(`Fetching document content from ${downloadUrl.substring(0, 100)}...`);

        // The download URL might or might not require authentication
        // Try first without authentication header
        let response = await fetch(downloadUrl);

        // If that fails with 401, try with authentication
        if (response.status === 401 && this.tokens) {
          logger.debug(`Retrying download with authentication`);
          response = await fetch(downloadUrl, {
            headers: {
              'Authorization': `Bearer ${this.tokens.access_token}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
        }

        // Get the binary content
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        logger.debug(`Successfully downloaded document ${id}: ${buffer.length} bytes`);
        return buffer;
      } catch (urlError) {
        // If getting the download URL failed with a content-type error,
        // try a direct download approach
        if (urlError instanceof Error &&
          urlError.message.includes('content type')) {
          logger.debug(`Attempting direct download for document ${id}`);

          // Ensure we have valid tokens
          if (!this.tokens) {
            throw new Error('Not authenticated. Initialize the client first.');
          }

          // Make a direct request to the document endpoint
          const url = new URL(`/api/v4/documents/${id}/download.json`, this.baseUrl);
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.tokens.access_token}`,
              'Accept': '*/*', // Accept any content type
            },
            redirect: 'follow', // Follow redirects automatically
          });

          if (!response.ok) {
            throw new Error(`Failed to download document directly: ${response.status} ${response.statusText}`);
          }

          // Get the binary content
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          logger.debug(`Successfully downloaded document ${id} directly: ${buffer.length} bytes`);
          return buffer;
        } else {
          // If it's another type of error, throw it
          throw urlError;
        }
      }
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
    query?: string,
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
      params,
    );
  }

  /**
   * Get a single folder by ID
   */
  async getFolder(id: string): Promise<{ data: ClioFolder }> {
    return this.makeRequest<{ data: ClioFolder }>(
      `folders/${id}.json`,
      'GET',
    );
  }

  /**
   * Get contents of a folder (documents and subfolders)
   */
  async getFolderContents(
    id: string,
    page: number = 1,
    perPage: number = 100,
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
        per_page: perPage,
      },
    );

    // Get subfolders in the folder
    const folders = await this.makeRequest<PaginatedResponse<ClioFolder>>(
      'folders.json',
      'GET',
      {
        parent_id: id,
        page,
        per_page: perPage,
      },
    );

    return { documents, folders };
  }
}

/**
 * Check if a document should be processed
 * Filters out documents that might not be suitable for text extraction
 */
export function isProcessableDocument(document: ClioDocument): boolean {
  // Debug the document object to understand its structure
  logger.debug(`Checking document ${document.id}: ${JSON.stringify(document, null, 2)}`);

  // Modified check: Allow documents with at least an ID even if name is missing
  if (!document.id) {
    logger.debug(`Skipping document with missing ID`);
    return false;
  }

  // If name is missing, use a placeholder name based on the ID
  if (!document.name) {
    logger.debug(`Document ${document.id} has no name, using ID as name`);
    document.name = `Document ${document.id}`;
  }

  // Skip documents with certain content types that might not be text-extractable
  const skipContentTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff',
    'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg',
    'video/mp4', 'video/mpeg', 'video/quicktime',
  ];

  if (document.content_type && skipContentTypes.some(type => document.content_type?.includes(type))) {
    logger.debug(`Skipping document ${document.name} (${document.id}) - Non-processable content type: ${document.content_type}`);
    return false;
  }

  // Skip documents that are too small (likely not containing much text)
  if (document.size !== undefined && document.size < 100) {
    logger.debug(`Skipping document ${document.name} (${document.id}) - Too small: ${document.size} bytes`);
    return false;
  }

  return true;
}


// Export a singleton instance
export const clioApiClient = new ClioApiClient();
