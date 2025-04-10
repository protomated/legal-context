import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthToken } from '../database/entities/oauth-token.entity';
import { ClioAuthService } from './auth/clio-auth.service';
import { ClioAuthController } from './auth/clio-auth.controller';
import { ClioDocumentService } from './api/clio-document.service';
import { ClioDocumentMetadataService } from './api/clio-document-metadata.service';
import { ClioDocumentBatchService } from './api/clio-document-batch.service';

/**
 * Clio integration module
 * Provides services for interacting with the Clio API
 */
@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([OAuthToken]),
  ],
  controllers: [ClioAuthController],
  providers: [
    ClioAuthService, 
    ClioDocumentService,
    ClioDocumentMetadataService,
    ClioDocumentBatchService
  ],
  exports: [
    ClioAuthService, 
    ClioDocumentService,
    ClioDocumentMetadataService,
    ClioDocumentBatchService
  ],
})
export class ClioModule {}
