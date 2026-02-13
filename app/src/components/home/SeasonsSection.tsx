import { CalendarCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { defaultSeasons, useAdminCollection } from "@/data/adminStore";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

export function SeasonsSection() {
  const seasons = useAdminCollection("seasons", defaultSeasons);
  const navigate = useNavigate();
  const { addItem } = useCart();

  const handleBook = (offer: (typeof seasons)[number]) => {
    addItem({
      id: `season-${offer.title}-${Date.now()}`,
      title: offer.title,
      price: Number(String(offer.price).replace(/[^\d.]/g, "")) || 0,
      details: `موسم: ${offer.season}`,
      image: offer.image,
      type: "season",
    });
    navigate("/cart");
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-4">
              <CalendarCheck className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-semibold text-sm">عروض مواسم</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              مواسم السفر القادمة
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              باقات مخصصة لرمضان والحج والصيف مع خيارات السكن والمواصلات والأنشطة حسب رغبتك.
            </p>
          </div>
          <Link to="/seasons">
            <Button variant="outline" className="gap-2">
              استعرض المواسم
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasons.map((offer, index) => (
            <div
              key={offer.id}
              className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-56 overflow-hidden">
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
                    onClick={() => handleBook(offer)}
                  >
                    احجز الآن
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
