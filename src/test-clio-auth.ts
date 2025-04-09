// src/test-clio-auth.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ClioAuthService } from './clio/auth/clio-auth.service';

/**
 * Test script to verify Clio authentication
 */
async function testClioAuth() {
  const logger = new Logger('Clio Auth Test');

  logger.log('Starting Clio OAuth test');

  // Create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Get Clio auth service
  const clioAuthService = app.get(ClioAuthService);

  try {
    // Attempt to get a valid access token
    logger.log('Attempting to get a valid access token');
    const accessToken = await clioAuthService.getValidAccessToken();
    
    logger.log('=== SUCCESS ===');
    logger.log('Successfully retrieved a valid access token');
    logger.log(`Token: ${accessToken.substring(0, 10)}...`);
    
    // Clean up and exit
    await app.close();
    logger.log('Test completed successfully');
  } catch (error) {
    logger.error(`=== FAILED ===`);
    logger.error(`Failed to get a valid access token: ${error.message}`);
    
    // Suggest using setup script
    logger.log('You may need to run the setup script first:');
    logger.log('  bun run setup:clio');
    
    // Clean up and exit
    await app.close();
    logger.error('Test failed');
    process.exit(1);
  }
}

// Run the test
testClioAuth().catch(error => {
  console.error('Unhandled error during test:', error);
  process.exit(1);
});
