import { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Users, Briefcase, Car } from "lucide-react";

const TRANSFER_SELECTION_KEY = "mashrouk-transfer-selection";

type TransferResult = {
  id?: string | null;
  name?: string | null;
  type?: string | null;
  capacity?: number | null;
  luggage?: number | null;
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

export default function TransferDetails() {
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

  const transfer = (location.state as TransferSelection | null)?.transfer || stored.transfer || null;

  if (!transfer) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">تعذر العثور على تفاصيل التوصيل</h2>
            <p className="text-muted-foreground mb-4">يرجى العودة لاختيار خدمة من النتائج المتاحة.</p>
            <Button variant="hero" onClick={() => navigate("/transfers")}>العودة لنتائج التوصيل</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const price = parsePrice(transfer.priceTotal);
  const currency = transfer.currency || "SAR";

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">تفاصيل خدمة التوصيل</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            {transfer.name}
          </h1>
          <p className="text-primary-foreground/80 mt-3">{transfer.vendor || "مزود غير محدد"}</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="bg-card rounded-3xl overflow-hidden shadow-card">
            <div className="h-72">
              <ImageWithFallback
                src={transfer.image}
                alt={transfer.name || ""}
                className="w-full h-full object-cover"
                fallbackQuery={`${transfer.type || "car"} transfer`}
              />
            </div>
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">مواصفات المركبة</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Car className="w-4 h-4" /> : {transfer.type || ""}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> : {transfer.capacity || 3} </div>
                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> : {transfer.luggage || 2} </div>
              </div>
              <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground">
                يشمل الحجز سائقًا خاصًا ومتابعة حتى نقطة الوصول.
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-3xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">ملخص السعر</h3>
            <div className="text-2xl font-bold text-primary">
              {price ? price.toLocaleString() : ""} {currency}
            </div>
            <Button variant="hero" className="w-full mt-6" onClick={() => navigate(`/transfers/${transferId}/booking`, { state: { transfer } })}>
              احجز الآن
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
