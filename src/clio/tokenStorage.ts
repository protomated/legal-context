/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Secure Token Storage
 * 
 * This module handles the secure storage of OAuth tokens for Clio.
 * It encrypts tokens before writing them to disk and decrypts them when reading.
 */

import { join } from "path";
import { config } from "../config";
import { logger } from "../logger";
import { ClioTokens } from "./oauthClient";

// Path to the token storage file
const TOKEN_FILE_PATH = join(process.cwd(), ".clio_tokens");

/**
 * Simple encryption/decryption implementation
 * Note: This is a basic implementation. For production use, consider using
 * platform-specific secure storage or more robust encryption libraries.
 */
class TokenEncryption {
  private key: Uint8Array;
  
  constructor(secretKey: string) {
    // Create a fixed-length key from the secret
    this.key = new TextEncoder().encode(
      secretKey.padEnd(32, 'x').slice(0, 32)
    );
  }
  
  /**
   * Encrypt token data
   */
  async encrypt(data: string): Promise<string> {
    try {
      // Generate a random IV (Initialization Vector)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Get the encryption key
      const key = await crypto.subtle.importKey(
        "raw",
        this.key,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
      );
      
      // Encrypt the data
      const encodedData = new TextEncoder().encode(data);
      const encryptedData = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedData.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedData), iv.length);
      
      // Return as base64 string
      return Buffer.from(result).toString("base64");
    } catch (error) {
      logger.error("Error encrypting tokens:", error);
      throw new Error("Failed to encrypt tokens");
    }
  }
  
  /**
   * Decrypt token data
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      // Decode the base64 data
      const data = Buffer.from(encryptedData, "base64");
      
      // Extract IV and encrypted data
      const iv = data.subarray(0, 12);
      const ciphertext = data.subarray(12);
      
      // Get the decryption key
      const key = await crypto.subtle.importKey(
        "raw",
        this.key,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );
      
      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );
      
      // Return as string
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      logger.error("Error decrypting tokens:", error);
      throw new Error("Failed to decrypt tokens");
    }
  }
}

/**
 * Secure Token Storage class
 */
class SecureTokenStorage {
  private encryption: TokenEncryption | null = null;
  
  constructor() {
    // Initialize encryption if secret key is available
    if (config.secretKey) {
      this.encryption = new TokenEncryption(config.secretKey);
    } else {
      logger.warn("SECRET_KEY not provided - tokens will not be encrypted");
    }
  }
  
  /**
   * Save tokens to storage
   */
  async saveTokens(tokens: ClioTokens): Promise<void> {
    try {
      const tokenData = JSON.stringify(tokens);
      
      // Encrypt if encryption is available
      let dataToStore = tokenData;
      if (this.encryption) {
        dataToStore = await this.encryption.encrypt(tokenData);
      }
      
      // Write to file
      await Bun.write(TOKEN_FILE_PATH, dataToStore);
      logger.info("Tokens saved successfully");
    } catch (error) {
      logger.error("Failed to save tokens:", error);
      throw error;
    }
  }
  
  /**
   * Load tokens from storage
   */
  async loadTokens(): Promise<ClioTokens | null> {
    try {
      // Check if the token file exists
      try {
        await Bun.file(TOKEN_FILE_PATH).exists();
      } catch (error) {
        logger.info("Token file does not exist");
        return null;
      }
      
      // Read from file
      const data = await Bun.file(TOKEN_FILE_PATH).text();
      if (!data) {
        logger.info("Token file is empty");
        return null;
      }
      
      // Decrypt if encryption is available
      let tokenData = data;
      if (this.encryption) {
        tokenData = await this.encryption.decrypt(data);
      }
      
      // Parse JSON
      return JSON.parse(tokenData) as ClioTokens;
    } catch (error) {
      logger.error("Failed to load tokens:", error);
      return null;
    }
  }
  
  /**
   * Delete saved tokens
   */
  async deleteTokens(): Promise<void> {
    try {
      // Simply overwrite with empty string
      await Bun.write(TOKEN_FILE_PATH, "");
      logger.info("Tokens deleted successfully");
    } catch (error) {
      logger.error("Failed to delete tokens:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const secureTokenStorage = new SecureTokenStorage();
