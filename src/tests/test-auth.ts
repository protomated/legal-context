/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Comprehensive Clio OAuth Authentication Test
 * 
 * This script performs a detailed test of the Clio OAuth authentication flow.
 * It validates tokens, tests token refresh, and provides diagnostics for OAuth issues.
 */

import { logger } from "../logger";
import { clioApiClient } from "../clio/apiClient";
import { secureTokenStorage } from "../clio/tokenStorage";
import { ClioTokens, getClioBaseUrl, isTokenExpired, refreshAccessToken } from "../clio/oauthClient";
import { startOAuthServer } from "../clio/httpServer";
import { config } from "../config";

// Set colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

/**
 * Main function to test Clio OAuth authentication
 */
async function testAuth() {
  console.log(`\n${colors.bright}${colors.cyan}=== Comprehensive Clio OAuth Authentication Test ===${colors.reset}\n`);
  
  // Check for existing tokens
  console.log(`${colors.bright}Step 1: Checking for existing OAuth tokens${colors.reset}`);
  
  let tokens: ClioTokens | null = await secureTokenStorage.loadTokens();
  
  if (tokens) {
    console.log(`${colors.green}✓ Found existing OAuth tokens${colors.reset}`);
    
    // Display token info
    console.log(`\nToken Info:`);
    console.log(`• Access Token: ****${tokens.access_token.substring(tokens.access_token.length - 8)}`);
    console.log(`• Token Type: ${tokens.token_type}`);
    console.log(`• Created At: ${tokens.created_at ? new Date(tokens.created_at * 1000).toLocaleString() : 'Not available'}`);
    
    // Check expiration
    const expired = isTokenExpired(tokens);
    if (expired) {
      console.log(`${colors.yellow}⚠ Access token is expired${colors.reset}`);
    } else {
      const expiresAt = tokens.created_at ? new Date((tokens.created_at + tokens.expires_in) * 1000) : null;
      console.log(`${colors.green}✓ Access token is valid${colors.reset}`);
      if (expiresAt) {
        console.log(`• Expires At: ${expiresAt.toLocaleString()}`);
      }
    }
    
    // Test token refresh
    console.log(`\n${colors.bright}Step 2: Testing token refresh${colors.reset}`);
    
    try {
      console.log(`Attempting to refresh the access token...`);
      
      // Force a token refresh
      const refreshedTokens = await refreshAccessToken(tokens.refresh_token);
      
      // Save the refreshed tokens
      await secureTokenStorage.saveTokens(refreshedTokens);
      tokens = refreshedTokens;
      
      console.log(`${colors.green}✓ Successfully refreshed access token${colors.reset}`);
      console.log(`• New Access Token: ****${tokens.access_token.substring(tokens.access_token.length - 8)}`);
      console.log(`• Created At: ${tokens.created_at ? new Date(tokens.created_at * 1000).toLocaleString() : 'Not available'}`);
      const expiresAt = tokens.created_at ? new Date((tokens.created_at + tokens.expires_in) * 1000) : null;
      if (expiresAt) {
        console.log(`• Expires At: ${expiresAt.toLocaleString()}`);
      }
    } catch (refreshError) {
      console.error(`${colors.red}✗ Failed to refresh access token: ${refreshError instanceof Error ? refreshError.message : String(refreshError)}${colors.reset}`);
      console.log(`\nThe refresh token might be invalid or expired. You need to re-authenticate.`);
      
      const reAuthAnswer = await question(`Do you want to re-authenticate with Clio? (y/n): `);
      
      if (reAuthAnswer.toLowerCase() === 'y' || reAuthAnswer.toLowerCase() === 'yes') {
        // Delete the existing tokens
        await secureTokenStorage.deleteTokens();
        tokens = null;
      } else {
        process.exit(1);
      }
    }
  } else {
    console.log(`${colors.yellow}⚠ No existing OAuth tokens found${colors.reset}`);
  }
  
  // Start OAuth flow if needed
  if (!tokens) {
    console.log(`\n${colors.bright}Step 3: Initiating new OAuth flow${colors.reset}`);
    
    // Start OAuth server
    console.log(`Starting OAuth server...`);
    
    const port = config.port || 3001;
    const oauthServer = startOAuthServer();
    
    console.log(`\n${colors.bright}${colors.cyan}OAuth server started on port ${port}${colors.reset}`);
    console.log(`\nPlease follow these steps to authenticate with Clio:`);
    console.log(`1. Visit ${colors.cyan}http://localhost:${port}/clio/auth${colors.reset} in your browser`);
    console.log(`2. Log in to your Clio account if prompted`);
    console.log(`3. Approve the authorization request`);
    console.log(`4. You should be redirected back to a success page`);
    
    console.log(`\n${colors.yellow}Waiting for authentication to complete...${colors.reset}`);
    console.log(`Press Ctrl+C to cancel at any time.\n`);
    
    // Check for tokens every 5 seconds
    let authenticated = false;
    const maxChecks = 60; // 5 minutes max
    let checks = 0;
    
    while (!authenticated && checks < maxChecks) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        tokens = await secureTokenStorage.loadTokens();
        if (tokens) {
          authenticated = true;
          console.log(`\n${colors.green}✓ Authentication successful! Tokens received and stored.${colors.reset}`);
          break;
        }
      } catch (error) {
        // Ignore errors during polling
      }
      
      checks++;
    }
    
    if (!authenticated) {
      console.error(`\n${colors.red}✗ Authentication timed out after 5 minutes. Please try again.${colors.reset}`);
      process.exit(1);
    }
    
    // Shut down the server
    console.log(`\n${colors.yellow}Shutting down OAuth server...${colors.reset}`);
    oauthServer.stop();
  } else {
    console.log(`\n${colors.bright}Step 3: Skipped - Using existing tokens${colors.reset}`);
  }
  
  // Test API access with the tokens
  console.log(`\n${colors.bright}Step 4: Testing API access with OAuth tokens${colors.reset}`);
  
  try {
    console.log(`Initializing Clio API client with the tokens...`);
    
    await clioApiClient.initialize();
    
    console.log(`${colors.green}✓ Clio API client initialized successfully${colors.reset}`);
    
    // Make a simple API call to test access
    console.log(`\nMaking a test API call to list documents...`);
    
    const documents = await clioApiClient.listDocuments(1, 1);
    
    console.log(`${colors.green}✓ API call successful${colors.reset}`);
    console.log(`Total documents in Clio: ${documents.meta.paging.total_entries}`);
    
    // Test other API endpoints if available
    console.log(`\nMaking a test API call to list folders...`);
    
    const folders = await clioApiClient.listFolders(1, 1);
    
    console.log(`${colors.green}✓ API call successful${colors.reset}`);
    console.log(`Total folders in Clio: ${folders.meta.paging.total_entries}`);
    
  } catch (apiError) {
    console.error(`${colors.red}✗ API access test failed: ${apiError instanceof Error ? apiError.message : String(apiError)}${colors.reset}`);
    
    // Check if it's an authentication error
    if (apiError instanceof Error && apiError.message.includes('Authentication failed')) {
      console.log(`\nThis appears to be an authentication error. Your tokens might be invalid.`);
      console.log(`Try re-authenticating by running this test again with the --reauth flag.`);
    }
    
    process.exit(1);
  }
  
  // Check token storage security
  console.log(`\n${colors.bright}Step 5: Checking token storage security${colors.reset}`);
  
  try {
    // Check if SECRET_KEY is set
    if (!config.secretKey) {
      console.log(`${colors.yellow}⚠ WARNING: No SECRET_KEY set in environment variables${colors.reset}`);
      console.log(`Tokens are being stored without encryption. This is not recommended for production.`);
      console.log(`Add a SECRET_KEY to your .env file to enable encrypted token storage.`);
    } else {
      console.log(`${colors.green}✓ SECRET_KEY is configured for token encryption${colors.reset}`);
    }
    
    // Check token file permissions (Unix-like systems only)
    if (process.platform !== 'win32') {
      const fs = await import('fs');
      const tokenFilePath = '.clio_tokens';
      
      if (fs.existsSync(tokenFilePath)) {
        const stats = fs.statSync(tokenFilePath);
        const fileMode = stats.mode & 0o777;
        
        // Check if file is readable by others
        if ((fileMode & 0o004) !== 0) {
          console.log(`${colors.yellow}⚠ WARNING: Token file is world-readable (mode: ${fileMode.toString(8)})${colors.reset}`);
          console.log(`Consider restricting permissions with: chmod 600 ${tokenFilePath}`);
        } else if ((fileMode & 0o040) !== 0) {
          console.log(`${colors.yellow}⚠ WARNING: Token file is group-readable (mode: ${fileMode.toString(8)})${colors.reset}`);
          console.log(`Consider restricting permissions with: chmod 600 ${tokenFilePath}`);
        } else {
          console.log(`${colors.green}✓ Token file has appropriate permissions${colors.reset}`);
        }
      }
    }
  } catch (error) {
    console.log(`${colors.yellow}⚠ Could not check token storage security: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
  }
  
  // Summary
  console.log(`\n${colors.bright}${colors.green}Authentication Test Summary${colors.reset}`);
  console.log(`\n${colors.green}✓ OAuth tokens are valid and working${colors.reset}`);
  console.log(`${colors.green}✓ API access is functioning correctly${colors.reset}`);
  console.log(`\nYou can now start the LegalContext server with: ${colors.cyan}bun start${colors.reset}`);
}

/**
 * Helper function to get user input
 */
async function question(query: string): Promise<string> {
  const readline = await import('readline');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Parse command-line arguments
const args = process.argv.slice(2);
const forceReauth = args.includes('--reauth') || args.includes('-r');

// If --reauth flag is provided, delete existing tokens
if (forceReauth) {
  try {
    await secureTokenStorage.deleteTokens();
    console.log(`${colors.yellow}Deleted existing tokens due to --reauth flag${colors.reset}`);
  } catch (error) {
    // Ignore errors when deleting non-existent tokens
  }
}

// Run the authentication test
testAuth().catch(error => {
  logger.error("Error during authentication test:", error);
  process.exit(1);
});
