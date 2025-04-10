#!/usr/bin/env bun
/**
 * Clio OAuth Authentication Test Script
 *
 * This script initializes the NestJS application and tests the Clio OAuth flow
 * by generating an authorization URL and displaying it to the user.
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as readline from 'readline';
import open from 'open';
import { AppModule } from '../app.module';
import { ClioAuthService } from '../clio/auth/clio-auth.service';

const logger = new Logger('TestClioAuth');

/**
 * Main function to test the Clio OAuth authentication flow
 */
async function testClioAuth() {
  logger.log('Starting Clio OAuth authentication test');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  try {
    // Get Clio auth service
    const clioAuthService = app.get(ClioAuthService);

    // Create readline interface for user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Prompt for confirmation
    rl.question('This will test the Clio OAuth flow. Continue? (y/n) ', async (answer) => {
      if (answer.toLowerCase() !== 'y') {
        logger.log('Test cancelled');
        rl.close();
        await app.close();
        return;
      }

      try {
        // Check if we already have a valid token
        const hasToken = await clioAuthService.hasValidToken();

        if (hasToken) {
          logger.log('Already have a valid token');

          const info = await clioAuthService.getTokenInfo();
          logger.log(`Token info: ${JSON.stringify(info, null, 2)}`);

          rl.question('Do you want to generate a new token anyway? (y/n) ', async (genAnswer) => {
            if (genAnswer.toLowerCase() !== 'y') {
              logger.log('Using existing token');
              rl.close();
              await app.close();
              return;
            } else {
              await generateAndUseToken(clioAuthService, rl, app);
            }
          });
        } else {
          await generateAndUseToken(clioAuthService, rl, app);
        }
      } catch (error) {
        logger.error(`Error: ${error.message}`, error.stack);
        rl.close();
        await app.close();
      }
    });
  } catch (error) {
    logger.error(`Error: ${error.message}`, error.stack);
    await app.close();
  }
}

/**
 * Generate a new authorization URL and use the returned code to get a token
 */
async function generateAndUseToken(clioAuthService: ClioAuthService, rl: readline.Interface, app: any) {
  try {
    // Generate authorization URL
    const { url, state } = await clioAuthService.generateAuthorizationUrl();

    logger.log('Generated Clio authorization URL:');
    logger.log(url);
    logger.log(`State: ${state}`);

    // Open the URL in the default browser
    rl.question('Would you like to open this URL in your browser? (y/n) ', async (openAnswer) => {
      if (openAnswer.toLowerCase() === 'y') {
        logger.log('Opening URL in browser...');
        await open(url);
      }

      // Prompt for the authorization code
      rl.question('After authorizing, please enter the full callback URL you were redirected to: ', async (callbackUrl) => {
        try {
          // Parse the code and state from the callback URL
          const parsedUrl = new URL(callbackUrl);
          const code = parsedUrl.searchParams.get('code');
          const returnedState = parsedUrl.searchParams.get('state');

          if (!code) {
            throw new Error('No code parameter found in the callback URL');
          }

          if (!returnedState) {
            throw new Error('No state parameter found in the callback URL');
          }

          if (returnedState !== state) {
            throw new Error(`State mismatch: expected ${state}, got ${returnedState}`);
          }

          logger.log(`Received code: ${code}`);
          logger.log(`Received state: ${returnedState}`);

          // Exchange the code for a token
          const token = await clioAuthService.exchangeCodeForToken(code, returnedState);

          logger.log('OAuth authentication successful');
          logger.log(`Token ID: ${token.id}`);
          logger.log(`Access token: ${token.accessToken.substring(0, 5)}...${token.accessToken.substring(token.accessToken.length - 5)}`);
          logger.log(`Refresh token: ${token.refreshToken.substring(0, 5)}...${token.refreshToken.substring(token.refreshToken.length - 5)}`);
          logger.log(`Expires at: ${token.expiresAt.toLocaleString()}`);

          rl.close();
          await app.close();
        } catch (error) {
          logger.error(`Error exchanging code for token: ${error.message}`, error.stack);
          rl.close();
          await app.close();
        }
      });
    });
  } catch (error) {
    logger.error(`Error generating authorization URL: ${error.message}`, error.stack);
    rl.close();
    await app.close();
  }
}

// Run the test
testClioAuth().catch((error) => {
  logger.error(`Unhandled error: ${error.message}`, error.stack);
  process.exit(1);
});
