import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  MapPin, Star, BedDouble, Users, Calendar,
  Wifi, Dumbbell, Car, UtensilsCrossed, Wind,
  Waves, ChevronLeft, ChevronRight, Phone,
  Clock, ShieldCheck, Ban, Check, Coffee,
  Maximize2, Info, Building2, Sparkles,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import { defaultHotels, useAdminCollection } from "@/data/adminStore";

const HOTEL_SELECTION_KEY = "mashrouk-hotel-selection";

type HotelOffer = {
  id?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  room?: { typeEstimated?: { category?: string; beds?: number; bedType?: string } } | null;
  guests?: { adults?: number } | null;
  price?: { total?: string; currency?: string } | null;
  policies?: { cancellations?: Array<{ deadline?: string; amount?: string }> } | null;
};

type HotelResult = {
  id: string | null;
  name: string | null;
  cityCode?: string | null;
  rating?: number | null;
  amenities?: string[];
  address?: { cityName?: string; lines?: string[] } | null;
  geoCode?: { latitude?: number; longitude?: number } | null;
  media?: Array<{ uri?: string }>;
  offers?: HotelOffer[];
  cheapestOffer?: HotelOffer | null;
  raw?: unknown;
};

type ApiResponse = {
  results?: HotelResult[];
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

// Amenity icon mapping
const amenityIcons: Record<string, typeof Wifi> = {
  "واي فاي": Wifi,
  "مسبح": Waves,
  "موقف سيارات": Car,
  "مطعم": UtensilsCrossed,
  "تكييف": Wind,
  "صالة رياضية": Dumbbell,
  "سبا": Sparkles,
  "خدمة الغرف": Coffee,
  "WIFI": Wifi,
  "SWIMMING_POOL": Waves,
  "PARKING": Car,
  "RESTAURANT": UtensilsCrossed,
  "AIR_CONDITIONING": Wind,
  "FITNESS_CENTER": Dumbbell,
  "SPA": Sparkles,
  "ROOM_SERVICE": Coffee,
};

export default function HotelDetails() {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const location = useLocation();
  const hotels = useAdminCollection("hotels", defaultHotels);
  const [hotel, setHotel] = useState<HotelResult | null>(() => {
    const stateHotel = (location.state as { hotel?: HotelResult } | null)?.hotel;
    return stateHotel || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);

  // Find matching admin hotel for enriched data
  const adminHotel = useMemo(() => {
    if (!hotelId) return null;
    return hotels.find((h) => h.id === hotelId) || null;
  }, [hotelId, hotels]);

  useEffect(() => {
    if (hotel || !hotelId) return;
    // Check admin hotels first
    if (adminHotel) {
      setHotel({
        id: adminHotel.id,
        name: adminHotel.name,
        rating: adminHotel.rating,
        amenities: adminHotel.amenities,
        address: { cityName: adminHotel.location, lines: [adminHotel.description] },
        media: [
          { uri: adminHotel.image },
          ...(adminHotel.gallery || []).map((uri) => ({ uri })),
        ],
        offers: adminHotel.roomTypes?.map((rt, i) => ({
          id: `room-${i}`,
          room: { typeEstimated: { category: rt.name, beds: 1, bedType: rt.bedType } },
          guests: { adults: parseInt(rt.capacity) || 2 },
          price: { total: rt.price, currency: "SAR" },
        })) || [],
      });
      return;
    }
    // Fetch from API
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiPost("/api/hotels/details", { hotelId });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || "hotel_details_failed");
        }
        const response = (await res.json()) as ApiResponse;
        const first = response?.results?.[0] || null;
        setHotel(first);
      } catch {
        setError("تعذر تحميل بيانات الفندق. حاول مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hotel, hotelId, adminHotel]);

  const offers = useMemo(() => hotel?.offers || [], [hotel]);

  const handleSelectOffer = (offer?: HotelOffer | null) => {
    if (!hotel) return;
    const payload = { hotel, offer: offer || hotel.cheapestOffer || null };
    localStorage.setItem(HOTEL_SELECTION_KEY, JSON.stringify(payload));
    navigate(`/hotels/${hotel.id}/booking`, { state: payload });
  };

  // Gallery images
  const galleryImages = useMemo(() => {
    const images: string[] = [];
    if (adminHotel?.image) images.push(adminHotel.image);
    if (adminHotel?.gallery) images.push(...adminHotel.gallery);
    if (hotel?.media) {
      hotel.media.forEach((m) => {
        if (m.uri && !images.includes(m.uri)) images.push(m.uri);
      });
    }
    return images.length > 0 ? images : [];
  }, [hotel, adminHotel]);

  const nextImage = () => setGalleryIndex((i) => (i + 1) % galleryImages.length);
  const prevImage = () => setGalleryIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length);

  // Star rating display
  const starCount = adminHotel?.starCategory || Math.round(hotel?.rating || 0);
  const renderStars = (count: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < count ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );

  // Rating badge
  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return { label: "ممتاز", color: "bg-emerald-600" };
    if (rating >= 4) return { label: "جيد جداً", color: "bg-emerald-500" };
    if (rating >= 3.5) return { label: "جيد", color: "bg-blue-500" };
    return { label: "مقبول", color: "bg-yellow-500" };
  };

  const ratingValue = hotel?.rating || adminHotel?.rating || 0;
  const ratingBadge = ratingValue ? getRatingBadge(ratingValue) : null;
  const amenities = hotel?.amenities || adminHotel?.amenities || [];
  const fallbackQuery = `${hotel?.name || adminHotel?.name || "hotel"} ${hotel?.address?.cityName || adminHotel?.location || ""}`.trim();

  return (
    <Layout>
      {/* Hero Header */}
      <section className="hero-gradient py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {renderStars(starCount)}
            <span className="text-primary-foreground/70 text-sm mr-2">
              {starCount > 0 ? `${starCount} نجوم` : ""}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-2">
            {hotel?.name || adminHotel?.name || "فندق غير محدد"}
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary-foreground/80 mt-3">
            <MapPin className="w-4 h-4" />
            <span>{hotel?.address?.cityName || adminHotel?.location || "مدينة غير محددة"}</span>
          </div>
          {ratingBadge && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className={`${ratingBadge.color} text-white px-3 py-1 rounded-lg text-sm font-bold`}>
                {ratingValue}
              </span>
              <span className="text-primary-foreground/80 text-sm">{ratingBadge.label}</span>
              {adminHotel?.reviews ? (
                <span className="text-primary-foreground/60 text-xs">({adminHotel.reviews} تقييم)</span>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">

          {/* Image Gallery */}
          {galleryImages.length > 0 && (
            <div className="mb-8">
              <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                <div className="aspect-[16/7] md:aspect-[16/6]">
                  <ImageWithFallback
                    src={galleryImages[galleryIndex]}
                    alt={hotel?.name || adminHotel?.name || ""}
                    className="w-full h-full object-cover"
                    fallbackQuery={fallbackQuery}
                  />
                </div>
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      title="الصورة السابقة"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      title="الصورة التالية"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      {galleryImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIndex(i)}
                          title={`الصورة ${i + 1}`}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            i === galleryIndex ? "bg-white w-6" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                      {galleryIndex + 1} / {galleryImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryIndex(i)}
                      title={`عرض الصورة ${i + 1}`}
                      className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        i === galleryIndex ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
            {/* Left Column - Details */}
            <div className="space-y-6">

              {/* Quick Info Bar */}
              <div className="bg-card rounded-2xl p-5 shadow-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {adminHotel?.checkInTime && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">تسجيل الدخول</p>
                        <p className="text-sm font-semibold">{adminHotel.checkInTime}</p>
                      </div>
                    </div>
                  )}
                  {adminHotel?.checkOutTime && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">تسجيل الخروج</p>
                        <p className="text-sm font-semibold">{adminHotel.checkOutTime}</p>
                      </div>
                    </div>
                  )}
                  {adminHotel?.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">الهاتف</p>
                        <p className="text-sm font-semibold" dir="ltr">{adminHotel.phone}</p>
                      </div>
                    </div>
                  )}
                  {adminHotel?.cancellationPolicy && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">الإلغاء</p>
                        <p className="text-sm font-semibold text-emerald-600">{adminHotel.cancellationPolicy}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              <div className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  عن الفندق
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {adminHotel?.description ||
                    (hotel?.address?.lines?.length ? hotel.address.lines.join(" ") : "تفاصيل العنوان غير متوفرة حاليًا.")}
                </p>
                {adminHotel?.cuisine && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    <span className="font-medium">المأكولات:</span>
                    <span className="text-muted-foreground">{adminHotel.cuisine}</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    المرافق والخدمات
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity, i) => {
                      const Icon = amenityIcons[amenity] || Check;
                      return (
                        <div key={i} className="flex items-center gap-3 bg-muted rounded-xl p-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Distances */}
              {adminHotel?.distances && adminHotel.distances.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    المسافات من المعالم
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminHotel.distances.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{d.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary">{d.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Types */}
              {adminHotel?.roomTypes && adminHotel.roomTypes.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-primary" />
                    أنواع الغرف المتاحة
                  </h3>
                  <div className="space-y-4">
                    {adminHotel.roomTypes.map((room, i) => (
                      <div
                        key={i}
                        className={`border rounded-2xl overflow-hidden transition-all ${
                          selectedRoomType === room.name ? "border-primary ring-2 ring-primary/20" : "border-border"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Room Image */}
                          {room.image && (
                            <div className="md:w-56 h-44 md:h-auto shrink-0">
                              <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {/* Room Details */}
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-lg font-bold">{room.name}</h4>
                                {room.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-3 text-xs">
                              <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                                <BedDouble className="w-3.5 h-3.5" />
                                <span>{room.bedType}</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                                <Users className="w-3.5 h-3.5" />
                                <span>{room.capacity}</span>
                              </div>
                              {room.size && (
                                <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full">
                                  <Maximize2 className="w-3.5 h-3.5" />
                                  <span>{room.size}</span>
                                </div>
                              )}
                              {room.breakfast && (
                                <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full">
                                  <Coffee className="w-3.5 h-3.5" />
                                  <span>إفطار مجاني</span>
                                </div>
                              )}
                              {room.refundable && (
                                <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>قابل للاسترداد</span>
                                </div>
                              )}
                              {room.refundable === false && (
                                <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full">
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>غير قابل للاسترداد</span>
                                </div>
                              )}
                            </div>
                            {/* Room Amenities */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {room.amenities.map((a, j) => (
                                  <span key={j} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Price & Action */}
                          <div className="md:w-44 p-4 flex flex-col items-center justify-center border-t md:border-t-0 md:border-r border-border bg-muted/30">
                            <p className="text-xs text-muted-foreground">لليلة الواحدة</p>
                            <p className="text-2xl font-bold text-primary mt-1">
                              {room.price} <span className="text-xs">ر.س</span>
                            </p>
                            <Button
                              variant="hero"
                              size="sm"
                              className="w-full mt-3"
                              onClick={() => {
                                setSelectedRoomType(room.name);
                                handleSelectOffer({
                                  id: `room-${i}`,
                                  room: { typeEstimated: { category: room.name, beds: 1, bedType: room.bedType } },
                                  guests: { adults: parseInt(room.capacity) || 2 },
                                  price: { total: room.price, currency: "SAR" },
                                });
                              }}
                            >
                              احجز الآن
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* API Offers (from Amadeus) */}
              {offers.length > 0 && !adminHotel?.roomTypes?.length && (
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <h3 className="text-xl font-bold mb-4">العروض المتاحة</h3>
                  {loading && <p className="text-muted-foreground">جاري تحميل العروض...</p>}
                  {error && <p className="text-destructive">{error}</p>}
                  <div className="space-y-4">
                    {offers.map((offer, index) => {
                      const roomInfo = offer?.room?.typeEstimated;
                      const price = parsePrice(offer?.price?.total);
                      const currency = offer?.price?.currency || "SAR";
                      const cancellations = offer?.policies?.cancellations;
                      return (
                        <div key={offer?.id || index} className="bg-muted rounded-2xl p-5 border border-border hover:border-primary/30 transition-all">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg">{roomInfo?.category || "غرفة قياسية"}</h4>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-2">
                                  <BedDouble className="w-4 h-4" />
                                  {roomInfo?.beds || 1} {roomInfo?.bedType || "سرير"}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  {offer?.guests?.adults || 2} نزيل
                                </div>
                                {offer?.checkInDate && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {offer.checkInDate} - {offer.checkOutDate || ""}
                                  </div>
                                )}
                              </div>
                              {cancellations && cancellations.length > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>
                                    إلغاء مجاني حتى {cancellations[0]?.deadline || "تاريخ الوصول"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-center md:text-right">
                              <div className="text-2xl font-bold text-primary">
                                {price ? price.toLocaleString() : "—"} <span className="text-sm">{currency}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">لليلة الواحدة</p>
                              <Button variant="hero" size="sm" className="mt-2" onClick={() => handleSelectOffer(offer)}>
                                احجز الآن
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Price Summary Card */}
              <div className="bg-card rounded-2xl p-6 shadow-card border border-primary/20 sticky top-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">يبدأ من</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {adminHotel?.price || (offers[0] ? parsePrice(offers[0]?.price?.total).toLocaleString() : "—")}
                    <span className="text-sm mr-1">ر.س</span>
                  </p>
                  {adminHotel?.priceNote && (
                    <p className="text-xs text-muted-foreground mt-1">{adminHotel.priceNote}</p>
                  )}
                </div>
                <Button variant="hero" className="w-full" onClick={() => handleSelectOffer(null)}>
                  احجز بأفضل سعر
                </Button>
                {adminHotel?.tag && (
                  <div className="mt-3 text-center">
                    <span className="inline-block bg-secondary/10 text-secondary text-xs font-semibold px-3 py-1 rounded-full">
                      {adminHotel.tag}
                    </span>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="bg-muted rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  نصائح قبل الحجز
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>راجع سياسة الإلغاء قبل تأكيد الحجز.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>تحقق من تفاصيل الغرفة وعدد النزلاء.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>يمكنك التواصل معنا لأي استفسار قبل الدفع.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>أسعار الغرف تشمل الضريبة والخدمة.</span>
                  </li>
                </ul>
              </div>

              {/* Cancellation Policy Card */}
              {adminHotel?.cancellationPolicy && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">سياسة الإلغاء</h3>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{adminHotel.cancellationPolicy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
