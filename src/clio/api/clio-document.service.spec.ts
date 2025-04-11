// src/clio/api/clio-document.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ClioDocumentService } from './clio-document.service';
import { ClioAuthService } from '../auth/clio-auth.service';
import {
  DocumentListResponse,
  DocumentResponse,
  DocumentApiError,
  DocumentNotFoundError,
} from '../dto/document.dto';

// Mock ClioAuthService
const mockClioAuthService = {
  getValidAccessToken: jest.fn().mockResolvedValue('mock-access-token'),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'clio.apiUrl') {
      return 'https://app.clio.com/api/v4';
    }
    return null;
  }),
};

describe('ClioDocumentService', () => {
  let service: ClioDocumentService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule,
      ],
      providers: [
        ClioDocumentService,
        { provide: ClioAuthService, useValue: mockClioAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ClioDocumentService>(ClioDocumentService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listDocuments', () => {
    it('should return a list of documents', async () => {
      // Mock response data
      const mockResponse: DocumentListResponse = {
        data: [
          {
            id: 'doc1',
            etag: 'etag1',
            name: 'Document 1',
            content_type: 'application/pdf',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z',
          },
          {
            id: 'doc2',
            etag: 'etag2',
            name: 'Document 2',
            content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            created_at: '2023-01-03T00:00:00Z',
            updated_at: '2023-01-04T00:00:00Z',
          },
        ],
        meta: {
          paging: {
            limit: 2,
            page: 1,
            total_pages: 1,
            total_entries: 2,
          },
        },
      };

      // Mock HttpService.get to return the mock response
      jest.spyOn(httpService, 'get').mockReturnValueOnce(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'https://app.clio.com/api/v4/documents' },
        } as AxiosResponse)
      );

      // Call the service method
      const result = await service.listDocuments({ limit: 2 });

      // Assertions
      expect(httpService.get).toHaveBeenCalledWith(
        'https://app.clio.com/api/v4/documents',
        {
          headers: { Authorization: 'Bearer mock-access-token' },
          params: {
            fields: 'id,etag,name,content_type,created_at,updated_at,parent',
            limit: 2,
            page: 1,
          },
        }
      );
      expect(result).toEqual(mockResponse);
      expect(result.data.length).toBe(2);
    });

    it('should handle API errors correctly', async () => {
      // Mock HttpService.get to throw an error
      jest.spyOn(httpService, 'get').mockReturnValueOnce(
        throwError(() => ({
          response: {
            status: 404,
            data: { error: 'Not found' },
          },
        }))
      );

      // Call the service method and expect it to throw
      await expect(service.listDocuments()).rejects.toThrow(DocumentApiError);
    });
  });

  describe('getDocument', () => {
    it('should return a document', async () => {
      // Mock response data
      const mockResponse = {
        data: {
          id: 'doc1',
          etag: 'etag1',
          name: 'Document 1',
          content_type: 'application/pdf',
          description: 'Test document',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
        } as DocumentResponse,
      };

      // Mock HttpService.get to return the mock response
      jest.spyOn(httpService, 'get').mockReturnValueOnce(
        of({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'https://app.clio.com/api/v4/documents/doc1' },
        } as AxiosResponse)
      );

      // Call the service method
      const result = await service.getDocument('doc1');

      // Assertions
      expect(httpService.get).toHaveBeenCalledWith(
        'https://app.clio.com/api/v4/documents/doc1',
        {
          headers: { Authorization: 'Bearer mock-access-token' },
          params: {
            fields: 'id,etag,name,content_type,created_at,updated_at,parent,description,size,document_category,matter,shared_with',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
      expect(result.name).toBe('Document 1');
    });

    it('should throw DocumentNotFoundError when document is not found', async () => {
      // Mock HttpService.get to throw a 404 error
      jest.spyOn(httpService, 'get').mockReturnValueOnce(
        throwError(() => ({
          response: {
            status: 404,
            data: { error: 'Document not found' },
          },
        }))
      );

      // Call the service method and expect it to throw
      await expect(service.getDocument('nonexistent')).rejects.toThrow(DocumentNotFoundError);
    });
  });

  describe('downloadDocument', () => {
    it('should download document content', async () => {
      // Mock response data (binary content)
      const mockContent = Buffer.from('Mock document content');

      // Mock HttpService.get to return the mock content
      jest.spyOn(httpService, 'get').mockReturnValueOnce(
        of({
          data: mockContent,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'https://app.clio.com/api/v4/documents/doc1/download' },
        } as AxiosResponse)
      );

      // Call the service method
      const result = await service.downloadDocument('doc1');

      // Assertions
      expect(httpService.get).toHaveBeenCalledWith(
        'https://app.clio.com/api/v4/documents/doc1/download',
        {
          headers: { Authorization: 'Bearer mock-access-token' },
          params: {},
          responseType: 'arraybuffer',
        }
      );
      expect(result).toBeInstanceOf(Buffer);
      expect(result.toString()).toBe('Mock document content');
    });
  });

  // Additional tests would be implemented for other methods
  // These are just examples to get started
});
