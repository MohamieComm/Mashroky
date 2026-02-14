import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { getAirlineLogoCandidates } from "@/lib/media";
import { ServiceCard } from "@/components/ServiceCard";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plane,
  Clock,
  Star,
  CreditCard,
  Hotel,
  Car,
  Camera,
  FileText,
  CalendarCheck,
  Smartphone,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Luggage,
  Briefcase,
  Building2,
} from "lucide-react";
import {
  defaultAirlines,
  defaultDestinations,
  defaultFlights,
  useAdminCollection,
  useAdminSettings,
} from "@/data/adminStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { adminBenefitCards, popularDestinationsByRegion } from "@/data/content";
import { useCart } from "@/hooks/useCart";
import FlightSearchForm, { type FlightSearchData } from "@/components/FlightSearchForm";
import { apiPost, apiBaseUrl } from "@/lib/api";

// --- Amadeus API integration helpers ---
const FLIGHT_PRICED_OFFER_KEY = "mashrouk-flight-priced-offer";
const FLIGHT_BOOKING_PAYLOAD_KEY = "mashrouk-flight-checkout";
const FLIGHT_BOOKING_RESULT_KEY = "mashrouk-flight-booking-result";

async function priceSelectedOffers(offers: any[], _apiBaseUrl: string) {
  const res = await apiPost("/api/flights/price", { flightOffers: offers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "flight_price_failed");
  }
  const data = await res.json();
  const priced = Array.isArray(data.results)
    ? data.results
    : Array.isArray(data?.data?.flightOffers)
      ? data.data.flightOffers
      : data.flightOffers || [];
  localStorage.setItem(FLIGHT_PRICED_OFFER_KEY, JSON.stringify(priced));
  return priced;
}

async function bookSelectedOffers(pricedOffers: any[], travelers: any[], _apiBaseUrl: string) {
  const res = await apiPost("/api/flights/book", { flightOffers: pricedOffers, travelers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "flight_book_failed");
  }
  const data = await res.json();
  localStorage.setItem(FLIGHT_BOOKING_RESULT_KEY, JSON.stringify(data));
  return data;
}

const bookingNotes = [
  "يرجى الحضور إلى المطار قبل 3 ساعات من الإقلاع.",
  "تأكد من صلاحية جواز السفر ومتطلبات التأشيرة للدولة المستهدفة.",
  "إمكانية إضافة الفندق والمواصلات والأنشطة من نفس الطلب.",
];

const ticketDetails = [
  { label: "رقم الرحلة", value: "MSH-246" },
  { label: "صالة الوصول", value: "Terminal 2" },
  { label: "بوابة الإقلاع", value: "Gate B12" },
  { label: "موعد الإقلاع", value: "08:00 ص" },
  { label: "موعد الوصول", value: "10:00 ص" },
];

const additionalServices = [
  {
    icon: Hotel,
    name: "حجز فندق",
    description: "أفضل الفنادق بأسعار مميزة مع خيارات مرنة.",
    details: ["فنادق 3-5 نجوم حسب الميزانية.", "خيارات إفطار ونقل من المطار."],
    price: "350",
  },
  {
    icon: Car,
    name: "تأجير سيارة",
    description: "سيارات حديثة مع أو بدون سائق.",
    details: ["سائق خاص عند الطلب.", "خيارات يومية أو أسبوعية."],
    price: "220",
  },
  {
    icon: Camera,
    name: "جولات سياحية",
    description: "اكتشف أجمل المعالم مع مرشدين معتمدين.",
    details: ["جولات يومية خاصة أو جماعية.", "برامج مناسبة للعائلة."],
    price: "180",
  },
  {
    icon: FileText,
    name: "خدمات الفيزا",
    description: "مساعدة في إجراءات السفر والتأشيرات.",
    details: ["متابعة المستندات خطوة بخطوة.", "تنبيه بالمواعيد والمتطلبات."],
    price: "120",
  },
];

const benefitIcons: Record<string, typeof Plane> = {
  checkin: FileText,
  bookings: CalendarCheck,
  app: Smartphone,
};

// ======== Helper: Format duration minutes ========
function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}د`;
  if (m === 0) return `${h}س`;
  return `${h}س ${m}د`;
}

// ======== Sort types ========
type SortMode = "cheapest" | "fastest" | "direct" | "recommended";

export default function Trips() {
  const navigate = useNavigate();
  const [destinationTab, setDestinationTab] = useState<"saudi" | "international" | "middleeast">("saudi");
  const flights = useAdminCollection("flights", defaultFlights);
  const destinations = useAdminCollection("destinations", defaultDestinations);
  const airlines = useAdminCollection("airlines", defaultAirlines);
  const { appDownloadLink } = useAdminSettings();
  const { addItem } = useCart();
  const flightApiBaseUrl =
    (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
    "https://jubilant-hope-production-a334.up.railway.app";

  const handleBook = (flight?: {
    id: string;
    from: string;
    to: string;
    price: number | string;
    duration: string;
    image?: string | null;
  }) => {
    if (flight) {
      addItem({
        id: `flight-${flight.id}-${Date.now()}`,
        title: `${flight.from} → ${flight.to}`,
        price: Number(String(flight.price).replace(/[^\d.]/g, "")) || 0,
        details: flight.duration,
        image: flight.image,
        type: "flight",
      });
    }
    navigate("/cart");
  };

  const handleFlightCheckout = (offer: FlightOffer, summary: ReturnType<typeof getOfferSummary>) => {
    if (!offer.raw) {
      alert("يرجى إعادة البحث عن الرحلات.");
      return;
    }
    const checkoutPayload = {
      tripType: "oneway",
      passengers: lastSearchData?.passengers || 1,
      cabinClass: lastSearchData?.cabinClass || "economy",
      offers: [offer.raw],
      summary: {
        outbound: `${summary.origin} → ${summary.destination}`,
      },
    };
    localStorage.setItem("mashrouk-flight-checkout", JSON.stringify(checkoutPayload));
    navigate("/flight/traveler-details");
  };

  const handleServiceAdd = (service: { name: string; description: string; price: string }) => {
    const serviceDetails = additionalServices.find((item) => item.name === service.name)?.details || [];
    addItem({
      id: `service-${service.name}-${Date.now()}`,
      title: service.name,
      price: Number(String(service.price).replace(/[^\d.]/g, "")) || 0,
      details: serviceDetails.length ? `${service.description} • ${serviceDetails.join("، ")}` : service.description,
      type: "service",
    });
    navigate("/cart");
  };

  type FlightSlice = {
    origin?: string;
    destination?: string;
    marketingCarrier?: string;
    durationMinutes?: number;
    departureTime?: string;
    arrivalTime?: string;
  };

  type FlightOffer = {
    providerOfferId?: string;
    raw?: any;
    slices?: FlightSlice[][];
    pricing?: { total?: number | string; currency?: string };
    cabins?: string[];
  };

  const [flightResults, setFlightResults] = useState<FlightOffer[]>([]);
  const [returnResults, setReturnResults] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSearchData, setLastSearchData] = useState<FlightSearchData | null>(null);
  const [activeTripType, setActiveTripType] = useState<"oneway" | "roundtrip">("oneway");
  const [selectedOutboundKey, setSelectedOutboundKey] = useState<string | null>(null);
  const [selectedReturnKey, setSelectedReturnKey] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // ====== Filter & Sort State ======
  const [sortMode, setSortMode] = useState<SortMode>("cheapest");
  const [filterStops, setFilterStops] = useState<number[]>([]);
  const [filterPriceRange, setFilterPriceRange] = useState<[number, number]>([0, 50000]);
  const [filterAirlines, setFilterAirlines] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const flightErrorMessages: Record<string, string> = {
    amadeus_not_configured: "خدمة الرحلات غير مهيأة بعد على الخادم.",
    amadeus_token_failed: "فشل الحصول على رمز Amadeus. تحقق من إعدادات الربط على الخادم.",
    amadeus_search_failed: "فشل البحث عن الرحلات من المزود. حاول لاحقًا.",
    invalid_airport_code: "رمز المطار غير صحيح.",
    invalid_departure_date: "تاريخ المغادرة غير صحيح.",
    invalid_passenger_count: "عدد المسافرين غير صالح.",
    unknown_provider: "مزود الرحلات غير معروف.",
    server_error: "تعذر جلب الرحلات بسبب خطأ في الخادم.",
  };

  const travelClassMap: Record<FlightSearchData["cabinClass"], string> = {
    economy: "ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };

  const getOfferKey = (offer: FlightOffer, index: number) =>
    offer.providerOfferId || `offer-${index}`;

  const getOfferPrice = (offer: FlightOffer) => {
    const raw = offer.pricing?.total;
    if (typeof raw === "number") return raw;
    if (!raw) return Number.NaN;
    const cleaned = String(raw).replace(/[^\d.]/g, "");
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : Number.NaN;
  };

  const sortOffersByPrice = (offers: FlightOffer[]) =>
    offers.slice().sort((a, b) => {
      const priceA = getOfferPrice(a);
      const priceB = getOfferPrice(b);
      const safeA = Number.isFinite(priceA) ? priceA : Number.POSITIVE_INFINITY;
      const safeB = Number.isFinite(priceB) ? priceB : Number.POSITIVE_INFINITY;
      return safeA - safeB;
    });

  const getOfferSummary = (offer: FlightOffer) => {
    const firstSlice = Array.isArray(offer.slices?.[0]) ? offer.slices[0] : [];
    const firstSegment = firstSlice[0] || {};
    const lastSegment = firstSlice[firstSlice.length - 1] || {};
    const origin = firstSegment.origin || "";
    const destination = lastSegment.destination || "";
    const carrier = firstSegment.marketingCarrier || "";
    const carrierName = airlines.find((airline) => airline.code === carrier)?.name || "";
    const durationMinutes = firstSegment.durationMinutes ?? 0;
    const priceValue = getOfferPrice(offer);
    const stopsCount = firstSlice.length > 1 ? firstSlice.length - 1 : 0;
    const departureTime = firstSegment.departureTime || "";
    const arrivalTime = lastSegment.arrivalTime || "";
    const flightNumber = (firstSegment as any).flightNumber || (firstSegment as any).number || "";
    const aircraft = (firstSegment as any).aircraft || "";
    const baggage = (firstSegment as any).baggage || null;
    const departTerminal = (firstSegment as any).departTerminal || (firstSegment as any).terminal || "";
    const arriveTerminal = (lastSegment as any).arriveTerminal || (lastSegment as any).terminal || "";
    return {
      origin,
      destination,
      carrier,
      carrierName,
      durationMinutes,
      stopsCount,
      departureTime,
      arrivalTime,
      priceValue: Number.isFinite(priceValue) ? priceValue : 0,
      currency: offer.pricing?.currency || "SAR",
      priceLabel: offer.pricing?.total,
      cabins: offer.cabins?.join("، "),
      flightNumber,
      aircraft,
      baggage,
      departTerminal,
      arriveTerminal,
    };
  };

  // ===== Computed: available airlines in results =====
  const availableAirlines = useMemo(() => {
    const codes = new Set<string>();
    flightResults.forEach((offer) => {
      const s = getOfferSummary(offer);
      if (s.carrier) codes.add(s.carrier);
    });
    return Array.from(codes).map((code) => ({
      code,
      name: airlines.find((a) => a.code === code)?.name || code,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightResults, airlines]);

  // ===== Computed: price range in results =====
  const priceExtent = useMemo(() => {
    if (!flightResults.length) return { min: 0, max: 50000 };
    const prices = flightResults.map(getOfferPrice).filter(Number.isFinite);
    if (!prices.length) return { min: 0, max: 50000 };
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightResults]);

  // Reset filters when results change
  useEffect(() => {
    setFilterPriceRange([priceExtent.min, priceExtent.max]);
    setFilterStops([]);
    setFilterAirlines([]);
    setSortMode("cheapest");
  }, [priceExtent.min, priceExtent.max]);

  // ===== Filtered + Sorted results =====
  const filteredSortedResults = useMemo(() => {
    let filtered = flightResults.filter((offer) => {
      const summary = getOfferSummary(offer);
      if (summary.priceValue < filterPriceRange[0] || summary.priceValue > filterPriceRange[1]) return false;
      if (filterStops.length > 0) {
        const stops = summary.stopsCount;
        const matchesStops = filterStops.some((f) => (f === 2 ? stops >= 2 : stops === f));
        if (!matchesStops) return false;
      }
      if (filterAirlines.length > 0 && !filterAirlines.includes(summary.carrier)) return false;
      return true;
    });

    switch (sortMode) {
      case "cheapest":
        filtered = filtered.slice().sort((a, b) => getOfferPrice(a) - getOfferPrice(b));
        break;
      case "fastest":
        filtered = filtered.slice().sort((a, b) => {
          const da = getOfferSummary(a).durationMinutes || Infinity;
          const db = getOfferSummary(b).durationMinutes || Infinity;
          return da - db;
        });
        break;
      case "direct":
        filtered = filtered.slice().sort((a, b) => {
          const sa = getOfferSummary(a).stopsCount;
          const sb = getOfferSummary(b).stopsCount;
          if (sa !== sb) return sa - sb;
          return getOfferPrice(a) - getOfferPrice(b);
        });
        break;
      case "recommended":
      default:
        filtered = filtered.slice().sort((a, b) => {
          const scoreA = getOfferPrice(a) + (getOfferSummary(a).durationMinutes || 0) * 2;
          const scoreB = getOfferPrice(b) + (getOfferSummary(b).durationMinutes || 0) * 2;
          return scoreA - scoreB;
        });
        break;
    }
    return filtered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightResults, sortMode, filterStops, filterPriceRange, filterAirlines]);

  const handleFlightSearch = async (searchData: FlightSearchData) => {
    setLoading(true);
    setError("");
    setReturnResults([]);
    setLastSearchData(searchData);
    setActiveTripType(searchData.tripType);
    setSelectedOutboundKey(null);
    setSelectedReturnKey(null);
    try {
      const runSearch = async (payload: {
        origin: string;
        destination: string;
        departureDate: string;
      }) => {
        const res = await apiPost("/api/flights/search", {
          provider: "amadeus",
          origin: payload.origin,
          destination: payload.destination,
          departureDate: payload.departureDate,
          adults: Number(searchData.passengers) || 1,
          airline: searchData.airline || undefined,
          travelClass: travelClassMap[searchData.cabinClass] || undefined,
        });
        if (!res.ok) {
          const errorBody = await res.json().catch(() => ({}));
          throw new Error(errorBody?.error || "flight_search_failed");
        }
        const data = await res.json();
        return Array.isArray(data.results) ? data.results : [];
      };

      const outbound = await runSearch({
        origin: searchData.origin,
        destination: searchData.destination,
        departureDate: searchData.departureDate,
      });
      setFlightResults(sortOffersByPrice(outbound));

      if (searchData.tripType === "roundtrip" && searchData.returnDate) {
        const inbound = await runSearch({
          origin: searchData.destination,
          destination: searchData.origin,
          departureDate: searchData.returnDate,
        });
        setReturnResults(sortOffersByPrice(inbound));
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : "flight_search_failed";
      setError(flightErrorMessages[code] || "فشل جلب الرحلات. تأكد من الاتصال بالخادم.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const origin = searchParams.get("origin") || "";
    const destination = searchParams.get("destination") || "";
    const departureDate = searchParams.get("departureDate") || "";
    const tripType = (searchParams.get("tripType") || "oneway") as "oneway" | "roundtrip";
    const returnDate = searchParams.get("returnDate") || "";
    if (!origin || !destination || !departureDate) return;
    const passengers = Number(searchParams.get("passengers") || "1") || 1;
    handleFlightSearch({
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      passengers,
      cabinClass: "economy",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destinationList = useMemo(() => {
    const fromAdmin = destinations
      .filter((dest) => dest.region === destinationTab)
      .map((dest) => dest.title);
    const fallback = popularDestinationsByRegion[destinationTab];
    const merged = Array.from(new Set([...fromAdmin, ...fallback]));
    return merged;
  }, [destinations, destinationTab]);

  const destinationColumns = useMemo(() => {
    const columns = 3;
    const chunkSize = Math.ceil(destinationList.length / columns);
    return Array.from({ length: columns }, (_, index) =>
      destinationList.slice(index * chunkSize, (index + 1) * chunkSize)
    ).filter((col) => col.length);
  }, [destinationList]);

  const selectedOutbound =
    selectedOutboundKey &&
    flightResults.find((offer, index) => getOfferKey(offer, index) === selectedOutboundKey);
  const selectedReturn =
    selectedReturnKey &&
    returnResults.find((offer, index) => getOfferKey(offer, index) === selectedReturnKey);
  const selectedOutboundSummary = selectedOutbound ? getOfferSummary(selectedOutbound) : null;
  const selectedReturnSummary = selectedReturn ? getOfferSummary(selectedReturn) : null;
  const canBookRoundtrip =
    activeTripType === "roundtrip" && Boolean(selectedOutboundSummary && selectedReturnSummary);
  const roundtripCurrency =
    selectedOutbound?.pricing?.currency || selectedReturn?.pricing?.currency || "SAR";
  const outboundPrice = selectedOutbound ? getOfferPrice(selectedOutbound) : 0;
  const returnPrice = selectedReturn ? getOfferPrice(selectedReturn) : 0;
  const safeOutboundPrice = Number.isFinite(outboundPrice) ? outboundPrice : 0;
  const safeReturnPrice = Number.isFinite(returnPrice) ? returnPrice : 0;
  const roundtripTotal = safeOutboundPrice + safeReturnPrice;

  const handleRoundtripBook = async () => {
    if (!selectedOutboundSummary || !selectedReturnSummary) return;
    const outboundRaw = selectedOutbound?.raw;
    const returnRaw = selectedReturn?.raw;
    if (!outboundRaw || !returnRaw) {
      alert("يرجى إعادة البحث عن الرحلات.");
      return;
    }
    try {
      const priced = await priceSelectedOffers([outboundRaw, returnRaw], flightApiBaseUrl);
      const checkoutPayload = {
        tripType: "roundtrip",
        passengers: lastSearchData?.passengers || 1,
        cabinClass: lastSearchData?.cabinClass || "economy",
        offers: priced,
        summary: {
          outbound: `${selectedOutboundSummary.origin} → ${selectedOutboundSummary.destination}`,
          inbound: `${selectedReturnSummary.origin} → ${selectedReturnSummary.destination}`,
        },
      };
      localStorage.setItem(FLIGHT_BOOKING_PAYLOAD_KEY, JSON.stringify(checkoutPayload));
      navigate("/flight/traveler-details");
    } catch {
      alert("فشل تسعير الرحلات. يرجى المحاولة لاحقًا.");
    }
  };

  // ============ Helper: get airline logo ============
  const getAirlineLogo = (code: string) => {
    const airline = airlines.find((a) => a.code === code);
    const candidates = getAirlineLogoCandidates(code, airline?.website);
    return airline?.logo || candidates[0] || "/airline-placeholder.svg";
  };

  // ============ Helper: stops label ============
  const getStopsLabel = (stops: number) => {
    if (stops === 0) return "مباشر";
    if (stops === 1) return "توقف واحد";
    return `${stops} توقفات`;
  };

  // ============ Render: Filter Sidebar ============
  const renderFilterSidebar = () => (
    <aside className="w-full lg:w-72 shrink-0 space-y-1">
      {/* Price Range */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          نطاق السعر (ر.س)
        </h4>
        <Slider
          min={priceExtent.min}
          max={priceExtent.max}
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

      {/* Stops */}
      <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
        <h4 className="font-bold text-sm mb-3">عدد التوقفات</h4>
        {[
          { value: 0, label: "مباشر (بدون توقف)" },
          { value: 1, label: "توقف واحد" },
          { value: 2, label: "توقفتان أو أكثر" },
        ].map((stop) => (
          <label
            key={stop.value}
            className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
          >
            <Checkbox
              checked={filterStops.includes(stop.value)}
              onCheckedChange={(checked) => {
                setFilterStops((prev) =>
                  checked ? [...prev, stop.value] : prev.filter((s) => s !== stop.value)
                );
              }}
            />
            <span className="text-sm">{stop.label}</span>
          </label>
        ))}
      </div>

      {/* Airlines */}
      {availableAirlines.length > 0 && (
        <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
          <h4 className="font-bold text-sm mb-3">شركات الطيران</h4>
          {availableAirlines.map((airline) => (
            <label
              key={airline.code}
              className="flex items-center gap-3 py-1.5 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
            >
              <Checkbox
                checked={filterAirlines.includes(airline.code)}
                onCheckedChange={(checked) => {
                  setFilterAirlines((prev) =>
                    checked ? [...prev, airline.code] : prev.filter((c) => c !== airline.code)
                  );
                }}
              />
              <div className="flex items-center gap-2">
                <img
                  src={getAirlineLogo(airline.code)}
                  alt={airline.name}
                  className="w-5 h-5 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-sm">{airline.name}</span>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {(filterStops.length > 0 || filterAirlines.length > 0 || filterPriceRange[0] !== priceExtent.min || filterPriceRange[1] !== priceExtent.max) && (
        <button
          onClick={() => {
            setFilterStops([]);
            setFilterAirlines([]);
            setFilterPriceRange([priceExtent.min, priceExtent.max]);
          }}
          className="w-full text-center text-sm text-primary hover:underline py-2"
        >
          مسح جميع الفلاتر
        </button>
      )}
    </aside>
  );

  // ============ Render: Single Flight Card (MakeMyTrip style) ============
  const renderFlightCard = (offer: FlightOffer, idx: number, isReturn = false) => {
    const offerKey = getOfferKey(offer, idx);
    const summary = getOfferSummary(offer);
    const isSelectedOutbound = !isReturn && selectedOutboundKey === offerKey;
    const isSelectedReturn = isReturn && selectedReturnKey === offerKey;
    const isSelected = isSelectedOutbound || isSelectedReturn;
    const logoSrc = getAirlineLogo(summary.carrier);

    return (
      <div
        key={offerKey}
        className={`bg-card rounded-xl border transition-all duration-200 hover:shadow-lg ${
          isSelected ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-border shadow-sm"
        }`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Airline Info */}
          <div className="md:w-44 p-4 flex md:flex-col items-center md:items-start gap-3 md:border-l border-border shrink-0">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt={summary.carrierName || summary.carrier}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">${summary.carrier}</div>`;
                  }
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold">{summary.carrierName || summary.carrier}</p>
              <p className="text-xs text-muted-foreground">{summary.carrier}</p>
              {summary.flightNumber && (
                <p className="text-xs text-primary font-medium mt-0.5">{summary.flightNumber}</p>
              )}
              {summary.cabins && (
                <span className="inline-block mt-1 text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                  {summary.cabins}
                </span>
              )}
            </div>
          </div>

          {/* Flight Times & Duration */}
          <div className="flex-1 p-4 flex flex-col justify-center">
            <div className="flex items-center w-full gap-3">
              {/* Departure */}
              <div className="text-center min-w-[60px]">
                <p className="text-xl font-bold">{summary.departureTime || "--:--"}</p>
                <p className="text-xs text-muted-foreground font-medium">{summary.origin}</p>
                {summary.departTerminal && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{summary.departTerminal}</p>
                )}
              </div>

              {/* Duration Line */}
              <div className="flex-1 flex flex-col items-center px-2">
                <span className="text-xs text-muted-foreground mb-1">
                  {formatDuration(summary.durationMinutes) || "—"}
                </span>
                <div className="w-full relative flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1 h-px bg-border relative mx-1">
                    {summary.stopsCount > 0 && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                </div>
                <span className={`text-[11px] mt-1 font-medium ${summary.stopsCount === 0 ? "text-emerald-600" : "text-orange-500"}`}>
                  {getStopsLabel(summary.stopsCount)}
                </span>
              </div>

              {/* Arrival */}
              <div className="text-center min-w-[60px]">
                <p className="text-xl font-bold">{summary.arrivalTime || "--:--"}</p>
                <p className="text-xs text-muted-foreground font-medium">{summary.destination}</p>
                {summary.arriveTerminal && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{summary.arriveTerminal}</p>
                )}
              </div>
            </div>

            {/* Baggage & Extra Info Row */}
            {(summary.baggage || summary.aircraft) && (
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50">
                {summary.baggage?.cabin && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Briefcase className="w-3 h-3" />
                    <span>يد: {summary.baggage.cabin}</span>
                  </div>
                )}
                {summary.baggage?.checked && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Luggage className="w-3 h-3" />
                    <span>شحن: {summary.baggage.checked}</span>
                  </div>
                )}
                {summary.aircraft && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Plane className="w-3 h-3" />
                    <span>{summary.aircraft}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Price & Action */}
          <div className="md:w-52 p-4 flex flex-col items-center justify-center md:border-r border-border bg-muted/30 md:rounded-l-xl shrink-0">
            <p className="text-2xl font-bold text-primary">
              {summary.priceValue ? summary.priceValue.toLocaleString() : summary.priceLabel}
            </p>
            <p className="text-xs text-muted-foreground mb-3">{summary.currency}</p>

            {activeTripType === "roundtrip" ? (
              <div className="flex flex-col gap-2 w-full">
                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full text-xs ${isSelected ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => {
                    if (isReturn) {
                      setSelectedReturnKey(isSelectedReturn ? null : offerKey);
                    } else {
                      setSelectedOutboundKey(isSelectedOutbound ? null : offerKey);
                    }
                  }}
                >
                  {isSelected
                    ? isReturn ? "✓ تم اختيار العودة" : "✓ تم اختيار الذهاب"
                    : isReturn ? "اختر رحلة العودة" : "اختر رحلة الذهاب"
                  }
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs"
                  onClick={() => handleFlightCheckout(offer, summary)}
                >
                  حجز مباشر
                </Button>
              </div>
            ) : (
              <Button
                variant="hero"
                size="sm"
                className="w-full"
                onClick={() => handleFlightCheckout(offer, summary)}
              >
                احجز الآن
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {/* Hero + Search */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              احجز رحلتك القادمة
            </h1>
            <p className="text-primary-foreground/80 text-base">
              أفضل أسعار تذاكر الطيران مع خدمات إضافية مميزة
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <FlightSearchForm
              onSearch={handleFlightSearch}
              airlineCodes={airlines.map((airline) => airline.code).filter(Boolean)}
            />
          </div>
        </div>
      </section>

      {/* ======== Search Results Section ======== */}
      {(loading || flightResults.length > 0 || error) && (
        <section className="py-6 bg-muted/30 min-h-[60vh]">
          <div className="container mx-auto px-4">
            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-lg text-muted-foreground">جارٍ البحث عن أفضل الرحلات...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Results */}
            {!loading && flightResults.length > 0 && (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">
                      {lastSearchData?.origin} → {lastSearchData?.destination}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      ({filteredSortedResults.length} رحلة)
                    </span>
                  </div>

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

                {/* Sort Tabs */}
                <div className="flex gap-1 mb-5 overflow-x-auto pb-2">
                  {([
                    { id: "cheapest" as SortMode, label: "الأرخص", icon: "💰" },
                    { id: "direct" as SortMode, label: "مباشر أولاً", icon: "✈️" },
                    { id: "fastest" as SortMode, label: "الأسرع", icon: "⚡" },
                    { id: "recommended" as SortMode, label: "الأفضل", icon: "⭐" },
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

                {/* Roundtrip selection bar */}
                {activeTripType === "roundtrip" && canBookRoundtrip && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                          ✓ تم اختيار رحلتي الذهاب والعودة
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400">
                          الذهاب: {selectedOutboundSummary?.origin} → {selectedOutboundSummary?.destination}
                          {" | "}
                          العودة: {selectedReturnSummary?.origin} → {selectedReturnSummary?.destination}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">الإجمالي</p>
                          <p className="text-xl font-bold text-primary">{roundtripTotal.toLocaleString()} {roundtripCurrency}</p>
                        </div>
                        <Button variant="hero" onClick={handleRoundtripBook}>
                          احجز الذهاب والعودة
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTripType === "roundtrip" && !canBookRoundtrip && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-5">
                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                      اختر رحلة الذهاب ورحلة العودة ثم اضغط زر الحجز الموحد
                    </p>
                  </div>
                )}

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

                  {/* Flight Cards */}
                  <div className="flex-1 space-y-3">
                    {/* Outbound flights label for roundtrip */}
                    {activeTripType === "roundtrip" && (
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm font-semibold">رحلات الذهاب ({filteredSortedResults.length})</span>
                      </div>
                    )}

                    {filteredSortedResults.map((offer, idx) => renderFlightCard(offer, idx, false))}

                    {filteredSortedResults.length === 0 && (
                      <div className="bg-card rounded-xl border border-border p-8 text-center">
                        <p className="text-muted-foreground">لا توجد نتائج مطابقة للفلاتر المحددة.</p>
                        <button
                          onClick={() => {
                            setFilterStops([]);
                            setFilterAirlines([]);
                            setFilterPriceRange([priceExtent.min, priceExtent.max]);
                          }}
                          className="text-primary text-sm mt-2 hover:underline"
                        >
                          مسح الفلاتر
                        </button>
                      </div>
                    )}

                    {/* Return flights for roundtrip */}
                    {activeTripType === "roundtrip" && returnResults.length > 0 && (
                      <>
                        <div className="flex items-center gap-2 px-1 mt-8">
                          <div className="w-3 h-3 rounded-full bg-orange-400" />
                          <span className="text-sm font-semibold">رحلات العودة ({returnResults.length})</span>
                        </div>
                        {returnResults.map((offer, idx) => renderFlightCard(offer, idx, true))}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* No results and no error */}
            {!loading && flightResults.length === 0 && !error && (
              <div className="text-center text-muted-foreground text-lg py-20">
                <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <p>ابدأ البحث عن الرحلات بإدخال بياناتك في النموذج أعلاه.</p>
                <p className="mt-2 text-sm">مثال: الرياض إلى القاهرة بتاريخ 2026-03-01</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Popular Destinations */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">أشهر الوجهات</h2>
              <p className="text-muted-foreground mt-2">
                اختر وجهتك بسرعة من أكثر الوجهات طلبًا حسب المنطقة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "saudi", label: "أشهر الوجهات الداخلية" },
                  { id: "international", label: "أشهر الوجهات الدولية" },
                  { id: "middleeast", label: "أشهر الوجهات في الشرق الأوسط" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDestinationTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    destinationTab === tab.id
                      ? "hero-gradient text-primary-foreground border-transparent shadow-soft"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {destinationColumns.map((column, index) => (
              <ul key={index} className="space-y-2 text-muted-foreground">
                {column.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* Airlines */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <h3 className="text-xl md:text-2xl font-bold">أشهر شركات الطيران</h3>
            <Button variant="outline">عرض الكل</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {airlines.map((airline) => (
              <div
                key={airline.id}
                className="bg-card rounded-xl px-4 py-3 shadow-card flex items-center gap-3"
              >
                {(() => {
                  const logoCandidates = getAirlineLogoCandidates(airline.code, airline.website);
                  const logoSrc = airline.logo || logoCandidates[0];
                  return (
                    <ImageWithFallback
                      src={logoSrc}
                      alt={airline.name}
                      className="w-20 h-8 object-contain"
                      fallbackClassName="w-20 h-8 object-contain bg-muted"
                      fallbackSources={logoCandidates}
                      fallbackSrc="/airline-placeholder.svg"
                    />
                  );
                })()}
                <div className="text-sm font-semibold">{airline.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Flights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">الرحلات الأكثر طلباً</h2>
          <div className="space-y-4">
            {flights.map((flight, index) => (
              <div
                key={flight.id}
                className="bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Airline + Image */}
                  <div className="md:w-44 p-4 flex items-center gap-3 md:border-l border-border">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{flight.airline}</p>
                      {flight.flightNumber && (
                        <p className="text-xs text-primary font-medium mt-0.5">{flight.flightNumber}</p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        <span className="text-xs text-muted-foreground">{flight.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Flight Times */}
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="flex items-center w-full gap-3">
                      <div className="text-center min-w-[60px]">
                        <p className="text-xl font-bold">{flight.departTime}</p>
                        <p className="text-xs text-muted-foreground">{flight.from}</p>
                        {flight.departTerminal && (
                          <p className="text-[10px] text-muted-foreground">{flight.departTerminal}</p>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">{flight.duration}</span>
                        <div className="w-full relative flex items-center">
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          <div className="flex-1 h-px bg-border mx-1" />
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        </div>
                        <span className={`text-[11px] mt-1 font-medium ${
                          flight.stops === "مباشر" ? "text-emerald-600" : "text-orange-500"
                        }`}>
                          {flight.stops}
                        </span>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <p className="text-xl font-bold">{flight.arriveTime}</p>
                        <p className="text-xs text-muted-foreground">{flight.to}</p>
                        {flight.arriveTerminal && (
                          <p className="text-[10px] text-muted-foreground">{flight.arriveTerminal}</p>
                        )}
                      </div>
                    </div>

                    {/* Baggage & Extra Info */}
                    {(flight.baggage || flight.aircraft || flight.fareType) && (
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border/50">
                        {flight.baggage?.cabin && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Briefcase className="w-3 h-3" />
                            <span>يد: {flight.baggage.cabin}</span>
                          </div>
                        )}
                        {flight.baggage?.checked && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Luggage className="w-3 h-3" />
                            <span>شحن: {flight.baggage.checked}</span>
                          </div>
                        )}
                        {flight.aircraft && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Plane className="w-3 h-3" />
                            <span>{flight.aircraft}</span>
                          </div>
                        )}
                        {flight.fareType && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {flight.fareType}
                          </span>
                        )}
                        {flight.refundable && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                            قابل للاسترداد
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="md:w-48 p-4 flex flex-col items-center justify-center md:border-r border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground">يبدأ من</p>
                    <p className="text-2xl font-bold text-primary">
                      {flight.price} <span className="text-xs">ر.س</span>
                    </p>
                    <Button variant="hero" size="sm" className="w-full mt-2" onClick={() => handleBook(flight)}>
                      احجز الآن
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefit Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {adminBenefitCards.map((item, index) => (
              <div
                key={item.title}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {(() => {
                  const resolvedLink =
                    item.id === "app" && appDownloadLink ? appDownloadLink : item.ctaLink;
                  const Icon = benefitIcons[item.id] ?? Star;
                  return (
                    <ServiceCard
                      title={item.title}
                      description={item.description}
                      details={item.details}
                      ctaLabel={item.ctaLabel}
                      ctaLink={resolvedLink}
                      icon={<Icon className="w-6 h-6" />}
                    />
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2">خدمات إضافية لرحلتك</h2>
          <p className="text-muted-foreground mb-8">أضف هذه الخدمات لتجعل رحلتك أكثر راحة ومتعة</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ServiceCard
                    title={service.name}
                    description={service.description}
                    details={service.details}
                    ctaLabel="أضف للسلة"
                    onCta={() => handleServiceAdd(service)}
                    icon={<Icon className="w-7 h-7" />}
                    className="text-center"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Offer Details */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
            <div className="bg-card rounded-3xl p-8 shadow-card">
              <h2 className="text-2xl font-bold mb-4">تفاصيل ووصف العرض</h2>
              <p className="text-muted-foreground mb-6">
                عرض متكامل يشمل رحلة الطيران مع إمكانية إضافة الفندق والمواصلات والأنشطة في نفس المدينة.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {ticketDetails.map((detail) => (
                  <div key={detail.label} className="bg-muted rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">{detail.label}</p>
                    <p className="font-semibold">{detail.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h3 className="font-bold mb-3">تنبيهات هامة</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {bookingNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-muted rounded-3xl p-8 shadow-card">
              <h3 className="text-xl font-bold mb-4">بعد الدفع ستحصل على</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="bg-card rounded-xl p-4">
                  تذكرة رقمية قابلة للإرسال عبر البريد الإلكتروني أو واتساب.
                </div>
                <div className="bg-card rounded-xl p-4">
                  موقع صالة الوصول ورقم البوابة وتفاصيل الرحلة كاملة.
                </div>
                <div className="bg-card rounded-xl p-4">
                  إمكانية تعديل خدمات الفندق أو المواصلات من لوحة المستخدم.
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    handleBook({
                      id: "offer-bundle",
                      from: "عرض متكامل",
                      to: "رحلتك",
                      price: flights[0]?.price ?? 0,
                      duration: "خدمات إضافية للطيران والفندق",
                    })
                  }
                >
                  إضافة للسلة
                </Button>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() =>
                    handleBook({
                      id: "offer-checkout",
                      from: "عرض متكامل",
                      to: "رحلتك",
                      price: flights[0]?.price ?? 0,
                      duration: "خدمات إضافية للطيران والفندق",
                    })
                  }
                >
                  الدفع المباشر
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold">طرق الدفع المتاحة</h3>
                <p className="text-sm text-muted-foreground">ادفع بالطريقة التي تناسبك</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Apple Pay</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Samsung Pay</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Visa</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">Mastercard</div>
              <div className="bg-muted rounded-lg px-6 py-3 font-semibold">مدى</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
