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
    priceTotal: 165,
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
                      <h3 className="font-bold">{car.name || ""}</h3>
                      <span className="text-xs bg-muted rounded-full px-2 py-1">{car.category || ""}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {car.transmission || ""}  {car.fuel || ""}  {car.seats || 4} 
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {price ? price.toLocaleString() : ""} {currency}
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
