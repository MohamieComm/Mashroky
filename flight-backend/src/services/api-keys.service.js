import { getServiceClient } from './supabase.service.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { ts: 0, data: null };

const isCacheValid = () => cache.data && Date.now() - cache.ts < CACHE_TTL_MS;

const normalize = (value) => String(value || '').trim().toLowerCase();

export async function listEnabledApiKeys() {
  if (isCacheValid()) return cache.data;
  const client = getServiceClient();
  if (!client) {
    cache = { ts: Date.now(), data: [] };
    return [];
  }
  const { data, error } = await client
    .from('api_keys')
    .select('id, name, provider, key, base_url, status');
  if (error) {
    cache = { ts: Date.now(), data: [] };
    return [];
  }
  const enabled = (data || []).filter((row) => normalize(row.status) === 'enabled');
  cache = { ts: Date.now(), data: enabled };
  return enabled;
}

export async function getApiKeyValue(provider, name) {
  const keys = await listEnabledApiKeys();
  const targetProvider = normalize(provider);
  const targetName = normalize(name);
  const match = keys.find(
    (row) => normalize(row.provider) === targetProvider && normalize(row.name) === targetName
  );
  return match?.key ? String(match.key) : '';
}

export async function getApiBaseUrl(provider) {
  const keys = await listEnabledApiKeys();
  const targetProvider = normalize(provider);
  const direct = keys.find(
    (row) => normalize(row.provider) === targetProvider && row.base_url
  );
  if (direct?.base_url) return String(direct.base_url);
  const fallback = keys.find(
    (row) =>
      normalize(row.provider) === targetProvider &&
      normalize(row.name) === 'base_url' &&
      row.key
  );
  return fallback?.key ? String(fallback.key) : '';
}
