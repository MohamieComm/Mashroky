// ============================================================
// Amadeus OAuth2 Token Manager
// Handles client_credentials grant with automatic caching & refresh
// ============================================================

import { AmadeusConfig, AmadeusToken } from './types';

const TOKEN_BUFFER_SECONDS = 60; // refresh 60s before expiry

export class TokenManager {
  private config: AmadeusConfig;
  private token: AmadeusToken | null = null;

  constructor(config: AmadeusConfig) {
    this.config = config;
  }

  private get tokenUrl(): string {
    const base = this.config.baseUrl || 'https://test.api.amadeus.com';
    return `${base}/v1/security/oauth2/token`;
  }

  private isTokenValid(): boolean {
    if (!this.token) return false;
    const now = Date.now() / 1000;
    const expiresAt = this.token._fetched_at + this.token.expires_in - TOKEN_BUFFER_SECONDS;
    return now < expiresAt;
  }

  async getToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.token!.access_token;
    }
    return this.fetchToken();
  }

  private async fetchToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new AmadeusAuthError(`OAuth2 token request failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    this.token = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      _fetched_at: Date.now() / 1000,
    };

    return this.token.access_token;
  }

  /** Force clear cached token */
  invalidate(): void {
    this.token = null;
  }
}

export class AmadeusAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmadeusAuthError';
  }
}
