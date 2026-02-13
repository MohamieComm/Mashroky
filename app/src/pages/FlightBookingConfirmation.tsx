import { useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BOOKING_RESULT_KEY = "mashrouk-flight-booking-result";
const BOOKING_KEY = "mashrouk-flight-booking";
const BOOKING_STATUS_KEY = "mashrouk-flight-booking-status";

// Admitad SALE tracking injection
function AdmitadSaleScript({ orderNumber, discountCode, items, currency }: {
  orderNumber: string;
  discountCode: string;
  items: Array<{ id: string; price: string; quantity: string }>;
  currency: string;
}) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
ADMITAD = window.ADMITAD || {};
ADMITAD.Invoice = ADMITAD.Invoice || {};
ADMITAD.Invoice.broker = 'na';
ADMITAD.Invoice.category = '1';
var orderedItem = [];
${items
  .map(
    (item) => `orderedItem.push({Product:{productID:'${item.id}',category:'1',price:'${item.price}',priceCurrency:'${currency}'},orderQuantity:'${item.quantity}',additionalType:'sale'});`
  )
  .join('\n')}
ADMITAD.Invoice.referencesOrder = ADMITAD.Invoice.referencesOrder || [];
ADMITAD.Invoice.referencesOrder.push({orderNumber:'${orderNumber}',discountCode:'${discountCode}',orderedItem:orderedItem});
        `,
      }}
    />
  );
}

export default function FlightBookingConfirmation() {
  const navigate = useNavigate();
  const { bookingResult, bookingPayload } = useMemo(() => {
    const resultRaw = localStorage.getItem(BOOKING_RESULT_KEY);
    const payloadRaw = localStorage.getItem(BOOKING_KEY);
    return {
      bookingResult: resultRaw ? JSON.parse(resultRaw) : [],
      bookingPayload: payloadRaw ? JSON.parse(payloadRaw) : null,
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(BOOKING_KEY);
    localStorage.removeItem(BOOKING_RESULT_KEY);
    localStorage.removeItem(BOOKING_STATUS_KEY);
  }, []);

  const mainResult = Array.isArray(bookingResult) ? bookingResult[0] : bookingResult;
  const bookingReference = mainResult?.bookingReference || mainResult?.providerOrderId || "";
  const total = bookingPayload?.total || 0;
  const currency = bookingPayload?.currency || "SAR";
  const outbound = bookingPayload?.summary?.outbound || "";
  const inbound = bookingPayload?.summary?.inbound || "";
  const travelersCount = bookingPayload?.travelers?.length || 0;

  // Inject Admitad SALE script only if bookingReference and items exist
  const admitadSaleScript =
    bookingReference && total && Array.isArray(bookingPayload?.items)
      ? (
          <AdmitadSaleScript
            orderNumber={bookingReference}
            discountCode={bookingPayload?.discountCode || ""}
            items={bookingPayload?.items || [{ id: bookingReference, price: total, quantity: 1 }]}
            currency={currency}
          />
        )
      : null;
  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">تأكيد الحجز</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            تم إصدار الحجز بنجاح
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            احتفظ برقم الحجز لاستخدامه لاحقًا.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">رقم الحجز (PNR)</h2>
                <p className="text-3xl font-bold text-primary">
                  {bookingReference || "غير متوفر حالياً"}
                </p>
                <div className="mt-4 text-sm text-muted-foreground space-y-2">
                  {outbound && <div>الذهاب: {outbound}</div>}
                  {inbound && <div>العودة: {inbound}</div>}
                  <div>عدد المسافرين: {travelersCount}</div>
                </div>
              </div>
              <div className="bg-muted rounded-2xl p-6 text-center min-w-[220px]">
                <div className="text-sm text-muted-foreground">الإجمالي المدفوع</div>
                <div className="text-2xl font-bold mt-2">
                  {Number(total).toLocaleString()} {currency}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" onClick={() => navigate("/profile")}>
                عرض الحجوزات
              </Button>
              <Button variant="outline" onClick={() => navigate("/trips")}>
                حجز رحلة جديدة
              </Button>
            </div>
          </div>
        </div>
      </section>
      {admitadSaleScript}
    </Layout>
  );
}
