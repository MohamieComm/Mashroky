import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generate a booking invoice PDF buffer.
 * @param {Object} booking - Booking data
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateBookingInvoice(booking = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `فاتورة حجز - ${booking.bookingReference || 'N/A'}`,
          Author: 'مشروك - Mashrok',
          Subject: 'فاتورة حجز',
        },
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const primary = '#1a56db';
      const textColor = '#1f2937';
      const mutedColor = '#6b7280';
      const lineColor = '#e5e7eb';

      // Header
      doc
        .fontSize(24)
        .fillColor(primary)
        .text('MASHROK', 50, 50, { align: 'right' })
        .fontSize(10)
        .fillColor(mutedColor)
        .text('www.mashrok.online', { align: 'right' })
        .text('منصة حجز متكاملة', { align: 'right' });

      // Invoice title
      doc
        .moveDown(2)
        .fontSize(20)
        .fillColor(textColor)
        .text('فاتورة حجز', { align: 'right' });

      // Divider
      doc
        .moveDown(0.5)
        .strokeColor(lineColor)
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      // Booking details
      const detailsY = doc.y + 20;
      const labelX = 350;
      const valueX = 50;
      let currentY = detailsY;

      const addRow = (label, value) => {
        doc
          .fontSize(11)
          .fillColor(mutedColor)
          .text(label, labelX, currentY, { width: 195, align: 'right' })
          .fillColor(textColor)
          .text(String(value || '-'), valueX, currentY, { width: 290, align: 'right' });
        currentY += 22;
      };

      addRow('رقم الحجز', booking.bookingReference || booking.id || '-');
      addRow('تاريخ الحجز', booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }));
      addRow('نوع الخدمة', typeLabel(booking.type));
      addRow('الحالة', statusLabel(booking.status));

      if (booking.tripType) addRow('نوع الرحلة', booking.tripType === 'roundtrip' ? 'ذهاب وعودة' : 'ذهاب فقط');
      if (booking.summary?.outbound) addRow('رحلة الذهاب', booking.summary.outbound);
      if (booking.summary?.inbound) addRow('رحلة العودة', booking.summary.inbound);
      if (booking.travelersCount) addRow('عدد المسافرين', booking.travelersCount);
      if (booking.email) addRow('البريد الإلكتروني', booking.email);

      // Divider
      currentY += 10;
      doc
        .strokeColor(lineColor)
        .moveTo(50, currentY)
        .lineTo(545, currentY)
        .stroke();
      currentY += 15;

      // Items table
      if (Array.isArray(booking.items) && booking.items.length > 0) {
        doc
          .fontSize(13)
          .fillColor(primary)
          .text('تفاصيل الطلب', 50, currentY, { align: 'right' });
        currentY += 25;

        // Table header
        doc
          .fontSize(10)
          .fillColor(mutedColor)
          .text('السعر', 50, currentY, { width: 100, align: 'right' })
          .text('الكمية', 160, currentY, { width: 60, align: 'right' })
          .text('الخدمة', 230, currentY, { width: 315, align: 'right' });
        currentY += 18;

        doc.strokeColor(lineColor).moveTo(50, currentY).lineTo(545, currentY).stroke();
        currentY += 8;

        for (const item of booking.items) {
          doc
            .fontSize(10)
            .fillColor(textColor)
            .text(`${Number(item.price || 0).toLocaleString()} ${booking.currency || 'SAR'}`, 50, currentY, {
              width: 100,
              align: 'right',
            })
            .text(String(item.quantity || 1), 160, currentY, { width: 60, align: 'right' })
            .text(item.title || item.name || '-', 230, currentY, { width: 315, align: 'right' });
          currentY += 20;
        }
      }

      // Total
      currentY += 10;
      doc.strokeColor(primary).lineWidth(2).moveTo(50, currentY).lineTo(545, currentY).stroke();
      currentY += 15;

      doc
        .fontSize(14)
        .fillColor(primary)
        .text('الإجمالي', labelX, currentY, { width: 195, align: 'right' })
        .fontSize(16)
        .fillColor(textColor)
        .text(
          `${Number(booking.total || 0).toLocaleString()} ${booking.currency || 'SAR'}`,
          valueX,
          currentY,
          { width: 290, align: 'right' }
        );

      // Footer
      const footerY = 750;
      doc
        .fontSize(8)
        .fillColor(mutedColor)
        .text('هذه الفاتورة صادرة إلكترونيًا عبر منصة مشروك ولا تتطلب توقيعًا.', 50, footerY, {
          align: 'center',
          width: 495,
        })
        .text('www.mashrok.online | support@mashrok.online', 50, footerY + 12, {
          align: 'center',
          width: 495,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function typeLabel(type) {
  const labels = {
    flight: 'طيران',
    hotel: 'فندق',
    car: 'سيارة',
    tour: 'جولة سياحية',
    transfer: 'نقل خاص',
    service: 'خدمة',
  };
  return labels[type] || type || 'حجز';
}

function statusLabel(status) {
  const labels = {
    created: 'تم الإنشاء',
    confirmed: 'مؤكد',
    paid: 'مدفوع',
    cancelled: 'ملغي',
    pending: 'قيد الانتظار',
  };
  return labels[status] || status || 'غير محدد';
}
