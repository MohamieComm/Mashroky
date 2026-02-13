import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";

const HOTEL_SELECTION_KEY = "mashrouk-hotel-selection";
const HOTEL_BOOKING_KEY = "mashrouk-hotel-booking";

type HotelOffer = {
  id?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  room?: { typeEstimated?: { category?: string; beds?: number; bedType?: string } } | null;
  guests?: { adults?: number } | null;
  price?: { total?: string; currency?: string } | null;
};

type HotelResult = {
  id: string | null;
  name: string | null;
  cityCode?: string | null;
  address?: { cityName?: string; lines?: string[] } | null;
  media?: Array<{ uri?: string }>;
};

type BookingState = {
  hotel?: HotelResult | null;
  offer?: HotelOffer | null;
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function HotelBooking() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const location = useLocation();

  const storedState = useMemo<BookingState>(() => {
    try {
      const raw = localStorage.getItem(HOTEL_SELECTION_KEY);
      return raw ? (JSON.parse(raw) as BookingState) : {};
    } catch {
      return {};
    }
  }, []);

  const state = (location.state as BookingState | null) || storedState;
  const hotel = state?.hotel || null;
  const offer = state?.offer || null;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const price = parsePrice(offer?.price?.total);
  const currency = offer?.price?.currency || "SAR";

  const handleAddToCart = () => {
    if (!hotel) return;
    const bookingPayload = {
      hotel,
      offer,
      guest: { fullName, email, phone, notes },
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(HOTEL_BOOKING_KEY, JSON.stringify(bookingPayload));
    addItem({
      id: `hotel-${hotel.id || hotelId}-${Date.now()}`,
      title: hotel.name || "حجز فندق",
      price: price || 0,
      details: `${hotel?.address?.cityName || hotel?.cityCode || "مدينة غير محددة"} • ${currency}`.trim(),
      image: hotel?.media?.[0]?.uri || null,
      type: "hotel",
    });
    navigate("/cart");
  };

  if (!hotel) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">لا توجد بيانات حجز للفندق</h2>
            <p className="text-muted-foreground mb-4">يرجى العودة لاختيار فندق من النتائج المتاحة.</p>
            <Button variant="hero" onClick={() => navigate("/hotels")}>العودة للفنادق</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">حجز فندق</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            أكمل بيانات حجز الفندق
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            {hotel.name}  {hotel?.address?.cityName || hotel?.cityCode}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="bg-card rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="text-xl font-bold">بيانات النزيل</h3>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" />
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات إضافية (اختياري)" />
          </div>

          <div className="bg-muted rounded-3xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">ملخص الحجز</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>الفندق: {hotel.name}</div>
              <div>المدينة: {hotel?.address?.cityName || hotel?.cityCode}</div>
              {offer?.checkInDate && offer?.checkOutDate && (
                <div>التواريخ: {offer.checkInDate} - {offer.checkOutDate}</div>
              )}
              {offer?.room?.typeEstimated?.category && (
                <div>نوع الغرفة: {offer.room.typeEstimated.category}</div>
              )}
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
