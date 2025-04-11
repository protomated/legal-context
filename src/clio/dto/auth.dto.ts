export class TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope?: string;
  created_at?: number;
}

export class AuthorizationRequestDto {
  state: string;
  code_verifier: string;
  code_challenge: string;
  code_challenge_method: string;
  created_at: Date;
  expires_at: Date;
}

export class AuthorizationResponseDto {
  code: string;
  state: string;
}

export class TokenRequestDto {
  grant_type: 'authorization_code' | 'refresh_token';
  code?: string;
  refresh_token?: string;
  redirect_uri?: string;
  code_verifier?: string;
  client_id: string;
  client_secret: string;
}
