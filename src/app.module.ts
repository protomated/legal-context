import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from './mcp/mcp.module';
import { ClioModule } from './clio/clio.module';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';
import { configValidationSchema } from './config/validation.schema';

/**
 * Main application module that integrates all components of the LegalContext server.
 */
@Module({
  imports: [
    // Global config module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Database module
    DatabaseModule,

    // MCP module for Claude Desktop integration
    McpModule,

    // Clio integration module
    ClioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
