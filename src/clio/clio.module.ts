// src/clio/clio.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthToken } from '../database/entities/oauth-token.entity';
import { ClioAuthService } from './auth/clio-auth.service';
import { ClioDocumentService } from './api/clio-document.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([OAuthToken]),
  ],
  providers: [
    ClioAuthService,
    ClioDocumentService,
  ],
  exports: [
    ClioAuthService,
    ClioDocumentService,
  ],
})
export class ClioModule {}
