import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { safeText } from "@/lib/utils";
import { FileDown, CheckCircle } from "lucide-react";

const CAR_BOOKING_KEY = "mashrouk-car-booking";
const CAR_BOOKING_STATUS_KEY = "mashrouk-car-booking-status";
const CAR_BOOKING_RESULT_KEY = "mashrouk-car-booking-result";

export default function CarConfirmation() {
  const navigate = useNavigate();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const { booking, result } = useMemo(() => {
    try {
      const rawBooking = localStorage.getItem(CAR_BOOKING_KEY);
      const rawResult = localStorage.getItem(CAR_BOOKING_RESULT_KEY);
      return {
        booking: rawBooking ? JSON.parse(rawBooking) : null,
        result: rawResult ? JSON.parse(rawResult) : null,
      };
    } catch {
      return { booking: null, result: null };
    }
  }, []);

  const bookingRef = result?.bookingId || result?.id || "";
  const total = Number(booking?.car?.priceTotal || booking?.price || 0);
  const currency = booking?.car?.currency || booking?.currency || "SAR";

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CAR_BOOKING_KEY);
    localStorage.removeItem(CAR_BOOKING_STATUS_KEY);
    localStorage.removeItem(CAR_BOOKING_RESULT_KEY);
  }, []);

  const handleDownloadPdf = async () => {
    if (!bookingRef) return;
    setDownloadingPdf(true);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(bookingRef)}/invoice.pdf`);
      if (!res.ok) throw new Error("pdf_failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-car-${bookingRef}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("تعذر تحميل الفاتورة. يرجى المحاولة لاحقًا.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <span className="text-primary-foreground/80">تأكيد الحجز</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            تم إصدار حجز السيارة بنجاح
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            ستصلك تفاصيل الحجز عبر البريد الإلكتروني بعد إتمام المعاملة.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">تفاصيل الحجز</h2>
                {bookingRef && (
                  <div className="mb-3">
                    <span className="text-sm text-muted-foreground">رقم الحجز:</span>
                    <p className="text-2xl font-bold text-primary">{bookingRef}</p>
                  </div>
                )}
                {booking?.car ? (
                  <div className="space-y-2 text-muted-foreground">
                    <div>المركبة: {safeText(booking.car.name, booking.car?.name || "غير متوفر")}</div>
                    <div>المزوّد: {safeText(booking.car.vendor, "غير متوفر")}</div>
                    {booking?.pickupDate && <div>الاستلام: {booking.pickupDate}</div>}
                    {booking?.dropoffDate && <div>الإرجاع: {booking.dropoffDate}</div>}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا توجد معلومات حجز متوفرة حالياً.</p>
                )}
              </div>
              {total > 0 && (
                <div className="bg-muted rounded-2xl p-6 text-center min-w-[220px]">
                  <div className="text-sm text-muted-foreground">الإجمالي المدفوع</div>
                  <div className="text-2xl font-bold mt-2">
                    {total.toLocaleString()} {currency}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {bookingRef && (
                <Button variant="outline" className="gap-2" disabled={downloadingPdf} onClick={handleDownloadPdf}>
                  <FileDown className="w-4 h-4" />
                  {downloadingPdf ? "جارٍ التحميل..." : "تحميل الفاتورة PDF"}
                </Button>
              )}
              <Button variant="hero" onClick={() => navigate("/profile")}>عرض حجوزاتي</Button>
              <Button variant="outline" onClick={() => navigate("/cars")}>حجز سيارة جديدة</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
