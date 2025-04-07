import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Document } from './entities/document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { DocumentVector } from './entities/document-vector.entity';
import { OAuthToken } from './entities/oauth-token.entity';

/**
 * Database module for entity management
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [Document, DocumentChunk, DocumentVector, OAuthToken],
        synchronize: configService.get('environment') !== 'production',
        logging: configService.get('environment') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Document, DocumentChunk, DocumentVector, OAuthToken]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
