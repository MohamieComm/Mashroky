import * as transfersService from '../services/transfers.service.js';
import { sendBookingEmail } from '../services/email.service.js';
import { escapeHtml } from '../utils/html-escape.js';

export async function searchTransfers(req, res, next) {
  try {
    const result = await transfersService.searchTransfers(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTransferDetails(req, res, next) {
  try {
    const result = await transfersService.getTransferDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookTransfer(req, res, next) {
  try {
    const { sendEmail, customerEmail, passenger, ...rest } = req.body || {};
    const result = await transfersService.bookTransfer(rest);

    if (sendEmail) {
      const email = customerEmail || passenger?.email || null;
      if (email) {
        const bookingRef = escapeHtml(result?.bookingId || result?.id || '');
        const transferName = escapeHtml(rest?.transferName || result?.transferName || 'نقل');
        const total = Number(rest?.payment?.amount || result?.total || 0);
        const currency = rest?.payment?.currency || result?.currency || 'SAR';
        await sendBookingEmail({
          to: email,
          subject: 'تأكيد حجز نقل - مشروك',
          text: `تم تأكيد حجز النقل بنجاح. الخدمة: ${transferName}. رقم الحجز: ${bookingRef}. الإجمالي: ${total} ${currency}.`,
          html: `
            <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
              <h2>تأكيد حجز نقل - مشروك</h2>
              <p>تم تأكيد حجزك بنجاح.</p>
              <p><strong>الخدمة:</strong> ${transferName}</p>
              <p><strong>رقم الحجز:</strong> ${bookingRef}</p>
              <p><strong>الإجمالي:</strong> ${total} ${currency}</p>
              <p>شكراً لاختيارك مشروك.</p>
            </div>
          `,
        });
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}
