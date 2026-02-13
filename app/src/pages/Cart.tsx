import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Trash2, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState, useMemo } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { apiPost } from "@/lib/api";

const ORDER_SNAPSHOT_KEY = "mashrouk-last-order";
const typeLabels: Record<string, string> = {
  flight: "طيران",
  hotel: "فندق",
  car: "سيارة",
  tour: "جولة",
  transfer: "توصيل",
  offer: "عرض",
  seasonal: "عرض موسمي",
  study: "دراسة",
  destination: "وجهة",
  transport: "نقل",
  trip: "رحلة",
  service: "خدمة",
  activity: "نشاط",
};

export default function Cart() {
  const { items, removeItem, clear, total } = useCart();
  const hasItems = items.length > 0;
  const subtotal = total;
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.floor(subtotal * (appliedPromo.percent / 100));
  }, [subtotal, appliedPromo]);
  const finalTotal = Math.max(subtotal - discount, 0);
  const flightApiBaseUrl =
    (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
    "https://jubilant-hope-production-a334.up.railway.app";
  const paymentErrorMessages: Record<string, string> = {
    moyasar_not_configured: "لم يتم تفعيل بوابة الدفع على الخادم بعد.",
    backend_base_url_not_configured: "إعدادات الخادم غير مكتملة (BACKEND_BASE_URL).",
    invalid_amount: "قيمة الدفع غير صالحة. يرجى مراجعة السلة.",
    payment_failed: "فشل إنشاء رابط الدفع. حاول مرة أخرى.",
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    setPromoError("");
    setPromoSuccess("");
    if (!code) {
      setPromoError("أدخل كود الخصم أولاً");
      return;
    }
    try {
      const res = await apiPost("/api/promo/validate", { code, subtotal });
      const data = await res.json();
      if (!data.valid) {
        const errorMap: Record<string, string> = {
          missing_code: "أدخل كود الخصم أولاً",
          invalid_code: "كود الخصم غير صالح",
          min_amount_not_met: `الحد الأدنى لاستخدام هذا الكود ${data.minAmount?.toLocaleString() || "0"} ر.س`,
        };
        setPromoError(errorMap[data.error] || "كود الخصم غير صالح");
        return;
      }
      setAppliedPromo({ code, percent: data.percent, label: data.label });
      setPromoSuccess(`تم تفعيل ${data.label} بنجاح!`);
    } catch {
      setPromoError("تعذر التحقق من الكود. حاول مرة أخرى.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
    setPromoSuccess("");
  };

  const handleCheckout = async () => {
    if (!hasItems || processing) return;
    setProcessing(true);
    setPaymentError("");
    if (finalTotal <= 0) {
      setPaymentError("قيمة الدفع يجب أن تكون أكبر من صفر.");
      setProcessing(false);
      return;
    }
    try {
      const orderNumber = `ORD-${Date.now()}`;
      const snapshot = {
        orderNumber,
        currency: "SAR",
        discountCode: promoCode.trim(),
        total: finalTotal,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: 1,
        })),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(ORDER_SNAPSHOT_KEY, JSON.stringify(snapshot));

      const res = await apiPost("/api/payments/create", {
          amount: finalTotal,
          currency: "SAR",
          description: "حجز عبر السلة",
          returnUrl: `${window.location.origin}/payments`,
        });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "payment_failed");
      }
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      throw new Error("missing_payment_url");
    } catch (error) {
      const code = error instanceof Error ? error.message : "payment_failed";
      setPaymentError(paymentErrorMessages[code] || "تعذر بدء عملية الدفع. يرجى المحاولة لاحقًا أو التواصل مع الدعم.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">سلة المشتريات</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            راجع طلبك قبل الدفع
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            أضف أو عدّل الخدمات قبل إتمام الدفع النهائي.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
          <div className="space-y-4">
            {hasItems ? (
              items.map((item) => (
                <div key={item.id} className="bg-card rounded-2xl p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                      fallbackQuery={item.details || item.title}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold">{item.title}</h3>
                        {item.type && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            {typeLabels[item.type] || "حجز"}
                          </span>
                        )}
                      </div>
                      {item.details && <p className="text-sm text-muted-foreground">{item.details}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-bold text-primary">{item.price.toLocaleString()} ر.س</p>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-muted rounded-2xl p-8 text-center text-muted-foreground shadow-card">
                السلة فارغة حالياً. أضف عروضك المفضلة ثم عد للدفع.
              </div>
            )}

            <div className="bg-muted rounded-2xl p-6 shadow-card">
              <h4 className="font-semibold mb-2">كوبون خصم</h4>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">{appliedPromo.label}</span>
                    <span className="text-sm text-muted-foreground">({appliedPromo.code})</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="text-destructive">
                    إزالة
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <input
                      className="h-11 rounded-xl border border-input px-4 flex-1"
                      placeholder="أدخل الكود"
                      value={promoCode}
                      onChange={(event) => {
                        setPromoCode(event.target.value);
                        setPromoError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                    />
                    <Button variant="outline" onClick={handleApplyPromo}>تفعيل</Button>
                  </div>
                  {promoError && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {promoError}
                    </p>
                  )}
                  {promoSuccess && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {promoSuccess}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-card">
            <h3 className="text-xl font-bold mb-6">ملخص الدفع</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>الإجمالي الفرعي</span>
                <span>{subtotal.toLocaleString()} ر.س</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <span>{appliedPromo ? appliedPromo.label : "خصم"}</span>
                  <span>-{discount.toLocaleString()} ر.س</span>
                </div>
              )}
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>الإجمالي النهائي</span>
                <span>{finalTotal.toLocaleString()} ر.س</span>
              </div>
            </div>
            <Button
              variant="hero"
              className="mt-6 w-full gap-2"
              disabled={!hasItems || processing}
              onClick={handleCheckout}
            >
              <CreditCard className="w-5 h-5" />
              {processing ? "جاري التحويل للدفع..." : "المتابعة للدفع"}
            </Button>
            {paymentError && (
              <p className="text-xs text-destructive mt-3">{paymentError}</p>
            )}
            {hasItems && (
              <Button variant="ghost" className="mt-4 w-full" onClick={clear}>
                تفريغ السلة
              </Button>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
