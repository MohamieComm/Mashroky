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
  Users,
  Filter,
  ArrowLeftRight,
} from "lucide-react";
import { AIRPORTS, formatAirportLabel, getInputLanguage, resolveAirportCode } from "@/data/airports";
import DatePickerField from "@/components/DatePickerField";
import { useAdminCollection, getActiveApiKeyByProvider } from "@/data/adminStore";

type AirlineOption = { code: string; name: string; country?: string };
type ApiAirline = {
  code?: string;
  iataCode?: string;
  iata?: string;
  icaoCode?: string;
  icao?: string;
  name?: string;
  commonName?: string;
  businessName?: string;
  airlineName?: string;
  country?: string;
};

// قائمة شركات الطيران
export const AIRLINES: AirlineOption[] = [
  { code: "SV", name: "الخطوط السعودية", country: "السعودية" },
  { code: "EK", name: "طيران الإمارات", country: "الإمارات" },
  { code: "FZ", name: "فلاي دبي", country: "الإمارات" },
  { code: "MS", name: "مصر للطيران", country: "مصر" },
  { code: "TK", name: "الخطوط التركية", country: "تركيا" },
  { code: "QR", name: "الخطوط القطرية", country: "قطر" },
  { code: "LH", name: "لوفتهانزا", country: "ألمانيا" },
  { code: "BA", name: "الخطوط البريطانية", country: "المملكة المتحدة" },
  { code: "UA", name: "يونايتد", country: "الولايات المتحدة" },
];

// قائمة المطارات الأساسية موجودة في data/airports.ts

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

const isCabinClass = (value: string): value is FlightSearchData["cabinClass"] =>
  value === "economy" || value === "business" || value === "first";

export function FlightSearchForm({ onSearch, airlineCodes = [] }: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [originCountry, setOriginCountry] = useState("all");
  const [destinationCountry, setDestinationCountry] = useState("all");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [cabinClass, setCabinClass] = useState<"economy" | "business" | "first">("economy");
  const [selectedAirline, setSelectedAirline] = useState("all");
  const [airlines, setAirlines] = useState<AirlineOption[]>(AIRLINES);
  const flightApiBaseUrl =
    (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
    "https://jubilant-hope-production-a334.up.railway.app";

  // استخدام مفاتيح API من لوحة الإدارة
  const apiKeys = useAdminCollection("apiKeys", []);
  const amadeusKey = getActiveApiKeyByProvider(apiKeys, "amadeus");

  const handleSearch = () => {
    const originCode =
      resolveAirportCode(originInput, originAirports) || resolveAirportCode(originInput, AIRPORTS);
    const destinationCode =
      resolveAirportCode(destinationInput, destinationAirports) ||
      resolveAirportCode(destinationInput, AIRPORTS);
    if (!originCode || !destinationCode || !departureDate) {
      alert("يرجى إدخال مطار المغادرة والوصول وتاريخ السفر.");
      return;
    }
    if (tripType === "roundtrip" && !returnDate) {
      alert("يرجى إدخال تاريخ العودة لرحلة الذهاب والعودة.");
      return;
    }

    const searchData: FlightSearchData = {
      tripType,
      origin: originCode,
      destination: destinationCode,
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
            list
              .map((item: ApiAirline) => ({
                code: item.code || item.iataCode || item.iata || item.icaoCode || item.icao || "",
                name: item.name || item.commonName || item.businessName || item.airlineName || "",
                country: item.country || "",
              }))
              .filter((item): item is AirlineOption => Boolean(item.code && item.name))
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

  const originLang = getInputLanguage(originInput);
  const destinationLang = getInputLanguage(destinationInput);
  const dateLocale = originLang === "en" || destinationLang === "en" ? "en" : "ar";

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
          <label className="block text-sm font-semibold mb-2 text-foreground">بلد المغادرة</label>
          <Select value={originCountry} onValueChange={setOriginCountry}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="اختر الدولة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {countryOptions.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">مدينة أو مطار المغادرة</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              list="origin-airports"
              placeholder="اختر المدينة أو المطار"
              value={originInput}
              onChange={(event) => setOriginInput(event.target.value)}
              className="pr-10 h-12 bg-muted border-0"
            />
          </div>
          <datalist id="origin-airports">
            {originAirports.map((airport) => (
              <option key={airport.code} value={formatAirportLabel(airport, originLang)} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">بلد الوصول</label>
          <Select value={destinationCountry} onValueChange={setDestinationCountry}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="اختر الدولة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {countryOptions.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">مدينة أو مطار الوصول</label>
          <div className="relative">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              list="destination-airports"
              placeholder="اختر المدينة أو المطار"
              value={destinationInput}
              onChange={(event) => setDestinationInput(event.target.value)}
              className="pr-10 h-12 bg-muted border-0"
            />
          </div>
          <datalist id="destination-airports">
            {destinationAirports.map((airport) => (
              <option key={airport.code} value={formatAirportLabel(airport, destinationLang)} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">تاريخ المغادرة</label>
          <DatePickerField
            value={departureDate}
            onChange={setDepartureDate}
            locale={dateLocale}
            buttonClassName="bg-muted border-0"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">تاريخ العودة</label>
          <DatePickerField
            value={tripType === "roundtrip" ? returnDate : ""}
            onChange={(nextValue) => {
              if (tripType === "roundtrip") setReturnDate(nextValue);
            }}
            disabled={tripType !== "roundtrip"}
            locale={dateLocale}
            buttonClassName="bg-muted border-0"
          />
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
          <Select
            value={cabinClass}
            onValueChange={(val) => {
              if (isCabinClass(val)) setCabinClass(val);
            }}
          >
            <SelectTrigger className="bg-muted border-0 h-12">
              <Plane className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">اقتصادية</SelectItem>
              <SelectItem value="business">رجال الأعمال</SelectItem>
              <SelectItem value="first">الأولى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Airline (Optional) */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-foreground">شركة الطيران (اختياري)</label>
          <Select value={selectedAirline} onValueChange={setSelectedAirline}>
            <SelectTrigger className="bg-muted border-0 h-12">
              <Plane className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="أي شركة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الشركات</SelectItem>
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
          تصفية متقدمة
        </Button>
        <Button
          variant="hero"
          size="lg"
          className="gap-2"
          onClick={handleSearch}
        >
          <Plane className="w-5 h-5" />
          ابحث عن رحلة
        </Button>
      </div>
    </div>
  );
}

export default FlightSearchForm;
