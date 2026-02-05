import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { 
  Plane, 
  Clock, 
  Star,
  CreditCard,
  Hotel,
  Car,
  Camera,
  FileText
} from "lucide-react";
import { defaultAirlines, defaultDestinations, defaultFlights, useAdminCollection } from "@/data/adminStore";
import { useNavigate } from "react-router-dom";
import { adminBenefitCards, popularDestinationsByRegion } from "@/data/content";
import { useCart } from "@/hooks/useCart";
import FlightSearchForm from "@/components/FlightSearchForm";

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
  { icon: Hotel, name: "حجز فندق", description: "أفضل الفنادق بأسعار مميزة" },
  { icon: Car, name: "تأجير سيارة", description: "سيارات حديثة مع سائق" },
  { icon: Camera, name: "جولات سياحية", description: "اكتشف أجمل المعالم" },
  { icon: FileText, name: "خدمات الفيزا", description: "مساعدة في إجراءات السفر" },
];

export default function Trips() {
      // Fallback دائم في الصفحة
      const alwaysVisible = (
        <div style={{textAlign:'center',marginTop:'100px'}}>
          <img src="/logo.png" alt="مشروك" style={{width:'120px',marginBottom:'24px'}} />
          <h2 style={{fontSize:'2rem',color:'#e11d48'}}>قسم الرحلات</h2>
          <p style={{color:'#555',marginTop:'16px'}}>ابدأ البحث عن رحلتك من خلال النموذج أعلاه.<br/>إذا لم يظهر النموذج أو النتائج، يرجى تحديث الصفحة أو التواصل مع الدعم.</p>
        </div>
      );
    // Fallback إذا فشل كل شيء
    if (typeof Layout !== "function") {
      return <div style={{textAlign:'center',marginTop:'100px',fontSize:'2rem',color:'#e11d48'}}>حدث خطأ في تحميل الصفحة. يرجى تحديث الصفحة أو التواصل مع الدعم.</div>;
    }
  const navigate = useNavigate();
  const [destinationTab, setDestinationTab] = useState<"saudi" | "international" | "middleeast">("saudi");
  const flights = useAdminCollection("flights", defaultFlights);
  const destinations = useAdminCollection("destinations", defaultDestinations);
  const airlines = useAdminCollection("airlines", defaultAirlines);
  const { addItem } = useCart();

  const handleBook = (flight?: { id: string; from: string; to: string; price: number; duration: string }) => {
    if (flight) {
      addItem({
        id: `flight-${flight.id}-${Date.now()}`,
        title: `${flight.from} → ${flight.to}`,
        price: flight.price,
        details: flight.duration,
      });
    }
    navigate("/cart");
  };

  const [flightResults, setFlightResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFlightSearch = async (searchData: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: string;
    cabinClass: string;
    tripType: string;
    airline?: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://jubilant-hope-production-a334.up.railway.app/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "amadeus",
          origin: searchData.origin,
          destination: searchData.destination,
          departureDate: searchData.departureDate,
          adults: searchData.passengers,
          airline: searchData.airline || undefined,
        }),
      });
      const data = await res.json();
      setFlightResults(data.results || []);
    } catch (err) {
      setError("فشل جلب الرحلات. تأكد من الاتصال بالخادم.");
    }
    setLoading(false);
  };

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

  return (
    <Layout>
      {alwaysVisible}
      {/* Hero */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              احجز رحلتك القادمة
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              أفضل أسعار تذاكر الطيران مع خدمات إضافية مميزة
            </p>
          </div>

          {/* Flight Search Form Component */}
          <div className="max-w-6xl mx-auto">
            <FlightSearchForm onSearch={handleFlightSearch} />
          </div>
        </div>
      </section>

      {/* نتائج البحث */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {loading && <div className="text-center text-lg">جاري البحث عن الرحلات...</div>}
          {error && <div className="text-center text-destructive text-lg">{error}</div>}
          {!loading && flightResults.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {flightResults.map((offer, idx) => (
                <div key={offer.providerOfferId || idx} className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-2">
                    <Plane className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">{offer.slices?.[0]?.origin} → {offer.slices?.[0]?.destination}</span>
                  </div>
                  <div className="mb-2">رقم الرحلة: {offer.providerOfferId}</div>
                  <div className="mb-2">السعر: {offer.pricing?.total} {offer.pricing?.currency}</div>
                  <div className="mb-2">الدرجة: {offer.cabins?.join("، ")}</div>
                  <div className="mb-2">شركة الطيران: {offer.slices?.[0]?.marketingCarrier}</div>
                  <Button variant="hero" onClick={() => handleBook({ id: offer.providerOfferId, from: offer.slices?.[0]?.origin, to: offer.slices?.[0]?.destination, price: offer.pricing?.total, duration: offer.slices?.[0]?.durationMinutes })}>احجز الآن</Button>
                </div>
              ))}
            </div>
          )}
          {!loading && flightResults.length === 0 && !error && (
            <div className="text-center text-muted-foreground text-lg mt-10">
              <span>ابدأ البحث عن الرحلات بإدخال بياناتك في النموذج أعلاه.</span>
              <div className="mt-4 text-sm">مثال: الرياض إلى القاهرة بتاريخ 2026-03-01</div>
            </div>
          )}
        </div>
      </section>

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
                {airline.logo && (
                  <ImageWithFallback
                    src={airline.logo}
                    alt={airline.name}
                    className="w-20 h-8 object-contain"
                    fallbackClassName="w-20 h-8 object-contain bg-muted"
                  />
                )}
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

          <div className="space-y-6">
            {flights.map((flight, index) => (
              <div
                key={flight.id}
                className="bg-card rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Flight Image */}
                  <div className="lg:w-48 h-32 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={flight.image}
                      alt={`${flight.from} إلى ${flight.to}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Flight Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Plane className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{flight.airline}</span>
                        <div className="flex items-center gap-1 bg-accent rounded-full px-2 py-1">
                          <Star className="w-3 h-3 fill-secondary text-secondary" />
                          <span className="text-xs font-semibold">{flight.rating}</span>
                        </div>
                      </div>
                      <span className="bg-accent text-accent-foreground text-sm px-3 py-1 rounded-full">
                        {flight.stops}
                      </span>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.departTime}</p>
                        <p className="text-muted-foreground">{flight.from}</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                        <div className="w-full h-px bg-border relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary w-3 h-3 rounded-full" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{flight.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.arriveTime}</p>
                        <p className="text-muted-foreground">{flight.to}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="lg:w-48 flex flex-col items-center justify-center lg:border-r border-border lg:pr-6">
                    <p className="text-sm text-muted-foreground">يبدأ من</p>
                    <p className="text-3xl font-bold text-primary">{flight.price} <span className="text-sm">ر.س</span></p>
                    <Button variant="hero" className="w-full mt-4" onClick={() => handleBook(flight)}>احجز الآن</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {adminBenefitCards.map((item, index) => (
              <div
                key={item.title}
                className="bg-card rounded-2xl p-6 shadow-card animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
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
                  className="bg-card rounded-2xl p-6 text-center shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer group animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 hero-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold mb-2">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
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
                <Button variant="outline" className="w-full">إضافة للسلة</Button>
                <Button variant="hero" className="w-full">الدفع المباشر</Button>
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
