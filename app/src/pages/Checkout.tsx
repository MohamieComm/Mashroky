import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard, Shield, CheckCircle, MapPin, User, Mail,
  Phone, ArrowRight, ShoppingCart, Lock, Sparkles,
  Hotel, Plane, Car, Package, Gift, Clock,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api";

const ORDER_SNAPSHOT_KEY = "mashrouk-last-order";

const typeLabels: Record<string, string> = {
  flight: "طيران",
  hotel: "فندق",
  car: "سيارة",
  tour: "جولة",
  transfer: "توصيل",
  offer: "عرض",
  service: "خدمة",
  activity: "نشاط",
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
  tour: MapPin,
  offer: Gift,
  service: Package,
};

export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const hasItems = items.length > 0;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhoneNum] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const finalTotal = total;

  const paymentErrorMessages: Record<string, string> = {
    moyasar_not_configured: "لم يتم تفعيل بوابة الدفع على الخادم بعد.",
    backend_base_url_not_configured: "إعدادات الخادم غير مكتملة.",
    invalid_amount: "قيمة الدفع غير صالحة.",
    payment_failed: "فشل إنشاء رابط الدفع. حاول مرة أخرى.",
  };

  const isFormValid = useMemo(() => {
    return fullName.trim().length >= 2 && email.includes("@") && phone.trim().length >= 8;
  }, [fullName, email, phone]);

  const handlePay = async () => {
    if (!hasItems || processing || !isFormValid) return;
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
        total: finalTotal,
        customer: { fullName, email, phone },
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
        description: `حجز ${orderNumber} - ${fullName}`,
        returnUrl: `${window.location.origin}/payments`,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "payment_failed");
      }
      const data = await res.json();

      // Test mode: Moyasar test keys detected — skip redirect to avoid 3DS ACS Emulator
      if (data.testMode && data.successRedirect) {
        window.location.href = data.successRedirect;
        return;
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      throw new Error("missing_payment_url");
    } catch (error) {
      const code = error instanceof Error ? error.message : "payment_failed";
      setPaymentError(paymentErrorMessages[code] || "تعذر بدء عملية الدفع. يرجى المحاولة لاحقًا.");
    } finally {
      setProcessing(false);
    }
  };

  if (!hasItems) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-bold mb-2">لا توجد عناصر للدفع</h2>
            <p className="text-muted-foreground mb-6">أضف حجوزات إلى سلتك أولاً</p>
            <Button variant="hero" className="rounded-xl" onClick={() => navigate("/hotels")}>
              تصفح الفنادق
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/cart")} className="hover:text-primary transition-colors">السلة</button>
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span className="text-foreground font-medium">إتمام الدفع</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-primary">السلة</span>
            </div>
            <div className="flex-1 h-0.5 bg-primary" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-medium text-primary">الدفع</span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm text-muted-foreground">تأكيد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <section className="py-6 bg-muted/20 min-h-[60vh]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            {/* Left: Customer Info */}
            <div className="space-y-5">
              {/* Contact Info */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  بيانات المسافر
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">الاسم الكامل *</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="أدخل الاسم الكامل"
                        className="pr-10 h-12 rounded-xl bg-muted/30 border-border/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني *</label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com"
                          className="pr-10 h-12 rounded-xl bg-muted/30 border-border/50"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">رقم الهاتف *</label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhoneNum(e.target.value)}
                          placeholder="+966 5XX XXX XXXX"
                          className="pr-10 h-12 rounded-xl bg-muted/30 border-border/50"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Info */}
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  طريقة الدفع
                </h3>
                <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">بطاقة ائتمان / مدى</p>
                    <p className="text-xs text-muted-foreground">سيتم تحويلك لبوابة الدفع الآمنة Moyasar</p>
                  </div>
                  <Shield className="w-5 h-5 text-emerald-500 mr-auto" />
                </div>
                <div className="flex items-center gap-4 mt-4 text-[11px] text-muted-foreground justify-center">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-500" />
                    تشفير SSL 256-bit
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-blue-500" />
                    PCI DSS معتمد
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-muted/30 rounded-2xl p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  بإتمام الدفع، أنت توافق على{" "}
                  <button onClick={() => navigate("/terms")} className="text-primary hover:underline">الشروط والأحكام</button>
                  {" "}و{" "}
                  <button onClick={() => navigate("/privacy")} className="text-primary hover:underline">سياسة الخصوصية</button>
                </p>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  ملخص الطلب
                </h3>

                {/* Items */}
                <div className="space-y-3 mb-5">
                  {items.map((item) => {
                    const Icon = typeIcons[item.type || "service"] || Package;
                    return (
                      <div key={item.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {typeLabels[item.type || "service"] || "حجز"}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-primary shrink-0">
                          {item.price > 0 ? `${item.price.toLocaleString()}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>الإجمالي الفرعي</span>
                    <span>{total.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>الضريبة</span>
                    <span>مشمولة</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base">المبلغ المستحق</span>
                      <span className="font-extrabold text-2xl text-primary">{finalTotal.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="mt-5 w-full gap-2 rounded-xl font-bold text-base h-13 shadow-lg hover:shadow-xl transition-all"
                  disabled={!isFormValid || processing || finalTotal <= 0}
                  onClick={handlePay}
                >
                  <Lock className="w-4 h-4" />
                  {processing ? "جاري التحويل..." : `ادفع ${finalTotal.toLocaleString()} ر.س`}
                </Button>

                {!isFormValid && (
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    يرجى تعبئة جميع البيانات المطلوبة (*)
                  </p>
                )}

                {paymentError && (
                  <div className="bg-destructive/10 rounded-xl p-3 mt-3">
                    <p className="text-xs text-destructive">{paymentError}</p>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-around text-[10px] text-muted-foreground">
                  <span className="flex flex-col items-center gap-1">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    دفع آمن
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    تأكيد فوري
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    دعم 24/7
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
