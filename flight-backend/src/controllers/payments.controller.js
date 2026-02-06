import { createMoyasarInvoice } from '../services/moyasar.service.js';
import { appBaseUrl } from '../config/env.config.js';

export async function createPayment(req, res, next) {
  try {
    const { amount, currency, description, bookingId, returnUrl } = req.body || {};
    const baseUrl = (returnUrl || appBaseUrl || '').replace(/\/$/, '');
    const backendBaseUrl =
      process.env.BACKEND_BASE_URL ||
      `${req.protocol}://${req.get('host')}`;

    const invoice = await createMoyasarInvoice({
      amount,
      currency,
      description,
      successUrl: `${baseUrl}/cart?payment=success`,
      backUrl: `${baseUrl}/cart?payment=cancelled`,
      callbackUrl: `${backendBaseUrl}/api/payments/webhook`,
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
  // Moyasar sends payment events here; keep a 200 OK so it doesn't retry.
  res.json({ ok: true });
}
