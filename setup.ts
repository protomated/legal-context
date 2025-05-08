/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * LegalContext Setup Script
 *
 * This script performs initial setup for the LegalContext MCP server:
 * 1. Verifies Bun installation or installs it
 * 2. Validates required environment variables
 * 3. Set up OAuth with Clio
 * 4. Updates Claude Desktop configuration
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';

const execAsync = promisify(exec);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

/**
 * Main setup function
 */
async function setup() {
  console.log(`\n${colors.bright}${colors.cyan}====== LegalContext Setup ======${colors.reset}\n`);

  try {
    // Step 1: Check/Install Bun
    await checkOrInstallBun();

    // Step 2: Validate Environment Variables
    await validateEnvironment();

    // Step 3: Setup OAuth with Clio
    await setupClioOAuth();

    // Step 4: Update Claude Desktop configuration
    await updateClaudeConfig();

    console.log(`\n${colors.green}${colors.bright}✓ Setup completed successfully!${colors.reset}`);
    console.log(`\nYou can now start LegalContext with: ${colors.cyan}bun start${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}Error during setup:${colors.reset}`, error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Check for Bun installation or install it
 */
async function checkOrInstallBun() {
  console.log(`${colors.bright}Checking for Bun installation...${colors.reset}`);

  try {
    const { stdout } = await execAsync('bun --version');
    console.log(`${colors.green}✓ Bun is installed (version ${stdout.trim()})${colors.reset}`);
    return;
  } catch (error) {
    console.log(`${colors.yellow}Bun is not installed. Installing now...${colors.reset}`);

    const isWindows = process.platform === 'win32';
    const isMacOrLinux = process.platform === 'darwin' || process.platform === 'linux';

    if (isWindows) {
      console.log('Installing Bun on Windows using PowerShell...');
      // Using PowerShell to install Bun on Windows
      const installProcess = spawn('powershell.exe', [
        '-Command',
        'irm bun.sh/install.ps1 | iex'
      ], { stdio: 'inherit' });

      await new Promise<void>((resolve, reject) => {
        installProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`${colors.green}✓ Bun installed successfully${colors.reset}`);
            resolve();
          } else {
            reject(new Error(`Bun installation failed with code ${code}`));
          }
        });
      });

      console.log(`${colors.yellow}Please add Bun to your PATH manually and restart your terminal${colors.reset}`);
    } else if (isMacOrLinux) {
      console.log('Installing Bun on macOS/Linux...');
      // Using curl to install Bun on macOS/Linux
      const installProcess = spawn('bash', [
        '-c',
        'curl -fsSL https://bun.sh/install | bash'
      ], { stdio: 'inherit' });

      await new Promise<void>((resolve, reject) => {
        installProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`${colors.green}✓ Bun installed successfully${colors.reset}`);
            resolve();
          } else {
            reject(new Error(`Bun installation failed with code ${code}`));
          }
        });
      });

      // Add Bun to current PATH for this session
      process.env.PATH = `${os.homedir()}/.bun/bin:${process.env.PATH}`;
    } else {
      throw new Error('Unsupported operating system. Please install Bun manually: https://bun.sh/docs/installation');
    }

    // Verify installation
    try {
      const { stdout } = await execAsync('bun --version');
      console.log(`${colors.green}✓ Verified Bun installation (version ${stdout.trim()})${colors.reset}`);
    } catch (verifyError) {
      throw new Error('Bun was installed but cannot be found in PATH. Please restart your terminal or add Bun to your PATH manually.');
    }
  }
}

/**
 * Validate required environment variables
 */
async function validateEnvironment() {
  console.log(`\n${colors.bright}Checking environment variables...${colors.reset}`);

  // Create .env file if it doesn't exist
  const envFilePath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envFilePath)) {
    envContent = fs.readFileSync(envFilePath, 'utf8');
    console.log(`${colors.green}✓ Found .env file${colors.reset}`);
  } else {
    console.log(`${colors.yellow}No .env file found. Creating one...${colors.reset}`);

    // If .env.example exists, copy it
    const envExamplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
    }
  }

  // Parse current env content
  const envVars: Record<string, string> = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match[1]) {
      envVars[match[1].trim()] = match[2] || '';
    }
  });

  // Required variables
  const requiredVars = [
    { key: 'NODE_ENV', default: 'development', description: 'Environment (development or production)' },
    { key: 'LOG_LEVEL', default: 'info', description: 'Logging level (debug, info, warn, error)' },
    { key: 'PORT', default: '3001', description: 'Port for the OAuth HTTP server' },
    { key: 'CLIO_CLIENT_ID', description: 'Clio API Client ID from developer portal' },
    { key: 'CLIO_CLIENT_SECRET', description: 'Clio API Client Secret from developer portal' },
    { key: 'CLIO_REDIRECT_URI', default: 'http://localhost:3001/clio/auth/callback', description: 'OAuth callback URL (must match Clio settings)' },
    { key: 'CLIO_API_REGION', default: 'us', description: 'Clio API region (us, ca, eu, au)' },
    { key: 'LANCEDB_DB_PATH', default: path.join(os.homedir(), '.legalcontext', 'lancedb'), description: 'Path to store LanceDB database files' },
    { key: 'SECRET_KEY', description: 'Secret key for encrypting stored tokens' },
    { key: 'MAX_DOCUMENTS', default: '100', description: 'Maximum number of documents for free tier' },
    { key: 'MAX_QUERIES_PER_DAY', default: '50', description: 'Maximum queries per day for free tier' }
  ];

  // Check and prompt for missing variables
  let envUpdated = false;

  for (const varInfo of requiredVars) {
    const { key, default: defaultValue, description } = varInfo;

    if (!envVars[key]) {
      console.log(`${colors.yellow}Missing ${key}${colors.reset} - ${description}`);

      // For sensitive info, don't show default and handle differently
      if (key === 'CLIO_CLIENT_ID' || key === 'CLIO_CLIENT_SECRET' || key === 'SECRET_KEY') {
        const value = await question(`Enter ${key}: `);
        if (value) {
          envVars[key] = value;
          envUpdated = true;
        } else if (key === 'SECRET_KEY') {
          // Generate a random secret key if not provided
          envVars[key] = Math.random().toString(36).substring(2, 15) +
                         Math.random().toString(36).substring(2, 15);
          console.log(`${colors.green}✓ Generated random SECRET_KEY${colors.reset}`);
          envUpdated = true;
        }
      } else if (defaultValue) {
        const value = await question(`Enter ${key} (default: ${defaultValue}): `);
        envVars[key] = value || defaultValue;
        envUpdated = true;
      } else {
        const value = await question(`Enter ${key}: `);
        if (value) {
          envVars[key] = value;
          envUpdated = true;
        }
      }
    }
  }

  // Save updated .env file if needed
  if (envUpdated) {
    const newEnvContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(envFilePath, newEnvContent);
    console.log(`${colors.green}✓ Updated .env file with new values${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ All required environment variables are set${colors.reset}`);
  }
}

/**
 * Setup OAuth with Clio
 */
async function setupClioOAuth() {
  console.log(`\n${colors.bright}Setting up OAuth with Clio...${colors.reset}`);

  // Load environment variables from .env file
  const envFilePath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envFilePath, 'utf8');
  const envVars: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match[1]) {
      envVars[match[1].trim()] = match[2] || '';
    }
  });

  // Show Clio configuration information
  console.log(`\n${colors.cyan}Clio API Configuration:${colors.reset}`);
  console.log(`• Client ID: ${envVars.CLIO_CLIENT_ID ? '****' + envVars.CLIO_CLIENT_ID.substring(envVars.CLIO_CLIENT_ID.length - 4) : 'Not set'}`);
  console.log(`• Redirect URI: ${envVars.CLIO_REDIRECT_URI || 'Not set'}`);
  console.log(`• API Region: ${envVars.CLIO_API_REGION || 'Not set'}`);

  // Instructions for registering the app with Clio
  console.log(`\n${colors.yellow}Make sure you have registered this application in the Clio Developer Portal:${colors.reset}`);
  console.log(`1. Go to: ${colors.cyan}https://app.clio.com/settings/developer_applications${colors.reset} (or your region-specific Clio URL)`);
  console.log(`2. Create a new application (if not done already)`);
  console.log(`3. Set the redirect URI to exactly: ${colors.cyan}${envVars.CLIO_REDIRECT_URI || 'http://localhost:3001/clio/auth/callback'}${colors.reset}`);
  console.log(`4. Copy the Client ID and Client Secret to your .env file`);

  // Ask if user wants to start OAuth flow now
  const startAuth = await question(`\nDo you want to start the OAuth authorization flow now? (y/n): `);

  if (startAuth.toLowerCase() === 'y' || startAuth.toLowerCase() === 'yes') {
    // Check if we have all required environment variables for OAuth
    if (!envVars.CLIO_CLIENT_ID || !envVars.CLIO_CLIENT_SECRET || !envVars.CLIO_REDIRECT_URI) {
      throw new Error('Missing required Clio API credentials in .env file');
    }

    // Start the server and open browser for auth
    console.log(`\n${colors.yellow}Starting OAuth server...${colors.reset}`);

    // Execute using Bun
    const port = envVars.PORT || '3001';
    const serverProcess = spawn('bun', ['run', 'src/server.ts'], { stdio: 'inherit' });

    // Wait a moment for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Open the browser to the auth URL
    const authUrl = `http://localhost:${port}/clio/auth`;
    console.log(`\n${colors.bright}Opening browser to authorize with Clio: ${colors.cyan}${authUrl}${colors.reset}`);

    // Open browser based on platform
    let openCommand;
    switch (process.platform) {
      case 'win32':
        openCommand = ['cmd', ['/c', `start "${authUrl}"`]];
        break;
      case 'darwin':
        openCommand = ['open', [authUrl]];
        break;
      default:
        openCommand = ['xdg-open', [authUrl]];
    }

    if (openCommand) {
      spawn(openCommand[0], openCommand[1] as string[], { stdio: 'ignore' });
    }

    // Wait for user to complete authorization
    await question(`\n${colors.yellow}Press Enter after completing the authorization process in your browser...${colors.reset}`);

    // Stop the server
    serverProcess.kill();

    console.log(`${colors.green}✓ OAuth setup completed${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Skipped OAuth authorization flow${colors.reset}`);
    console.log(`You can run the authorization flow later by starting the server with ${colors.cyan}bun start${colors.reset}`);
    console.log(`Then visit ${colors.cyan}http://localhost:${envVars.PORT || '3001'}/clio/auth${colors.reset}`);
  }
}

/**
 * Update Claude Desktop configuration
 */
async function updateClaudeConfig() {
  console.log(`\n${colors.bright}Setting up Claude Desktop configuration...${colors.reset}`);

  // Determine Claude Desktop config path based on platform
  let claudeConfigPath;
  const homedir = os.homedir();

  if (process.platform === 'win32') {
    claudeConfigPath = path.join(homedir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
  } else if (process.platform === 'darwin') {
    claudeConfigPath = path.join(homedir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    claudeConfigPath = path.join(homedir, '.config', 'Claude', 'claude_desktop_config.json');
  }

  // Get absolute path to project and bun executable
  const projectPath = process.cwd();
  let bunPath;

  try {
    const { stdout } = await execAsync('which bun');
    bunPath = stdout.trim();
  } catch (error) {
    if (process.platform === 'win32') {
      bunPath = path.join(homedir, '.bun', 'bin', 'bun.exe');
    } else {
      bunPath = path.join(homedir, '.bun', 'bin', 'bun');
    }
  }

  console.log(`${colors.cyan}Project path:${colors.reset} ${projectPath}`);
  console.log(`${colors.cyan}Bun path:${colors.reset} ${bunPath}`);
  console.log(`${colors.cyan}Claude config path:${colors.reset} ${claudeConfigPath}`);

  // Create Claude config directory if it doesn't exist
  const claudeConfigDir = path.dirname(claudeConfigPath);
  if (!fs.existsSync(claudeConfigDir)) {
    fs.mkdirSync(claudeConfigDir, { recursive: true });
    console.log(`${colors.green}✓ Created Claude config directory${colors.reset}`);
  }

  // Load or create Claude Desktop config
  let claudeConfig: any = { mcpServers: {} };

  if (fs.existsSync(claudeConfigPath)) {
    try {
      const configContent = fs.readFileSync(claudeConfigPath, 'utf8');
      claudeConfig = JSON.parse(configContent);
      console.log(`${colors.green}✓ Found existing Claude Desktop config${colors.reset}`);

      // Make sure mcpServers exists
      if (!claudeConfig.mcpServers) {
        claudeConfig.mcpServers = {};
      }
    } catch (error) {
      console.log(`${colors.yellow}Error reading Claude config, creating new one${colors.reset}`);
      claudeConfig = { mcpServers: {} };
    }
  } else {
    console.log(`${colors.yellow}No Claude Desktop config found, creating new one${colors.reset}`);
  }

  // Update Claude config with LegalContext server
  claudeConfig.mcpServers.legalcontext = {
    command: bunPath,
    args: [path.join(projectPath, 'src', 'server.ts')],
    cwd: projectPath
  };

  // Save updated Claude config
  fs.writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2));
  console.log(`${colors.green}✓ Updated Claude Desktop config with LegalContext server${colors.reset}`);
  console.log(`${colors.yellow}Note: You may need to restart Claude Desktop for changes to take effect${colors.reset}`);
}

// Run the setup
setup();
