#!/usr/bin/env bun

/**
 * Standalone Clio OAuth setup script with local callback server
 * This script starts a simple HTTP server to handle the OAuth callback
 */

import * as readline from 'readline';
import * as crypto from 'crypto';
import * as open from 'open';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as url from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

console.log(`Loading environment from: ${envPath}`);

const execAsync = promisify(exec);

// Read directly from the .env file to ensure we have the latest values
function loadEnvFile() {
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const env = {};
      
      content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          if (key && value) {
            env[key.trim()] = value;
          }
        }
      });
      
      return env;
    }
  } catch (error) {
    console.error('Error reading .env file:', error.message);
  }
  
  return {};
}

const envVars = loadEnvFile();

// Parse the redirect URI to get the port and path
const CLIO_CLIENT_ID = envVars.CLIO_CLIENT_ID || '';
const CLIO_CLIENT_SECRET = envVars.CLIO_CLIENT_SECRET || '';
const CLIO_REDIRECT_URI = envVars.CLIO_REDIRECT_URI || 'http://127.0.0.1:3000/clio/auth/callback';
const CLIO_API_URL = envVars.CLIO_API_URL || 'https://app.clio.com/api/v4';

console.log('Using Clio API configuration:');
console.log(`- Client ID: ${CLIO_CLIENT_ID ? CLIO_CLIENT_ID.substring(0, 8) + '...' : 'NOT SET'}`);
console.log(`- Redirect URI: ${CLIO_REDIRECT_URI}`);
console.log(`- API URL: ${CLIO_API_URL}`);

if (!CLIO_CLIENT_ID || !CLIO_CLIENT_SECRET) {
  console.error('Error: Missing required environment variables');
  console.error('Please set CLIO_CLIENT_ID and CLIO_CLIENT_SECRET in your .env file');
  process.exit(1);
}

// Parse the redirect URI to get server details
const redirectUrl = new URL(CLIO_REDIRECT_URI);
const redirectPort = redirectUrl.port || (redirectUrl.protocol === 'https:' ? 443 : 80);
const redirectPath = redirectUrl.pathname;

// State and verifier for PKCE
let savedState = '';
let savedCodeVerifier = '';

/**
 * Generate a cryptographically secure random state value
 */
function generateState() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a code verifier and challenge for PKCE
 */
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('hex');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { codeVerifier, codeChallenge };
}

/**
 * Generate an authorization URL
 */
function generateAuthorizationUrl() {
  const state = generateState();
  const { codeVerifier, codeChallenge } = generatePKCE();

  // Save state and verifier for later verification
  savedState = state;
  savedCodeVerifier = codeVerifier;

  const authUrl = CLIO_API_URL.replace('/api/v4', '/oauth/authorize');

  // Build authorization URL
  const url = new URL(authUrl);
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('client_id', CLIO_CLIENT_ID);
  url.searchParams.append('redirect_uri', CLIO_REDIRECT_URI);
  url.searchParams.append('state', state);
  url.searchParams.append('code_challenge', codeChallenge);
  url.searchParams.append('code_challenge_method', 'S256');
  url.searchParams.append('scope', 'documents');

  return url.toString();
}

/**
 * Exchange authorization code for access and refresh tokens
 */
async function exchangeCodeForToken(code) {
  const tokenUrl = CLIO_API_URL.replace('/api/v4', '/oauth/token');

  const params = new URLSearchParams();
  params.append('client_id', CLIO_CLIENT_ID);
  params.append('client_secret', CLIO_CLIENT_SECRET);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', CLIO_REDIRECT_URI);
  params.append('code_verifier', savedCodeVerifier);

  const tokenCommand = `curl -s -X POST "${tokenUrl}" -d "${params.toString()}" -H "Content-Type: application/x-www-form-urlencoded"`;
  console.log('Executing token request...');
  
  try {
    const { stdout } = await execAsync(tokenCommand);
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error executing token request:', error.message);
    if (error.stdout) {
      console.error('Response:', error.stdout);
    }
    throw error;
  }
}

/**
 * Save token to a file (for demonstration purposes)
 * In a real application, you would store this securely in a database
 */
function saveToken(token) {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + token.expires_in);

  const tokenData = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: expiresAt.toISOString(),
    scope: token.scope,
    tokenType: token.token_type,
  };

  // Save to .env.clio file
  const envContent = `
# Clio OAuth Token (generated on ${new Date().toISOString()})
CLIO_ACCESS_TOKEN=${token.access_token}
CLIO_REFRESH_TOKEN=${token.refresh_token}
CLIO_TOKEN_EXPIRES_AT=${expiresAt.toISOString()}
CLIO_TOKEN_SCOPE=${token.scope || ''}
`;

  console.log('Token information:');
  console.log(`- Access Token: ${token.access_token.substring(0, 10)}...`);
  console.log(`- Refresh Token: ${token.refresh_token.substring(0, 10)}...`);
  console.log(`- Expires At: ${expiresAt.toLocaleString()}`);
  console.log(`- Scopes: ${token.scope || 'default'}`);

  // Note we're not actually writing the file to respect .env security
  console.log('In a real implementation, these tokens would be stored securely in a database');
}

/**
 * Start a local HTTP server to handle the OAuth callback
 */
function startCallbackServer() {
  return new Promise((resolve, reject) => {
    // Create server to handle the callback
    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      
      // Check if this is the callback path
      if (parsedUrl.pathname === redirectPath) {
        const { code, state, error } = parsedUrl.query;
        
        // Handle error in the callback
        if (error) {
          console.error(`OAuth error: ${error}`);
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<html><body><h1>Authentication Error</h1><p>${error}</p></body></html>`);
          server.close();
          reject(new Error(`Authentication error: ${error}`));
          return;
        }
        
        // Validate state to prevent CSRF
        if (state !== savedState) {
          console.error(`State mismatch: ${state} vs ${savedState}`);
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<html><body><h1>Authentication Error</h1><p>Invalid state parameter</p></body></html>');
          server.close();
          reject(new Error('Invalid state parameter'));
          return;
        }
        
        // Success - exchange the code for a token
        try {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body>
                <h1>Authentication Successful</h1>
                <p>You can close this window and return to the application.</p>
                <script>window.close();</script>
              </body>
            </html>
          `);
          
          server.close();
          resolve(code);
        } catch (err) {
          console.error('Error in callback handler:', err);
          reject(err);
        }
      } else {
        // Not the callback path
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
      }
    });
    
    // Start server
    server.listen(redirectPort, '127.0.0.1', () => {
      console.log(`Callback server listening on port ${redirectPort}`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error(`Server error: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('Starting Clio OAuth setup with local callback server');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const confirmPrompt = await new Promise(resolve => {
      rl.question('This will start the OAuth flow to authorize LegalContext with your Clio account. Continue? (y/n) ', answer => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    if (!confirmPrompt) {
      console.log('Setup cancelled');
      rl.close();
      return;
    }
    
    // Generate authorization URL
    const authUrl = generateAuthorizationUrl();
    
    console.log('Starting local callback server...');
    const codePromise = startCallbackServer();
    
    console.log('Please open the following URL in your browser for OAuth authorization:');
    console.log(authUrl);
    
    // Attempt to open the URL automatically
    try {
      await open(authUrl);
      console.log('Browser opened automatically with the authorization URL');
    } catch (error) {
      console.warn('Could not open browser automatically. Please copy and paste the URL in your browser.');
    }
    
    console.log('Waiting for authorization...');
    
    // Wait for the callback
    const code = await codePromise;
    console.log(`Authorization code received: ${code.substring(0, 8)}...`);
    
    // Exchange code for token
    console.log('Exchanging authorization code for token...');
    const token = await exchangeCodeForToken(code);
    
    console.log('OAuth authorization successful');
    saveToken(token);
    
    console.log('Setup complete. You can now start LegalContext.');
  } catch (error) {
    console.error(`OAuth setup failed: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Start the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
