import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthToken } from '../database/entities/oauth-token.entity';
import { ClioAuthService } from './auth/clio-auth.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([OAuthToken]),
  ],
  providers: [
    ClioAuthService,
  ],
  exports: [
    ClioAuthService,
  ],
})
export class ClioModule {}
