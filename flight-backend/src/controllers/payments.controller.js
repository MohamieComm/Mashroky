import { createMoyasarInvoice } from '../services/moyasar.service.js';
import { upsertPaymentStatus } from '../services/supabase.service.js';
import { appBaseUrl, backendBaseUrl, moyasarEnv, allowedOrigins } from '../config/env.config.js';

const isValidCurrency = (value) => /^[A-Z]{3}$/.test(String(value || '').trim());

const normalizeBaseUrl = (value, fallback) => {
  const rawValue = String(value || '').trim();
  const rawFallback = String(fallback || '').trim();
  const toOrigin = (url) => `${url.protocol}//${url.host}`;

  if (rawValue) {
    try {
      const direct = new URL(rawValue);
      if (['http:', 'https:'].includes(direct.protocol)) return toOrigin(direct);
    } catch {
      // not an absolute URL; fall back to base handling
    }
  }

  if (!rawFallback) return '';

  try {
    const base = new URL(rawFallback);
    const target = rawValue ? new URL(rawValue, base) : base;
    if (!['http:', 'https:'].includes(target.protocol)) return toOrigin(base);
    if (target.host !== base.host) return toOrigin(base);
    return toOrigin(target);
  } catch {
    return rawFallback;
  }
};

const resolveBackendBaseUrl = (req) => {
  if (backendBaseUrl) return backendBaseUrl.replace(/\/$/, '');
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  const rawHost = forwardedHost || req.get('host') || '';
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'https';
  if (!rawHost) return '';
  const allowedHosts = (allowedOrigins || [])
    .map((origin) => {
      try {
        return new URL(origin).host;
      } catch {
        return '';
      }
    })
    .filter(Boolean);
  if (allowedHosts.length && !allowedHosts.includes(rawHost)) return '';
  return `${protocol}://${rawHost}`.replace(/\/$/, '');
};

export async function createPayment(req, res, next) {
  try {
    const { amount, currency, description, bookingId, returnUrl } = req.body || {};
    const rawAmount = Number(String(amount || '').replace(/[^\d.]/g, ''));
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({ error: 'invalid_amount' });
    }
    if (currency && !isValidCurrency(currency)) {
      return res.status(400).json({ error: 'invalid_currency' });
    }

    const baseUrl = normalizeBaseUrl(returnUrl, appBaseUrl || '').replace(/\/$/, '');
    const backendUrl = resolveBackendBaseUrl(req);
    if (!backendUrl) {
      return res.status(500).json({ error: 'backend_base_url_not_configured' });
    }

    const invoice = await createMoyasarInvoice({
      amount: rawAmount,
      currency,
      description,
      successUrl: `${baseUrl}/payments?payment=success`,
      backUrl: `${baseUrl}/payments?payment=cancelled`,
      callbackUrl: `${backendUrl}/api/payments/webhook`,
      metadata: bookingId ? { bookingId } : undefined,
    });

    res.json({
      provider: 'moyasar',
      invoice,
      paymentUrl: invoice?.url || invoice?.payment_url || null,
    });
  } catch (err) {
    if (err?.message === 'moyasar_not_configured') {
      res.status(500).json({ error: 'moyasar_not_configured' });
      return;
    }
    next(err);
  }
}

export async function handleWebhook(req, res) {
  const expectedSecret = String(moyasarEnv.webhookSecret || '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (!expectedSecret) {
      return res.status(500).json({ error: 'webhook_secret_not_configured' });
    }
    if (req.body?.secret_token !== expectedSecret) {
      return res.status(401).json({ error: 'invalid_webhook_secret' });
    }
  } else if (expectedSecret && req.body?.secret_token !== expectedSecret) {
    return res.status(401).json({ error: 'invalid_webhook_secret' });
  }
  try {
    const payload = req.body || {};
    const payment = payload.data || {};
    const providerPaymentId = payment.id || payload.payment_id || null;
    if (providerPaymentId) {
      await upsertPaymentStatus({
        provider: 'moyasar',
        provider_payment_id: providerPaymentId,
        provider_event_id: payload.id || null,
        event_type: payload.type || null,
        status: payment.status || null,
        amount: typeof payment.amount === 'number' ? payment.amount : null,
        currency: payment.currency || null,
        live: typeof payload.live === 'boolean' ? payload.live : null,
        account_name: payload.account_name || null,
        metadata: payment.metadata || null,
        raw: payload,
        event_created_at: payload.created_at || null,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: 'webhook_storage_failed' });
  }
  // Moyasar sends payment events here; keep a 200 OK so it doesn't retry.
  res.json({ ok: true });
}
