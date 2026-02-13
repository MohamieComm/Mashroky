import axios from 'axios';
import { moyasarEnv } from '../config/env.config.js';
import { getApiKeyValue, getApiBaseUrl } from './api-keys.service.js';

const DEFAULT_MOYASAR_BASE = 'https://api.moyasar.com/v1';

async function resolveMoyasarBaseUrl() {
  const explicit = String(process.env.MOYASAR_BASE_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');
  try {
    const fromAdmin = await getApiBaseUrl('moyasar');
    if (fromAdmin) return String(fromAdmin).trim().replace(/\/$/, '');
  } catch {
    // ignore
  }
  return DEFAULT_MOYASAR_BASE;
}

const normalizeAmount = (amount) => {
  const numeric = Number(String(amount).replace(/[^\d.]/g, '')) || 0;
  return Math.max(Math.round(numeric * 100), 0);
};

export function createMockMoyasarPayment({ amount, currency = 'SAR' }) {
  const paymentId = `pay_${Date.now()}`;
  return {
    provider: 'moyasar',
    paymentId,
    currency,
    amount: Number(amount || 0),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    paidAt: null,
  };
}

export async function createMoyasarInvoice({
  amount,
  currency = 'SAR',
  description,
  successUrl,
  backUrl,
  callbackUrl,
  metadata,
}) {
  let secretKey = moyasarEnv.secretKey || '';
  try {
    if (!secretKey) {
      // try admin-managed api_keys table: provider=moyasar name=secret_key
      secretKey = await getApiKeyValue('moyasar', 'secret_key');
    }
  } catch (e) {
    // ignore lookup errors — we'll handle missing key below
  }

  if (!secretKey) {
    throw new Error('moyasar_not_configured');
  }
  const payload = {
    amount: normalizeAmount(amount),
    currency,
    description,
    success_url: successUrl,
    back_url: backUrl,
    callback_url: callbackUrl,
    metadata,
  };
  const base = await resolveMoyasarBaseUrl();
  const url = `${base.replace(/\/$/, '')}/invoices`;

  const response = await axios.post(url, payload, {
    auth: { username: secretKey, password: '' },
    timeout: 15000,
  });

  return response.data;
}
