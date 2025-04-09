import { Controller, Get, Query, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { ClioAuthService } from './clio-auth.service';

@Controller('clio/auth')
export class ClioAuthController {
  private readonly logger = new Logger(ClioAuthController.name);

  constructor(private readonly clioAuthService: ClioAuthService) {}

  @Get('login')
  async login(@Res() res: Response) {
    try {
      const { url } = await this.clioAuthService.generateAuthorizationUrl();
      return res.redirect(url);
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      return res.status(500).send(`Authentication error: ${error.message}`);
    }
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      if (!code || !state) {
        return res.status(400).send('Missing code or state parameter');
      }

      await this.clioAuthService.exchangeCodeForToken(code, state);

      // Success response - in a real application, you might redirect to a success page
      return res.status(200).send('Authentication successful! You can close this window.');
    } catch (error) {
      this.logger.error(`Callback error: ${error.message}`, error.stack);
      return res.status(500).send(`Authentication error: ${error.message}`);
    }
  }

  @Get('status')
  async status() {
    try {
      const token = await this.clioAuthService.getValidAccessToken();
      return { authenticated: !!token, status: token ? 'Valid token' : 'No token' };
    } catch (error) {
      return { authenticated: false, error: error.message };
    }
  }
}
