import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { MapPin, Clock, Users, Star } from "lucide-react";

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

type TourSelection = {
  tour?: TourResult | null;
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function TourDetails() {
  const navigate = useNavigate();
  const { tourId } = useParams();
  const location = useLocation();

  const stored = useMemo<TourSelection>(() => {
    try {
      const raw = localStorage.getItem(TOUR_SELECTION_KEY);
      return raw ? (JSON.parse(raw) as TourSelection) : {};
    } catch {
      return {};
    }
  }, []);

  const tour = (location.state as TourSelection | null)?.tour || stored.tour || null;

  if (!tour) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">تعذر العثور على تفاصيل الجولة</h2>
            <p className="text-muted-foreground mb-4">يرجى العودة لاختيار جولة من النتائج المتاحة.</p>
            <Button variant="hero" onClick={() => navigate("/tours")}>العودة لنتائج الجولات</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const price = parsePrice(tour.priceTotal);
  const currency = tour.currency || "SAR";

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">تفاصيل الجولة</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            {tour.name}
          </h1>
          <p className="text-primary-foreground/80 mt-3">{tour.city}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="bg-card rounded-3xl overflow-hidden shadow-card">
            <div className="h-72">
              <ImageWithFallback
                src={tour.image}
                alt={tour.name || ""}
                className="w-full h-full object-cover"
                fallbackQuery={`${tour.city || "city"} ${tour.category || "tour"}`}
              />
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">نبذة عن الجولة</h2>
              <p className="text-muted-foreground">
                {tour.summary || "تجربة سياحية مصممة بعناية لتمنحك أفضل ما في الوجهة المختارة."}
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> : {tour.city}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> : {tour.duration || ""}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> : {tour.category || ""}</div>
                {tour.rating ? (
                  <div className="flex items-center gap-2"><Star className="w-4 h-4" /> : {tour.rating}</div>
                ) : null}
              </div>
              {tour.meetingPoint && (
                <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                  نقطة الالتقاء: {tour.meetingPoint}
                </div>
              )}
            </div>
          </div>

          <div className="bg-muted rounded-3xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">ملخص السعر</h3>
            <div className="text-2xl font-bold text-primary">
              {price ? price.toLocaleString() : ""} {currency}
            </div>
            <Button variant="hero" className="w-full mt-6" onClick={() => navigate(`/tours/${tourId}/booking`, { state: { tour } })}>
              احجز الجولة
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
