import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthToken } from '../../database/entities/oauth-token.entity';
import { TokenResponse } from '../dto/auth.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClioAuthService {
  private readonly logger = new Logger(ClioAuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(OAuthToken)
    private readonly tokenRepository: Repository<OAuthToken>,
  ) {}

  /**
   * Exchange authorization code for access and refresh tokens
   */
  async authenticate(code: string): Promise<OAuthToken> {
    try {
      const clientId = this.configService.get('clio.clientId');
      const clientSecret = this.configService.get('clio.clientSecret');
      const redirectUri = this.configService.get('clio.redirectUri');
      const apiUrl = this.configService.get('clio.apiUrl');

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Create and save token
      const token = this.tokenRepository.create({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
      });

      return this.tokenRepository.save(token);
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`, error.stack);
      throw new Error(`Failed to authenticate with Clio: ${error.message}`);
    }
  }

  /**
   * Refresh access token using the refresh token
   */
  async refreshToken(token: OAuthToken): Promise<OAuthToken> {
    try {
      const clientId = this.configService.get('clio.clientId');
      const clientSecret = this.configService.get('clio.clientSecret');
      const apiUrl = this.configService.get('clio.apiUrl');

      const tokenUrl = apiUrl.replace('/api/v4', '/oauth/token');

      const response = await lastValueFrom(
        this.httpService.post<TokenResponse>(
          tokenUrl,
          {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
      );

      const { access_token, refresh_token, expires_in } = response.data;

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Update token
      token.accessToken = access_token;
      token.refreshToken = refresh_token;
      token.expiresAt = expiresAt;

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
}
