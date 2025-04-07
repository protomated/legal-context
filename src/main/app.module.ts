// src/main/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { McpModule } from '../mcp/mcp.module';
import configuration from '../config/configuration';

/**
 * Main application module that integrates all components of the LegalContext server.
 */
@Module({
  imports: [
    // Global config module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // MCP module for Claude Desktop integration
    McpModule,
  ],
})
export class AppModule {}