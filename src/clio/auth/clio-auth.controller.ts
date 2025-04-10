import { Controller, Get, Query, Res, Logger, Post, Body, UnauthorizedException, HttpStatus, HttpCode } from '@nestjs/common';
import type { Response } from 'express';
import { ClioAuthService } from './clio-auth.service';

/**
 * Controller for handling Clio OAuth 2.0 authentication flow
 * Provides endpoints for login, callback, and auth status
 */
@Controller('clio/auth')
export class ClioAuthController {
  private readonly logger = new Logger(ClioAuthController.name);

  constructor(private readonly clioAuthService: ClioAuthService) {}

  /**
   * Initiate the OAuth flow by redirecting to Clio's authorization page
   */
  @Get('login')
  async login(@Res() res: Response) {
    try {
      this.logger.log('Initiating Clio OAuth login flow');
      const { url } = await this.clioAuthService.generateAuthorizationUrl();
      
      this.logger.debug(`Redirecting to Clio authorization URL`);
      return res.redirect(url);
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: `Authentication error: ${error.message}`
      });
    }
  }

  /**
   * Handle the OAuth callback from Clio
   * Exchanges the authorization code for access and refresh tokens
   */
  @Get('callback')
  async callback(
    @Query('code') code: string, 
    @Query('state') state: string, 
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response
  ) {
    try {
      // Check for OAuth error response
      if (error) {
        this.logger.error(`OAuth error: ${error} - ${errorDescription}`);
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          error,
          error_description: errorDescription
        });
      }
      
      // Validate required parameters
      if (!code || !state) {
        this.logger.warn('Missing code or state parameter in callback');
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'error',
          message: 'Missing code or state parameter'
        });
      }

      this.logger.log(`Received OAuth callback with state: ${state}`);
      await this.clioAuthService.exchangeCodeForToken(code, state);

      // Return a success page with instructions for the user
      return res.status(HttpStatus.OK).send(`
        <html>
          <head>
            <title>LegalContext - Authentication Successful</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .success { color: green; }
              .card { border: 1px solid #ccc; border-radius: 5px; padding: 20px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>LegalContext</h1>
            <div class="card">
              <h2 class="success">Authentication Successful!</h2>
              <p>You have successfully authenticated with Clio.</p>
              <p>You can now close this window and return to LegalContext.</p>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      this.logger.error(`Callback error: ${error.message}`, error.stack);
      
      // Return an error page
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(`
        <html>
          <head>
            <title>LegalContext - Authentication Error</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
              .error { color: red; }
              .card { border: 1px solid #ccc; border-radius: 5px; padding: 20px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>LegalContext</h1>
            <div class="card">
              <h2 class="error">Authentication Error</h2>
              <p>An error occurred during authentication:</p>
              <p><strong>${error.message}</strong></p>
              <p>Please close this window and try again.</p>
            </div>
          </body>
        </html>
      `);
    }
  }

  /**
   * Check the current authentication status
   */
  @Get('status')
  async status() {
    try {
      const hasToken = await this.clioAuthService.hasValidToken();
      if (hasToken) {
        const token = await this.clioAuthService.getValidAccessToken();
        return { 
          authenticated: true, 
          status: 'Valid token',
          token_preview: token.substring(0, 5) + '...' + token.substring(token.length - 5)
        };
      } else {
        return { authenticated: false, status: 'No valid token' };
      }
    } catch (error) {
      return { authenticated: false, error: error.message };
    }
  }

  /**
   * Get detailed information about all tokens
   */
  @Get('tokens')
  async tokens() {
    try {
      const tokens = await this.clioAuthService.getTokenInfo();
      return { 
        tokens,
        count: tokens.length
      };
    } catch (error) {
      this.logger.error(`Error getting token info: ${error.message}`, error.stack);
      return { error: error.message };
    }
  }

  /**
   * Revoke the current access token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { token_id?: string }) {
    try {
      const tokens = await this.clioAuthService.getTokenInfo();
      
      if (tokens.length === 0) {
        return { status: 'success', message: 'No tokens to revoke' };
      }
      
      // Find the token to revoke
      let tokenToRevoke;
      if (body.token_id) {
        // Find the specific token
        const repository = this.clioAuthService['tokenRepository'];
        tokenToRevoke = await repository.findOne({ where: { id: body.token_id }});
        
        if (!tokenToRevoke) {
          throw new Error(`Token with ID ${body.token_id} not found`);
        }
      } else {
        // Find the most recent token
        const repository = this.clioAuthService['tokenRepository'];
        tokenToRevoke = await repository.findOne({
          order: { createdAt: 'DESC' },
        });
        
        if (!tokenToRevoke) {
          throw new Error('No tokens found to revoke');
        }
      }
      
      // Revoke the token
      await this.clioAuthService.revokeToken(tokenToRevoke);
      
      return { 
        status: 'success', 
        message: `Token ID: ${tokenToRevoke.id} successfully revoked` 
      };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`, error.stack);
      return { 
        status: 'error',
        message: error.message
      };
    }
  }
}
