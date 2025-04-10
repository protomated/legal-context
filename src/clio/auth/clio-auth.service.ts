import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthToken } from '../../database/entities/oauth-token.entity';
import { TokenResponse, AuthorizationRequestDto } from '../dto/auth.dto';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class ClioAuthService {
  private readonly logger = new Logger(ClioAuthService.name);
  private stateMap = new Map<string, AuthorizationRequestDto>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(OAuthToken)
    private readonly tokenRepository: Repository<OAuthToken>,
  ) {}

  /**
   * Generate a cryptographically secure random state value for OAuth flow
   */
  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate a code verifier and challenge for PKCE
   */
  private generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return { codeVerifier, codeChallenge };
  }

  /**
   * Generate the authorization URL for the OAuth flow
   */
  async generateAuthorizationUrl(): Promise<{ url: string; state: string }> {
    const clientId = this.configService.get<string>('clio.clientId');
    const redirectUri = this.configService.get<string>('clio.redirectUri');
    const apiUrl = this.configService.get<string>('clio.apiUrl');

    if (!clientId || !redirectUri || !apiUrl) {
      throw new Error('Missing Clio OAuth configuration');
    }

    const authUrl = apiUrl.replace('/api/v4', '/oauth/authorize');
    const state = this.generateState();
    const { codeVerifier, codeChallenge } = this.generatePKCE();

    // Store state and code verifier
    // Create expiration time (10 minutes from now)
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    this.stateMap.set(state, {
      state,
      code_verifier: codeVerifier,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      created_at: createdAt,
      expires_at: expiresAt,
    });

    // Build authorization URL
    const url = new URL(authUrl);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('code_challenge', codeChallenge);
    url.searchParams.append('code_challenge_method', 'S256');
    url.searchParams.append('scope', 'documents');

    return { url: url.toString(), state };
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async exchangeCodeForToken(code: string, state: string): Promise<OAuthToken> {
    // Validate state
    const storedRequest = this.stateMap.get(state);
    if (!storedRequest) {
      throw new UnauthorizedException('Invalid state parameter');
    }

    // Remove the used state
    this.stateMap.delete(state);

    try {
      const clientId = this.configService.get<string>('clio.clientId');
      const clientSecret = this.configService.get<string>('clio.clientSecret');
      const redirectUri = this.configService.get<string>('clio.redirectUri');
      const apiUrl = this.configService.get<string>('clio.apiUrl');

      if (!clientId || !clientSecret || !redirectUri || !apiUrl) {
        throw new Error('Missing Clio OAuth configuration');
      }

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      // Create URLSearchParams to properly encode form data
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', redirectUri);
      params.append('code_verifier', storedRequest.code_verifier);
      
      this.logger.debug(`Token request params: ${params.toString()}`);
      this.logger.debug(`Token URL: ${tokenUrl}`);
      
      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Create and save token
      const token = this.tokenRepository.create({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scope,
      });

      return this.tokenRepository.save(token);
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`, error.stack);
      
      // Add more detailed error information if available
      if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx range
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response headers: ${JSON.stringify(error.response.headers)}`);
        throw new Error(`Failed to authenticate with Clio: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        this.logger.error('No response received from Clio API');
        throw new Error('Failed to authenticate with Clio: No response received');
      } else {
        // Something happened in setting up the request
        throw new Error(`Failed to authenticate with Clio: ${error.message}`);
      }
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async authenticate(code: string): Promise<OAuthToken> {
    this.logger.warn('Using deprecated authenticate method. Please use exchangeCodeForToken instead.');

    const state = this.generateState();
    const { codeVerifier } = this.generatePKCE();

    // Create a temporary request object
    // Create expiration time (10 minutes from now)
    const createdAt = new Date();
    const expiresAt = new Date(createdAt);
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    this.stateMap.set(state, {
      state,
      code_verifier: codeVerifier,
      code_challenge: '',
      code_challenge_method: 'S256',
      created_at: createdAt,
      expires_at: expiresAt,
    });

    return this.exchangeCodeForToken(code, state);
  }

  /**
   * Refresh access token using the refresh token
   */
  async refreshToken(token: OAuthToken): Promise<OAuthToken> {
    try {
      const clientId = this.configService.get<string>('clio.clientId');
      const clientSecret = this.configService.get<string>('clio.clientSecret');
      const apiUrl = this.configService.get<string>('clio.apiUrl');

      if (!clientId || !clientSecret || !apiUrl) {
        throw new Error('Missing Clio OAuth configuration');
      }

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      // Create URLSearchParams for form data
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', token.refreshToken);
      
      this.logger.debug(`Refresh token request params: ${params.toString()}`);
      
      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Update token
      token.accessToken = access_token;
      token.refreshToken = refresh_token;
      token.expiresAt = expiresAt;
      if (scope) token.scope = scope;

      return this.tokenRepository.save(token);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getValidAccessToken(): Promise<string> {
    try {
      // Get the most recent token
      const token = await this.tokenRepository.findOne({
        order: { createdAt: 'DESC' },
      });

      if (!token) {
        throw new Error('No OAuth token found. Authentication required.');
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const now = new Date();
      const expirationThreshold = new Date(now);
      expirationThreshold.setMinutes(now.getMinutes() + 5);

      if (token.expiresAt < expirationThreshold) {
        const refreshedToken = await this.refreshToken(token);
        return refreshedToken.accessToken;
      }

      return token.accessToken;
    } catch (error) {
      this.logger.error(`Failed to get valid access token: ${error.message}`, error.stack);
      throw new Error(`Unable to get valid access token: ${error.message}`);
    }
  }

  /**
   * Revoke the current access token
   */
  async revokeToken(token: OAuthToken): Promise<void> {
    try {
      const clientId = this.configService.get<string>('clio.clientId');
      const clientSecret = this.configService.get<string>('clio.clientSecret');
      const apiUrl = this.configService.get<string>('clio.apiUrl');

      if (!clientId || !clientSecret || !apiUrl) {
        throw new Error('Missing Clio OAuth configuration');
      }

      const revokeUrl = apiUrl.replace('/api/v4', '/oauth/token/revoke');

      // Create URLSearchParams for form data
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('token', token.accessToken);
      
      this.logger.debug(`Revoking token ID: ${token.id}`);
      
      await lastValueFrom(
        this.httpService.post(
          revokeUrl,
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
          },
        )
      );

      // Remove the token from the database
      await this.tokenRepository.remove(token);
      this.logger.log(`Token ID: ${token.id} successfully revoked and removed from database`);
    } catch (error) {
      this.logger.error(`Token revocation failed: ${error.message}`, error.stack);
      throw new Error(`Failed to revoke token: ${error.message}`);
    }
  }
  
  /**
   * Get information about all active tokens
   */
  async getTokenInfo(): Promise<any[]> {
    try {
      const tokens = await this.tokenRepository.find({
        order: { createdAt: 'DESC' },
      });
      
      return tokens.map(token => ({
        id: token.id,
        expiresAt: token.expiresAt,
        isExpired: token.expiresAt < new Date(),
        scope: token.scope || 'unknown',
        createdAt: token.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Failed to get token info: ${error.message}`, error.stack);
      throw new Error(`Unable to get token information: ${error.message}`);
    }
  }
  
  /**
   * Check if we have any valid tokens
   */
  async hasValidToken(): Promise<boolean> {
    try {
      // Just try to get a valid token
      await this.getValidAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}
