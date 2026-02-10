import { MapPin, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { seasonalOffers } from "@/data/content";

export function FeaturedDestinations() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const handleBook = (offer: (typeof seasonalOffers)[number]) => {
    addItem({
      id: `seasonal-${offer.title}-${Date.now()}`,
      title: offer.title,
      price: Number(offer.price.replace(/[^\\d.]/g, "")) || 0,
      details: `${offer.location} • ${offer.duration}`,
      image: offer.image,
      type: "seasonal",
    });
    navigate("/cart");
  };
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            {/* Removed colored badge above title (empty/visual only) */}
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              أفضل ستة عروض لأكثر الوجهات سياحة
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              باقات شاملة للطيران والفنادق والأنشطة الترفيهية والمواصلات لهذا الموسم.
            </p>
          </div>
          <Link to="/offers">
            <Button variant="outline" className="hidden md:flex gap-2">
              عرض جميع العروض
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasonalOffers.map((offer, index) => (
            <div
              key={offer.id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                <ImageWithFallback
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  fallbackQuery={`${offer.location} ${offer.title}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="gold-gradient text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {offer.tag}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-primary">
                  {offer.discount}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{offer.title}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{offer.location}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">المدة: {offer.duration}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">يبدأ من</p>
                    <p className="text-xl font-bold text-primary">
                      {offer.price} <span className="text-sm">ر.س</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 text-xs text-muted-foreground">
                  {offer.includes.map((item) => (
                    <span key={item} className="bg-muted px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>

                <Button
                  variant="hero"
                  className="w-full mt-5"
                  onClick={() => handleBook(offer)}
                >
                  احجز الآن
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/offers">
            <Button variant="outline" className="gap-2">
              عرض جميع العروض
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
