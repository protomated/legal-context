#!/usr/bin/env bun

/**
 * Simple script to check Clio API configuration
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

// Get actual environment variable values, not just string placeholders
const getEnvVar = (name, defaultValue) => {
  const value = process.env[name];
  return value && !value.startsWith('${') ? value : defaultValue;
};

console.log('Checking Clio API configuration:');
console.log('--------------------------------');

const CLIO_CLIENT_ID = getEnvVar('CLIO_CLIENT_ID', '');
const CLIO_CLIENT_SECRET = getEnvVar('CLIO_CLIENT_SECRET', '');
const CLIO_REDIRECT_URI = getEnvVar('CLIO_REDIRECT_URI', 'http://127.0.0.1:3000/clio/auth/callback');
const CLIO_API_URL = getEnvVar('CLIO_API_URL', 'https://app.clio.com/api/v4');

console.log(`CLIO_CLIENT_ID: ${CLIO_CLIENT_ID ? 'Set ✓' : 'Not set ✗'}`);
console.log(`CLIO_CLIENT_SECRET: ${CLIO_CLIENT_SECRET ? 'Set ✓' : 'Not set ✗'}`);
console.log(`CLIO_REDIRECT_URI: ${CLIO_REDIRECT_URI}`);
console.log(`CLIO_API_URL: ${CLIO_API_URL}`);

// Check for actual valid values
const hasValidCredentials = CLIO_CLIENT_ID && CLIO_CLIENT_SECRET;

if (!hasValidCredentials) {
  console.log('\n⚠️ Missing or invalid Clio API credentials!');
  console.log('Please add the following to your .env file:');
  console.log('CLIO_CLIENT_ID=your_client_id_here');
  console.log('CLIO_CLIENT_SECRET=your_client_secret_here');
  
  // Prompt to create a config file
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  rl.question('\nWould you like to create a template .env file now? (y/n) ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      try {
        const envTemplate = `# Clio API Configuration
CLIO_CLIENT_ID=
CLIO_CLIENT_SECRET=
CLIO_REDIRECT_URI=http://127.0.0.1:3000/clio/auth/callback
CLIO_API_URL=https://app.clio.com/api/v4
`;
      
        if (!fs.existsSync('.env') || await new Promise(resolve => {
          rl.question('.env file already exists. Overwrite? (y/n) ', answer => {
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
          });
        })) {
          fs.writeFileSync('.env', envTemplate);
          console.log('Created .env template file. Please edit it with your Clio credentials.');
        }
      } catch (error) {
        console.error('Error creating .env file:', error.message);
      }
    }
    
    rl.close();
  });
} else {
  console.log('\n✅ Clio API configuration appears valid.');
  console.log('You can now run the OAuth setup with:');
  console.log('bun run setup:clio:standalone');
}
