// src/setup.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as readline from 'readline';
import * as open from 'open';
import { AppModule } from './app.module';
import { ClioAuthService } from './clio/auth/clio-auth.service';

/**
 * Setup script to handle initial OAuth flow and environment configuration
 */
async function setup() {
  const logger = new Logger('Setup');

  logger.log('Starting LegalContext Connect setup');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Get configuration service
  const configService = app.get(ConfigService);

  // Get Clio auth service
  const clioAuthService = app.get(ClioAuthService);

  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Prompt for confirmation
  rl.question('This will start the OAuth flow to authorize LegalContext Connect with your Clio account. Continue? (y/n) ', async (answer) => {
    if (answer.toLowerCase() !== 'y') {
      logger.log('Setup cancelled');
      rl.close();
      await app.close();
      return;
    }

    // Get OAuth configuration
    const clientId = configService.get('clio.clientId');
    const redirectUri = configService.get('clio.redirectUri');

    // Generate authorization URL
    const authUrl = `${configService.get('clio.apiUrl').replace('/api/v4', '')}/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;

    logger.log('Opening browser for OAuth authorization...');
    logger.log(`If the browser doesn't open automatically, please visit: ${authUrl}`);

    // Open browser for authorization
    await open(authUrl);

    // Prompt for authorization code
    rl.question('After authorizing, please enter the authorization code: ', async (code) => {
      try {
        // Exchange authorization code for tokens
        const token = await clioAuthService.authenticate(code);

        logger.log('OAuth authorization successful');
        logger.log(`Access token will expire at: ${token.expiresAt.toLocaleString()}`);

        rl.close();
        await app.close();

        logger.log('Setup complete. You can now start LegalContext Connect.');
      } catch (error) {
        logger.error(`OAuth authorization failed: ${error.message}`);
        rl.close();
        await app.close();
      }
    });
  });
}

setup();
