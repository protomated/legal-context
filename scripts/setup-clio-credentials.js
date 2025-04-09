#!/usr/bin/env bun

/**
 * Interactive script to set up Clio credentials
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('===== Clio API Credentials Setup =====');
console.log('');
console.log('This script will help you set up your Clio API credentials.');
console.log('You will need your Clio Client ID and Client Secret from the Clio Developer Portal.');
console.log('');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  let clientId = process.env.CLIO_CLIENT_ID;
  let clientSecret = process.env.CLIO_CLIENT_SECRET;
  
  // Check for existing values
  if (clientId && !clientId.startsWith('${')) {
    console.log(`Current Client ID: ${clientId.substring(0, 8)}...`);
  } else {
    clientId = '';
  }
  
  if (clientSecret && !clientSecret.startsWith('${')) {
    console.log(`Current Client Secret: ${clientSecret.substring(0, 4)}...`);
  } else {
    clientSecret = '';
  }
  
  // Prompt for Client ID if not set
  if (!clientId) {
    clientId = await new Promise(resolve => {
      rl.question('Enter your Clio Client ID: ', answer => resolve(answer.trim()));
    });
  } else {
    const shouldChange = await new Promise(resolve => {
      rl.question('Would you like to change the Client ID? (y/n): ', answer => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    if (shouldChange) {
      clientId = await new Promise(resolve => {
        rl.question('Enter your Clio Client ID: ', answer => resolve(answer.trim()));
      });
    }
  }
  
  // Prompt for Client Secret if not set
  if (!clientSecret) {
    clientSecret = await new Promise(resolve => {
      rl.question('Enter your Clio Client Secret: ', answer => resolve(answer.trim()));
    });
  } else {
    const shouldChange = await new Promise(resolve => {
      rl.question('Would you like to change the Client Secret? (y/n): ', answer => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    
    if (shouldChange) {
      clientSecret = await new Promise(resolve => {
        rl.question('Enter your Clio Client Secret: ', answer => resolve(answer.trim()));
      });
    }
  }
  
  // Confirm redirect URI
  const redirectUri = process.env.CLIO_REDIRECT_URI || 'http://127.0.0.1:3000/clio/auth/callback';
  console.log(`\nRedirect URI: ${redirectUri}`);
  console.log('Make sure this exactly matches what you have configured in the Clio Developer Portal');
  
  const confirmRedirect = await new Promise(resolve => {
    rl.question('Is this redirect URI correct? (y/n): ', answer => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
  
  if (!confirmRedirect) {
    console.log('\nPlease update your redirect URI in the .env file and try again.');
    rl.close();
    return;
  }
  
  // Generate the .env file
  try {
    // Read existing .env if it exists
    let envContent = '';
    if (fs.existsSync('.env')) {
      envContent = fs.readFileSync('.env', 'utf8');
    }
    
    // Update the values
    if (envContent) {
      // Replace existing values
      envContent = envContent.replace(/CLIO_CLIENT_ID=.*(\r?\n|$)/, `CLIO_CLIENT_ID=${clientId}$1`);
      envContent = envContent.replace(/CLIO_CLIENT_SECRET=.*(\r?\n|$)/, `CLIO_CLIENT_SECRET=${clientSecret}$1`);
      envContent = envContent.replace(/CLIO_REDIRECT_URI=.*(\r?\n|$)/, `CLIO_REDIRECT_URI=${redirectUri}$1`);
    } else {
      // Create new content
      envContent = `# LegalContext Environment Configuration

# Clio API Configuration
CLIO_CLIENT_ID=${clientId}
CLIO_CLIENT_SECRET=${clientSecret}
CLIO_REDIRECT_URI=${redirectUri}
CLIO_API_URL=https://app.clio.com/api/v4

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=legalcontext

# Security
ENCRYPTION_KEY=dev-encryption-key-for-testing-only

# Document Processing
MAX_DOCUMENT_SIZE=5242880
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
`;
    }
    
    // Write the updated content
    fs.writeFileSync('.env', envContent);
    
    console.log('\nCredentials saved successfully to .env file.');
    console.log('You can now run the OAuth setup with:');
    console.log('  bun run setup:clio:standalone');
  } catch (error) {
    console.error('Error saving credentials:', error.message);
  }
  
  rl.close();
}

main().catch(error => {
  console.error('Error:', error.message);
  rl.close();
  process.exit(1);
});
