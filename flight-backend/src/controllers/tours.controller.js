import * as toursService from '../services/tours.service.js';
import { sendBookingEmail } from '../services/email.service.js';
import { escapeHtml } from '../utils/html-escape.js';

export async function searchTours(req, res, next) {
  try {
    const result = await toursService.searchTours(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTourDetails(req, res, next) {
  try {
    const result = await toursService.getTourDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookTour(req, res, next) {
  try {
    const { sendEmail, customerEmail, travelers, ...rest } = req.body || {};
    const result = await toursService.bookTour(rest);

    if (sendEmail) {
      const email = customerEmail || travelers?.email || null;
      if (email) {
        const bookingRef = escapeHtml(result?.bookingId || result?.id || '');
        const tourName = escapeHtml(rest?.tourName || result?.tourName || 'جولة');
        const total = Number(rest?.payment?.amount || result?.total || 0);
        const currency = rest?.payment?.currency || result?.currency || 'SAR';
        await sendBookingEmail({
          to: email,
          subject: 'تأكيد حجز جولة - مشروك',
          text: `تم تأكيد حجز الجولة بنجاح. الجولة: ${tourName}. رقم الحجز: ${bookingRef}. الإجمالي: ${total} ${currency}.`,
          html: `
            <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
              <h2>تأكيد حجز جولة - مشروك</h2>
              <p>تم تأكيد حجزك بنجاح.</p>
              <p><strong>الجولة:</strong> ${tourName}</p>
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
