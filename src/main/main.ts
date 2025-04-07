import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('Initializing LegalContext server...');
    
    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    // Start the application
    // Note: Since we're using stdio for MCP communication,
    // we don't need to actually listen on a port
    await app.init();
    
    logger.log('LegalContext server initialized successfully');
    
    // Keep the application running
    process.on('SIGINT', async () => {
      logger.log('Shutting down LegalContext server...');
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Failed to initialize LegalContext server: ${error.message}`, error.stack);
    process.exit(1);
  }
}

// Start the application
bootstrap();
