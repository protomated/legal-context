// src/clio/dto/auth.dto.ts
export class TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}
