/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) Protomated
 * Email: team@protomated.com
 * Website: protomated.com
 */

import { join } from 'path';
import { config } from '../config';
import { logger } from '../logger';
import { ClioTokens } from './oauthClient';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { getLegalContextFilePath } from '../utils/paths';
import * as crypto from 'crypto';

// Path to the token storage file in the .legalcontext directory
const TOKEN_FILE_PATH = getLegalContextFilePath('clio_tokens');
logger.info(`Using token storage file: ${TOKEN_FILE_PATH}`);

/**
 * Secure Token Storage class with improved error handling
 */
class SecureTokenStorage {
  private secretKey: string;

  constructor() {
    // Get or create a persistent secret key
    this.secretKey = config.secretKey || 'default-secure-key-for-local-storage-only';
    logger.debug('Token storage initialized');
  }

  /**
   * Save tokens to storage
   */
  async saveTokens(tokens: ClioTokens): Promise<void> {
    try {
      // Validate tokens before saving
      if (!tokens.access_token) {
        throw new Error('Cannot save invalid tokens: missing access_token');
      }

      // Simply store tokens as JSON
      const tokenData = JSON.stringify(tokens);
      writeFileSync(TOKEN_FILE_PATH, tokenData);

      logger.info('Tokens saved successfully (unencrypted)');
    } catch (error) {
      logger.error('Failed to save tokens:', error);
      throw error;
    }
  }

  /**
   * Load tokens from storage with improved error handling
   */
  async loadTokens(): Promise<ClioTokens | null> {
    try {
      // Check if the token file exists
      if (!existsSync(TOKEN_FILE_PATH)) {
        logger.info('Token file does not exist');
        return null;
      }

      // Read from file
      const data = readFileSync(TOKEN_FILE_PATH, 'utf8');
      if (!data || data.trim() === '') {
        logger.info('Token file is empty');
        return null;
      }

      // Try to parse as JSON directly
      try {
        const tokens = JSON.parse(data) as ClioTokens;
        if (!tokens.access_token) {
          logger.warn('Token file contains invalid data (missing access_token)');
          return null;
        }
        logger.debug('Successfully loaded tokens');
        return tokens;
      } catch (parseError) {
        logger.error(`Error parsing token data: ${parseError}`);

        // If we couldn't parse, backup and delete the file
        logger.warn('Token file is corrupted - creating backup and deleting');

        // Backup the corrupted file before deleting
        try {
          const backupPath = `${TOKEN_FILE_PATH}.bak`;
          writeFileSync(backupPath, data);
          logger.info(`Backed up corrupted token file to ${backupPath}`);
        } catch (backupError) {
          logger.error(`Failed to backup corrupted token file: ${backupError}`);
        }

        // Delete the corrupted file
        try {
          unlinkSync(TOKEN_FILE_PATH);
          logger.info('Deleted corrupted token file');
        } catch (deleteError) {
          logger.error(`Failed to delete corrupted token file: ${deleteError}`);
          // Attempt to overwrite instead
          writeFileSync(TOKEN_FILE_PATH, '');
          logger.info('Overwrote corrupted token file');
        }

        return null;
      }
    } catch (error) {
      logger.error('Failed to load tokens:', error);
      return null;
    }
  }

  /**
   * Delete saved tokens
   */
  async deleteTokens(): Promise<void> {
    try {
      // Check if file exists before attempting to delete
      if (existsSync(TOKEN_FILE_PATH)) {
        unlinkSync(TOKEN_FILE_PATH);
        logger.info('Tokens deleted successfully (file removed)');
      } else {
        logger.info('No token file to delete');
      }
    } catch (error) {
      logger.error('Error deleting token file:', error);
      // Fallback to overwriting the file
      try {
        writeFileSync(TOKEN_FILE_PATH, '');
        logger.info('Tokens deleted successfully (file overwritten)');
      } catch (writeError) {
        logger.error('Failed to overwrite token file:', writeError);
        throw error;
      }
    }
  }

  /**
   * Check if tokens file exists
   */
  async tokensExist(): Promise<boolean> {
    return existsSync(TOKEN_FILE_PATH);
  }
}

// Create and export a singleton instance
const secureTokenStorage = new SecureTokenStorage();
export { secureTokenStorage };
