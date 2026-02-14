import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { GraduationCap, Globe, CheckCircle } from "lucide-react";
import { studyOffers, studyDestinations, topUniversities } from "@/data/content";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

export default function Study() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const handleBook = (payload?: { title?: string; price?: string; details?: string; image?: string | null }) => {
    const title = payload?.title ?? "برنامج دراسة";
    const price = payload?.price ?? "0";
    addItem({
      id: `study-${title}-${Date.now()}`,
      title,
      price: Number(price.replace(/[^\\d.]/g, "")) || 0,
      details: payload?.details,
      image: payload?.image,
      type: "study",
    });
    navigate("/cart");
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">الدراسة بالخارج مع مشروك</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            استثمر في مستقبل أبنائك بثقة
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            برامج لغة ودراسة جامعية في أفضل المعاهد العالمية — مع تنسيق الطيران والسكن والمتابعة الشاملة لراحة بالك.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <h2 className="text-2xl font-bold mb-6">احجز برنامجك الدراسي</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Input placeholder="الدولة" />
              <Input placeholder="المدينة" />
              <Input placeholder="المعهد أو الجامعة" />
              <Input placeholder="البرنامج الدراسي" />
              <Input placeholder="مدة الدراسة" />
              <Input placeholder="عدد الطلاب" />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <Input placeholder="إضافة الطيران" />
              <Input placeholder="إضافة الإقامة" />
              <Input placeholder="إضافة التنقلات" />
            </div>
            <Button variant="hero" className="mt-6" onClick={() => handleBook()}>
              احجز البرنامج
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              بعد الدفع ستصلك تفاصيل القبول والمتطلبات وإرشادات التأشيرة وموقع المعهد عبر البريد أو واتساب.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            برامج لغة إنجليزية معتمدة
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studyOffers.map((offer) => (
                <div key={offer.id} className="bg-card rounded-2xl overflow-hidden shadow-card">
                  <div className="h-44 overflow-hidden">
                  <ImageWithFallback
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    fallbackQuery={`${offer.location} ${offer.title}`}
                  />
                  </div>
                <div className="p-5">
                  <h3 className="font-bold mb-1">{offer.title}</h3>
                  <p className="text-sm text-muted-foreground">{offer.location} • {offer.duration}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                    {offer.includes.map((item) => (
                      <span key={item} className="bg-muted px-3 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-lg font-bold text-primary">{offer.price} ر.س</p>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() =>
                        handleBook({
                          title: offer.title,
                          price: offer.price,
                          details: `${offer.location} • ${offer.duration}`,
                          image: offer.image,
                        })
                      }
                    >
                      احجز
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
            <div className="bg-card rounded-2xl p-8 shadow-card">
              <h3 className="text-2xl font-bold mb-6">أفضل الدول للدراسة والتطوير</h3>
              <div className="space-y-4">
                {studyDestinations.map((dest) => (
                  <div key={dest.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-secondary" />
                      <h4 className="font-semibold">{dest.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{dest.focus}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {dest.highlights.map((item) => (
                        <span key={item} className="bg-muted px-3 py-1 rounded-full">{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted rounded-3xl p-8 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-6 h-6 text-secondary" />
                <h3 className="text-2xl font-bold">جامعات عالمية بارزة</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                نساعدك في القبول والتسجيل في جامعات مصنفة ضمن الأفضل عالمياً — بدعم متكامل من التقديم حتى الوصول.
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                {topUniversities.map((uni) => (
                  <div key={uni} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>{uni}</span>
                  </div>
                ))}
              </div>
              <Button variant="hero" className="mt-6 w-full">طلب استشارة دراسية</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
