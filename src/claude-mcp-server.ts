#!/usr/bin/env bun
/**
 * Entry point script for Claude Desktop integration
 * This script starts the MCP server with stdio transport for Claude Desktop
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application with Claude Desktop
 */
async function bootstrap() {
  const logger = new Logger('ClaudeDesktop');
  
  try {
    logger.log('Initializing LegalContext MCP server for Claude Desktop...');
    
    // Create NestJS application with minimal logging to avoid cluttering stdio
    // which is used for MCP communication
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn'],
      // Disable stdout/stderr buffering for direct communication
      bufferLogs: false,
    });
    
    // Initialize the application
    await app.init();
    
    logger.log('LegalContext MCP server initialized successfully');
    
    // Handle shutdown signal
    process.on('SIGINT', async () => {
      logger.log('Shutting down LegalContext MCP server...');
      await app.close();
      process.exit(0);
    });

    // Don't exit the process, keep it running for stdio communication
  } catch (error) {
    // Log to stderr to not interfere with MCP protocol on stdout
    console.error(`Failed to initialize LegalContext MCP server: ${error.message}`);
    process.exit(1);
  }
}

// Start the application
bootstrap();
