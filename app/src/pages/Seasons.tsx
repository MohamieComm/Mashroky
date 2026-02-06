import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { CalendarCheck, CheckCircle, MapPin } from "lucide-react";
import { defaultSeasons, useAdminCollection } from "@/data/adminStore";
import { useCart } from "@/hooks/useCart";
import { useNavigate } from "react-router-dom";

const seasonHighlights = [
  "باقات مرنة مع خيارات السكن والمواصلات حسب اختيار العميل.",
  "تنسيق كامل للطيران الداخلي والدولي ضمن نفس الطلب.",
  "خدمات إضافية (مرافقة، إرشاد، جولات) عند الطلب.",
];

export default function Seasons() {
  const seasons = useAdminCollection("seasons", defaultSeasons);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleBook = (title: string, price: string, details?: string, image?: string | null) => {
    addItem({
      id: `season-${title}-${Date.now()}`,
      title,
      price: Number(String(price).replace(/[^\d.]/g, "")) || 0,
      details,
      image,
    });
    navigate("/cart");
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">مواسم مشروك</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            عروض موسمية مصممة لك
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            برامج رمضان والحج والإجازة الصيفية مع خيارات سكن ومواصلات وخدمات إضافية تناسب احتياجك.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
          <div className="grid md:grid-cols-2 gap-6">
            {seasons.map((offer, index) => (
              <div
                key={offer.id}
                className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-52 overflow-hidden">
                  <ImageWithFallback
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                    fallbackQuery={`${offer.title} ${offer.season}`}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="text-xl font-bold">{offer.title}</h3>
                    <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {offer.season === "ramadan"
                        ? "رمضان"
                        : offer.season === "hajj"
                          ? "الحج"
                          : "الصيف"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                    {offer.options.map((option) => (
                      <span key={option} className="bg-muted px-3 py-1 rounded-full">
                        {option}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">يبدأ من</p>
                      <p className="text-lg font-bold text-primary">{offer.price} ر.س</p>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() =>
                        handleBook(offer.title, offer.price, `موسم: ${offer.season}`, offer.image)
                      }
                    >
                      احجز العرض
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted rounded-3xl p-8 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <CalendarCheck className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-bold">ماذا يميز عروض المواسم؟</h2>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              {seasonHighlights.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-card rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-semibold">وجهات مختارة</span>
              </div>
              <p className="text-sm text-muted-foreground">
                مكة المكرمة (رمضان والحج) وبرامج دراسة اللغة في الخارج خلال الصيف.
              </p>
            </div>
            <Button variant="hero" className="mt-6 w-full" onClick={() => navigate("/cart")}>
              متابعة الحجز
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

