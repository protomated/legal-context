// File: src/clio/authStatus.ts

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */

import { logger } from '../logger';
import { clioApiClient } from './apiClient';
import { secureTokenStorage } from './tokenStorage';
import { config } from '../config';

/**
 * Check if Clio is authenticated and ready for use
 */
export async function isClioAuthenticated(): Promise<boolean> {
  try {
    // Check if we have tokens
    const tokens = await secureTokenStorage.loadTokens();
    if (!tokens) {
      logger.debug('No Clio tokens found');
      return false;
    }

    // For debugging, log token details (safely)
    logger.debug(`Found tokens from: ${tokens.created_at ? new Date(tokens.created_at * 1000).toISOString() : 'unknown'}`);
    logger.debug(`Token expires in: ${tokens.expires_in ? tokens.expires_in : 'unknown'} seconds`);
    logger.debug(`Refresh token present: ${tokens.refresh_token ? 'Yes' : 'No'}`);

    // Initialize the API client
    const initialized = await clioApiClient.initialize();
    logger.info(`Clio API client initialized: ${initialized}`);
    return initialized;
  } catch (error) {
    logger.error('Error checking Clio authentication status:', error);
    return false;
  }
}

/**
 * Get the Clio authentication URL
 */
export function getClioAuthUrl(): string {
  const port = config.port || 3001;
  return `http://localhost:${port}/clio/auth`;
}

/**
 * Get a user-friendly message for authentication
 */
export function getClioAuthInstructions(): string {
  const authUrl = getClioAuthUrl();

  return `Clio integration is not authenticated. To connect with Clio, please follow these steps:

1. Visit ${authUrl} in your browser
2. Complete the Clio authentication process
3. Restart the LegalContext server
4. Try your query again

If you're seeing this message even after authenticating, your tokens may have expired or become invalid. Please re-authenticate by following the steps above.`;
}

/**
 * Force re-authentication by deleting existing tokens
 */
export async function forceReauthentication(): Promise<void> {
  logger.info('Forcing re-authentication by deleting existing tokens');
  await secureTokenStorage.deleteTokens();
  logger.info('Tokens deleted. User will need to re-authenticate.');
}