import axios from 'axios';
import { moyasarEnv } from '../config/env.config.js';
import { getApiKeyValue } from './api-keys.service.js';

const MOYASAR_BASE_URL = process.env.MOYASAR_BASE_URL || 'https://api.moyasar.com/v1';

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

  const response = await axios.post(`${MOYASAR_BASE_URL}/invoices`, payload, {
    auth: { username: secretKey, password: '' },
  });

  return response.data;
}
