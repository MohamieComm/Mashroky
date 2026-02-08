import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Trash2, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

const ORDER_SNAPSHOT_KEY = "mashrouk-last-order";

export default function Cart() {
  const { items, removeItem, clear, total } = useCart();
  const hasItems = items.length > 0;
  const subtotal = total;
  const discount = Math.floor(subtotal * 0.05);
  const finalTotal = Math.max(subtotal - discount, 0);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const flightApiBaseUrl =
    (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
    "https://jubilant-hope-production-a334.up.railway.app";
  const paymentErrorMessages: Record<string, string> = {
    moyasar_not_configured: "لم يتم تفعيل بوابة الدفع على الخادم بعد.",
    backend_base_url_not_configured: "إعدادات الخادم غير مكتملة (BACKEND_BASE_URL).",
    invalid_amount: "قيمة الدفع غير صالحة. يرجى مراجعة السلة.",
    payment_failed: "فشل إنشاء رابط الدفع. حاول مرة أخرى.",
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

      const apiUrl = `${flightApiBaseUrl.replace(/\/$/, "")}/api/payments/create`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalTotal,
          currency: "SAR",
          description: "حجز عبر السلة",
          returnUrl: window.location.origin,
        }),
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
                <div key={item.id} className="bg-card rounded-2xl p-6 shadow-card flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    {item.details && <p className="text-sm text-muted-foreground">{item.details}</p>}
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
              <div className="flex gap-3">
                <input
                  className="h-11 rounded-xl border border-input px-4 flex-1"
                  placeholder="أدخل الكود"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                />
                <Button variant="outline">تفعيل</Button>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-card">
            <h3 className="text-xl font-bold mb-6">ملخص الدفع</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>الإجمالي الفرعي</span>
                <span>{subtotal.toLocaleString()} ر.س</span>
              </div>
              <div className="flex items-center justify-between">
                <span>خصم موسمي</span>
                <span>-{discount.toLocaleString()} ر.س</span>
              </div>
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
