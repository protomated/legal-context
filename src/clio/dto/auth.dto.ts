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
}

export class AuthorizationResponseDto {
  code: string;
  state: string;
}
