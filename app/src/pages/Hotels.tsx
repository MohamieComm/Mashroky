import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
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
  Filter,
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

export default function Hotels() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const fallbackHotels = useAdminCollection("hotels", defaultHotels);

  const [cityCode, setCityCode] = useState("JED");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState("2");
  const [roomQuantity, setRoomQuantity] = useState("1");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [ratingFilter, setRatingFilter] = useState("0");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<HotelResult[]>([]);

  const toggleAmenity = (amenity: string) => {
    setAmenityFilter((prev) =>
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
        priceMin: priceMin || undefined,
        priceMax: priceMax || undefined,
        ratings: ratingFilter && ratingFilter !== "0" ? ratingFilter : undefined,
        amenities: amenityFilter.length ? amenityFilter.join(",") : undefined,
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

  const filteredResults = useMemo(() => {
    const min = parsePrice(priceMin) || 0;
    const max = parsePrice(priceMax) || 0;
    const ratingValue = Number(ratingFilter || 0);

    return displayedResults.filter((hotel) => {
      const price = parsePrice(hotel?.cheapestOffer?.price?.total);
      if (min && price < min) return false;
      if (max && price > max) return false;
      if (ratingValue && (hotel?.rating || 0) < ratingValue) return false;
      if (amenityFilter.length) {
        const amenities = (hotel?.amenities || []).map((value) => value.toUpperCase());
        if (!amenityFilter.every((amenity) => amenities.includes(amenity))) return false;
      }
      return true;
    });
  }, [displayedResults, priceMin, priceMax, ratingFilter, amenityFilter]);

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

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              احجز أفضل الفنادق بسهولة
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              اختر المدينة وتواريخ الإقامة واستمتع بعروض تناسب ميزانيتك.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-hover max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <div className="relative">
                <Input
                  value={roomQuantity}
                  onChange={(event) => setRoomQuantity(event.target.value)}
                  placeholder="عدد الغرف"
                  className="h-12 bg-muted border-0"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <Input
                value={priceMin}
                onChange={(event) => setPriceMin(event.target.value)}
                placeholder="السعر الأدنى"
                className="h-12 bg-muted border-0"
              />
              <Input
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
                placeholder="السعر الأعلى"
                className="h-12 bg-muted border-0"
              />
              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                className="h-12 w-full rounded-xl border-0 bg-muted px-4 text-sm text-muted-foreground"
              >
                <option value="0">كل التقييمات</option>
                <option value="3">3 نجوم+</option>
                <option value="4">4 نجوم+</option>
                <option value="4.5">4.5 نجوم+</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {Object.entries(amenityIcons).map(([key, meta]) => {
                const Icon = meta.icon;
                const active = amenityFilter.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAmenity(key)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {meta.name}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button variant="ghost" className="gap-2">
                <Filter className="w-4 h-4" />
                تصفية متقدمة
              </Button>
              <Button variant="hero" size="lg" className="gap-2" onClick={searchHotels} disabled={loading}>
                <Hotel className="w-5 h-5" />
                {loading ? "جارٍ البحث..." : "ابحث عن فنادق"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-4">{error}</p>}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">أفضل الفنادق المتاحة</h2>
          <div className="space-y-8">
            {filteredResults.map((hotel, index) => {
              const price = parsePrice(hotel?.cheapestOffer?.price?.total);
              const currency = hotel?.cheapestOffer?.price?.currency || "SAR";
              const fallbackQuery = `${hotel?.name || "hotel"} ${hotel?.address?.cityName || cityCode}`.trim();
              return (
                <div
                  key={hotel?.id || `hotel-${index}`}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-96 h-64 lg:h-auto relative">
                      <ImageWithFallback
                        src={hotel?.media?.[0]?.uri}
                        alt={hotel?.name || ""}
                        className="w-full h-full object-cover"
                        fallbackQuery={fallbackQuery}
                      />
                      <div className="absolute top-4 right-4">
                        <span className="gold-gradient text-secondary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                          عرض مميز
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{hotel?.name || ""}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{hotel?.address?.cityName || hotel?.cityCode || "مدينة غير محددة"}</span>
                          </div>
                        </div>
                        {hotel?.rating ? (
                          <div className="flex items-center gap-2 bg-accent rounded-full px-3 py-1">
                            <Star className="w-4 h-4 fill-secondary text-secondary" />
                            <span className="font-bold">{hotel.rating}</span>
                          </div>
                        ) : null}
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {hotel?.address?.lines?.length
                          ? hotel.address.lines.join("  ")
                          : "لا تتوفر تفاصيل إضافية لهذا الفندق حالياً."}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        {(hotel?.amenities || []).slice(0, 6).map((amenity) => {
                          const key = amenity.toUpperCase();
                          const meta = amenityIcons[key];
                          if (!meta) return null;
                          const Icon = meta.icon;
                          return (
                            <div
                              key={`${hotel?.id}-${amenity}`}
                              className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2"
                            >
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="text-sm">{meta.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="lg:w-64 p-6 bg-muted/50 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-r border-border">
                      <p className="text-sm text-muted-foreground mb-1">ابتداءً من</p>
                      <p className="text-3xl font-bold text-primary mb-1">
                        {price ? price.toLocaleString() : ""} <span className="text-base">{currency}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">لليلة الواحدة</p>
                      <Button variant="hero" className="w-full" onClick={() => handleBook(hotel, hotel?.cheapestOffer)}>
                        احجز الآن
                      </Button>
                      <Button variant="ghost" className="w-full mt-2" onClick={() => handleViewDetails(hotel)}>
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {!filteredResults.length && !loading && (
              <div className="bg-muted rounded-2xl p-8 text-center text-muted-foreground shadow-card">
                لا توجد نتائج مطابقة. جرّب تعديل الفلاتر أو تواريخ الإقامة.
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
