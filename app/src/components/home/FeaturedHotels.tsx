import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { honeymoonOffers } from "@/data/content";

export function FeaturedHotels() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const handleBook = (offer: (typeof honeymoonOffers)[number]) => {
    addItem({
      id: `honeymoon-${offer.title}-${Date.now()}`,
      title: offer.title,
      price: Number(offer.price.replace(/[^\\d.]/g, "")) || 0,
      details: `${offer.location} • ${offer.duration}`,
      image: offer.image,
      type: "honeymoon",
    });
    navigate("/cart");
  };

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-semibold text-sm">شهر العسل</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              أفضل أربعة عروض شهر العسل
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              باقات رومانسية شاملة للطيران، الإقامة الفاخرة، والأنشطة الخاصة بالأزواج.
            </p>
          </div>
          <Link to="/offers">
            <Button variant="outline" className="hidden md:flex gap-2">
              عرض المزيد
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {honeymoonOffers.map((offer, index) => (
            <div
              key={offer.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-52 overflow-hidden">
                <ImageWithFallback
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  fallbackQuery={`${offer.location} honeymoon`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute top-4 right-4 gold-gradient text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  باقة للأزواج
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold">{offer.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{offer.location} • {offer.duration}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                  {offer.perks.map((perk) => (
                    <span key={perk} className="bg-muted px-3 py-1 rounded-full">
                      {perk}
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

        <div className="mt-8 text-center md:hidden">
          <Link to="/offers">
            <Button variant="outline" className="gap-2">
              عرض المزيد
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
