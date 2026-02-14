import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import DatePickerField from "@/components/DatePickerField";
import {
  Hotel,
  MapPin,
  Users,
  Star,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Utensils,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Heart,
  Shield,
  BadgeCheck,
  Award,
  Briefcase,
  Baby,
  ThumbsUp,
  Flame,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { defaultHotels, useAdminCollection, type HotelItem } from "@/data/adminStore";
import { apiPost } from "@/lib/api";

/* ────────── Amenity icons mapping ────────── */
const amenityIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; name: string }> = {
  WIFI: { icon: Wifi, name: "واي فاي" },
  PARKING: { icon: Car, name: "موقف سيارات" },
  BREAKFAST: { icon: Coffee, name: "إفطار" },
  GYM: { icon: Dumbbell, name: "صالة رياضية" },
  POOL: { icon: Waves, name: "مسبح" },
  RESTAURANT: { icon: Utensils, name: "مطعم" },
  SPA: { icon: Sparkles, name: "سبا" },
  "واي فاي مجاني": { icon: Wifi, name: "واي فاي" },
  "مسبح": { icon: Waves, name: "مسبح" },
  "موقف سيارات": { icon: Car, name: "موقف سيارات" },
  "إفطار": { icon: Coffee, name: "إفطار" },
  "صالة رياضية": { icon: Dumbbell, name: "صالة رياضية" },
  "خدمة غرف": { icon: Coffee, name: "خدمة غرف" },
  "مطعم": { icon: Utensils, name: "مطعم" },
};

/* ────────── Tag → badge config ────────── */
const tagBadges: Record<string, { icon: React.ComponentType<{ className?: string }>; bg: string; text: string }> = {
  "الأكثر طلبا": { icon: Flame, bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  "الأكثر طلباً": { icon: Flame, bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  "فاخر": { icon: Award, bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
  "رجال أعمال": { icon: Briefcase, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  "عائلي": { icon: Baby, bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
  "أفضل قيمة": { icon: ThumbsUp, bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  "منتجع": { icon: Sparkles, bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300" },
  "إطلالة بحرية": { icon: Waves, bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300" },
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

type HotelOffer = {
  id?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  room?: { typeEstimated?: { category?: string; beds?: number; bedType?: string } } | null;
  guests?: { adults?: number } | null;
  price?: { total?: string; currency?: string } | null;
  policies?: unknown;
};

type HotelResult = {
  id: string | null;
  name: string | null;
  cityCode?: string | null;
  rating?: number | null;
  reviews?: number | null;
  amenities?: string[];
  address?: { cityName?: string; lines?: string[] } | null;
  geoCode?: { latitude?: number; longitude?: number } | null;
  media?: Array<{ uri?: string }>;
  offers?: HotelOffer[];
  cheapestOffer?: HotelOffer | null;
  tag?: string | null;
  starCategory?: number | null;
  cancellationPolicy?: string | null;
  raw?: unknown;
};

type ApiResponse = {
  results?: HotelResult[];
  meta?: unknown;
  warnings?: unknown;
};

type HotelSortMode = "popular" | "cheapest" | "expensive" | "rating";

export default function Hotels() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const fallbackHotels = useAdminCollection("hotels", defaultHotels);

  const [cityCode, setCityCode] = useState("JED");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState("2");
  const [roomQuantity, setRoomQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<HotelResult[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // ====== Filter & Sort State ======
  const [sortMode, setSortMode] = useState<HotelSortMode>("popular");
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 10000]);
  const [filterRating, setFilterRating] = useState<number[]>([]);
  const [filterAmenities, setFilterAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleAmenity = (amenity: string) => {
    setFilterAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity]
    );
  };

  const toggleFavorite = (hotelId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(hotelId)) next.delete(hotelId);
      else next.add(hotelId);
      return next;
    });
  };

  const searchHotels = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost("/api/hotels/search", {
        cityCode: cityCode.trim() || undefined,
        checkInDate: checkInDate || undefined,
        checkOutDate: checkOutDate || undefined,
        adults: adults || undefined,
        roomQuantity: roomQuantity || undefined,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "hotel_search_failed");
      }
      const response = (await res.json()) as ApiResponse;
      const data = Array.isArray(response?.results) ? response.results : [];
      setResults(data);
    } catch (err) {
      const code = err instanceof Error ? err.message : "hotel_search_failed";
      setError(
        code === "hotel_search_failed"
          ? "تعذر جلب نتائج الفنادق. يرجى المحاولة مرة أخرى."
          : "حدث خطأ غير متوقع أثناء البحث. حاول لاحقًا."
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const mappedFallback = useMemo<HotelResult[]>(
    () =>
      fallbackHotels.map((hotel: HotelItem) => ({
        id: hotel.id,
        name: hotel.name,
        cityCode: null,
        rating: hotel.rating,
        reviews: hotel.reviews,
        amenities: hotel.amenities,
        address: { cityName: hotel.location, lines: [hotel.description] },
        media: [
          ...(hotel.image ? [{ uri: hotel.image }] : []),
          ...(hotel.gallery || []).map((uri) => ({ uri })),
        ],
        offers: [
          {
            id: hotel.id,
            price: { total: hotel.price, currency: "SAR" },
            checkInDate: null,
            checkOutDate: null,
          },
        ],
        cheapestOffer: {
          id: hotel.id,
          price: { total: hotel.price, currency: "SAR" },
        },
        tag: hotel.tag,
        starCategory: hotel.starCategory || null,
        cancellationPolicy: hotel.cancellationPolicy || null,
        raw: hotel,
      })),
    [fallbackHotels]
  );

  const displayedResults = results.length ? results : mappedFallback;

  const priceExtent = useMemo(() => {
    if (!displayedResults.length) return { min: 0, max: 10000 };
    const prices = displayedResults
      .map((h) => parsePrice(h?.cheapestOffer?.price?.total))
      .filter((p) => p > 0);
    if (!prices.length) return { min: 0, max: 10000 };
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [displayedResults]);

  const filteredSortedResults = useMemo(() => {
    let filtered = displayedResults.filter((hotel) => {
      const price = parsePrice(hotel?.cheapestOffer?.price?.total);
      if (price > 0 && (price < filterPriceRange[0] || price > filterPriceRange[1])) return false;
      if (filterRating.length > 0) {
        const rating = hotel?.rating || 0;
        if (!filterRating.some((r) => rating >= r && rating < r + 1)) return false;
      }
      if (filterAmenities.length > 0) {
        const hotelAmenities = (hotel?.amenities || []).map((v) => v.toUpperCase());
        if (!filterAmenities.every((a) => hotelAmenities.includes(a) || hotelAmenities.some((ha) => ha.includes(a)))) return false;
      }
      return true;
    });

    switch (sortMode) {
      case "cheapest":
        filtered = filtered.slice().sort((a, b) => parsePrice(a?.cheapestOffer?.price?.total) - parsePrice(b?.cheapestOffer?.price?.total));
        break;
      case "expensive":
        filtered = filtered.slice().sort((a, b) => parsePrice(b?.cheapestOffer?.price?.total) - parsePrice(a?.cheapestOffer?.price?.total));
        break;
      case "rating":
        filtered = filtered.slice().sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
        break;
      case "popular":
      default:
        break;
    }
    return filtered;
  }, [displayedResults, sortMode, filterPriceRange, filterRating, filterAmenities]);

  const handleViewDetails = (hotel: HotelResult) => {
    if (!hotel?.id) return;
    navigate(`/hotels/${hotel.id}`, { state: { hotel } });
  };

  const handleBook = (hotel: HotelResult, offer?: HotelOffer | null) => {
    if (!hotel?.id) return;
    const price = parsePrice(offer?.price?.total ?? hotel?.cheapestOffer?.price?.total);
    const currency = offer?.price?.currency || hotel?.cheapestOffer?.price?.currency || "SAR";
    addItem({
      id: `hotel-${hotel.id}-${Date.now()}`,
      title: hotel.name || "حجز فندق",
      price,
      details: `${hotel?.address?.cityName || ""} • ${currency}`.trim(),
      image: hotel?.media?.[0]?.uri || null,
      type: "hotel",
    });
    navigate("/cart");
  };

  /* ────────── Rating helpers (Trip.com style) ────────── */
  const getRatingInfo = (rating: number | null | undefined) => {
    if (!rating) return null;
    const score = Math.round(rating * 20) / 10; // convert 5-scale to 10-scale
    let label = "مقبول";
    let color = "bg-yellow-500";
    if (score >= 9) { label = "ممتاز"; color = "bg-emerald-600"; }
    else if (score >= 8) { label = "جيد جداً"; color = "bg-emerald-500"; }
    else if (score >= 7) { label = "جيد"; color = "bg-blue-500"; }
    else if (score >= 6) { label = "مقبول"; color = "bg-yellow-500"; }
    return { score: score.toFixed(1), label, color };
  };

  const renderStars = (count: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i < Math.round(count) ? "fill-amber-400 text-amber-400" : "fill-gray-200 dark:fill-gray-700 text-gray-200 dark:text-gray-700"
          }`}
        />
      ))}
    </div>
  );

  const activeFilterCount = filterRating.length + filterAmenities.length +
    (filterPriceRange[0] !== priceExtent.min || filterPriceRange[1] !== (priceExtent.max || 10000) ? 1 : 0);

  /* ────────── Filter Sidebar ────────── */
  const renderFilterSidebar = () => (
    <aside className="w-full lg:w-72 shrink-0 space-y-3">
      {/* Price Range */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          ميزانية لليلة (ر.س)
        </h4>
        <Slider
          min={priceExtent.min}
          max={priceExtent.max || 10000}
          step={50}
          value={filterPriceRange}
          onValueChange={(v) => setFilterPriceRange(v as [number, number])}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="bg-muted px-2 py-1 rounded-lg font-medium">{filterPriceRange[0].toLocaleString()}</span>
          <span className="text-muted-foreground">—</span>
          <span className="bg-muted px-2 py-1 rounded-lg font-medium">{filterPriceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Star Rating */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-3">تصنيف النجوم</h4>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() =>
                setFilterRating((prev) =>
                  prev.includes(star) ? prev.filter((r) => r !== star) : [...prev, star]
                )
              }
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                filterRating.includes(star)
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-transparent hover:border-border"
              }`}
            >
              <Star className={`w-3 h-3 ${filterRating.includes(star) ? "fill-amber-400 text-amber-400" : "fill-gray-300 text-gray-300"}`} />
              {star}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-3">المرافق والخدمات</h4>
        <div className="space-y-0.5">
          {Object.entries(amenityIcons).slice(0, 7).map(([key, meta]) => {
            const Icon = meta.icon;
            const isActive = filterAmenities.includes(key);
            return (
              <label
                key={key}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -mx-1"
              >
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) => {
                    setFilterAmenities((prev) =>
                      checked ? [...prev, key] : prev.filter((a) => a !== key)
                    );
                  }}
                />
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{meta.name}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-3">فلاتر سريعة</h4>
        <div className="space-y-1.5">
          {[
            { key: "BREAKFAST", label: "يشمل الإفطار", icon: Coffee },
            { key: "POOL", label: "يحتوي مسبح", icon: Waves },
            { key: "WIFI", label: "واي فاي مجاني", icon: Wifi },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = filterAmenities.includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => toggleAmenity(item.key)}
                className={`w-full flex items-center gap-2.5 text-right px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 font-medium"
                    : "bg-muted text-muted-foreground hover:bg-accent border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={() => {
            setFilterRating([]);
            setFilterAmenities([]);
            setFilterPriceRange([priceExtent.min, priceExtent.max || 10000]);
          }}
          className="w-full text-center text-sm text-primary hover:underline py-2 font-medium"
        >
          مسح جميع الفلاتر ({activeFilterCount})
        </button>
      )}
    </aside>
  );

  return (
    <Layout>
      {/* ────────── Hero + Search ────────── */}
      <section className="hero-gradient py-14 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <Hotel className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">أكثر من 500,000 فندق حول العالم</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-3 leading-tight">
              اكتشف أفضل الفنادق واحجز بأقل الأسعار
            </h1>
            <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto">
              قارن الأسعار من مئات المواقع واحصل على أفضل عروض الفنادق
            </p>
          </div>

          {/* Search Bar - Trip.com style */}
          <div className="bg-card rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-1">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  value={cityCode}
                  onChange={(event) => setCityCode(event.target.value.toUpperCase())}
                  placeholder="رمز المدينة (مثل JED)"
                  className="pr-10 h-12 bg-muted/50 border-border/50 rounded-xl font-medium"
                />
              </div>
              <DatePickerField
                label="تاريخ الوصول"
                value={checkInDate}
                onChange={setCheckInDate}
                buttonClassName="bg-muted/50 border-border/50 rounded-xl"
              />
              <DatePickerField
                label="تاريخ المغادرة"
                value={checkOutDate}
                onChange={setCheckOutDate}
                buttonClassName="bg-muted/50 border-border/50 rounded-xl"
              />
              <div className="relative">
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  value={adults}
                  onChange={(event) => setAdults(event.target.value)}
                  placeholder="عدد النزلاء"
                  className="pr-10 h-12 bg-muted/50 border-border/50 rounded-xl font-medium"
                />
              </div>
              <Button
                variant="hero"
                size="lg"
                className="h-12 gap-2 rounded-xl text-base font-bold shadow-lg hover:shadow-xl transition-all"
                onClick={searchHotels}
                disabled={loading}
              >
                <Search className="w-5 h-5" />
                {loading ? "جارٍ البحث..." : "ابحث عن فنادق"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-3 bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
          </div>
        </div>
      </section>

      {/* ────────── Trust Bar ────────── */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>ضمان أقل سعر</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-blue-500" />
              <span>إلغاء مجاني متاح</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>تقييمات حقيقية من نزلاء</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-orange-500" />
              <span>خيارات مع إفطار</span>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Results Section ────────── */}
      <section className="py-6 bg-muted/30 min-h-[60vh]">
        <div className="container mx-auto px-4">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Hotel className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold mb-1">جارٍ البحث عن أفضل العروض...</p>
                <p className="text-sm text-muted-foreground">نقارن الأسعار من مئات الفنادق</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Results Header + Sort */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Hotel className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold leading-tight">
                        {filteredSortedResults.length} فندق متاح
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        في {cityCode || "المدينة المحددة"}
                        {activeFilterCount > 0 && ` • ${activeFilterCount} فلتر نشط`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile filter toggle */}
                <button
                  className="lg:hidden flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  الفلاتر
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                  {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Sort Tabs - Trip.com style */}
              <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                {([
                  { id: "popular" as HotelSortMode, label: "الأكثر شعبية", icon: Flame },
                  { id: "cheapest" as HotelSortMode, label: "الأقل سعراً", icon: SlidersHorizontal },
                  { id: "expensive" as HotelSortMode, label: "الأعلى سعراً", icon: Award },
                  { id: "rating" as HotelSortMode, label: "الأعلى تقييماً", icon: Star },
                ]).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSortMode(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        sortMode === tab.id
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "bg-card text-muted-foreground border border-border hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Main Content: Sidebar + Cards */}
              <div className="flex gap-6 items-start">
                {/* Filter Sidebar - Desktop */}
                <div className="hidden lg:block sticky top-4">
                  {renderFilterSidebar()}
                </div>

                {/* Filter Sidebar - Mobile Drawer */}
                {showFilters && (
                  <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowFilters(false)}>
                    <div
                      className="absolute left-0 top-0 h-full w-80 bg-background p-4 overflow-y-auto shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg">الفلاتر</h3>
                        <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-muted rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      {renderFilterSidebar()}
                    </div>
                  </div>
                )}

                {/* Hotel Cards - Trip.com Style */}
                <div className="flex-1 space-y-4">
                  {filteredSortedResults.map((hotel, index) => {
                    const price = parsePrice(hotel?.cheapestOffer?.price?.total);
                    const currency = hotel?.cheapestOffer?.price?.currency || "SAR";
                    const fallbackQuery = `${hotel?.name || "hotel"} ${hotel?.address?.cityName || cityCode}`.trim();
                    const ratingInfo = getRatingInfo(hotel?.rating);
                    const isFavorite = favorites.has(hotel?.id || "");
                    const starCount = hotel?.starCategory || Math.round(hotel?.rating || 0);
                    const tag = hotel?.tag || null;
                    const tagConfig = tag ? tagBadges[tag] : null;
                    const adminRaw = hotel?.raw as HotelItem | undefined;
                    const reviewCount =hotel?.reviews  || adminRaw?.reviews || 0;
                    const hotelAmenities = hotel?.amenities || adminRaw?.amenities || [];
                    const hasFreeCancellation = hotel?.cancellationPolicy || adminRaw?.cancellationPolicy;

                    return (
                      <div
                        key={hotel?.id || `hotel-${index}`}
                        className="bg-card rounded-2xl border border-border hover:border-primary/20 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        style={{ animationDelay: `${index * 0.06}s` }}
                      >
                        <div className="flex flex-col lg:flex-row">
                          {/* Hotel Image */}
                          <div className="lg:w-80 h-56 lg:h-auto relative shrink-0 overflow-hidden">
                            <ImageWithFallback
                              src={hotel?.media?.[0]?.uri}
                              alt={hotel?.name || ""}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              fallbackQuery={fallbackQuery}
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                            {/* Tag Badge */}
                            {tagConfig && tag && (
                              <div className="absolute top-3 right-3">
                                <span className={`inline-flex items-center gap-1 ${tagConfig.bg} ${tagConfig.text} text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm`}>
                                  <tagConfig.icon className="w-3 h-3" />
                                  {tag}
                                </span>
                              </div>
                            )}

                            {/* Favorite button */}
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(hotel?.id || ""); }}
                              className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                            >
                              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                            </button>

                            {/* Image count badge */}
                            {hotel?.media && hotel.media.length > 1 && (
                              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm">
                                {hotel.media.length} صورة
                              </div>
                            )}

                            {/* Free cancellation badge on image */}
                            {hasFreeCancellation && (
                              <div className="absolute bottom-3 right-3 bg-emerald-600/90 text-white text-[10px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                إلغاء مجاني
                              </div>
                            )}
                          </div>

                          {/* Hotel Info */}
                          <div className="flex-1 p-5 flex flex-col justify-between min-h-[200px]">
                            <div>
                              {/* Name + Stars + Rating */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {starCount > 0 && renderStars(starCount)}
                                    {starCount > 0 && (
                                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {starCount} نجوم
                                      </span>
                                    )}
                                  </div>
                                  <h3
                                    className="text-lg font-bold leading-snug mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1"
                                    onClick={() => handleViewDetails(hotel)}
                                  >
                                    {hotel?.name || ""}
                                  </h3>
                                </div>

                                {/* Trip.com-style Rating Badge */}
                                {ratingInfo && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-left">
                                      <p className="text-xs font-bold">{ratingInfo.label}</p>
                                      {reviewCount > 0 && (
                                        <p className="text-[10px] text-muted-foreground">{reviewCount.toLocaleString()} تقييم</p>
                                      )}
                                    </div>
                                    <div className={`${ratingInfo.color} text-white text-sm font-bold rounded-xl w-11 h-11 flex items-center justify-center shadow-sm`}>
                                      {ratingInfo.score}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Location */}
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="line-clamp-1">{hotel?.address?.cityName || hotel?.cityCode || "مدينة غير محددة"}</span>
                              </div>

                              {/* Amenities - Trip.com compact style */}
                              <div className="flex gap-2 flex-wrap mb-3">
                                {hotelAmenities.slice(0, 5).map((amenity, ai) => {
                                  const key = amenity.toUpperCase();
                                  const meta = amenityIcons[key] || amenityIcons[amenity];
                                  const Icon = meta?.icon;
                                  return (
                                    <div
                                      key={`${hotel?.id}-${amenity}-${ai}`}
                                      className="flex items-center gap-1.5 bg-muted/70 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground"
                                    >
                                      {Icon && <Icon className="w-3 h-3 text-primary/70" />}
                                      <span>{meta?.name || amenity}</span>
                                    </div>
                                  );
                                })}
                                {hotelAmenities.length > 5 && (
                                  <span className="text-[11px] text-primary/70 self-center">
                                    +{hotelAmenities.length - 5} خدمة
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom section: Details link */}
                            <div className="mt-auto pt-2">
                              <button
                                onClick={() => handleViewDetails(hotel)}
                                className="text-primary text-sm font-medium hover:underline"
                              >
                                عرض التفاصيل والغرف المتاحة ←
                              </button>
                            </div>
                          </div>

                          {/* Price & Action Column */}
                          <div className="lg:w-52 p-5 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-r border-border bg-gradient-to-b from-muted/20 to-muted/50 shrink-0">
                            <p className="text-[11px] text-muted-foreground mb-1">يبدأ من / الليلة</p>
                            <p className="text-3xl font-extrabold text-primary mb-0.5 tracking-tight">
                              {price ? price.toLocaleString() : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground mb-1 font-medium">{currency === "SAR" ? "ر.س" : currency}</p>
                            <p className="text-[10px] text-muted-foreground/70 mb-4">شامل الضرائب والرسوم</p>
                            <Button
                              variant="hero"
                              size="sm"
                              className="w-full rounded-xl font-bold shadow-md hover:shadow-lg transition-all mb-2"
                              onClick={() => handleViewDetails(hotel)}
                            >
                              اختر الغرفة
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs rounded-xl hover:bg-primary/5"
                              onClick={() => handleBook(hotel, hotel?.cheapestOffer)}
                            >
                              حجز سريع
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* No results */}
                  {filteredSortedResults.length === 0 && !loading && (
                    <div className="bg-card rounded-2xl border border-border p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Hotel className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">لا توجد نتائج</h3>
                      <p className="text-muted-foreground text-sm mb-4">لم نجد فنادق مطابقة للفلاتر المحددة. جرب تعديل خيارات البحث.</p>
                      <button
                        onClick={() => {
                          setFilterRating([]);
                          setFilterAmenities([]);
                          setFilterPriceRange([priceExtent.min, priceExtent.max || 10000]);
                        }}
                        className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                      >
                        <X className="w-3.5 h-3.5" />
                        مسح جميع الفلاتر
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
