import { generateBookingInvoice } from '../services/invoice.service.js';
import { getServiceClient } from '../services/supabase.service.js';

// C1 fix: strict ID validation
const SAFE_ID = /^[a-zA-Z0-9\-_]{1,64}$/;

export async function getBookingInvoice(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !SAFE_ID.test(id)) {
      return res.status(400).json({ error: 'invalid_booking_id' });
    }

    const userId = req.user?.id; // from attachUser middleware

    // Try to find booking in flight_bookings or bookings table
    let booking = null;
    const client = getServiceClient();

    if (client) {
      // C1 fix: use separate .eq queries instead of .or with string interpolation
      let flightBooking = null;
      const { data: byRef } = await client
        .from('flight_bookings')
        .select('*')
        .eq('booking_reference', id)
        .maybeSingle();
      flightBooking = byRef;

      if (!flightBooking) {
        const { data: byId } = await client
          .from('flight_bookings')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        flightBooking = byId;
      }

      if (flightBooking) {
        // C2 fix: ownership check — only the booking owner or admin can download
        if (flightBooking.user_id && userId && flightBooking.user_id !== userId) {
          return res.status(403).json({ error: 'forbidden' });
        }

        booking = {
          id: flightBooking.id,
          bookingReference: flightBooking.booking_reference || id,
          type: 'flight',
          status: flightBooking.status || 'confirmed',
          total: flightBooking.total || 0,
          currency: flightBooking.currency || 'SAR',
          tripType: flightBooking.trip_type || null,
          summary: flightBooking.summary || {},
          email: flightBooking.email || null,
          travelersCount: flightBooking.travelers_count || 0,
          createdAt: flightBooking.created_at,
          items: [
            {
              title: flightBooking.summary?.outbound
                ? `رحلة ${flightBooking.summary.outbound}`
                : 'حجز رحلة طيران',
              price: flightBooking.total || 0,
              quantity: 1,
            },
          ],
        };
      }

      // Try bookings table
      if (!booking) {
        const { data: genericBooking } = await client
          .from('bookings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (genericBooking) {
          // C2 fix: ownership check
          if (genericBooking.user_id && userId && genericBooking.user_id !== userId) {
            return res.status(403).json({ error: 'forbidden' });
          }

          booking = {
            id: genericBooking.id,
            bookingReference: genericBooking.id,
            type: genericBooking.type || 'service',
            status: genericBooking.status || 'confirmed',
            total: genericBooking.total || 0,
            currency: genericBooking.currency || 'SAR',
            createdAt: genericBooking.created_at,
            items: [
              {
                title: `حجز ${genericBooking.type || 'خدمة'}`,
                price: genericBooking.total || 0,
                quantity: 1,
              },
            ],
          };
        }
      }
    }

    // H3 fix: Return 404 instead of generating a fake invoice
    if (!booking) {
      return res.status(404).json({ error: 'booking_not_found' });
    }

    const pdfBuffer = await generateBookingInvoice(booking);

    // H1 fix: sanitize ID before using in Content-Disposition header
    const safeId = id.replace(/[^a-zA-Z0-9\-_]/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${safeId}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}
