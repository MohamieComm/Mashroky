import { Clock, Percent, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const offers = [
  {
    id: 1,
    title: "عروض شتاء دبي",
    description: "استمتع بأجواء دبي الشتوية مع عروض حصرية على الفنادق والرحلات",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
    discount: 35,
    validUntil: "نهاية الشهر",
    originalPrice: "3,500",
    newPrice: "2,275",
  },
  {
    id: 2,
    title: "باقة شهر العسل - المالديف",
    description: "7 ليالٍ في منتجع فاخر مع إفطار ورحلة بحرية خاصة",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
    discount: 25,
    validUntil: "15 يناير",
    originalPrice: "8,000",
    newPrice: "6,000",
  },
  {
    id: 3,
    title: "استكشف تركيا",
    description: "جولة شاملة في إسطنبول وكابادوكيا لمدة 5 أيام",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
    discount: 40,
    validUntil: "عرض محدود",
    originalPrice: "4,500",
    newPrice: "2,700",
  },
];

export function WeeklyOffers() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="text-secondary font-semibold">عروض محدودة</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">
            عروض <span className="text-gold">الأسبوع</span> الحصرية
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            لا تفوّت هذه العروض المميزة! خصومات استثنائية على أفضل الوجهات السياحية
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Discount Badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="gold-gradient text-secondary-foreground font-bold px-4 py-2 rounded-xl flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  <span>{offer.discount}% خصم</span>
                </div>
              </div>

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {offer.description}
                </p>

                {/* Validity */}
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">صالح حتى: {offer.validUntil}</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-muted-foreground line-through text-lg">
                    {offer.originalPrice} ر.س
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {offer.newPrice} ر.س
                  </span>
                </div>

                <Button variant="hero" className="w-full">
                  احجز الآن
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <Link to="/offers">
            <Button variant="outline" size="lg" className="gap-2">
              عرض جميع العروض
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
