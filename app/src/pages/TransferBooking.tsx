import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DatePickerField from "@/components/DatePickerField";
import { useCart } from "@/hooks/useCart";

const TRANSFER_SELECTION_KEY = "mashrouk-transfer-selection";
const TRANSFER_BOOKING_KEY = "mashrouk-transfer-booking";

type TransferResult = {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  vendor?: string | null;
  image?: string | null;
  priceTotal?: string | number | null;
  currency?: string | null;
};

type TransferSelection = {
  transfer?: TransferResult | null;
};

const parsePrice = (value: unknown) => {
  const numeric = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

export default function TransferBooking() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { transferId } = useParams();
  const location = useLocation();

  const stored = useMemo<TransferSelection>(() => {
    try {
      const raw = localStorage.getItem(TRANSFER_SELECTION_KEY);
      return raw ? (JSON.parse(raw) as TransferSelection) : {};
    } catch {
      return {};
    }
  }, []);

  const stateTransfer = (location.state as TransferSelection | null)?.transfer || null;
  const transfer = stateTransfer || stored.transfer || null;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!transfer) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">لا توجد بيانات لحجز النقل</h2>
            <p className="text-muted-foreground mb-4">يرجى العودة لاختيار خدمة نقل من النتائج المتاحة.</p>
            <Button variant="hero" onClick={() => navigate("/transfers")}>العودة لخدمات النقل</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const price = parsePrice(transfer.priceTotal);
  const currency = transfer.currency || "SAR";

  const handleAddToCart = () => {
    const payload = {
      transfer,
      traveler: { fullName, email, phone },
      pickupAddress,
      dropoffAddress,
      date,
      notes,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(TRANSFER_BOOKING_KEY, JSON.stringify(payload));
    addItem({
      id: `transfer-${transfer.id || transferId}-${Date.now()}`,
      title: transfer.name || "حجز نقل",
      price: price || 0,
      details: `${transfer.vendor || "مزود غير محدد"} • ${currency}`.trim(),
      image: transfer.image || null,
      type: "transfer",
    });
    navigate("/cart");
  };

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">حجز نقل</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            أكمل بيانات حجز النقل
          </h1>
          <p className="text-primary-foreground/80 mt-3">{transfer.name}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="bg-card rounded-3xl p-6 shadow-card space-y-4">
            <h3 className="text-xl font-bold">بيانات المسافر</h3>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم الكامل" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الجوال" />
            <Input value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} placeholder="عنوان الاستلام" />
            <Input value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} placeholder="عنوان الوصول" />
            <DatePickerField
              label="تاريخ التوصيل"
              value={date}
              onChange={setDate}
            />
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات إضافية (اختياري)" />
          </div>

          <div className="bg-muted rounded-3xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">ملخص الحجز</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>الخدمة: {transfer.name}</div>
              <div>المزوّد: {transfer.vendor || "غير محدد"}</div>
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
