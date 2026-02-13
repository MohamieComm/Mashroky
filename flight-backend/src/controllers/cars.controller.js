import * as carService from '../services/car-rental.service.js';
import { sendBookingEmail } from '../services/email.service.js';
import { escapeHtml } from '../utils/html-escape.js';

export async function searchCars(req, res, next) {
  try {
    const result = await carService.searchCars(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCarDetails(req, res, next) {
  try {
    const result = await carService.getCarDetails(req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookCar(req, res, next) {
  try {
    const { sendEmail, customerEmail, renter, ...rest } = req.body || {};
    const result = await carService.bookCar(rest);

    if (sendEmail) {
      const email = customerEmail || renter?.email || null;
      if (email) {
        const bookingRef = escapeHtml(result?.bookingId || result?.id || '');
        const carName = escapeHtml(rest?.carName || result?.carName || 'سيارة');
        const total = Number(rest?.payment?.amount || result?.total || 0);
        const currency = rest?.payment?.currency || result?.currency || 'SAR';
        await sendBookingEmail({
          to: email,
          subject: 'تأكيد حجز سيارة - مشروك',
          text: `تم تأكيد حجز السيارة بنجاح. السيارة: ${carName}. رقم الحجز: ${bookingRef}. الإجمالي: ${total} ${currency}.`,
          html: `
            <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
              <h2>تأكيد حجز سيارة - مشروك</h2>
              <p>تم تأكيد حجزك بنجاح.</p>
              <p><strong>السيارة:</strong> ${carName}</p>
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
