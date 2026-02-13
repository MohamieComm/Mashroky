import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import DatePickerField from "@/components/DatePickerField";
import { MapPin, Users, Filter, Car } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "@/lib/api";

const TRANSFER_SELECTION_KEY = "mashrouk-transfer-selection";

type TransferResult = {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  category?: string | null;
  capacity?: number | null;
  luggage?: number | null;
  vendor?: string | null;
  image?: string | null;
  priceTotal?: string | number | null;
  currency?: string | null;
  pickup?: string | null;
  dropoff?: string | null;
  duration?: string | number | null;
};

type ApiResponse = {
  results?: TransferResult[];
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const fallbackTransfers: TransferResult[] = [
  {
    id: "transfer-1",
    name: "ليموزين VIP فاخر",
    type: "VIP",
    capacity: 3,
    luggage: 2,
    vendor: "Elite Transfer",
    priceTotal: 220,
    currency: "SAR",
  },
  {
    id: "transfer-2",
    name: "فان عائلي واسع",
    type: "Van",
    capacity: 6,
    luggage: 5,
    vendor: "City Shuttle",
    priceTotal: 180,
    currency: "SAR",
  },
  {
    id: "transfer-3",
    name: "سيدان اقتصادية",
    type: "Sedan",
    capacity: 3,
    luggage: 2,
    vendor: "Express Ride",
    priceTotal: 120,
    currency: "SAR",
  },
];

export default function TransfersResults() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<TransferResult[]>([]);

  const searchTransfers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiPost("/api/transfers/search", {
        pickup,
        dropoff,
        date: date || undefined,
        passengers: passengers || undefined,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "transfer_search_failed");
      }
      const response = (await res.json()) as ApiResponse;
      setResults(Array.isArray(response?.results) ? response.results : []);
    } catch {
      setError("تعذر جلب نتائج النقل. حاول مرة أخرى.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedResults = results.length ? results : fallbackTransfers;

  const filteredResults = useMemo(() => {
    const min = parsePrice(priceMin) || 0;
    const max = parsePrice(priceMax) || 0;
    return displayedResults.filter((transfer) => {
      const price = parsePrice(transfer.priceTotal);
      if (min && price < min) return false;
      if (max && price > max) return false;
      return true;
    });
  }, [displayedResults, priceMin, priceMax]);

  const handleViewDetails = (transfer: TransferResult) => {
    if (!transfer.id) return;
    const payload = { transfer };
    localStorage.setItem(TRANSFER_SELECTION_KEY, JSON.stringify(payload));
    navigate(`/transfers/${transfer.id}`, { state: payload });
  };

  return (
    <Layout>
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">خدمات النقل</span>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mt-3">
            احجز نقلًا خاصًا بسهولة
          </h1>
          <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto">
            اختر نقطة الانطلاق والوصول وسيتم ترتيب السائق فورًا.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-6 shadow-card">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="مكان الاستلام" className="pr-10 h-12" />
              </div>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="وجهة الوصول" className="pr-10 h-12" />
              </div>
              <DatePickerField
                label="تاريخ التوصيل"
                value={date}
                onChange={setDate}
                buttonClassName="bg-background"
              />
              <div className="relative">
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={passengers} onChange={(e) => setPassengers(e.target.value)} placeholder="عدد الركاب" className="pr-10 h-12" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <Input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="السعر الأدنى" className="h-12" />
              <Input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="السعر الأعلى" className="h-12" />
              <Button variant="hero" onClick={searchTransfers} disabled={loading}>
                {loading ? "جارٍ البحث..." : "بحث"}
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
            <h2 className="text-2xl font-bold">أفضل خيارات النقل</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((transfer) => {
              const price = parsePrice(transfer.priceTotal);
              const currency = transfer.currency || "SAR";
              return (
                <div key={transfer.id || transfer.name} className="bg-card rounded-2xl shadow-card overflow-hidden">
                  <div className="h-48">
                    <ImageWithFallback
                      src={transfer.image}
                      alt={transfer.name || ""}
                      className="w-full h-full object-cover"
                      fallbackQuery={`${transfer.type || "car"} transfer`}
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{transfer.name || " "}</h3>
                      <span className="text-xs bg-muted rounded-full px-2 py-1">{transfer.type || ""}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      السعة: {transfer.capacity || 3} ركاب • الحقائب: {transfer.luggage || 2}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-primary">
                        {price ? price.toLocaleString() : ""} {currency}
                      </div>
                      <Button size="sm" variant="hero" onClick={() => handleViewDetails(transfer)}>
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {!filteredResults.length && !loading && (
              <div className="bg-muted rounded-2xl p-8 text-center text-muted-foreground shadow-card">
                لا توجد خيارات نقل مطابقة لبحثك الحالي.
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
