// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Document } from './entities/document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import { DocumentVector } from './entities/document-vector.entity';
import { OAuthToken } from './entities/oauth-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [Document, DocumentChunk, DocumentVector, OAuthToken],
        synchronize: configService.get('environment') === 'development',
        ssl: configService.get('environment') === 'production',
      }),
    }),
    TypeOrmModule.forFeature([Document, DocumentChunk, DocumentVector, OAuthToken]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
