import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Car, Bus, Train, Plane, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

const transportOptions = [
  {
    title: "تأجير سيارات خاصة",
    description: "خيارات مرنة للمدن والرحلات اليومية مع سائق أو بدون.",
    icon: Car,
  },
  {
    title: "حافلات سياحية",
    description: "جولات مريحة مع مرشدين وتنقلات جماعية منظمة.",
    icon: Bus,
  },
  {
    title: "قطارات إقليمية",
    description: "تنقل سريع بين المدن الرئيسية مع مواعيد دقيقة.",
    icon: Train,
  },
  {
    title: "رحلات داخلية",
    description: "أفضل المسارات للطيران المحلي وربط المدن البعيدة.",
    icon: Plane,
  },
];

export default function Transport() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const handleBook = (title: string) => {
    addItem({ id: `transport-${title}-${Date.now()}`, title, price: 0, type: "transport" });
    navigate("/cart");
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">خدمات النقل</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            اختر وسيلة التنقل الأنسب
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            ننسّق لك النقل من وإلى المطار والتنقلات الداخلية بسهولة ومرونة.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.title} className="bg-card rounded-2xl p-6 shadow-card text-center">
                  <div className="w-14 h-14 hero-gradient rounded-2xl flex items-center justify-center text-primary-foreground mx-auto mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-card rounded-3xl p-8 shadow-card mt-12">
            <h2 className="text-2xl font-bold mb-6">نموذج طلب النقل</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <input className="h-12 rounded-xl border border-input px-4" placeholder="مدينة الانطلاق" />
              <input className="h-12 rounded-xl border border-input px-4" placeholder="الوجهة" />
              <input className="h-12 rounded-xl border border-input px-4" placeholder="عدد الركاب" />
              <input className="h-12 rounded-xl border border-input px-4" placeholder="تاريخ الرحلة" />
              <input className="h-12 rounded-xl border border-input px-4" placeholder="وقت الانطلاق" />
              <input className="h-12 rounded-xl border border-input px-4" placeholder="ملاحظات إضافية" />
            </div>
            <Button variant="hero" className="mt-6" onClick={() => handleBook("طلب نقل")}>
              إضافة للسلة
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              سيتم التواصل لتأكيد الموعد والسعر النهائي حسب الوجهة ونوع المركبة.
            </p>
          </div>

          <div className="bg-muted rounded-3xl p-8 shadow-card mt-12 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary">
              <MapPin className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">مناطق التغطية</h3>
              <p className="text-muted-foreground">
                نوفر الخدمة في المدن الرئيسية ومناطق الجذب السياحي، ويمكن طلب تنقلات خاصة حسب الحاجة.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
