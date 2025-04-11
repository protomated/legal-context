#!/usr/bin/env bun
/**
 * LegalContext Full Integration Test Script
 * 
 * This script tests the complete LegalContext integration by:
 * 1. Testing Clio authentication
 * 2. Testing document access
 * 3. Testing MCP server functionality
 * 
 * This gives a comprehensive view of whether the system is ready for Claude Desktop.
 */

import { spawn } from 'child_process';
import { resolve } from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Constants
const TEST_TIMEOUT = 60000; // 60 seconds total test timeout
const COMPONENT_TIMEOUT = 20000; // 20 seconds for each component test

// Log message with timestamp
function log(message) {
  const timestamp = new Date().toISOString().substring(11, 19);
  console.log(`[${timestamp}] ${message}`);
}

// Check if config file exists
function checkClaudeConfig() {
  let configPath;
  
  switch (os.platform()) {
    case 'win32':
      configPath = process.env.APPDATA + '\\Claude\\claude-config.json';
      break;
    case 'darwin':
      configPath = os.homedir() + '/Library/Application Support/Claude/claude-config.json';
      break;
    default: // linux and others
      configPath = os.homedir() + '/.config/Claude/claude-config.json';
      break;
  }
  
  log(`Checking for Claude Desktop config at: ${configPath}`);
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      if (config.mcpServers && config.mcpServers.legalcontext) {
        log('Found LegalContext configuration in Claude Desktop config!');
        return true;
      } else {
        log('Claude Desktop config exists but does not contain LegalContext configuration.');
        return false;
      }
    } else {
      log('Claude Desktop config file not found.');
      return false;
    }
  } catch (error) {
    log(`Error checking Claude config: ${error.message}`);
    return false;
  }
}

// Run a test command
async function runTest(command, args, name, successMessage) {
  return new Promise((resolve) => {
    log(`Running ${name} test...`);
    
    const proc = spawn(command, args, {
      stdio: 'pipe',
    });
    
    let output = '';
    let success = false;
    const timeout = setTimeout(() => {
      log(`${name} test timed out after ${COMPONENT_TIMEOUT/1000} seconds.`);
      proc.kill();
      resolve({ success: false, output });
    }, COMPONENT_TIMEOUT);
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Try to determine success based on output
      if (text.includes(successMessage)) {
        success = true;
      }
    });
    
    proc.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    proc.on('close', (code) => {
      clearTimeout(timeout);
      log(`${name} test completed with code ${code}`);
      
      if (code === 0 || success) {
        log(`${name} test PASSED.`);
        resolve({ success: true, output });
      } else {
        log(`${name} test FAILED.`);
        resolve({ success: false, output });
      }
    });
  });
}

// Run the full integration test
async function runFullIntegrationTest() {
  log('Starting LegalContext full integration test...');
  
  const results = {
    clioAuth: false,
    mcpServer: false,
    claudeConfig: false,
    overallSuccess: false
  };
  
  // Step 1: Check Claude Desktop config
  results.claudeConfig = checkClaudeConfig();
  
  // Step 2: Test MCP server
  const mcpTest = await runTest('bun', ['scripts/test-mcp-server.js'], 'MCP Server', 'MCP server connected successfully');
  results.mcpServer = mcpTest.success;
  
  // Step 3: Test Clio auth (this one is potentially destructive so we run it last)
  // We only check if test:clio:auth exists and is executable, not actually running it
  try {
    const authScript = resolve('./src/scripts/test-clio-auth.ts');
    const authStats = fs.statSync(authScript);
    const isExecutable = !!(authStats.mode & 0o111);
    
    log(`Clio auth script exists at ${authScript} and is ${isExecutable ? 'executable' : 'not executable'}`);
    
    // Try to run a less destructive test to check auth status
    const clioStatusTest = await runTest('bun', ['run', 'src/scripts/test-clio-documents.ts'], 'Clio Documents', 'Successfully authenticated with Clio');
    
    results.clioAuth = clioStatusTest.success;
    
    if (!results.clioAuth) {
      log('Clio authentication test failed. You may need to run:');
      log('  bun run test:clio:auth');
      log('to authenticate with Clio.');
    }
  } catch (error) {
    log(`Error checking Clio auth script: ${error.message}`);
    results.clioAuth = false;
  }
  
  // Calculate overall success
  results.overallSuccess = results.mcpServer && (results.clioAuth || results.claudeConfig);
  
  // Display final results
  log('\n=== INTEGRATION TEST RESULTS ===');
  log(`Clio Authentication: ${results.clioAuth ? 'PASS' : 'FAIL'}`);
  log(`MCP Server: ${results.mcpServer ? 'PASS' : 'FAIL'}`);
  log(`Claude Desktop Config: ${results.claudeConfig ? 'PRESENT' : 'MISSING'}`);
  log(`Overall Status: ${results.overallSuccess ? 'READY' : 'NOT READY'} for Claude Desktop integration`);
  
  if (!results.overallSuccess) {
    log('\nSome components are not ready. Please fix the issues before using with Claude Desktop.');
    
    if (!results.clioAuth) {
      log('- Run Clio authentication setup: bun run test:clio:auth');
    }
    
    if (!results.mcpServer) {
      log('- Fix MCP server issues - check src/claude-mcp-server.ts and dependencies');
    }
    
    if (!results.claudeConfig) {
      log('- Create Claude Desktop configuration file - see docs/claude-desktop-integration.md');
      log(`- You can use examples/claude-config.json as a starting point`);
    }
  } else {
    log('\nAll required components are ready for Claude Desktop integration!');
    log('Instructions for connecting Claude Desktop:');
    log('1. Open Claude Desktop');
    log('2. Start a new conversation');
    log('3. Select "legalcontext" from the server dropdown in the lower right');
    log('4. Try a sample query like "What document resources are available?"');
  }
  
  return results.overallSuccess;
}

// Run the test
runFullIntegrationTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log(`Unhandled error: ${error.message}`);
  process.exit(1);
});
