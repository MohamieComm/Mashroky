import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { defaultHotels, type HotelItem, useAdminCollection } from "@/data/adminStore";
import { resolveRelevantImage, safeArabicText } from "@/lib/contentQuality";

export function FeaturedHotels() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const hotels = useAdminCollection("hotels", defaultHotels)
    .slice(0, 4)
    .map((hotel, index) => {
      const fallback = defaultHotels[index] || defaultHotels[0];
      const name = safeArabicText(hotel.name, fallback?.name || "فندق مميز");
      const location = safeArabicText(hotel.location, fallback?.location || "وجهة سياحية");
      const image = resolveRelevantImage(hotel.image, name, location, fallback?.image || "");

      return {
        ...hotel,
        name,
        location,
        image,
        description: safeArabicText(
          hotel.description,
          fallback?.description || "إقامة مريحة وخدمات متكاملة."
        ),
        tag: safeArabicText(hotel.tag, fallback?.tag || "الأكثر طلبًا"),
        priceNote: safeArabicText(hotel.priceNote, fallback?.priceNote || "يبدأ من"),
        amenities: Array.isArray(hotel.amenities) && hotel.amenities.length
          ? hotel.amenities.map((item, itemIndex) =>
              safeArabicText(item, fallback?.amenities?.[itemIndex] || "خدمة")
            )
          : fallback?.amenities || [],
      };
    });

  const handleBook = (hotel: HotelItem) => {
    const priceValue =
      Number(String(hotel.price || "").replace(/[^\\d.]/g, "")) || 0;
    addItem({
      id: `hotel-${hotel.name}-${Date.now()}`,
      title: hotel.name,
      price: priceValue,
      details: hotel.location,
      image: hotel.image,
      type: "hotel",
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
              <span className="text-secondary font-semibold text-sm">الفنادق المميزة</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              فنادق مختارة بعناية لراحتك
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              إقامات موثوقة للعائلات ورجال الأعمال مع مواقع مركزية وخدمات متكاملة.
            </p>
          </div>
          <Link to="/hotels">
            <Button variant="outline" className="hidden md:flex gap-2">
              عرض المزيد
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.map((hotel, index) => (
            <div
              key={hotel.id || `hotel-home-${index}`}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-52 overflow-hidden">
                <ImageWithFallback
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  fallbackQuery={`${hotel.location} hotel`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute top-4 right-4 gold-gradient text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {hotel.tag || "الأكثر طلبًا"}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold">{hotel.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hotel.location}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                  {(hotel.amenities || []).slice(0, 3).map((perk) => (
                    <span key={perk} className="bg-muted px-3 py-1 rounded-full">
                      {perk}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {hotel.priceNote || "يبدأ من"}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {hotel.price} <span className="text-sm">ر.س</span>
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleBook(hotel)}
                  >
                    احجز
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/hotels">
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
