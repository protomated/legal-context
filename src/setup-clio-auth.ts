// src/setup-clio-auth.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as readline from 'readline';
import * as open from 'open';
import { AppModule } from './app.module';
import { ClioAuthService } from './clio/auth/clio-auth.service';

/**
 * Setup script to handle initial OAuth flow for Clio
 */
async function setupClioAuth() {
  const logger = new Logger('Clio Auth Setup');

  logger.log('Starting Clio OAuth setup');

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
  rl.question('This will start the OAuth flow to authorize LegalContext with your Clio account. Continue? (y/n) ', async (answer) => {
    if (answer.toLowerCase() !== 'y') {
      logger.log('Setup cancelled');
      rl.close();
      await app.close();
      return;
    }

    try {
      // Generate authorization URL
      const { url, state } = await clioAuthService.generateAuthorizationUrl();

      logger.log('Please open the following URL in your browser for OAuth authorization:');
      logger.log(url);

      // Attempt to open the URL automatically
      try {
        await open(url);
        logger.log('Browser opened automatically with the authorization URL');
      } catch (error) {
        logger.warn('Could not open browser automatically. Please copy and paste the URL in your browser.');
      }

      // Prompt for authorization code
      rl.question('After authorizing, please enter the authorization code: ', async (code) => {
        try {
          // Exchange authorization code for tokens
          const token = await clioAuthService.exchangeCodeForToken(code, state);

          logger.log('OAuth authorization successful');
          logger.log(`Access token will expire at: ${token.expiresAt.toLocaleString()}`);

          rl.close();
          await app.close();

          logger.log('Setup complete. You can now start LegalContext.');
        } catch (error) {
          logger.error(`OAuth authorization failed: ${error.message}`);
          rl.close();
          await app.close();
        }
      });
    } catch (error) {
      logger.error(`Error generating authorization URL: ${error.message}`);
      rl.close();
      await app.close();
    }
  });
}

setupClioAuth().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
