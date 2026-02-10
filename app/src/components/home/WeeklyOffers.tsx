import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { studyOffers } from "@/data/content";

export function WeeklyOffers() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const handleBook = (offer: (typeof studyOffers)[number]) => {
    addItem({
      id: `study-${offer.title}-${Date.now()}`,
      title: offer.title,
      price: Number(offer.price.replace(/[^\\d.]/g, "")) || 0,
      details: offer.location,
      image: offer.image,
      type: "study",
    });
    navigate("/cart");
  };

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Removed empty colored background boxes */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          {/* Removed colored badge above title (empty/visual only) */}
          <h2 className="text-3xl md:text-4xl font-bold">
            أفضل أربعة عروض <span className="text-secondary">لدراسة اللغة الإنجليزية</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            برامج مرنة مع خيارات سكن وأنشطة طلابية ومرافقة منذ القبول وحتى العودة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studyOffers.map((offer, index) => (
            <div
              key={offer.id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  fallbackQuery={`${offer.location} دراسة لغة`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-primary">
                  {offer.duration}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                <p className="text-sm text-muted-foreground">{offer.location}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                  {offer.includes.map((item) => (
                    <span key={item} className="bg-muted px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ابتداءً من</p>
                    <p className="text-xl font-bold text-primary">
                      {offer.price} <span className="text-sm">ر.س</span>
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleBook(offer)}
                  >
                    احجز
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/study">
            <Button variant="outline" size="lg" className="gap-2">
              عرض برامج الدراسة
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
