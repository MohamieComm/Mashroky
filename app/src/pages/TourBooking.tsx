import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DatePickerField from "@/components/DatePickerField";
import { useCart } from "@/hooks/useCart";

const TOUR_SELECTION_KEY = "mashrouk-tour-selection";
const TOUR_BOOKING_KEY = "mashrouk-tour-booking";

type TourResult = {
  id?: string | null;
  name?: string | null;
  city?: string | null;
  category?: string | null;
  duration?: string | number | null;
  image?: string | null;
  priceTotal?: string | number | null;
  currency?: string | null;
};

type TourSelection = {
  tour?: TourResult | null;
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function TourBooking() {
  const { addItem } = useCart();
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

  const stateTour = (location.state as TourSelection | null)?.tour || null;
  const tour = stateTour || stored.tour || null;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("2");
  const [notes, setNotes] = useState("");

  if (!tour) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">لا توجد بيانات لحجز الجولة</h2>
            <p className="text-muted-foreground mb-4">يرجى العودة لاختيار جولة من النتائج المتاحة.</p>
            <Button variant="hero" onClick={() => navigate("/tours")}>العودة للجولات</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const price = parsePrice(tour.priceTotal);
  const currency = tour.currency || "SAR";

  const handleAddToCart = () => {
    const payload = {
      tour,
      traveler: { fullName, email, phone },
      date,
      people,
      notes,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(TOUR_BOOKING_KEY, JSON.stringify(payload));
    addItem({
      id: `tour-${tour.id || tourId}-${Date.now()}`,
      title: tour.name || "حجز جولة",
      price: price || 0,
      details: `${tour.city || "وجهة غير محددة"} • ${currency}`.trim(),
      image: tour.image || null,
      type: "tour",
    });
    navigate("/cart");
  };

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">حجز جولة</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            أكمل بيانات حجز الجولة
          </h1>
          <p className="text-primary-foreground/80 mt-3">{tour.name}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="bg-card rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="text-xl font-bold">بيانات المسافر</h3>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" />
            <div className="grid md:grid-cols-2 gap-4">
              <DatePickerField
                label="تاريخ الجولة"
                value={date}
                onChange={setDate}
              />
              <Input value={people} onChange={(e) => setPeople(e.target.value)} placeholder="عدد الأشخاص" />
            </div>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات إضافية (اختياري)" />
          </div>

          <div className="bg-muted rounded-3xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">ملخص الحجز</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>الجولة: {tour.name}</div>
              <div>المدينة: {tour.city || "غير محددة"}</div>
              <div>المدة: {tour.duration || "غير محددة"}</div>
            </div>
            <div className="mt-6 text-2xl font-bold text-primary">
              {price ? price.toLocaleString() : ""} {currency}
            </div>
            <Button variant="hero" className="w-full mt-6" onClick={handleAddToCart}>
              إضافة للسلة
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
