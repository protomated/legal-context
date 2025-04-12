/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Clio Integration Module
 * 
 * This module serves as the main entry point for all Clio-related functionality.
 * It coordinates the OAuth server, API client, and document processing.
 */

import { Server } from "bun";
import { config } from "../config";
import { logger } from "../logger";
import { clioApiClient } from "./apiClient";
import { startOAuthServer } from "./httpServer";

let oauthServer: Server | null = null;

/**
 * Initialize the Clio integration
 * This includes starting the OAuth server if a port is configured
 * and initializing the API client if tokens are available
 */
export async function initializeClioIntegration(): Promise<boolean> {
  logger.info("Initializing Clio integration...");
  
  // Start OAuth server if port is configured
  if (config.port) {
    try {
      oauthServer = startOAuthServer();
      logger.info(`OAuth server started on port ${config.port}`);
      
      // Log authentication URL
      const authUrl = `http://localhost:${config.port}/auth/clio`;
      logger.info(`To authenticate with Clio, visit: ${authUrl}`);
    } catch (error) {
      logger.error("Failed to start OAuth server:", error);
      // Continue with initialization even if OAuth server fails
    }
  } else {
    logger.info("PORT not configured. OAuth server not started.");
  }
  
  // Initialize API client
  try {
    const initialized = await clioApiClient.initialize();
    if (!initialized) {
      if (oauthServer) {
        logger.warn("Clio API client not authenticated. Please visit the authentication URL to connect with Clio.");
      } else {
        logger.error("Clio API client not authenticated and OAuth server not running. Authentication not possible.");
      }
      return false;
    }
    
    logger.info("Clio API client initialized successfully");
    return true;
  } catch (error) {
    logger.error("Failed to initialize Clio API client:", error);
    return false;
  }
}

/**
 * Get the Clio API client instance
 */
export function getClioApiClient() {
  return clioApiClient;
}

/**
 * Shutdown the Clio integration
 */
export function shutdownClioIntegration() {
  logger.info("Shutting down Clio integration...");
  
  // Close OAuth server if running
  if (oauthServer) {
    oauthServer.stop();
    oauthServer = null;
    logger.info("OAuth server stopped");
  }
  
  // No explicit cleanup needed for API client
  
  logger.info("Clio integration shutdown complete");
}

// Re-export other Clio-related modules
export * from "./apiClient";
export * from "./oauthClient";
