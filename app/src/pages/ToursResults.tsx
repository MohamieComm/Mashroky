import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import DatePickerField from "@/components/DatePickerField";
import { MapPin, Users, Filter, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api";

const TOUR_SELECTION_KEY = "mashrouk-tour-selection";

type TourResult = {
  id?: string | null;
  name?: string | null;
  city?: string | null;
  category?: string | null;
  rating?: number | null;
  duration?: string | number | null;
  image?: string | null;
  priceTotal?: string | number | null;
  currency?: string | null;
  summary?: string | null;
  meetingPoint?: string | null;
};

type ApiResponse = {
  results?: TourResult[];
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const fallbackTours: TourResult[] = [
  {
    id: "tour-1",
    name: "جولة تاريخية في جدة",
    city: "جدة",
    category: "تاريخية",
    rating: 4.7,
    duration: "3 ساعات",
    priceTotal: 180,
    currency: "SAR",
    summary: "زيارة البلدة القديمة والكورنيش مع مرشد محلي وتجربة تراثية متكاملة.",
  },
  {
    id: "tour-2",
    name: "تجربة العلا الصحراوية",
    city: "العلا",
    category: "مغامرة",
    rating: 4.9,
    duration: "يومان",
    priceTotal: 250,
    currency: "SAR",
    summary: "مواقع تراثية وجولات هِجرا مع أنشطة صحراوية وتجارب ثقافية.",
  },
  {
    id: "tour-3",
    name: "جولة بحرية في البحر الأحمر",
    city: "البحر الأحمر",
    category: "بحرية",
    rating: 4.8,
    duration: "5 ساعات",
    priceTotal: 320,
    currency: "SAR",
    summary: "رحلة بحرية مع غطس خفيف وتجربة استرخاء على الشاطئ.",
  },
];

export default function ToursResults() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [travelers, setTravelers] = useState("2");
  const [category, setCategory] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [ratingFilter, setRatingFilter] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<TourResult[]>([]);

  const searchTours = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost("/api/tours/search", {
        city: city || undefined,
        date: date || undefined,
        travelers: travelers || undefined,
        category: category || undefined,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "tour_search_failed");
      }
      const response = (await res.json()) as ApiResponse;
      setResults(Array.isArray(response?.results) ? response.results : []);
    } catch {
      setError("تعذر جلب نتائج الجولات. حاول مرة أخرى.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedResults = results.length ? results : fallbackTours;

  const filteredResults = useMemo(() => {
    const min = parsePrice(priceMin) || 0;
    const max = parsePrice(priceMax) || 0;
    const ratingValue = Number(ratingFilter || 0);
    return displayedResults.filter((tour) => {
      const price = parsePrice(tour.priceTotal);
      if (min && price < min) return false;
      if (max && price > max) return false;
      if (ratingValue && (tour.rating || 0) < ratingValue) return false;
      return true;
    });
  }, [displayedResults, priceMin, priceMax, ratingFilter]);

  const handleViewDetails = (tour: TourResult) => {
    if (!tour.id) return;
    const payload = { tour };
    localStorage.setItem(TOUR_SELECTION_KEY, JSON.stringify(payload));
    navigate(`/tours/${tour.id}`, { state: payload });
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">الأنشطة والجولات</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            احجز جولتك المفضلة بسهولة
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            اكتشف أجمل التجارب السياحية واحجزها مباشرة من منصة مشروك.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="المدينة" className="pr-10 h-12" />
              </div>
              <DatePickerField
                label="تاريخ الجولة"
                value={date}
                onChange={setDate}
                buttonClassName="bg-background"
              />
              <div className="relative">
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={travelers} onChange={(e) => setTravelers(e.target.value)} placeholder="عدد الأشخاص" className="pr-10 h-12" />
              </div>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="نوع الجولة" className="h-12" />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="السعر الأدنى" className="h-12" />
              <Input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="السعر الأعلى" className="h-12" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="0">كل التقييمات</option>
                <option value="4">4 نجوم+</option>
                <option value="4.5">4.5 نجوم+</option>
              </select>
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button variant="ghost" className="gap-2">
                <Filter className="w-4 h-4" />
                تصفية متقدمة
              </Button>
              <Button variant="hero" onClick={searchTours} disabled={loading}>
                {loading ? "جارٍ البحث..." : "ابحث عن جولات"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive mt-4">{error}</p>}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">أفضل الجولات المتاحة</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((tour) => {
              const price = parsePrice(tour.priceTotal);
              const currency = tour.currency || "SAR";
              return (
                <div key={tour.id || tour.name} className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <div className="h-48">
                    <ImageWithFallback
                      src={tour.image}
                      alt={tour.name || ""}
                      className="w-full h-full object-cover"
                      fallbackQuery={`${tour.city || "city"} ${tour.category || "tour"}`}
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{tour.name}</h3>
                        <div className="text-sm text-muted-foreground">{tour.city}</div>
                      </div>
                      {tour.rating ? (
                        <span className="flex items-center gap-1 text-xs bg-accent rounded-full px-2 py-1">
                          <Star className="w-3 h-3 text-secondary fill-secondary" /> {tour.rating}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{tour.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {price ? price.toLocaleString() : ""} {currency}
                      </div>
                      <Button size="sm" variant="hero" onClick={() => handleViewDetails(tour)}>
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {!filteredResults.length && !loading && (
              <div className="bg-muted rounded-2xl p-8 text-center text-muted-foreground shadow-card">
                لا توجد جولات مطابقة لخيارات البحث الحالية.
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
