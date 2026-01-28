import { MapPin, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const destinations = [
  {
    id: 1,
    name: "دبي",
    country: "الإمارات العربية المتحدة",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    rating: 4.9,
    price: "1,299",
    tag: "الأكثر طلباً",
  },
  {
    id: 2,
    name: "إسطنبول",
    country: "تركيا",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
    rating: 4.8,
    price: "899",
    tag: "عرض خاص",
  },
  {
    id: 3,
    name: "باريس",
    country: "فرنسا",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    rating: 4.9,
    price: "2,199",
    tag: "رومانسية",
  },
  {
    id: 4,
    name: "المالديف",
    country: "جزر المالديف",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
    rating: 5.0,
    price: "3,499",
    tag: "شهر العسل",
  },
];

export function FeaturedDestinations() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">
              استكشف العالم
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              الوجهات <span className="text-gradient">الأكثر طلباً</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              اكتشف أجمل الوجهات السياحية حول العالم واستمتع بتجارب لا تُنسى مع مشروك
            </p>
          </div>
          <Link to="/trips">
            <Button variant="outline" className="hidden md:flex gap-2">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, index) => (
            <div
              key={dest.id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                
                {/* Tag */}
                <div className="absolute top-4 right-4">
                  <span className="gold-gradient text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {dest.tag}
                  </span>
                </div>

                {/* Rating */}
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="text-sm font-semibold">{dest.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{dest.name}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{dest.country}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground">يبدأ من</p>
                    <p className="text-xl font-bold text-primary">{dest.price} <span className="text-sm">ر.س</span></p>
                  </div>
                </div>

                <Button variant="hero" className="w-full mt-4">
                  احجز الآن
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/trips">
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
