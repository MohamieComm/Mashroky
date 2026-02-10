import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { MapPin, Star, BedDouble, Users, Calendar } from "lucide-react";
import { postJson } from "@/lib/backend";

const HOTEL_SELECTION_KEY = "mashrouk-hotel-selection";

type HotelOffer = {
  id?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  room?: { typeEstimated?: { category?: string; beds?: number; bedType?: string } } | null;
  guests?: { adults?: number } | null;
  price?: { total?: string; currency?: string } | null;
  policies?: { cancellations?: Array<{ deadline?: string; amount?: string }>} | null;
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
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function HotelDetails() {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const location = useLocation();
  const [hotel, setHotel] = useState<HotelResult | null>(() => {
    const stateHotel = (location.state as { hotel?: HotelResult } | null)?.hotel;
    return stateHotel || null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hotel || !hotelId) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await postJson<ApiResponse>("/api/hotels/details", { hotelId });
        const first = response?.results?.[0] || null;
        setHotel(first);
      } catch {
        setError("تعذر تحميل بيانات الفندق. حاول مرة أخرى.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hotel, hotelId]);

  const offers = useMemo(() => hotel?.offers || [], [hotel]);

  const handleSelectOffer = (offer?: HotelOffer | null) => {
    if (!hotel) return;
    const payload = { hotel, offer: offer || hotel.cheapestOffer || null };
    localStorage.setItem(HOTEL_SELECTION_KEY, JSON.stringify(payload));
    navigate(`/hotels/${hotel.id}/booking`, { state: payload });
  };

  const headerImage = hotel?.media?.[0]?.uri;
  const fallbackQuery = `${hotel?.name || "hotel"} ${hotel?.address?.cityName || hotel?.cityCode || ""}`.trim();

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">تفاصيل الفندق</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            {hotel?.name || "فندق غير محدد"}
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            {hotel?.address?.cityName || hotel?.cityCode || "مدينة غير محددة"}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="space-y-6">
            <div className="bg-card rounded-3xl overflow-hidden shadow-card">
              <div className="h-72">
                <ImageWithFallback
                  src={headerImage}
                  alt={hotel?.name || ""}
                  className="w-full h-full object-cover"
                  fallbackQuery={fallbackQuery}
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{hotel?.name || ""}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel?.address?.cityName || hotel?.cityCode || ""}</span>
                    </div>
                  </div>
                  {hotel?.rating ? (
                    <div className="flex items-center gap-2 bg-accent rounded-full px-3 py-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="font-bold">{hotel.rating}</span>
                    </div>
                  ) : null}
                </div>
                <p className="text-muted-foreground">
                  {hotel?.address?.lines?.length
                    ? hotel.address.lines.join("  ")
                    : "تفاصيل العنوان غير متوفرة حاليًا."}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-6 shadow-card">
              <h3 className="text-xl font-bold mb-4">العروض المتاحة</h3>
              {loading && <p className="text-muted-foreground">جاري تحميل العروض...</p>}
              {error && <p className="text-destructive">{error}</p>}
              {!loading && !offers.length && (
                <p className="text-muted-foreground">لا توجد عروض متاحة لهذا الفندق حالياً.</p>
              )}
              <div className="space-y-4">
                {offers.map((offer, index) => {
                  const roomInfo = offer?.room?.typeEstimated;
                  const price = parsePrice(offer?.price?.total);
                  const currency = offer?.price?.currency || "SAR";
                  return (
                    <div key={offer?.id || index} className="bg-muted rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-semibold">{roomInfo?.category || ""}</h4>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-2">
                              <BedDouble className="w-4 h-4" />
                              {roomInfo?.beds || 1} {roomInfo?.bedType || ""}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {offer?.guests?.adults || 2} نزيل
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {offer?.checkInDate || ""} - {offer?.checkOutDate || ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {price ? price.toLocaleString() : ""} {currency}
                          </div>
                          <Button variant="hero" size="sm" className="mt-2" onClick={() => handleSelectOffer(offer)}>
                            احجز الآن
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-3xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">نصائح قبل الحجز</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>راجع سياسة الإلغاء قبل تأكيد الحجز.</li>
              <li>تحقق من تفاصيل الغرفة وعدد النزلاء.</li>
              <li>يمكنك التواصل معنا لأي استفسار قبل الدفع.</li>
            </ul>
            <Button variant="outline" className="mt-6 w-full" onClick={() => handleSelectOffer(null)}>
              احجز أقل سعر
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
