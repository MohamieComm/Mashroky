import axios from 'axios';
import { getApiBaseUrl, getApiKeyValue } from './api-keys.service.js';
import { logAmadeusError } from '../utils/amadeus-logger.js';

const DEFAULT_BASE = '';

const resolveConfig = async () => {
  const baseUrl = String(process.env.SAMSUNG_BASE_URL || '').trim() || (await getApiBaseUrl('samsung')) || DEFAULT_BASE;
  const apiKey = String(process.env.SAMSUNG_API_KEY || '').trim() || (await getApiKeyValue('samsung', 'api_key')) || '';
  return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey };
};

export async function pingSamsung() {
  const cfg = await resolveConfig();
  if (!cfg.baseUrl) {
    const err = new Error('samsung_not_configured');
    err.status = 500;
    throw err;
  }
  try {
    const res = await axios.get(cfg.baseUrl + '/ping', {
      headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {},
      timeout: 8000,
    });
    return res?.data || { ok: true };
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('samsung_ping_error', { error: payload });
    const err = new Error('samsung_ping_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    throw err;
  }
}

export default { pingSamsung };
