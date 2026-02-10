import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Car, Fuel, Settings, Users, ShieldCheck } from "lucide-react";

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
};

type CarSelection = {
  car?: CarResult | null;
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function CarDetails() {
  const navigate = useNavigate();
  const { carId } = useParams();
  const location = useLocation();

  const stored = useMemo<CarSelection>(() => {
    try {
      const raw = localStorage.getItem(CAR_SELECTION_KEY);
      return raw ? (JSON.parse(raw) as CarSelection) : {};
    } catch {
      return {};
    }
  }, []);

  const stateCar = (location.state as CarSelection | null)?.car || null;
  const [car] = useState<CarResult | null>(stateCar || stored.car || null);

  if (!car) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">تعذر العثور على تفاصيل السيارة</h2>
            <p className="text-muted-foreground mb-4">يرجى العودة لاختيار سيارة من النتائج المتاحة.</p>
            <Button variant="hero" onClick={() => navigate("/cars")}>العودة لنتائج السيارات</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const price = parsePrice(car.priceTotal);
  const currency = car.currency || "SAR";

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">تفاصيل السيارة</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            {car.name || ""}
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            {car.vendor || "مزود غير محدد"}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="bg-card rounded-3xl overflow-hidden shadow-card">
            <div className="h-72">
              <ImageWithFallback
                src={car.image}
                alt={car.name || ""}
                className="w-full h-full object-cover"
                fallbackQuery={`${car.name || "car"} ${car.category || ""}`}
              />
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">مواصفات السيارة</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Car className="w-4 h-4" /> : {car.category || ""}</div>
                <div className="flex items-center gap-2"><Settings className="w-4 h-4" />  : {car.transmission || ""}</div>
                <div className="flex items-center gap-2"><Fuel className="w-4 h-4" /> : {car.fuel || ""}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> : {car.seats || ""}</div>
              </div>
              <div className="bg-muted rounded-2xl p-4 text-sm text-muted-foreground">
                سيتم تأكيد موقع الاستلام والإرجاع بعد إتمام الحجز مع المزود.
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-3xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">ملخص الحجز</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>السيارة: {car.name}</div>
              <div>المزود: {car.vendor || "غير محدد"}</div>
              <div>الفئة: {car.category || "غير محدد"}</div>
            </div>
            <div className="mt-6 text-2xl font-bold text-primary">
              {price ? price.toLocaleString() : ""} {currency}
            </div>
            <Button variant="hero" className="w-full mt-6" onClick={() => navigate(`/cars/${carId}/booking`, { state: { car } })}>
              احجز الآن
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
              <ShieldCheck className="w-4 h-4" /> حجز آمن وسياسة الإلغاء حسب المزود.
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
