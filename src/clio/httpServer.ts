/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Clio OAuth HTTP Server
 * 
 * This module implements a minimal HTTP server to handle Clio OAuth 2.0 authorization flow.
 * It provides endpoints for initiating the OAuth flow and handling the callback from Clio.
 */

import { Server } from "bun";
import { config } from "../config";
import { logger } from "../logger";
import { exchangeCodeForTokens, generateAuthorizationUrl } from "./oauthClient";
import { secureTokenStorage } from "./tokenStorage";

// Simple in-memory state store for CSRF protection
const stateStore: Map<string, { createdAt: number }> = new Map();

// Clean up expired states (older than 10 minutes)
function cleanupExpiredStates() {
  const now = Date.now();
  for (const [state, { createdAt }] of stateStore.entries()) {
    if (now - createdAt > 10 * 60 * 1000) {
      stateStore.delete(state);
    }
  }
}

// Create state and store it
function createAndStoreState(): string {
  // Generate a random state value for CSRF protection
  const state = Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
  
  // Store state with timestamp
  stateStore.set(state, { createdAt: Date.now() });
  
  // Schedule cleanup
  setTimeout(cleanupExpiredStates, 10 * 60 * 1000);
  
  return state;
}

/**
 * Create and start the OAuth HTTP server
 */
export function startOAuthServer(): Server {
  if (!config.port) {
    throw new Error("PORT environment variable must be set to run the OAuth HTTP server");
  }

  logger.info(`Starting OAuth HTTP server on port ${config.port}...`);

  return Bun.serve({
    port: config.port,
    
    async fetch(req) {
      const url = new URL(req.url);
      
      // Handle the OAuth initiation endpoint
      if (url.pathname === "/auth/clio") {
        try {
          // Create and store state
          const state = createAndStoreState();
          
          // Generate authorization URL
          const authUrl = generateAuthorizationUrl(state);
          
          // Redirect to Clio's authorization page
          return new Response(null, {
            status: 302,
            headers: { Location: authUrl }
          });
        } catch (error) {
          logger.error("Error initiating OAuth flow:", error);
          return new Response("Error initiating authorization", { status: 500 });
        }
      }
      
      // Handle the OAuth callback endpoint
      if (url.pathname === "/auth/clio/callback") {
        const params = new URLSearchParams(url.search);
        const code = params.get("code");
        const state = params.get("state");
        
        // Validate required parameters
        if (!code || !state) {
          logger.error("Missing required OAuth callback parameters");
          return new Response("Missing required parameters", { status: 400 });
        }
        
        // Validate state to prevent CSRF attacks
        if (!stateStore.has(state)) {
          logger.error("Invalid OAuth state parameter");
          return new Response("Invalid state parameter", { status: 403 });
        }
        
        // Remove used state
        stateStore.delete(state);
        
        try {
          // Exchange authorization code for tokens
          const tokens = await exchangeCodeForTokens(code);
          
          // Store tokens securely
          await secureTokenStorage.saveTokens(tokens);
          
          logger.info("Successfully authenticated with Clio");
          
          // Render success page
          return new Response(
            `<html>
              <body>
                <h1>Successfully authenticated with Clio</h1>
                <p>You can close this window and return to LegalContext.</p>
              </body>
            </html>`,
            {
              status: 200,
              headers: { "Content-Type": "text/html" }
            }
          );
        } catch (error) {
          logger.error("Error handling OAuth callback:", error);
          return new Response("Error completing authorization", { status: 500 });
        }
      }
      
      // Handle home endpoint with link to start auth
      if (url.pathname === "/" || url.pathname === "") {
        return new Response(
          `<html>
            <body>
              <h1>LegalContext Authentication</h1>
              <p>Click below to authenticate with Clio:</p>
              <a href="/auth/clio">Connect to Clio</a>
            </body>
          </html>`,
          {
            status: 200,
            headers: { "Content-Type": "text/html" }
          }
        );
      }
      
      // Not found for all other routes
      return new Response("Not Found", { status: 404 });
    }
  });
}
