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
  Map,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { defaultHotels, useAdminCollection } from "@/data/adminStore";
import { apiPost } from "@/lib/api";

const amenityIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; name: string }> = {
  WIFI: { icon: Wifi, name: "واي فاي" },
  PARKING: { icon: Car, name: "موقف سيارات" },
  BREAKFAST: { icon: Coffee, name: "إفطار" },
  GYM: { icon: Dumbbell, name: "صالة رياضية" },
  POOL: { icon: Waves, name: "مسبح" },
  RESTAURANT: { icon: Utensils, name: "مطعم" },
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
  meta?: unknown;
  warnings?: unknown;
};

// ======== Sort types ========
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
      fallbackHotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        cityCode: null,
        rating: hotel.rating,
        amenities: hotel.amenities.map((item) => item.toUpperCase()),
        address: { cityName: hotel.location, lines: [] },
        media: hotel.image ? [{ uri: hotel.image }] : [],
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
        raw: hotel,
      })),
    [fallbackHotels]
  );

  const displayedResults = results.length ? results : mappedFallback;

  // ===== Computed: price range in results =====
  const priceExtent = useMemo(() => {
    if (!displayedResults.length) return { min: 0, max: 10000 };
    const prices = displayedResults
      .map((h) => parsePrice(h?.cheapestOffer?.price?.total))
      .filter((p) => p > 0);
    if (!prices.length) return { min: 0, max: 10000 };
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [displayedResults]);

  // ===== Filtered + Sorted results =====
  const filteredSortedResults = useMemo(() => {
    let filtered = displayedResults.filter((hotel) => {
      const price = parsePrice(hotel?.cheapestOffer?.price?.total);
      // Price filter
      if (price > 0 && (price < filterPriceRange[0] || price > filterPriceRange[1])) return false;
      // Rating filter
      if (filterRating.length > 0) {
        const rating = hotel?.rating || 0;
        if (!filterRating.some((r) => rating >= r && rating < r + 1)) return false;
      }
      // Amenity filter
      if (filterAmenities.length > 0) {
        const amenities = (hotel?.amenities || []).map((v) => v.toUpperCase());
        if (!filterAmenities.every((a) => amenities.includes(a))) return false;
      }
      return true;
    });

    // Sort
    switch (sortMode) {
      case "cheapest":
        filtered = filtered.slice().sort((a, b) => {
          const pa = parsePrice(a?.cheapestOffer?.price?.total);
          const pb = parsePrice(b?.cheapestOffer?.price?.total);
          return pa - pb;
        });
        break;
      case "expensive":
        filtered = filtered.slice().sort((a, b) => {
          const pa = parsePrice(a?.cheapestOffer?.price?.total);
          const pb = parsePrice(b?.cheapestOffer?.price?.total);
          return pb - pa;
        });
        break;
      case "rating":
        filtered = filtered.slice().sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
        break;
      case "popular":
      default:
        // Keep original order (most popular)
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
      title: hotel.name || " ",
      price,
      details: `${currency}  ${hotel?.address?.cityName || ""}`.trim(),
      image: hotel?.media?.[0]?.uri || null,
      type: "hotel",
    });
    navigate("/cart");
  };

  // ======== Rating badge helper ========
  const getRatingBadge = (rating: number | null | undefined) => {
    if (!rating) return null;
    let label = "جيد";
    let color = "bg-blue-500";
    if (rating >= 4.5) { label = "ممتاز"; color = "bg-emerald-600"; }
    else if (rating >= 4) { label = "جيد جداً"; color = "bg-emerald-500"; }
    else if (rating >= 3.5) { label = "جيد"; color = "bg-blue-500"; }
    else if (rating >= 3) { label = "مقبول"; color = "bg-yellow-500"; }
    return { label, color };
  };

  // ======== Stars display ========
  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < Math.round(count) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  // ============ Render: Filter Sidebar ============
  const renderFilterSidebar = () => (
    <aside className="w-full lg:w-72 shrink-0 space-y-1">
      {/* Price Range */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          السعر لليلة (ر.س)
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
          <span>{filterPriceRange[0].toLocaleString()} ر.س</span>
          <span>{filterPriceRange[1].toLocaleString()} ر.س</span>
        </div>
      </div>

      {/* Star Rating */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-3">تصنيف النجوم</h4>
        {[5, 4, 3, 2, 1].map((star) => (
          <label
            key={star}
            className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
          >
            <Checkbox
              checked={filterRating.includes(star)}
              onCheckedChange={(checked) => {
                setFilterRating((prev) =>
                  checked ? [...prev, star] : prev.filter((r) => r !== star)
                );
              }}
            />
            <div className="flex items-center gap-1">
              {renderStars(star)}
              <span className="text-xs text-muted-foreground mr-1">({star})</span>
            </div>
          </label>
        ))}
      </div>

      {/* Amenities */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-3">المرافق</h4>
        {Object.entries(amenityIcons).map(([key, meta]) => {
          const Icon = meta.icon;
          return (
            <label
              key={key}
              className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
            >
              <Checkbox
                checked={filterAmenities.includes(key)}
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

      {/* Quick Filters */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-3">فلاتر سريعة</h4>
        {[
          { key: "BREAKFAST", label: "يشمل الإفطار" },
          { key: "POOL", label: "يحتوي مسبح" },
          { key: "WIFI", label: "واي فاي مجاني" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => toggleAmenity(item.key)}
            className={`w-full text-right px-3 py-2 rounded-lg text-sm mb-1 transition-all ${
              filterAmenities.includes(item.key)
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      {(filterRating.length > 0 || filterAmenities.length > 0 || filterPriceRange[0] !== priceExtent.min || filterPriceRange[1] !== (priceExtent.max || 10000)) && (
        <button
          onClick={() => {
            setFilterRating([]);
            setFilterAmenities([]);
            setFilterPriceRange([priceExtent.min, priceExtent.max || 10000]);
          }}
          className="w-full text-center text-sm text-primary hover:underline py-2"
        >
          مسح جميع الفلاتر
        </button>
      )}
    </aside>
  );

  return (
    <Layout>
      {/* Hero + Search */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              احجز أفضل الفنادق بسهولة
            </h1>
            <p className="text-primary-foreground/80 text-base">
              اختر المدينة وتواريخ الإقامة واستمتع بعروض تناسب ميزانيتك.
            </p>
          </div>

          {/* Compact Search Bar */}
          <div className="bg-card rounded-2xl p-5 shadow-hover max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={cityCode}
                  onChange={(event) => setCityCode(event.target.value.toUpperCase())}
                  placeholder="رمز المدينة (مثل JED)"
                  className="pr-10 h-12 bg-muted border-0"
                />
              </div>
              <DatePickerField
                label="تاريخ الوصول"
                value={checkInDate}
                onChange={setCheckInDate}
                buttonClassName="bg-muted border-0"
              />
              <DatePickerField
                label="تاريخ المغادرة"
                value={checkOutDate}
                onChange={setCheckOutDate}
                buttonClassName="bg-muted border-0"
              />
              <div className="relative">
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={adults}
                  onChange={(event) => setAdults(event.target.value)}
                  placeholder="عدد النزلاء"
                  className="pr-10 h-12 bg-muted border-0"
                />
              </div>
              <Button
                variant="hero"
                size="lg"
                className="h-12 gap-2"
                onClick={searchHotels}
                disabled={loading}
              >
                <Search className="w-5 h-5" />
                {loading ? "جارٍ البحث..." : "ابحث"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-3">{error}</p>}
          </div>
        </div>
      </section>

      {/* ======== Results Section ======== */}
      <section className="py-6 bg-muted/30 min-h-[60vh]">
        <div className="container mx-auto px-4">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-lg text-muted-foreground">جارٍ البحث عن أفضل الفنادق...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Hotel className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">
                    {filteredSortedResults.length} فندق{" "}
                    <span className="text-muted-foreground font-normal">
                      في {cityCode || "المدينة المحددة"}
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mobile filter toggle */}
                  <button
                    className="lg:hidden flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 text-sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    الفلاتر
                    {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Sort Tabs */}
              <div className="flex gap-1 mb-5 overflow-x-auto pb-2">
                {([
                  { id: "popular" as HotelSortMode, label: "شعبية", icon: "🔥" },
                  { id: "cheapest" as HotelSortMode, label: "الأرخص أولاً", icon: "💰" },
                  { id: "expensive" as HotelSortMode, label: "الأغلى أولاً", icon: "💎" },
                  { id: "rating" as HotelSortMode, label: "تقييم المستخدمين", icon: "⭐" },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSortMode(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      sortMode === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card text-muted-foreground border border-border hover:bg-accent"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Content: Sidebar + Cards */}
              <div className="flex gap-5 items-start">
                {/* Filter Sidebar - Desktop */}
                <div className="hidden lg:block">
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
                        <h3 className="font-bold">الفلاتر</h3>
                        <button onClick={() => setShowFilters(false)}>
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      {renderFilterSidebar()}
                    </div>
                  </div>
                )}

                {/* Hotel Cards */}
                <div className="flex-1 space-y-4">
                  {filteredSortedResults.map((hotel, index) => {
                    const price = parsePrice(hotel?.cheapestOffer?.price?.total);
                    const currency = hotel?.cheapestOffer?.price?.currency || "SAR";
                    const fallbackQuery = `${hotel?.name || "hotel"} ${hotel?.address?.cityName || cityCode}`.trim();
                    const ratingBadge = getRatingBadge(hotel?.rating);

                    return (
                      <div
                        key={hotel?.id || `hotel-${index}`}
                        className="bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-200 animate-fade-up overflow-hidden"
                        style={{ animationDelay: `${index * 0.06}s` }}
                      >
                        <div className="flex flex-col lg:flex-row">
                          {/* Hotel Image */}
                          <div className="lg:w-72 h-52 lg:h-auto relative shrink-0">
                            <ImageWithFallback
                              src={hotel?.media?.[0]?.uri}
                              alt={hotel?.name || ""}
                              className="w-full h-full object-cover"
                              fallbackQuery={fallbackQuery}
                            />
                            {/* Featured Badge */}
                            <div className="absolute top-3 right-3">
                              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                                عرض مميز
                              </span>
                            </div>
                          </div>

                          {/* Hotel Info */}
                          <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                              {/* Name + Stars */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div>
                                  <h3 className="text-lg font-bold mb-1">{hotel?.name || ""}</h3>
                                  {hotel?.rating ? renderStars(hotel.rating) : null}
                                </div>
                                {/* Rating Badge */}
                                {ratingBadge && hotel?.rating && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-left">
                                      <p className="text-xs font-semibold">{ratingBadge.label}</p>
                                    </div>
                                    <div className={`${ratingBadge.color} text-white text-sm font-bold rounded-lg w-10 h-10 flex items-center justify-center`}>
                                      {hotel.rating}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Location */}
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span>{hotel?.address?.cityName || hotel?.cityCode || "مدينة غير محددة"}</span>
                                {hotel?.address?.lines?.length ? (
                                  <span className="text-xs">• {hotel.address.lines.join("، ")}</span>
                                ) : null}
                              </div>

                              {/* Amenities */}
                              <div className="flex gap-1.5 flex-wrap">
                                {(hotel?.amenities || []).slice(0, 6).map((amenity) => {
                                  const key = amenity.toUpperCase();
                                  const meta = amenityIcons[key];
                                  if (!meta) return null;
                                  const Icon = meta.icon;
                                  return (
                                    <div
                                      key={`${hotel?.id}-${amenity}`}
                                      className="flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1.5 text-xs"
                                    >
                                      <Icon className="w-3.5 h-3.5 text-primary" />
                                      <span>{meta.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="lg:w-52 p-5 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-r border-border bg-muted/30 shrink-0">
                            <p className="text-xs text-muted-foreground mb-1">لليلة الواحدة</p>
                            <p className="text-2xl font-bold text-primary mb-0.5">
                              {price ? price.toLocaleString() : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground mb-1">{currency}</p>
                            <p className="text-[10px] text-muted-foreground mb-3">شامل الضرائب والرسوم</p>
                            <Button
                              variant="hero"
                              size="sm"
                              className="w-full mb-2"
                              onClick={() => handleBook(hotel, hotel?.cheapestOffer)}
                            >
                              احجز الآن
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => handleViewDetails(hotel)}
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* No results */}
                  {filteredSortedResults.length === 0 && !loading && (
                    <div className="bg-card rounded-xl border border-border p-10 text-center">
                      <Hotel className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                      <p className="text-muted-foreground">لا توجد نتائج مطابقة للفلاتر المحددة.</p>
                      <button
                        onClick={() => {
                          setFilterRating([]);
                          setFilterAmenities([]);
                          setFilterPriceRange([priceExtent.min, priceExtent.max || 10000]);
                        }}
                        className="text-primary text-sm mt-2 hover:underline"
                      >
                        مسح الفلاتر
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
