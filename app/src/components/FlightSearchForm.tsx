import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plane,
  MapPin,
  Calendar,
  Users,
  Filter,
  ArrowLeftRight,
} from "lucide-react";

// بيانات الخطوط الجوية
export const AIRLINES = [
  { code: "SV", name: "الخطوط السعودية", country: "السعودية" },
  { code: "EK", name: "طيران الإمارات", country: "الإمارات" },
  { code: "FZ", name: "طيران اقتصادي", country: "الإمارات" },
  { code: "MS", name: "مصر للطيران", country: "مصر" },
  { code: "TK", name: "الخطوط التركية", country: "تركيا" },
  { code: "QR", name: "الخطوط القطرية", country: "قطر" },
  { code: "LH", name: "لوفتهانزا", country: "ألمانيا" },
  { code: "BA", name: "الخطوط البريطانية", country: "المملكة المتحدة" },
  { code: "UA", name: "يونايتد إيرلاينز", country: "أمريكا" },
];

// بيانات المطارات
export const AIRPORTS = [
  // السعودية
  { code: "RUH", city: "الرياض", country: "السعودية", region: "saudi" },
  { code: "JED", city: "جدة", country: "السعودية", region: "saudi" },
  { code: "DMM", city: "الدمام", country: "السعودية", region: "saudi" },
  { code: "AHB", city: "أبها", country: "السعودية", region: "saudi" },
  { code: "TIF", city: "الطائف", country: "السعودية", region: "saudi" },
  
  // الإمارات
  { code: "DXB", city: "دبي", country: "الإمارات", region: "middle_east" },
  { code: "AUH", city: "أبو ظبي", country: "الإمارات", region: "middle_east" },
  
  // مصر
  { code: "CAI", city: "القاهرة", country: "مصر", region: "middle_east" },
  { code: "HRG", city: "الغردقة", country: "مصر", region: "middle_east" },
  
  // دول أخرى
  { code: "IST", city: "إسطنبول", country: "تركيا", region: "international" },
  { code: "LHR", city: "لندن", country: "المملكة المتحدة", region: "international" },
  { code: "CDG", city: "باريس", country: "فرنسا", region: "international" },
  { code: "FCO", city: "روما", country: "إيطاليا", region: "international" },
  { code: "AMS", city: "أمستردام", country: "هولندا", region: "international" },
];

interface FlightSearchFormProps {
  onSearch?: (data: FlightSearchData) => void;
  airlineCodes?: string[];
}

export interface FlightSearchData {
  tripType: "roundtrip" | "oneway";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: "economy" | "business" | "first";
  airline?: string;
}

export function FlightSearchForm({ onSearch, airlineCodes = [] }: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCountry, setOriginCountry] = useState("all");
  const [destinationCountry, setDestinationCountry] = useState("all");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState<"economy" | "business" | "first">("economy");
  const [selectedAirline, setSelectedAirline] = useState("all");
  const [airlines, setAirlines] = useState(AIRLINES);
  const flightApiBaseUrl =
    (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
    "https://jubilant-hope-production-a334.up.railway.app";

  const handleSearch = () => {
    if (!origin || !destination || !departureDate) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const searchData: FlightSearchData = {
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      passengers: parseInt(passengers),
      cabinClass,
      airline: selectedAirline !== "all" ? selectedAirline : undefined,
    };

    onSearch?.(searchData);
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadAirlines = async () => {
      try {
        const codes = airlineCodes.filter(Boolean).join(",");
        const apiUrlBase = `${flightApiBaseUrl.replace(/\/$/, "")}/api/flights/airlines`;
        const apiUrl = codes ? `${apiUrlBase}?codes=${encodeURIComponent(codes)}` : apiUrlBase;
        const res = await fetch(apiUrl, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.results) ? data.results : Array.isArray(data.airlines) ? data.airlines : [];
        if (list.length) {
          setAirlines(
            list.map((item: any) => ({
              code: item.code || item.iataCode || item.iata || item.icaoCode || item.icao || "",
              name: item.name || item.commonName || item.businessName || item.airlineName || "",
              country: item.country || "",
            }))
            .filter((item: any) => item.code && item.name)
          );
        }
      } catch {
        // keep fallback list
      }
    };
    loadAirlines();
    return () => controller.abort();
  }, [flightApiBaseUrl, airlineCodes]);

  const countryOptions = useMemo(
    () => Array.from(new Set(AIRPORTS.map((airport) => airport.country))),
    []
  );

  const originAirports = useMemo(() => {
    if (originCountry === "all") return AIRPORTS;
    return AIRPORTS.filter((airport) => airport.country === originCountry);
  }, [originCountry]);

  const destinationAirports = useMemo(() => {
    if (destinationCountry === "all") return AIRPORTS;
    return AIRPORTS.filter((airport) => airport.country === destinationCountry);
  }, [destinationCountry]);

  useEffect(() => {
    if (origin && !originAirports.find((airport) => airport.code === origin)) {
      setOrigin("");
    }
  }, [origin, originAirports]);

  useEffect(() => {
    if (destination && !destinationAirports.find((airport) => airport.code === destination)) {
      setDestination("");
    }
  }, [destination, destinationAirports]);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-hover max-w-6xl mx-auto">
      {/* Trip Type Selector */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTripType("roundtrip")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            tripType === "roundtrip"
              ? "hero-gradient text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          ذهاب وعودة
        </button>
        <button
          onClick={() => setTripType("oneway")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            tripType === "oneway"
              ? "hero-gradient text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <Plane className="w-5 h-5" />
          ذهاب فقط
        </button>
      </div>

      {/* Country & City Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">دولة المغادرة</label>
          <Select value={originCountry} onValueChange={setOriginCountry}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="اختر الدولة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الدول</SelectItem>
              {countryOptions.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">مدينة المغادرة</label>
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent>
              {originAirports.map((airport) => (
                <SelectItem key={airport.code} value={airport.code}>
                  {airport.city} ({airport.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">دولة الوصول</label>
          <Select value={destinationCountry} onValueChange={setDestinationCountry}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="اختر الدولة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الدول</SelectItem>
              {countryOptions.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">مدينة الوصول</label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="اختر المدينة" />
            </SelectTrigger>
            <SelectContent>
              {destinationAirports.map((airport) => (
                <SelectItem key={airport.code} value={airport.code}>
                  {airport.city} ({airport.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">تاريخ الذهاب</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="pr-10 h-12 bg-muted border-0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">تاريخ العودة</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={tripType === "roundtrip" ? returnDate : ""}
              onChange={(e) => {
                if (tripType === "roundtrip") setReturnDate(e.target.value);
              }}
              disabled={tripType !== "roundtrip"}
              className="pr-10 h-12 bg-muted border-0"
            />
          </div>
        </div>
      </div>

      {/* Second Row - Passengers, Class, Airline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Passengers */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">عدد المسافرين</label>
          <Select value={passengers} onValueChange={setPassengers}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num} {num === 1 ? "مسافر" : "مسافرين"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cabin Class */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">درجة السفر</label>
          <Select value={cabinClass} onValueChange={(val) => setCabinClass(val as any)}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <Plane className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">درجة اقتصادية</SelectItem>
              <SelectItem value="business">درجة الأعمال</SelectItem>
              <SelectItem value="first">الدرجة الأولى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Airline (Optional) */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">خطوط جوية (اختياري)</label>
          <Select value={selectedAirline} onValueChange={setSelectedAirline}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <Plane className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الخطوط</SelectItem>
              {airlines.map((airline) => (
                <SelectItem key={airline.code} value={airline.code}>
                  {airline.name} ({airline.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Empty space for alignment */}
        <div />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center gap-4">
        <Button variant="ghost" className="gap-2">
          <Filter className="w-4 h-4" />
          تصفية النتائج
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="gap-2"
          onClick={handleSearch}
        >
          <Plane className="w-5 h-5" />
          ابحث عن رحلات
        </Button>
      </div>
    </div>
  );
}

export default FlightSearchForm;
