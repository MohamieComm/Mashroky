import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plane,
  Hotel,
  Users,
  MapPin,
  PlayCircle,
} from "lucide-react";
import {
  defaultDestinations,
  defaultHotels,
  defaultOffers,
  useAdminCollection,
  usePromoVideoUrl,
} from "@/data/adminStore";
import { getMediaTypeFromUrl } from "@/lib/media";
import { Link, useNavigate } from "react-router-dom";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  AIRPORTS,
  formatAirportLabel,
  getInputLanguage,
  resolveAirportCode,
} from "@/data/airports";
import DatePickerField from "@/components/DatePickerField";

export function HeroSection() {
  const [searchType, setSearchType] = useState<"flights" | "hotels">("flights");
  const [tripType, setTripType] = useState<"roundtrip" | "oneway">("roundtrip");
  const [originInput, setOriginInput] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const navigate = useNavigate();

  const offers = useAdminCollection("offers", defaultOffers);
  const destinations = useAdminCollection("destinations", defaultDestinations);
  const hotels = useAdminCollection("hotels", defaultHotels);

  const stats = useMemo(
    () => [
      { label: "العروض المتاحة", value: `${offers.length}+` },
      { label: "الوجهات", value: `${destinations.length}+` },
      { label: "الفنادق", value: `${hotels.length}+` },
    ],
    [offers.length, destinations.length, hotels.length]
  );

  const supabasePromoUrl = usePromoVideoUrl();
  const promoVideoUrl =
    (import.meta.env.VITE_PROMO_VIDEO_URL as string | undefined) ||
    supabasePromoUrl;
  const promoMediaType = getMediaTypeFromUrl(promoVideoUrl);
  const showVideo = promoMediaType === "video";
  const showImage = promoMediaType === "image" || promoMediaType === "unknown";

  const searchLabel = useMemo(
    () => (searchType === "flights" ? "رحلات الطيران" : "الفنادق"),
    [searchType]
  );

  const originLang = getInputLanguage(originInput);
  const destinationLang = getInputLanguage(destinationInput);
  const dateLocale = originLang === "en" || destinationLang === "en" ? "en" : "ar";

  const handleHeroSearch = () => {
    if (searchType !== "flights") return;
    const originCode = resolveAirportCode(originInput, AIRPORTS);
    const destinationCode = resolveAirportCode(destinationInput, AIRPORTS);
    if (!originCode || !destinationCode || !departureDate) {
      alert("يرجى اختيار المدن والتاريخ من القائمة.");
      return;
    }
    if (tripType === "roundtrip" && !returnDate) {
      alert("يرجى تحديد تاريخ العودة لرحلات الذهاب والعودة.");
      return;
    }
    const params = new URLSearchParams({
      origin: originCode,
      destination: destinationCode,
      departureDate,
      passengers: passengers || "1",
      tripType,
    });
    if (tripType === "roundtrip" && returnDate) {
      params.set("returnDate", returnDate);
    }
    navigate(`/trips?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-95" />
      <div className="absolute inset-0 dot-pattern opacity-25" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="text-center lg:text-right">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-up">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-primary-foreground text-sm font-medium">
                رفيقك الموثوق لكل رحلة من الخليج إلى العالم
              </span>
            </div>

            <h1
              className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              سافر بثقة مع
              <span className="block mt-2 font-changa text-secondary">مشروك</span>
            </h1>

            <p
              className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl lg:max-w-none animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              باقات سفر متكاملة بأسعار شفافة، مصممة خصيصاً للعائلات والعرسان والمسافرين
              من الخليج. اختر وجهتك ونحن نُتقن التفاصيل.
            </p>

            <div
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10 animate-fade-up"
              style={{ animationDelay: "0.25s" }}
            >
              <Button variant="hero" size="lg" className="gap-2">
                ابدأ التخطيط الآن
              </Button>
              <Link to="/seasons">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/25"
                >
                  استكشف باقات الموسم
                </Button>
              </Link>
            </div>

            <div
              className="bg-card rounded-2xl p-6 shadow-hover animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex flex-wrap gap-3 mb-5">
                <button
                  onClick={() => setSearchType("flights")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all ${
                    searchType === "flights"
                      ? "hero-gradient text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Plane className="w-4 h-4" />
                  رحلات الطيران
                </button>
                <button
                  onClick={() => setSearchType("hotels")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition-all ${
                    searchType === "hotels"
                      ? "hero-gradient text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Hotel className="w-4 h-4" />
                  الفنادق
                </button>
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  نتائج {searchLabel} خلال ثوانٍ
                </span>
              </div>

              {searchType === "flights" && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setTripType("roundtrip")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      tripType === "roundtrip"
                        ? "hero-gradient text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    ذهاب وعودة
                  </button>
                  <button
                    onClick={() => setTripType("oneway")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      tripType === "oneway"
                        ? "hero-gradient text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    ذهاب فقط
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    list="hero-origin-airports"
                    placeholder={searchType === "flights" ? "من أين؟" : "الوجهة"}
                    className="pr-10 h-12 bg-muted border-0"
                    value={originInput}
                    onChange={(event) => setOriginInput(event.target.value)}
                  />
                  <datalist id="hero-origin-airports">
                    {AIRPORTS.map((airport) => (
                      <option
                        key={airport.code}
                        value={formatAirportLabel(airport, originLang)}
                      />
                    ))}
                  </datalist>
                </div>
                {searchType === "flights" && (
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      list="hero-destination-airports"
                      placeholder="إلى أين؟"
                      className="pr-10 h-12 bg-muted border-0"
                      value={destinationInput}
                      onChange={(event) => setDestinationInput(event.target.value)}
                    />
                    <datalist id="hero-destination-airports">
                      {AIRPORTS.map((airport) => (
                        <option
                          key={airport.code}
                          value={formatAirportLabel(airport, destinationLang)}
                        />
                      ))}
                    </datalist>
                  </div>
                )}
                <div className="relative">
                  <DatePickerField
                    value={departureDate}
                    onChange={setDepartureDate}
                    locale={dateLocale}
                    buttonClassName="bg-muted border-0"
                  />
                </div>
                {searchType === "flights" && tripType === "roundtrip" ? (
                  <div className="relative">
                    <DatePickerField
                      value={returnDate}
                      onChange={setReturnDate}
                      locale={dateLocale}
                      buttonClassName="bg-muted border-0"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="عدد المسافرين"
                      className="pr-10 h-12 bg-muted border-0"
                      value={passengers}
                      onChange={(event) => setPassengers(event.target.value)}
                    />
                  </div>
                )}
              </div>

              {searchType === "flights" && tripType === "roundtrip" && (
                <div className="mt-3">
                  <div className="relative max-w-xs">
                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="عدد المسافرين"
                      className="pr-10 h-12 bg-muted border-0"
                      value={passengers}
                      onChange={(event) => setPassengers(event.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full md:w-auto mt-6 gap-2"
                onClick={handleHeroSearch}
              >
                <Search className="w-5 h-5" />
                ابحث الآن
              </Button>
            </div>

            <div
              className="grid grid-cols-3 gap-6 mt-10 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">
                    {stat.value}
                  </p>
                  <p className="text-primary-foreground/70 text-sm md:text-base">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl border border-primary-foreground/20 p-4 shadow-hover animate-fade-up"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-primary-foreground/70 text-sm">تعرّف علينا</p>
                <h3 className="text-xl font-semibold text-primary-foreground">
                  مشروك — رحلتك تبدأ هنا
                </h3>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-background/20 min-h-[260px] flex items-center justify-center">
              {showVideo ? (
                <video
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                  src={promoVideoUrl}
                />
              ) : showImage ? (
                <Link to="/seasons" className="relative w-full h-full group">
                  <ImageWithFallback
                    src={promoVideoUrl}
                    alt="إعلان مواسم"
                    className="w-full h-full object-cover"
                    fallbackQuery="عروض مواسم سفر"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between">
                    <div className="text-primary-foreground">
                      <p className="text-sm text-primary-foreground/80">باقات موسمية</p>
                      <p className="text-lg font-semibold">
                        باقات رمضان والحج والصيف بأسعار شفافة
                      </p>
                    </div>
                    <span className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                      استكشف الآن
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-3 text-primary-foreground/70 py-12">
                  <PlayCircle className="w-16 h-16 text-secondary" />
                  <p className="font-semibold">لا يوجد فيديو مرفوع بعد</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-primary-foreground/80">
              <div className="bg-primary-foreground/10 rounded-xl p-3">
                <p className="font-semibold">باقات متكاملة</p>
                <p className="text-xs">طيران + فندق + أنشطة + تنقلات بسعر واحد.</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-3">
                <p className="font-semibold">دعم على مدار الساعة</p>
                <p className="text-xs">فريق يتحدث العربية متاح لمساعدتك دائماً.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
