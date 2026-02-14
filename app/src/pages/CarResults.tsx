import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import DatePickerField from "@/components/DatePickerField";
import { Car, MapPin, Users, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api";

const CAR_SELECTION_KEY = "mashrouk-car-selection";

type CarResult = {
  id?: string | null;
  name?: string | null;
  category?: string | null;
  transmission?: string | null;
  fuel?: string | null;
  seats?: number | null;
  doors?: number | null;
  vendor?: string | null;
  image?: string | null;
  priceTotal?: string | number | null;
  currency?: string | null;
  pickup?: string | null;
  dropoff?: string | null;
  raw?: unknown;
};

type ApiResponse = {
  results?: CarResult[];
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const fallbackCars: CarResult[] = [
  {
    id: "car-1",
    name: "Toyota Camry",
    category: "Sedan",
    transmission: "Automatic",
    fuel: "Gasoline",
    seats: 5,
    doors: 4,
    vendor: "Hertz",
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80",
    priceTotal: 180,
    currency: "SAR",
  },
  {
    id: "car-2",
    name: "Hyundai Tucson",
    category: "SUV",
    transmission: "Automatic",
    fuel: "Gasoline",
    seats: 5,
    doors: 4,
    vendor: "Avis",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    priceTotal: 220,
    currency: "SAR",
  },
  {
    id: "car-3",
    name: "Kia K5",
    category: "Sedan",
    transmission: "Automatic",
    fuel: "Gasoline",
    seats: 5,
    doors: 4,
    vendor: "Budget",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?auto=format&fit=crop&w=800&q=80",
    priceTotal: 165,
    currency: "SAR",
  },
  {
    id: "car-4",
    name: "Toyota Land Cruiser",
    category: "SUV",
    transmission: "Automatic",
    fuel: "Gasoline",
    seats: 7,
    doors: 4,
    vendor: "Hertz",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
    priceTotal: 450,
    currency: "SAR",
  },
  {
    id: "car-5",
    name: "Nissan Sunny",
    category: "Economy",
    transmission: "Automatic",
    fuel: "Gasoline",
    seats: 5,
    doors: 4,
    vendor: "Budget",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80",
    priceTotal: 120,
    currency: "SAR",
  },
  {
    id: "car-6",
    name: "Mercedes E-Class",
    category: "Luxury",
    transmission: "Automatic",
    fuel: "Gasoline",
    seats: 5,
    doors: 4,
    vendor: "Avis",
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80",
    priceTotal: 550,
    currency: "SAR",
  },
];

export default function CarResults() {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState("جدة");
  const [dropoffLocation, setDropoffLocation] = useState("جدة");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [driverAge, setDriverAge] = useState("30");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<CarResult[]>([]);

  const searchCars = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost("/api/cars/search", {
        pickupLocation: pickupLocation || undefined,
        dropoffLocation: dropoffLocation || undefined,
        pickupDate: pickupDate || undefined,
        dropoffDate: dropoffDate || undefined,
        driverAge: driverAge || undefined,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "car_search_failed");
      }
      const response = (await res.json()) as ApiResponse;
      setResults(Array.isArray(response?.results) ? response.results : []);
    } catch {
      setError("تعذر جلب نتائج السيارات. حاول مرة أخرى.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedResults = results.length ? results : fallbackCars;

  const filteredResults = useMemo(() => {
    const min = parsePrice(priceMin) || 0;
    const max = parsePrice(priceMax) || 0;
    return displayedResults.filter((car) => {
      const price = parsePrice(car.priceTotal);
      if (min && price < min) return false;
      if (max && price > max) return false;
      if (categoryFilter !== "all" && (car.category || "").toLowerCase() !== categoryFilter) return false;
      if (transmissionFilter !== "all" && (car.transmission || "").toLowerCase() !== transmissionFilter)
        return false;
      return true;
    });
  }, [displayedResults, priceMin, priceMax, categoryFilter, transmissionFilter]);

  const handleViewDetails = (car: CarResult) => {
    if (!car.id) return;
    const payload = { car };
    localStorage.setItem(CAR_SELECTION_KEY, JSON.stringify(payload));
    navigate(`/cars/${car.id}`, { state: payload });
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">تأجير السيارات</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            احجز سيارتك بكل سهولة
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            اختر موقع الاستلام والإرجاع وقارن الأسعار خلال ثوانٍ.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="مكان الاستلام"
                  className="pr-10 h-12"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="مكان الإرجاع"
                  className="pr-10 h-12"
                />
              </div>
              <div className="relative">
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={driverAge}
                  onChange={(e) => setDriverAge(e.target.value)}
                  placeholder="عمر السائق"
                  className="pr-10 h-12"
                />
              </div>
              <DatePickerField
                label="تاريخ الاستلام"
                value={pickupDate}
                onChange={setPickupDate}
                buttonClassName="bg-background"
              />
              <DatePickerField
                label="تاريخ الإرجاع"
                value={dropoffDate}
                onChange={setDropoffDate}
                buttonClassName="bg-background"
              />
              <div className="flex items-center justify-end">
                <Button variant="hero" className="w-full" onClick={searchCars} disabled={loading}>
                  {loading ? "جارٍ البحث..." : "بحث"}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="السعر الأدنى" className="h-12" />
              <Input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="السعر الأعلى" className="h-12" />
              <div className="flex gap-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="all">كل الفئات</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="economy">Economy</option>
                  <option value="luxury">Luxury</option>
                </select>
                <select
                  value={transmissionFilter}
                  onChange={(e) => setTransmissionFilter(e.target.value)}
                  className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="all">كل النواقل</option>
                  <option value="automatic">أوتوماتيك</option>
                  <option value="manual">يدوي</option>
                </select>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mt-4">{error}</p>}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">أفضل خيارات السيارات</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((car) => {
              const price = parsePrice(car.priceTotal);
              const currency = car.currency || "SAR";
              return (
                <div key={car.id || car.name} className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <div className="h-48">
                    <ImageWithFallback
                      src={car.image}
                      alt={car.name || ""}
                      className="w-full h-full object-cover"
                      fallbackQuery={`${car.name || "car"} ${car.category || ""}`}
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{car.name || ""}</h3>
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-semibold">{car.category || ""}</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{car.vendor || ""}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-4 h-4" />
                        <span>{car.transmission || ""}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{car.seats || 4} مقاعد</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">⛽</span>
                        <span>{car.fuel || "بنزين"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">🚪</span>
                        <span>{car.doors || 4} أبواب</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">السعر / يوم</p>
                        <p className="text-xl font-bold text-primary">
                          {price ? price.toLocaleString() : ""} <span className="text-sm">ر.س</span>
                        </p>
                      </div>
                      <Button size="sm" variant="hero" onClick={() => handleViewDetails(car)}>
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {!filteredResults.length && !loading && (
              <div className="bg-muted rounded-2xl p-8 text-center text-muted-foreground shadow-card">
                لا توجد سيارات مطابقة لخيارات البحث الحالية.
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
