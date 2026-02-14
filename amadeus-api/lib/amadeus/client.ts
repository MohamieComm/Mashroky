// ============================================================
// Amadeus Base HTTP Client
// Wraps fetch with auth, error handling, retries, rate limiting
// ============================================================

import { TokenManager, AmadeusAuthError } from './token-manager';
import { AmadeusConfig, AmadeusResponse, AmadeusCollectionResponse, Issue } from './types';

const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export class AmadeusApiError extends Error {
  status: number;
  errors: Issue[];

  constructor(status: number, errors: Issue[]) {
    const msg = errors.map(e => `[${e.code}] ${e.title}: ${e.detail ?? ''}`).join('; ');
    super(`Amadeus API Error (${status}): ${msg}`);
    this.name = 'AmadeusApiError';
    this.status = status;
    this.errors = errors;
  }
}

export class AmadeusClient {
  private tokenManager: TokenManager;
  private baseUrl: string;
  private timeout: number;

  constructor(config: AmadeusConfig) {
    this.baseUrl = config.baseUrl || 'https://test.api.amadeus.com';
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.tokenManager = new TokenManager(config);
  }

  // ── GET ─────────────────────────────────────────────────────

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | string[] | number[] | undefined>,
    version?: string,
  ): Promise<AmadeusResponse<T> | AmadeusCollectionResponse<T>> {
    const url = this.buildUrl(path, params, version);
    return this.request<T>('GET', url);
  }

  // ── POST ────────────────────────────────────────────────────

  async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>,
    version?: string,
  ): Promise<AmadeusResponse<T> | AmadeusCollectionResponse<T>> {
    const url = this.buildUrl(path, params, version);
    return this.request<T>('POST', url, body);
  }

  // ── POST-as-GET (X-HTTP-Method-Override) ────────────────────

  async postAsGet<T>(
    path: string,
    body: unknown,
    params?: Record<string, string | number | boolean | undefined>,
    version?: string,
  ): Promise<AmadeusResponse<T> | AmadeusCollectionResponse<T>> {
    const url = this.buildUrl(path, params, version);
    return this.request<T>('POST', url, body, {
      'X-HTTP-Method-Override': 'GET',
    });
  }

  // ── DELETE ──────────────────────────────────────────────────

  async delete<T>(
    path: string,
    version?: string,
  ): Promise<AmadeusResponse<T>> {
    const url = this.buildUrl(path, undefined, version);
    return this.request<T>('DELETE', url);
  }

  // ── Internal ────────────────────────────────────────────────

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | string[] | number[] | undefined>,
    version?: string,
  ): string {
    const versionPrefix = version || '';
    const fullPath = path.startsWith('/') ? `${versionPrefix}${path}` : `${versionPrefix}/${path}`;
    const url = new URL(fullPath, this.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
    attempt = 0,
  ): Promise<any> {
    const token = await this.tokenManager.getToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.amadeus+json, application/json',
      ...extraHeaders,
    };

    if (body) {
      headers['Content-Type'] = 'application/vnd.amadeus+json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Rate-limited → retry
      if (res.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
        await sleep(retryAfter * 1000);
        return this.request<T>(method, url, body, extraHeaders, attempt + 1);
      }

      // Server error → retry
      if (res.status >= 500 && attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        return this.request<T>(method, url, body, extraHeaders, attempt + 1);
      }

      // Token expired → re-auth once
      if (res.status === 401 && attempt === 0) {
        this.tokenManager.invalidate();
        return this.request<T>(method, url, body, extraHeaders, 1);
      }

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const errors: Issue[] = json?.errors || [
          { status: res.status, code: res.status, title: res.statusText, detail: '' },
        ];
        throw new AmadeusApiError(res.status, errors);
      }

      return json;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof AmadeusApiError || err instanceof AmadeusAuthError) throw err;

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(`Amadeus API request timed out after ${this.timeout}ms: ${method} ${url}`);
      }

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        return this.request<T>(method, url, body, extraHeaders, attempt + 1);
      }

      throw err;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
