import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CreditCard, ShieldCheck, Key, CheckCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const paymentMethods = [
  "Samsung Pay",
  "Apple Pay",
  "مدى",
  "Visa",
  "Mastercard",
];

const ORDER_SNAPSHOT_KEY = "mashrouk-last-order";
const FLIGHT_BOOKING_KEY = "mashrouk-flight-booking";
const FLIGHT_BOOKING_STATUS_KEY = "mashrouk-flight-booking-status";
const FLIGHT_BOOKING_RESULT_KEY = "mashrouk-flight-booking-result";

type StoredOrder = {
  orderNumber?: string;
  currency?: string;
  discountCode?: string;
  total?: number;
  items?: Array<{
    id?: string;
    title?: string;
    price?: number;
    quantity?: number;
  }>;
};

export default function Payments() {
  const { items, total } = useCart();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [flightBookingState, setFlightBookingState] = useState<{
    status: "idle" | "processing" | "success" | "error";
    message?: string;
    results?: any[];
  }>({ status: "idle" });
  const flightApiBaseUrl =
    (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
    "https://jubilant-hope-production-a334.up.railway.app";
  const paymentStatus = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("payment") || "";
  }, []);

  useEffect(() => {
    if (paymentStatus !== "success" || typeof window === "undefined") return;
    let storedOrder: StoredOrder | null = null;
    try {
      const raw = localStorage.getItem(ORDER_SNAPSHOT_KEY);
      storedOrder = raw ? (JSON.parse(raw) as StoredOrder) : null;
    } catch {
      storedOrder = null;
    }

    const orderNumber = storedOrder?.orderNumber || `ORD-${Date.now()}`;
    const trackedKey = `admitad-sale-tracked:${orderNumber}`;
    if (sessionStorage.getItem(trackedKey)) return;
    sessionStorage.setItem(trackedKey, "1");

    const w = window as typeof window & { ADMITAD?: any; getSourceCookie?: () => string | undefined; cookie_name?: string };
    w.ADMITAD = w.ADMITAD || {};
    w.ADMITAD.Invoice = w.ADMITAD.Invoice || {};

    const cookieName = w.cookie_name || "deduplication_cookie";
    const getSourceCookie =
      w.getSourceCookie ||
      function () {
        const matches = document.cookie.match(
          new RegExp(
            "(?:^|; )" +
              cookieName.replace(/([\.$?*|{}\(\)\[\]\\/\+^])/g, "\\$1") +
              "=([^;]*)"
          )
        );
        return matches ? decodeURIComponent(matches[1]) : undefined;
      };

    const deduplicationCookieValue = "admitad";

    if (!getSourceCookie()) {
      w.ADMITAD.Invoice.broker = "na";
    } else if (getSourceCookie() !== deduplicationCookieValue) {
      w.ADMITAD.Invoice.broker = getSourceCookie();
    } else {
      w.ADMITAD.Invoice.broker = "adm";
    }

    w.ADMITAD.Invoice.category = "1";
    const orderCurrency = storedOrder?.currency || "SAR";
    const sourceItems = storedOrder?.items?.length ? storedOrder.items : items;
    const orderedItem = (sourceItems || [])
      .filter((item) => Number(item?.price || 0) > 0)
      .map((item) => ({
        Product: {
          productID: String(item?.id || item?.title || orderNumber),
          category: "1",
          price: String(Number(item?.price || 0)),
          priceCurrency: orderCurrency,
        },
        orderQuantity: String(item?.quantity || 1),
        additionalType: "sale",
      }));

    if (!orderedItem.length) {
      const fallbackTotal = storedOrder?.total ?? total ?? 0;
      if (fallbackTotal > 0) {
        orderedItem.push({
          Product: {
            productID: orderNumber,
            category: "1",
            price: String(fallbackTotal),
            priceCurrency: orderCurrency,
          },
          orderQuantity: "1",
          additionalType: "sale",
        });
      }
    }

    w.ADMITAD.Invoice.referencesOrder = w.ADMITAD.Invoice.referencesOrder || [];
    w.ADMITAD.Invoice.referencesOrder.push({
      orderNumber,
      discountCode: storedOrder?.discountCode || "",
      orderedItem,
    });

    if (w.ADMITAD.Tracking && typeof w.ADMITAD.Tracking.processPositions === "function") {
      w.ADMITAD.Tracking.processPositions();
    }
  }, [items, paymentStatus, total]);

  useEffect(() => {
    if (paymentStatus !== "success" || typeof window === "undefined") return;
    const raw = localStorage.getItem(FLIGHT_BOOKING_KEY);
    if (!raw) return;
    const status = localStorage.getItem(FLIGHT_BOOKING_STATUS_KEY);
    if (status === "booked") {
      const cached = localStorage.getItem(FLIGHT_BOOKING_RESULT_KEY);
      setFlightBookingState({
        status: "success",
        results: cached ? JSON.parse(cached) : [],
      });
      return;
    }

    const payload = JSON.parse(raw);
    const offers = Array.isArray(payload?.offers) ? payload.offers : [];
    const travelers = Array.isArray(payload?.travelers) ? payload.travelers : [];
    if (!offers.length || !travelers.length) return;

    const runBooking = async () => {
      setFlightBookingState({ status: "processing" });
      try {
        const results: any[] = [];
        const primaryEmail =
          payload?.travelers?.find((t: any) => t?.contact?.emailAddress)?.contact?.emailAddress ||
          payload?.travelers?.[0]?.contact?.emailAddress ||
          "";
        let bookingReference = "";
        let providerOrderId = "";
        for (let idx = 0; idx < offers.length; idx += 1) {
          const offer = offers[idx];
          const res = await fetch(`${flightApiBaseUrl.replace(/\/$/, "")}/api/flights/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flightOffers: [offer],
              travelers,
              sendEmail: idx === 0,
              customerEmail: primaryEmail,
            }),
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body?.error || "flight_booking_failed");
          }
          const bookingResult = await res.json();
          results.push(bookingResult);
          bookingReference = bookingReference || bookingResult?.bookingReference || "";
          providerOrderId = providerOrderId || bookingResult?.providerOrderId || "";
        }
        localStorage.setItem(FLIGHT_BOOKING_STATUS_KEY, "booked");
        localStorage.setItem(FLIGHT_BOOKING_RESULT_KEY, JSON.stringify(results));
        setFlightBookingState({ status: "success", results });

        const bookingPayload = payload || {};
        await fetch(`${flightApiBaseUrl.replace(/\/$/, "")}/api/flight-bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingReference,
            providerOrderId,
            total: bookingPayload?.total || 0,
            currency: bookingPayload?.currency || "SAR",
            tripType: bookingPayload?.tripType || null,
            summary: bookingPayload?.summary || null,
            email: primaryEmail || null,
            travelersCount: bookingPayload?.travelers?.length || 0,
            raw: results,
          }),
        });
        setTimeout(() => {
          navigate("/flight/confirmation");
        }, 1500);
      } catch (err) {
        const code = err instanceof Error ? err.message : "flight_booking_failed";
        setFlightBookingState({
          status: "error",
          message:
            code === "flight_booking_failed"
              ? "تعذر إصدار التذاكر بعد الدفع. يرجى التواصل مع الدعم."
              : "حدث خطأ غير متوقع أثناء إصدار التذاكر.",
        });
      }
    };

    runBooking();
  }, [paymentStatus, flightApiBaseUrl]);

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">المدفوعات</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            دفع آمن ومباشر
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            {isAdmin
              ? "بوابات دفع متعددة مع لوحة تحكم لإدارة مفاتيح التكامل وصلاحيات الفريق."
              : "بوابات دفع متعددة وتجربة دفع آمنة ومباشرة للمستخدمين."}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
            <div className="bg-card rounded-3xl p-8 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-7 h-7 text-primary" />
                <h2 className="text-2xl font-bold">طرق الدفع المتاحة</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <span key={method} className="px-4 py-2 rounded-full bg-muted text-sm font-semibold">
                    {method}
                  </span>
                ))}
              </div>
              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-2xl p-5">
                  <ShieldCheck className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">أمان متقدم</h3>
                  <p className="text-sm text-muted-foreground">تشفير المدفوعات ومراقبة العمليات لحماية المستخدمين.</p>
                </div>
                {isAdmin && (
                  <div className="bg-muted rounded-2xl p-5">
                    <Key className="w-6 h-6 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">إدارة API Key</h3>
                    <p className="text-sm text-muted-foreground">تحكم في مفاتيح الربط مع مزود الدفع من لوحة الإدارة.</p>
                  </div>
                )}
              </div>
            </div>

            {isAdmin ? (
              <div className="bg-muted rounded-3xl p-8 shadow-card">
                <h3 className="text-xl font-bold mb-4">تكامل منصة ميسر</h3>
                <p className="text-muted-foreground mb-6">
                  اربط منصة الدفع مباشرة من لوحة التحكم وحدد صلاحيات الموظفين لإدارة العمليات.
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    دعم الدفع المباشر وبطاقات الائتمان.
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    إدارة استرداد المبالغ من نفس اللوحة.
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    تقارير فورية عن المدفوعات والطلبات.
                  </div>
                </div>
                <Button variant="hero" className="mt-6 w-full">إعداد بوابة الدفع</Button>
              </div>
            ) : (
              <div className="bg-muted rounded-3xl p-8 shadow-card">
                <h3 className="text-xl font-bold mb-4">دفع سريع وآمن</h3>
                <p className="text-muted-foreground mb-6">
                  أكمل عمليات الدفع من خلال السلة، وسنحوّلك تلقائيًا إلى بوابة الدفع الآمنة.
                </p>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    حماية بيانات الدفع بتشفير متقدم.
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    تأكيد فوري للحجز بعد الدفع.
                  </div>
                </div>
              </div>
            )}
          </div>

          {flightBookingState.status !== "idle" && (
            <div className="mt-10 bg-card rounded-3xl p-8 shadow-card">
              <h3 className="text-xl font-bold mb-3">حالة إصدار التذاكر</h3>
              {flightBookingState.status === "processing" && (
                <p className="text-muted-foreground">جاري إصدار التذاكر من Amadeus...</p>
              )}
              {flightBookingState.status === "error" && (
                <p className="text-destructive">{flightBookingState.message}</p>
              )}
              {flightBookingState.status === "success" && (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>تم إصدار التذاكر بنجاح.</p>
                  {(flightBookingState.results || []).map((result, index) => (
                    <div key={index} className="bg-muted rounded-xl p-4">
                      <div>رقم الحجز: {result?.bookingReference || "غير متوفر"}</div>
                      <div>رقم الطلب: {result?.providerOrderId || "غير متوفر"}</div>
                    </div>
                  ))}
                  <Button variant="hero" className="mt-4" onClick={() => navigate("/flight/confirmation")}>
                    عرض صفحة التأكيد
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
