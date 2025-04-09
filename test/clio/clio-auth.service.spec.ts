import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { of } from 'rxjs';
import { ClioAuthService } from '../../src/clio/auth/clio-auth.service';
import { OAuthToken } from '../../src/database/entities/oauth-token.entity';
import { TokenResponse } from '../../src/clio/dto/auth.dto';

describe('ClioAuthService', () => {
  let service: ClioAuthService;
  let httpService: HttpService;
  let configService: ConfigService;
  let tokenRepository: Repository<OAuthToken>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'clio.clientId') return 'test-client-id';
      if (key === 'clio.clientSecret') return 'test-client-secret';
      if (key === 'clio.redirectUri') return 'http://localhost:3000/callback';
      if (key === 'clio.apiUrl') return 'https://test.clio.com/api/v4';
      return undefined;
    }),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClioAuthService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(OAuthToken),
          useValue: mockTokenRepository,
        },
      ],
    }).compile();

    service = module.get<ClioAuthService>(ClioAuthService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    tokenRepository = module.get<Repository<OAuthToken>>(getRepositoryToken(OAuthToken));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAuthorizationUrl', () => {
    it('should generate a valid authorization URL', async () => {
      const result = await service.generateAuthorizationUrl();
      
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('state');
      expect(result.url).toContain('https://test.clio.com/oauth/authorize');
      expect(result.url).toContain('response_type=code');
      expect(result.url).toContain('client_id=test-client-id');
      expect(result.url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
      expect(result.url).toContain('state=' + result.state);
      expect(result.url).toContain('code_challenge=');
      expect(result.url).toContain('code_challenge_method=S256');
    });

    it('should throw error when config is missing', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      
      await expect(service.generateAuthorizationUrl()).rejects.toThrow('Missing Clio OAuth configuration');
    });
  });

  describe('exchangeCodeForToken', () => {
    it('should exchange code for token', async () => {
      // Generate a state to store in the service
      const { state } = await service.generateAuthorizationUrl();
      
      // Mock token response
      const mockTokenResponse: TokenResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'documents',
      };
      
      // Mock repository and http responses
      mockHttpService.post.mockReturnValue(of({ data: mockTokenResponse }));
      mockTokenRepository.create.mockReturnValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: expect.any(Date),
        scope: 'documents',
      });
      mockTokenRepository.save.mockResolvedValue({
        id: 'test-id',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: expect.any(Date),
        scope: 'documents',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Call the service method
      const result = await service.exchangeCodeForToken('test-code', state);
      
      // Verify the result
      expect(result).toHaveProperty('id');
      expect(result.accessToken).toBe('test-access-token');
      expect(result.refreshToken).toBe('test-refresh-token');
      expect(result.scope).toBe('documents');
      
      // Verify the HTTP request
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://test.clio.com/oauth/token',
        expect.objectContaining({
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          grant_type: 'authorization_code',
          code: 'test-code',
          redirect_uri: 'http://localhost:3000/callback',
        }),
        expect.any(Object),
      );
      
      // Verify the token was saved
      expect(mockTokenRepository.create).toHaveBeenCalled();
      expect(mockTokenRepository.save).toHaveBeenCalled();
    });
    
    it('should throw error for invalid state', async () => {
      await expect(service.exchangeCodeForToken('test-code', 'invalid-state')).rejects.toThrow('Invalid state parameter');
    });
  });

  describe('refreshToken', () => {
    it('should refresh an expired token', async () => {
      // Mock token to refresh
      const mockToken: OAuthToken = {
        id: 'test-id',
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock token response
      const mockTokenResponse: TokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };
      
      // Mock HTTP response
      mockHttpService.post.mockReturnValue(of({ data: mockTokenResponse }));
      
      // Mock repository save
      mockTokenRepository.save.mockResolvedValue({
        ...mockToken,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: expect.any(Date),
      });
      
      // Call the service method
      const result = await service.refreshToken(mockToken);
      
      // Verify the result
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
      
      // Verify the HTTP request
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://test.clio.com/oauth/token',
        expect.objectContaining({
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          grant_type: 'refresh_token',
          refresh_token: 'old-refresh-token',
        }),
        expect.any(Object),
      );
      
      // Verify the token was saved
      expect(mockTokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('getValidAccessToken', () => {
    it('should return a valid token', async () => {
      // Mock token with future expiration
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      
      const mockToken: OAuthToken = {
        id: 'test-id',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: futureDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock repository findOne
      mockTokenRepository.findOne.mockResolvedValue(mockToken);
      
      // Call the service method
      const result = await service.getValidAccessToken();
      
      // Verify the result
      expect(result).toBe('test-access-token');
      
      // Verify findOne was called
      expect(mockTokenRepository.findOne).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
    
    it('should refresh an expiring token', async () => {
      // Mock token with soon-to-expire expiration
      const soonDate = new Date();
      soonDate.setMinutes(soonDate.getMinutes() + 1); // Expire in 1 minute
      
      const mockToken: OAuthToken = {
        id: 'test-id',
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
        expiresAt: soonDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock token response for refresh
      const mockTokenResponse: TokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'Bearer',
        expires_in: 3600,
      };
      
      // Mock repository and HTTP responses
      mockTokenRepository.findOne.mockResolvedValue(mockToken);
      mockHttpService.post.mockReturnValue(of({ data: mockTokenResponse }));
      mockTokenRepository.save.mockResolvedValue({
        ...mockToken,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: expect.any(Date),
      });
      
      // Call the service method
      const result = await service.getValidAccessToken();
      
      // Verify the result
      expect(result).toBe('new-access-token');
      
      // Verify token was refreshed
      expect(mockHttpService.post).toHaveBeenCalled();
    });
    
    it('should throw error when no token exists', async () => {
      // Mock repository to return no token
      mockTokenRepository.findOne.mockResolvedValue(null);
      
      // Call the service method and expect error
      await expect(service.getValidAccessToken()).rejects.toThrow('No OAuth token found. Authentication required.');
    });
  });

  describe('revokeToken', () => {
    it('should revoke a token', async () => {
      // Mock token to revoke
      const mockToken: OAuthToken = {
        id: 'test-id',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Mock HTTP response
      mockHttpService.post.mockReturnValue(of({ data: {} }));
      
      // Call the service method
      await service.revokeToken(mockToken);
      
      // Verify the HTTP request
      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://test.clio.com/oauth/token/revoke',
        expect.objectContaining({
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          token: 'test-access-token',
        }),
        expect.any(Object),
      );
      
      // Verify the token was removed
      expect(mockTokenRepository.remove).toHaveBeenCalledWith(mockToken);
    });
  });
});
