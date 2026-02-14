import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  MapPin, Calendar, Percent, Clock, Sparkles,
  Check, AlertCircle, ChevronLeft, ChevronRight,
  Plane, Hotel, Car, Camera, CreditCard, Shield,
  Star, Users, ArrowLeft,
} from "lucide-react";
import { defaultOffers, defaultHotels, defaultFlights, defaultActivities, useAdminCollection } from "@/data/adminStore";
import { useCart } from "@/hooks/useCart";

const seasonLabels: Record<string, string> = {
  winter: "الشتاء",
  spring: "الربيع",
  summer: "الصيف",
  ramadan: "رمضان",
  hajj: "الحج",
};

const seasonColors: Record<string, string> = {
  winter: "from-blue-600 to-cyan-500",
  spring: "from-emerald-600 to-lime-500",
  summer: "from-orange-500 to-yellow-400",
  ramadan: "from-purple-600 to-indigo-500",
  hajj: "from-amber-600 to-yellow-500",
};

export default function OfferDetails() {
  const navigate = useNavigate();
  const { offerId } = useParams();
  const { addItem } = useCart();
  const offers = useAdminCollection("offers", defaultOffers);
  const hotels = useAdminCollection("hotels", defaultHotels);
  const flights = useAdminCollection("flights", defaultFlights);
  const activities = useAdminCollection("activities", defaultActivities);

  const offer = useMemo(
    () => offers.find((o) => o.id === offerId) || null,
    [offers, offerId]
  );

  // Find related items based on offer title/season
  const relatedHotels = useMemo(() => {
    if (!offer) return [];
    const keywords = offer.title.split(" ").filter((w) => w.length > 2);
    return hotels.filter((h) =>
      keywords.some((kw) => h.name.includes(kw) || h.location.includes(kw))
    ).slice(0, 3);
  }, [offer, hotels]);

  const relatedFlights = useMemo(() => {
    if (!offer) return [];
    const keywords = offer.title.split(" ").filter((w) => w.length > 2);
    return flights.filter((f) =>
      keywords.some((kw) => f.from.includes(kw) || f.to.includes(kw))
    ).slice(0, 2);
  }, [offer, flights]);

  const relatedActivities = useMemo(() => {
    if (!offer) return [];
    const keywords = offer.title.split(" ").filter((w) => w.length > 2);
    return activities.filter((a) =>
      keywords.some((kw) => a.title.includes(kw) || a.location.includes(kw))
    ).slice(0, 3);
  }, [offer, activities]);

  if (!offer) {
    return (
      <Layout>
        <section className="py-32 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">العرض غير موجود</h1>
            <p className="text-muted-foreground mb-6">لم نتمكن من العثور على هذا العرض.</p>
            <Button variant="hero" onClick={() => navigate("/offers")}>
              عرض جميع العروض
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const seasonLabel = seasonLabels[offer.season?.toLowerCase()] || offer.season || "موسم مميز";
  const seasonColor = seasonColors[offer.season?.toLowerCase()] || "from-primary to-primary/80";
  const savings = Number(offer.originalPrice.replace(/,/g, "")) - Number(offer.newPrice.replace(/,/g, ""));

  const handleBook = () => {
    const priceValue = Number(String(offer.newPrice || offer.originalPrice).replace(/[^\d.]/g, "")) || 0;
    addItem({
      id: `offer-${offer.id}-${Date.now()}`,
      title: offer.title,
      price: priceValue,
      details: offer.description,
      image: offer.image,
      type: "offer",
    });
    navigate("/cart");
  };

  return (
    <Layout>
      {/* Hero with full-width image */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <ImageWithFallback
          src={offer.image}
          alt={offer.title}
          className="w-full h-full object-cover"
          fallbackQuery={`${offer.title} travel`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content over image */}
        <div className="absolute bottom-0 inset-x-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className={`bg-gradient-to-r ${seasonColor} text-white text-sm font-bold px-4 py-1.5 rounded-full`}>
                {seasonLabel}
              </span>
              {offer.discount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5" />
                  خصم {offer.discount}%
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{offer.title}</h1>
            <p className="text-white/80 text-lg max-w-2xl">{offer.description}</p>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          title="رجوع"
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Main Content */}
            <div className="space-y-8">

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-2xl p-4 shadow-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">صالح حتى</p>
                  <p className="text-sm font-bold mt-1">{offer.validUntil}</p>
                </div>
                <div className="bg-card rounded-2xl p-4 shadow-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                    <Percent className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">نسبة الخصم</p>
                  <p className="text-sm font-bold mt-1 text-emerald-600">{offer.discount}%</p>
                </div>
                <div className="bg-card rounded-2xl p-4 shadow-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">التوفير</p>
                  <p className="text-sm font-bold mt-1 text-orange-600">{savings.toLocaleString()} ر.س</p>
                </div>
                <div className="bg-card rounded-2xl p-4 shadow-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">الموسم</p>
                  <p className="text-sm font-bold mt-1">{seasonLabel}</p>
                </div>
              </div>

              {/* What's Included */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  ما تشمله الباقة
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {offer.includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted rounded-xl p-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  نصائح مهمة قبل الحجز
                </h2>
                <ul className="space-y-3">
                  {offer.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Flights */}
              {relatedFlights.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    رحلات مقترحة
                  </h2>
                  <div className="space-y-3">
                    {relatedFlights.map((flight) => (
                      <div key={flight.id} className="bg-muted rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold">{flight.departTime}</p>
                            <p className="text-xs text-muted-foreground">{flight.from}</p>
                          </div>
                          <div className="flex flex-col items-center px-4">
                            <span className="text-xs text-muted-foreground">{flight.duration}</span>
                            <div className="w-16 h-px bg-border my-1" />
                            <span className="text-[10px] text-emerald-600">{flight.stops}</span>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">{flight.arriveTime}</p>
                            <p className="text-xs text-muted-foreground">{flight.to}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <p className="text-xs text-muted-foreground">{flight.airline}</p>
                            {flight.flightNumber && (
                              <p className="text-xs text-primary font-medium">{flight.flightNumber}</p>
                            )}
                          </div>
                          <p className="text-lg font-bold text-primary">{flight.price} <span className="text-xs">ر.س</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 gap-2" onClick={() => navigate("/trips")}>
                    البحث عن المزيد من الرحلات
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Related Hotels */}
              {relatedHotels.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-primary" />
                    فنادق مقترحة
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedHotels.map((hotel) => (
                      <div
                        key={hotel.id}
                        className="bg-muted rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all"
                        onClick={() => navigate(`/hotels/${hotel.id}`, { state: { hotel: { id: hotel.id, name: hotel.name, rating: hotel.rating, address: { cityName: hotel.location }, media: [{ uri: hotel.image }] } } })}
                      >
                        <div className="h-32">
                          <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm">{hotel.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{hotel.location}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{hotel.rating}</span>
                            </div>
                            <p className="text-sm font-bold text-primary">{hotel.price} <span className="text-[10px]">ر.س</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Activities */}
              {relatedActivities.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    أنشطة مقترحة
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {relatedActivities.map((activity) => (
                      <div key={activity.id} className="bg-muted rounded-xl overflow-hidden">
                        <div className="h-32">
                          <img src={activity.image} alt={activity.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <h4 className="font-bold text-sm">{activity.title}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{activity.location}</span>
                          </div>
                          {activity.duration && (
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{activity.duration}</span>
                            </div>
                          )}
                          <p className="text-sm font-bold text-primary mt-2">{activity.price} <span className="text-[10px]">ر.س</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Booking Card */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 shadow-card border border-primary/20 sticky top-4">
                {/* Price */}
                <div className="text-center mb-5">
                  <p className="text-sm text-muted-foreground line-through">{offer.originalPrice} ر.س</p>
                  <p className="text-4xl font-bold text-primary mt-1">
                    {offer.newPrice} <span className="text-sm">ر.س</span>
                  </p>
                  <div className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 text-xs font-bold px-3 py-1 rounded-full mt-2">
                    <Percent className="w-3 h-3" />
                    وفر {savings.toLocaleString()} ر.س
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full text-lg" onClick={handleBook}>
                  احجز الآن
                </Button>

                {/* Validity */}
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>صالح حتى: {offer.validUntil}</span>
                </div>

                {/* Guarantee */}
                <div className="mt-5 pt-5 border-t border-border space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>ضمان أفضل سعر</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>تأكيد فوري للحجز</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>دعم عربي على مدار الساعة</span>
                  </div>
                </div>
              </div>

              {/* Season Badge */}
              <div className={`bg-gradient-to-r ${seasonColor} rounded-2xl p-6 text-white text-center`}>
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <h3 className="text-lg font-bold">عرض {seasonLabel}</h3>
                <p className="text-sm text-white/80 mt-1">باقة مصممة خصيصاً لموسم {seasonLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
