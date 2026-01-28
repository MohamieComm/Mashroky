import { MapPin, Star, Wifi, Car, Coffee, Dumbbell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const hotels = [
  {
    id: 1,
    name: "فندق برج العرب",
    location: "دبي، الإمارات",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    rating: 5.0,
    price: "2,500",
    amenities: ["wifi", "parking", "breakfast", "gym"],
    distance: "5 دقائق من المطار",
  },
  {
    id: 2,
    name: "فندق أتلانتس النخلة",
    location: "دبي، الإمارات",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    rating: 4.9,
    price: "1,800",
    amenities: ["wifi", "parking", "breakfast"],
    distance: "15 دقيقة من الأسواق",
  },
  {
    id: 3,
    name: "فندق فور سيزونز",
    location: "إسطنبول، تركيا",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    rating: 4.8,
    price: "1,200",
    amenities: ["wifi", "breakfast", "gym"],
    distance: "10 دقائق من البازار الكبير",
  },
];

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  gym: Dumbbell,
};

export function FeaturedHotels() {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
              أفضل الإقامات
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              فنادق <span className="text-gradient">مميزة</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              اكتشف مجموعة منتقاة من أفضل الفنادق العالمية بخدمات استثنائية وأسعار تنافسية
            </p>
          </div>
          <Link to="/hotels">
            <Button variant="outline" className="hidden md:flex gap-2">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {hotels.map((hotel, index) => (
            <div
              key={hotel.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="text-sm font-bold">{hotel.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                
                <div className="flex items-center gap-1 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{hotel.location}</span>
                </div>

                <p className="text-sm text-primary font-medium mb-4">
                  📍 {hotel.distance}
                </p>

                {/* Amenities */}
                <div className="flex gap-2 mb-6">
                  {hotel.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity];
                    return (
                      <div
                        key={amenity}
                        className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center"
                        title={amenity}
                      >
                        <Icon className="w-5 h-5 text-accent-foreground" />
                      </div>
                    );
                  })}
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">يبدأ من / ليلة</p>
                    <p className="text-2xl font-bold text-primary">
                      {hotel.price} <span className="text-sm">ر.س</span>
                    </p>
                  </div>
                  <Button variant="hero">احجز الآن</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/hotels">
            <Button variant="outline" className="gap-2">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
