/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Clio Configuration Check Tool
 * 
 * This script verifies Clio API configuration settings in the .env file.
 * It checks for the presence of required environment variables and validates
 * that the redirect URI format is correct.
 */

import { config, validateClioConfig } from "../config";
import { logger } from "../logger";
import { getClioBaseUrl } from "../clio/oauthClient";

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
 * Main function to check Clio configuration
 */
async function checkClioConfiguration() {
  console.log(`\n${colors.bright}${colors.cyan}=== Checking Clio API Configuration ===${colors.reset}\n`);

  // Check if required environment variables are set
  try {
    // This will throw an error if any required Clio variables are missing
    validateClioConfig();
    console.log(`${colors.green}✓ All required Clio configuration variables are present${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Clio configuration error: ${(error as Error).message}${colors.reset}`);
    process.exit(1);
  }

  // Show the configuration
  console.log(`\n${colors.cyan}Current Clio Configuration:${colors.reset}`);
  console.log(`• Client ID: ${config.clioClientId ? '****' + config.clioClientId.substring(config.clioClientId.length - 4) : 'Not set'}`);
  console.log(`• Client Secret: ${config.clioClientSecret ? '********' : 'Not set'}`);
  console.log(`• Redirect URI: ${config.clioRedirectUri}`);
  console.log(`• API Region: ${config.clioApiRegion}`);
  console.log(`• Base URL: ${getClioBaseUrl()}`);

  // Validate redirect URI format
  validateRedirectUri();

  // Provide environment setup instructions if needed
  if (!config.clioClientId || !config.clioClientSecret) {
    console.log(`\n${colors.yellow}You need to set up Clio API credentials:${colors.reset}`);
    console.log(`1. Go to ${colors.cyan}https://${config.clioApiRegion || 'us'}.app.clio.com/settings/developer_applications${colors.reset}`);
    console.log(`2. Create a new application`);
    console.log(`3. Set the redirect URI to: ${colors.cyan}${config.clioRedirectUri || 'http://localhost:3001/clio/auth/callback'}${colors.reset}`);
    console.log(`4. Copy the Client ID and Client Secret to your .env file`);
  } else {
    console.log(`\n${colors.green}✓ Clio API credentials are configured. Run 'bun run auth:simple' to test authentication.${colors.reset}`);
  }
}

/**
 * Validate the redirect URI format
 */
function validateRedirectUri() {
  const uri = config.clioRedirectUri;
  
  if (!uri) {
    console.log(`${colors.red}✗ Redirect URI is not set${colors.reset}`);
    return;
  }
  
  try {
    // Check basic URL format
    const url = new URL(uri);
    
    // Check protocol (must be http or https)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      console.log(`${colors.yellow}⚠ Redirect URI protocol should be http or https${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Redirect URI has valid protocol${colors.reset}`);
    }
    
    // Check if it has a path that includes /callback
    if (!url.pathname.includes('/callback')) {
      console.log(`${colors.yellow}⚠ Redirect URI should include '/callback' in the path${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Redirect URI has callback path${colors.reset}`);
    }
    
    // Check if localhost is used for development
    if (config.nodeEnv === 'development' && !url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
      console.log(`${colors.yellow}⚠ Using non-localhost URI in development mode${colors.reset}`);
    } else if (config.nodeEnv === 'development') {
      console.log(`${colors.green}✓ Using localhost URI in development mode${colors.reset}`);
    }
    
    // Check if port matches configured server port
    const uriPort = url.port || (url.protocol === 'https:' ? '443' : '80');
    const configPort = String(config.port || '3001');
    
    if (uriPort !== configPort) {
      console.log(`${colors.yellow}⚠ Redirect URI port (${uriPort}) doesn't match server port (${configPort})${colors.reset}`);
    } else {
      console.log(`${colors.green}✓ Redirect URI port matches server port${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Redirect URI is not a valid URL: ${error instanceof Error ? error.message : String(error)}${colors.reset}`);
  }
}

// Run the check
checkClioConfiguration().catch(error => {
  logger.error("Error checking Clio configuration:", error);
  process.exit(1);
});
