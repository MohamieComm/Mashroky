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
  Heart, Share2, ArrowRight, Gift, Utensils,
  ThumbsUp, Award, Shield, ChevronDown,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import { defaultHotels, useAdminCollection } from "@/data/adminStore";
import { useCart } from "@/hooks/useCart";

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
  "واي فاي مجاني": Wifi,
  "مسبح": Waves,
  "موقف سيارات": Car,
  "مطعم": UtensilsCrossed,
  "تكييف": Wind,
  "صالة رياضية": Dumbbell,
  "سبا": Sparkles,
  "خدمة الغرف": Coffee,
  "خدمة غرف": Coffee,
  "إفطار": Coffee,
  "إفطار مجاني": Coffee,
  WIFI: Wifi,
  SWIMMING_POOL: Waves,
  PARKING: Car,
  RESTAURANT: UtensilsCrossed,
  AIR_CONDITIONING: Wind,
  FITNESS_CENTER: Dumbbell,
  SPA: Sparkles,
  ROOM_SERVICE: Coffee,
};

export default function HotelDetails() {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const location = useLocation();
  const hotels = useAdminCollection("hotels", defaultHotels);
  const { addItem } = useCart();
  const [hotel, setHotel] = useState<HotelResult | null>(() => {
    const stateHotel = (location.state as { hotel?: HotelResult } | null)?.hotel;
    return stateHotel || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Find matching admin hotel for enriched data
  const adminHotel = useMemo(() => {
    if (!hotelId) return null;
    return hotels.find((h) => h.id === hotelId) || null;
  }, [hotelId, hotels]);

  useEffect(() => {
    if (hotel || !hotelId) return;
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

  const handleAddToCart = (roomName: string, price: number) => {
    addItem({
      id: `hotel-${hotel?.id}-room-${Date.now()}`,
      title: `${hotel?.name || "فندق"} - ${roomName}`,
      price,
      details: `${adminHotel?.location || hotel?.address?.cityName || ""} • غرفة ${roomName}`,
      image: hotel?.media?.[0]?.uri || null,
      type: "hotel",
    });
    navigate("/cart");
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
          className={`w-4 h-4 ${i < count ? "fill-amber-400 text-amber-400" : "fill-gray-200 dark:fill-gray-700 text-gray-200 dark:text-gray-700"}`}
        />
      ))}
    </div>
  );

  // Rating info (Trip.com style - 10-scale)
  const ratingValue = hotel?.rating || adminHotel?.rating || 0;
  const ratingScore = ratingValue ? (Math.round(ratingValue * 20) / 10).toFixed(1) : null;
  const getRatingLabel = (score: number) => {
    if (score >= 9) return "ممتاز";
    if (score >= 8) return "جيد جداً";
    if (score >= 7) return "جيد";
    return "مقبول";
  };
  const getRatingColor = (score: number) => {
    if (score >= 9) return "bg-emerald-600";
    if (score >= 8) return "bg-emerald-500";
    if (score >= 7) return "bg-blue-500";
    return "bg-yellow-500";
  };

  const amenities = hotel?.amenities || adminHotel?.amenities || [];
  const fallbackQuery = `${hotel?.name || adminHotel?.name || "hotel"} ${hotel?.address?.cityName || adminHotel?.location || ""}`.trim();
  const reviewCount = adminHotel?.reviews || 0;

  return (
    <Layout>
      {/* ────────── Breadcrumb ────────── */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/hotels")} className="hover:text-primary transition-colors">الفنادق</button>
            <ArrowRight className="w-3 h-3 rotate-180" />
            <span className="text-foreground font-medium line-clamp-1">{hotel?.name || adminHotel?.name || "تفاصيل الفندق"}</span>
          </div>
        </div>
      </div>

      {/* ────────── Image Gallery - Trip.com Grid Style ────────── */}
      {galleryImages.length > 0 && (
        <section className="bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              {/* Main Gallery with Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 h-[300px] md:h-[420px]">
                {/* Main Image */}
                <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer" onClick={() => {}}>
                  <ImageWithFallback
                    src={galleryImages[galleryIndex]}
                    alt={hotel?.name || adminHotel?.name || ""}
                    className="w-full h-full object-cover"
                    fallbackQuery={fallbackQuery}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {/* Navigation arrows */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        title="السابق"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        title="التالي"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {/* Image counter */}
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {galleryIndex + 1} / {galleryImages.length}
                  </div>
                </div>
                {/* Thumbnails Grid */}
                {galleryImages.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className="hidden md:block relative cursor-pointer overflow-hidden group/thumb"
                    onClick={() => setGalleryIndex(i + 1)}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                    />
                    {/* "Show all photos" overlay on last visible thumb */}
                    {i === 3 && galleryImages.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">+{galleryImages.length - 5} صورة</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons on gallery */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Thumbnail strip below */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setGalleryIndex(i)}
                    title={`صورة ${i + 1}`}
                    className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      i === galleryIndex ? "border-primary ring-2 ring-primary/30 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ────────── Hotel Info Header ────────── */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Left: Hotel Name + Stars + Location */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {starCount > 0 && renderStars(starCount)}
                {starCount > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-lg">
                    فندق {starCount} نجوم
                  </span>
                )}
                {adminHotel?.tag && (
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                    {adminHotel.tag}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {hotel?.name || adminHotel?.name || "فندق غير محدد"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{hotel?.address?.cityName || adminHotel?.location || "مدينة غير محددة"}</span>
              </div>
            </div>

            {/* Right: Rating Widget (Trip.com style) */}
            {ratingScore && (
              <div className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border shadow-sm">
                <div className="text-right">
                  <p className="text-lg font-bold">{getRatingLabel(parseFloat(ratingScore))}</p>
                  {reviewCount > 0 && (
                    <p className="text-xs text-muted-foreground">{reviewCount.toLocaleString()} تقييم من نزلاء</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <ThumbsUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[11px] text-emerald-600 font-medium">موصى به</span>
                  </div>
                </div>
                <div className={`${getRatingColor(parseFloat(ratingScore))} text-white text-xl font-bold rounded-2xl w-14 h-14 flex items-center justify-center shadow-md`}>
                  {ratingScore}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ────────── Main Content ────────── */}
      <section className="py-6 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_340px] gap-6">
            {/* Left Column - Details */}
            <div className="space-y-5">

              {/* Quick Info Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {adminHotel?.checkInTime && (
                  <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">تسجيل الدخول</p>
                    <p className="text-sm font-bold mt-0.5">{adminHotel.checkInTime}</p>
                  </div>
                )}
                {adminHotel?.checkOutTime && (
                  <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">تسجيل الخروج</p>
                    <p className="text-sm font-bold mt-0.5">{adminHotel.checkOutTime}</p>
                  </div>
                )}
                {adminHotel?.phone && (
                  <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                      <Phone className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">الهاتف</p>
                    <p className="text-sm font-bold mt-0.5" dir="ltr">{adminHotel.phone}</p>
                  </div>
                )}
                {adminHotel?.cancellationPolicy && (
                  <div className="bg-card rounded-2xl p-4 shadow-sm border border-border text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">الإلغاء</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">مجاني</p>
                  </div>
                )}
              </div>

              {/* About Section */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  عن الفندق
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {adminHotel?.description ||
                    (hotel?.address?.lines?.length ? hotel.address.lines.join(" ") : "تفاصيل الفندق غير متوفرة حاليًا.")}
                </p>
                {adminHotel?.cuisine && (
                  <div className="mt-3 flex items-center gap-2 text-sm bg-muted/50 rounded-xl p-3">
                    <Utensils className="w-4 h-4 text-primary" />
                    <span className="font-medium">المأكولات:</span>
                    <span className="text-muted-foreground">{adminHotel.cuisine}</span>
                  </div>
                )}
              </div>

              {/* Services & Amenities - Icon Grid */}
              {amenities.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    المرافق والخدمات
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {(showAllAmenities ? amenities : amenities.slice(0, 10)).map((amenity, i) => {
                      const Icon = amenityIcons[amenity] || Check;
                      return (
                        <div key={i} className="flex flex-col items-center gap-2 bg-muted/50 rounded-xl p-3 hover:bg-muted transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-[11px] font-medium text-center leading-tight">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                  {amenities.length > 10 && (
                    <button
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="flex items-center gap-1 text-primary text-sm font-medium mt-4 hover:underline mx-auto"
                    >
                      {showAllAmenities ? "عرض أقل" : `عرض كل المرافق (${amenities.length})`}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllAmenities ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
              )}

              {/* Nearby Landmarks */}
              {adminHotel?.distances && adminHotel.distances.length > 0 && (
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    المعالم القريبة
                  </h3>
                  <div className="space-y-2">
                    {adminHotel.distances.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-muted/30 rounded-xl p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{d.name}</span>
                        </div>
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{d.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ────────── Room Types TABLE (Trip.com Style) ────────── */}
              {adminHotel?.roomTypes && adminHotel.roomTypes.length > 0 && (
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden" id="rooms">
                  <div className="p-6 pb-4 border-b border-border">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <BedDouble className="w-5 h-5 text-primary" />
                      الغرف المتاحة
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">اختر الغرفة المناسبة لك واحجز بأفضل سعر</p>
                  </div>

                  {/* Room Table Header */}
                  <div className="hidden md:grid grid-cols-[2fr_1.5fr_0.8fr_0.8fr_1fr] gap-0 bg-muted/50 text-xs font-bold text-muted-foreground px-4 py-3 border-b border-border">
                    <span>نوع الغرفة</span>
                    <span>المزايا</span>
                    <span className="text-center">السعة</span>
                    <span className="text-center">السعر / ليلة</span>
                    <span className="text-center">الحجز</span>
                  </div>

                  {/* Room Rows */}
                  <div className="divide-y divide-border">
                    {adminHotel.roomTypes.map((room, i) => {
                      const roomPrice = parsePrice(room.price);
                      const isSelected = selectedRoomType === room.name;
                      return (
                        <div
                          key={i}
                          className={`group transition-all ${isSelected ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-muted/30"}`}
                        >
                          {/* Mobile Layout */}
                          <div className="md:hidden p-4 space-y-3">
                            <div className="flex gap-3">
                              {room.image && (
                                <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0">
                                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm mb-1">{room.name}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                  <BedDouble className="w-3 h-3" />
                                  <span>{room.bedType}</span>
                                  <span>•</span>
                                  <Users className="w-3 h-3" />
                                  <span>{room.capacity}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {room.breakfast && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
                                  <Coffee className="w-3 h-3" /> إفطار مجاني
                                </span>
                              )}
                              {room.refundable && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                                  <Shield className="w-3 h-3" /> إلغاء مجاني
                                </span>
                              )}
                              {room.size && (
                                <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full">
                                  <Maximize2 className="w-3 h-3" /> {room.size}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div>
                                <span className="text-xl font-extrabold text-primary">{roomPrice.toLocaleString()}</span>
                                <span className="text-xs text-muted-foreground mr-1">ر.س / ليلة</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl text-xs"
                                  onClick={() => handleAddToCart(room.name, roomPrice)}
                                >
                                  أضف للسلة
                                </Button>
                                <Button
                                  variant="hero"
                                  size="sm"
                                  className="rounded-xl"
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
                                  احجز
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Table Row */}
                          <div className="hidden md:grid grid-cols-[2fr_1.5fr_0.8fr_0.8fr_1fr] gap-0 items-center px-4 py-4">
                            {/* Room Type + Image */}
                            <div className="flex gap-3 items-start pr-3">
                              {room.image && (
                                <div className="w-24 h-18 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                  <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm mb-1 line-clamp-1">{room.name}</h4>
                                {room.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-1.5">{room.description}</p>
                                )}
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BedDouble className="w-3 h-3" /> {room.bedType}
                                  </span>
                                  {room.size && (
                                    <span className="flex items-center gap-1">
                                      <Maximize2 className="w-3 h-3" /> {room.size}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Benefits */}
                            <div className="flex flex-col gap-1.5 px-3">
                              {room.breakfast && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                                  <Coffee className="w-3.5 h-3.5" /> إفطار مجاني
                                </span>
                              )}
                              {room.refundable && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-blue-700 dark:text-blue-400">
                                  <ShieldCheck className="w-3.5 h-3.5" /> إلغاء مجاني
                                </span>
                              )}
                              {room.refundable === false && (
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-red-500">
                                  <Ban className="w-3.5 h-3.5" /> غير قابل للإلغاء
                                </span>
                              )}
                              {room.amenities && room.amenities.slice(0, 3).map((a, j) => (
                                <span key={j} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" /> {a}
                                </span>
                              ))}
                            </div>

                            {/* Capacity */}
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                {Array.from({ length: Math.min(parseInt(room.capacity) || 2, 4) }, (_, k) => (
                                  <Users key={k} className="w-3.5 h-3.5 text-muted-foreground" />
                                ))}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">{room.capacity}</p>
                            </div>

                            {/* Price */}
                            <div className="text-center">
                              <p className="text-lg font-extrabold text-primary">{roomPrice.toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">ر.س / ليلة</p>
                            </div>

                            {/* Book Button */}
                            <div className="flex flex-col items-center gap-2 pl-3">
                              <Button
                                variant="hero"
                                size="sm"
                                className="w-full rounded-xl font-bold shadow-md"
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
                              <button
                                onClick={() => handleAddToCart(room.name, roomPrice)}
                                className="text-[11px] text-primary hover:underline font-medium"
                              >
                                أضف للسلة
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* API Offers (from Amadeus) */}
              {offers.length > 0 && !adminHotel?.roomTypes?.length && (
                <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                  <div className="p-6 pb-4 border-b border-border">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" />
                      العروض المتاحة
                    </h3>
                  </div>
                  {loading && <p className="text-muted-foreground p-6">جاري تحميل العروض...</p>}
                  {error && <p className="text-destructive p-6">{error}</p>}
                  <div className="divide-y divide-border">
                    {offers.map((offer, index) => {
                      const roomInfo = offer?.room?.typeEstimated;
                      const price = parsePrice(offer?.price?.total);
                      const currency = offer?.price?.currency || "SAR";
                      const cancellations = offer?.policies?.cancellations;
                      return (
                        <div key={offer?.id || index} className="p-5 hover:bg-muted/30 transition-colors">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-base">{roomInfo?.category || "غرفة قياسية"}</h4>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-2">
                                  <BedDouble className="w-4 h-4" />
                                  {roomInfo?.beds || 1} {roomInfo?.bedType || "سرير"}
                                </span>
                                <span className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  {offer?.guests?.adults || 2} نزيل
                                </span>
                                {offer?.checkInDate && (
                                  <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {offer.checkInDate} - {offer.checkOutDate || ""}
                                  </span>
                                )}
                              </div>
                              {cancellations && cancellations.length > 0 && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>إلغاء مجاني حتى {cancellations[0]?.deadline || "تاريخ الوصول"}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-center md:text-right flex items-center gap-4">
                              <div>
                                <p className="text-2xl font-extrabold text-primary">
                                  {price ? price.toLocaleString() : "—"} <span className="text-xs">{currency}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground">لليلة الواحدة</p>
                              </div>
                              <Button variant="hero" size="sm" className="rounded-xl" onClick={() => handleSelectOffer(offer)}>
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

            {/* ────────── Right Sidebar ────────── */}
            <div className="space-y-5">
              {/* Price Summary Card */}
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-primary/20 sticky top-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary">أفضل سعر مضمون</span>
                </div>
                <div className="text-center mb-5 bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">يبدأ من</p>
                  <p className="text-4xl font-extrabold text-primary mt-1 tracking-tight">
                    {adminHotel?.price || (offers[0] ? parsePrice(offers[0]?.price?.total).toLocaleString() : "—")}
                    <span className="text-sm font-bold mr-1">ر.س</span>
                  </p>
                  {adminHotel?.priceNote && (
                    <p className="text-[11px] text-muted-foreground mt-1">{adminHotel.priceNote} • لليلة الواحدة</p>
                  )}
                </div>
                <Button
                  variant="hero"
                  className="w-full rounded-xl font-bold text-base h-12 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    const roomsSection = document.getElementById("rooms");
                    if (roomsSection) roomsSection.scrollIntoView({ behavior: "smooth" });
                    else handleSelectOffer(null);
                  }}
                >
                  اختر الغرفة واحجز
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-3">
                  شامل الضرائب والرسوم • دفع آمن
                </p>
              </div>

              {/* Cancellation Policy Card */}
              {adminHotel?.cancellationPolicy && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">سياسة الإلغاء</h3>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">{adminHotel.cancellationPolicy}</p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  نصائح قبل الحجز
                </h3>
                <ul className="space-y-2.5 text-[12px] text-muted-foreground">
                  {[
                    "راجع سياسة الإلغاء قبل تأكيد الحجز.",
                    "تحقق من تفاصيل الغرفة وعدد النزلاء.",
                    "يمكنك التواصل معنا لأي استفسار.",
                    "الأسعار شاملة الضريبة والخدمة.",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
