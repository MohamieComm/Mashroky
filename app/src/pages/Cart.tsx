import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Trash2, CreditCard, CheckCircle, XCircle, ShoppingCart,
  Hotel, Plane, Car, MapPin, Tag, Shield, Gift, ArrowRight,
  Plus, Package, Sparkles,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState, useMemo } from "react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { apiPost } from "@/lib/api";
import { useNavigate } from "react-router-dom";

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

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
  tour: MapPin,
  transfer: Car,
  offer: Gift,
  service: Package,
};

const typeColors: Record<string, string> = {
  flight: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  hotel: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  car: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  tour: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
  offer: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
};

export default function Cart() {
  const { items, removeItem, clear, total } = useCart();
  const navigate = useNavigate();
  const hasItems = items.length > 0;
  const subtotal = total;
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    return Math.floor(subtotal * (appliedPromo.percent / 100));
  }, [subtotal, appliedPromo]);
  const finalTotal = Math.max(subtotal - discount, 0);

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

  const handleRemoveItem = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, 300);
  };

  // Group items by type
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach((item) => {
      const type = item.type || "service";
      if (!groups[type]) groups[type] = [];
      groups[type].push(item);
    });
    return groups;
  }, [items]);

  return (
    <Layout>
      {/* ────────── Breadcrumb ────────── */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">الرئيسية</button>
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span className="text-foreground font-medium">سلة المشتريات</span>
          </div>
        </div>
      </div>

      {/* ────────── Cart Header ────────── */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">سلة المشتريات</h1>
                <p className="text-sm text-muted-foreground">
                  {hasItems ? `${items.length} ${items.length === 1 ? "عنصر" : "عناصر"} في السلة` : "السلة فارغة"}
                </p>
              </div>
            </div>
            {hasItems && (
              <button
                onClick={clear}
                className="text-sm text-destructive hover:underline font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                تفريغ السلة
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ────────── Cart Content ────────── */}
      <section className="py-6 bg-muted/20 min-h-[50vh]">
        <div className="container mx-auto px-4">
          {hasItems ? (
            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
              {/* Left: Cart Items */}
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([type, groupItems]) => {
                  const Icon = typeIcons[type] || Package;
                  const colorClass = typeColors[type] || "bg-muted text-muted-foreground";
                  return (
                    <div key={type} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      {/* Group Header */}
                      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm">{typeLabels[type] || "حجز"}</span>
                        <span className="text-xs text-muted-foreground">({groupItems.length})</span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-border">
                        {groupItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                              removingId === item.id ? "opacity-0 -translate-x-8 h-0 p-0 overflow-hidden" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  fallbackQuery={item.details || item.title}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm line-clamp-1">{item.title}</h3>
                                {item.details && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.details}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right">
                                <p className="text-lg font-extrabold text-primary">
                                  {item.price > 0 ? item.price.toLocaleString() : "—"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">ر.س</p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors group"
                              >
                                <Trash2 className="w-4 h-4 text-destructive group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Coupon Section */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-primary" />
                    <h4 className="font-bold text-sm">كوبون خصم</h4>
                  </div>
                  {appliedPromo ? (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                        <div>
                          <span className="font-bold text-sm">{appliedPromo.label}</span>
                          <span className="text-xs text-muted-foreground mr-2">({appliedPromo.code})</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="text-destructive text-xs">
                        إزالة
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            className="w-full h-11 rounded-xl border border-input bg-muted/30 pr-10 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            placeholder="أدخل كود الخصم"
                            value={promoCode}
                            onChange={(event) => {
                              setPromoCode(event.target.value);
                              setPromoError("");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                          />
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-xl font-bold px-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={handleApplyPromo}
                        >
                          تفعيل
                        </Button>
                      </div>
                      {promoError && (
                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {promoError}
                        </p>
                      )}
                      {promoSuccess && (
                        <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {promoSuccess}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Continue Shopping */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate("/hotels")}
                    className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    متابعة التسوق
                  </button>
                </div>
              </div>

              {/* Right: Payment Summary */}
              <div className="space-y-4">
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sticky top-4">
                  <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    ملخص الطلب
                  </h3>

                  {/* Items Summary */}
                  <div className="space-y-3 mb-5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground line-clamp-1 flex-1 ml-3">{item.title}</span>
                        <span className="font-medium shrink-0">
                          {item.price > 0 ? `${item.price.toLocaleString()} ر.س` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">الإجمالي الفرعي</span>
                      <span className="font-medium">{subtotal.toLocaleString()} ر.س</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-sm text-emerald-600">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {appliedPromo?.label || "خصم"}
                        </span>
                        <span className="font-medium">-{discount.toLocaleString()} ر.س</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>ضريبة القيمة المضافة</span>
                      <span className="font-medium">مشمولة</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">الإجمالي النهائي</span>
                        <span className="font-extrabold text-2xl text-primary">{finalTotal.toLocaleString()} ر.س</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="mt-5 w-full gap-2 rounded-xl font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all"
                    disabled={!hasItems || finalTotal <= 0}
                    onClick={() => navigate("/checkout")}
                  >
                    <CreditCard className="w-5 h-5" />
                    المتابعة للدفع الآمن
                  </Button>

                  {/* Trust badges */}
                  <div className="mt-5 pt-4 border-t border-border">
                    <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        دفع آمن
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                        تأكيد فوري
                      </span>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-muted/50 rounded-2xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold">هل تحتاج مساعدة؟</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    تواصل معنا عبر صفحة الدعم الفني لأي استفسار حول طلبك.
                  </p>
                  <button
                    onClick={() => navigate("/support")}
                    className="text-xs text-primary hover:underline font-medium mt-2 inline-block"
                  >
                    تواصل مع الدعم
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ────────── Empty Cart ────────── */
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <h2 className="text-2xl font-bold mb-3">السلة فارغة</h2>
              <p className="text-muted-foreground mb-8">
                لم تضف أي حجوزات بعد. تصفح الفنادق والعروض واختر ما يناسبك.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="hero" className="rounded-xl gap-2" onClick={() => navigate("/hotels")}>
                  <Hotel className="w-4 h-4" />
                  تصفح الفنادق
                </Button>
                <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate("/offers")}>
                  <Gift className="w-4 h-4" />
                  العروض
                </Button>
                <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate("/trips")}>
                  <MapPin className="w-4 h-4" />
                  الرحلات
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
