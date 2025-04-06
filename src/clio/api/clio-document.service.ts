// src/clio/api/clio-document.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClioAuthService } from '../auth/clio-auth.service';
import { DocumentListParams, DocumentListResponse, DocumentResponse } from '../dto/document.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClioDocumentService {
  private readonly logger = new Logger(ClioDocumentService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: ClioAuthService,
  ) {}

  /**
   * List documents with optional filtering
   */
  async listDocuments(params: DocumentListParams = {}): Promise<DocumentListResponse> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get<DocumentListResponse>(`${apiUrl}/documents`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: params.fields || 'id,etag,name,content_type,created_at,updated_at,parent',
            limit: params.limit || 100,
            page: params.page || 1,
            ...params,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to list documents: ${error.message}`, error.stack);
      throw new Error(`Unable to list documents: ${error.message}`);
    }
  }

  /**
   * List contents of a folder
   */
  async listFolderContents(folderId: string, params: DocumentListParams = {}): Promise<DocumentListResponse> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get<DocumentListResponse>(`${apiUrl}/folders/list`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: params.fields || 'id,etag,name,content_type,created_at,updated_at,parent',
            parent_id: folderId,
            limit: params.limit || 100,
            page: params.page || 1,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to list folder contents: ${error.message}`, error.stack);
      throw new Error(`Unable to list folder contents: ${error.message}`);
    }
  }

  /**
   * Get document metadata
   */
  async getDocument(documentId: string, fields?: string): Promise<DocumentResponse> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get<{ data: DocumentResponse }>(`${apiUrl}/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            fields: fields || 'id,etag,name,content_type,created_at,updated_at,parent,description',
          },
        })
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get document: ${error.message}`, error.stack);
      throw new Error(`Unable to get document: ${error.message}`);
    }
  }

  /**
   * Download document content
   */
  async downloadDocument(documentId: string): Promise<Buffer> {
    try {
      const accessToken = await this.authService.getValidAccessToken();
      const apiUrl = this.configService.get('clio.apiUrl');

      const response = await lastValueFrom(
        this.httpService.get(`${apiUrl}/documents/${documentId}/download`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'arraybuffer',
        })
      );

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Failed to download document: ${error.message}`, error.stack);
      throw new Error(`Unable to download document: ${error.message}`);
    }
  }
}
