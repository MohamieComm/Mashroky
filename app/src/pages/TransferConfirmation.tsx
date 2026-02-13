import { useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TRANSFER_BOOKING_KEY = "mashrouk-transfer-booking";
const TRANSFER_BOOKING_STATUS_KEY = "mashrouk-transfer-booking-status";
const TRANSFER_BOOKING_RESULT_KEY = "mashrouk-transfer-booking-result";

export default function TransferConfirmation() {
  const navigate = useNavigate();
  const booking = useMemo(() => {
    try {
      const raw = localStorage.getItem(TRANSFER_BOOKING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TRANSFER_BOOKING_KEY);
    localStorage.removeItem(TRANSFER_BOOKING_STATUS_KEY);
    localStorage.removeItem(TRANSFER_BOOKING_RESULT_KEY);
  }, []);

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">تأكيد الحجز</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            تم إصدار حجز النقل بنجاح
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            ستصلك تفاصيل النقل بعد إتمام الدفع.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <h2 className="text-2xl font-bold mb-4">تفاصيل الحجز</h2>
            {booking?.transfer ? (
              <div className="space-y-2 text-muted-foreground">
                <div>الخدمة: {booking.transfer.name}</div>
                <div>المزوّد: {booking.transfer.vendor || "غير محدد"}</div>
              </div>
            ) : (
              <p className="text-muted-foreground">لا توجد معلومات حجز متوفرة حالياً.</p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button variant="hero" onClick={() => navigate("/profile")}>عرض حجوزاتي</Button>
              <Button variant="outline" onClick={() => navigate("/transfers")}>حجز نقل جديد</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
