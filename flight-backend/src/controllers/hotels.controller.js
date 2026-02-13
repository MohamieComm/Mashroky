import * as hotelService from '../services/hotel.service.js';
import { sendBookingEmail } from '../services/email.service.js';
import { escapeHtml } from '../utils/html-escape.js';

export async function searchHotels(req, res, next) {
  try {
    const result = await hotelService.searchHotels(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getHotelDetails(req, res, next) {
  try {
    const result = await hotelService.getHotelDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookHotel(req, res, next) {
  try {
    const { sendEmail, customerEmail, guests, ...rest } = req.body || {};
    const result = await hotelService.bookHotel(rest);

    if (sendEmail) {
      const email = customerEmail || guests?.email || null;
      if (email) {
        const bookingRef = escapeHtml(result?.bookingId || result?.id || '');
        const hotelName = escapeHtml(rest?.hotelName || result?.hotelName || 'فندق');
        const total = Number(rest?.payment?.amount || result?.total || 0);
        const currency = rest?.payment?.currency || result?.currency || 'SAR';
        await sendBookingEmail({
          to: email,
          subject: 'تأكيد حجز فندق - مشروك',
          text: `تم تأكيد حجز الفندق بنجاح. الفندق: ${hotelName}. رقم الحجز: ${bookingRef}. الإجمالي: ${total} ${currency}.`,
          html: `
            <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
              <h2>تأكيد حجز فندق - مشروك</h2>
              <p>تم تأكيد حجزك بنجاح.</p>
              <p><strong>الفندق:</strong> ${hotelName}</p>
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
