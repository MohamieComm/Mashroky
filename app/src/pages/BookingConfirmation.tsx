import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { FileDown, CheckCircle, Plane, Hotel, Car, MapPin, Bus } from "lucide-react";

// Storage keys for all service types
const FLIGHT_BOOKING_RESULT_KEY = "mashrouk-flight-booking-result";
const FLIGHT_BOOKING_KEY = "mashrouk-flight-booking";
const FLIGHT_BOOKING_STATUS_KEY = "mashrouk-flight-booking-status";
const HOTEL_BOOKING_KEY = "mashrouk-hotel-booking";
const HOTEL_BOOKING_RESULT_KEY = "mashrouk-hotel-booking-result";
const CAR_BOOKING_KEY = "mashrouk-car-booking";
const CAR_BOOKING_RESULT_KEY = "mashrouk-car-booking-result";
const TOUR_BOOKING_KEY = "mashrouk-tour-booking";
const TOUR_BOOKING_RESULT_KEY = "mashrouk-tour-booking-result";
const TRANSFER_BOOKING_KEY = "mashrouk-transfer-booking";
const TRANSFER_BOOKING_RESULT_KEY = "mashrouk-transfer-booking-result";

type BookingType = "flight" | "hotel" | "car" | "tour" | "transfer" | "unknown";

const typeLabels: Record<BookingType, string> = {
  flight: "طيران",
  hotel: "فندق",
  car: "سيارة",
  tour: "جولة",
  transfer: "نقل",
  unknown: "حجز",
};

const typeIcons: Record<BookingType, typeof Plane> = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
  tour: MapPin,
  transfer: Bus,
  unknown: CheckCircle,
};

function detectBookingType(): BookingType {
  if (localStorage.getItem(FLIGHT_BOOKING_RESULT_KEY) || localStorage.getItem(FLIGHT_BOOKING_KEY)) return "flight";
  if (localStorage.getItem(HOTEL_BOOKING_RESULT_KEY) || localStorage.getItem(HOTEL_BOOKING_KEY)) return "hotel";
  if (localStorage.getItem(CAR_BOOKING_RESULT_KEY) || localStorage.getItem(CAR_BOOKING_KEY)) return "car";
  if (localStorage.getItem(TOUR_BOOKING_RESULT_KEY) || localStorage.getItem(TOUR_BOOKING_KEY)) return "tour";
  if (localStorage.getItem(TRANSFER_BOOKING_RESULT_KEY) || localStorage.getItem(TRANSFER_BOOKING_KEY)) return "transfer";
  return "unknown";
}

function getBookingData(type: BookingType) {
  const parse = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  switch (type) {
    case "flight": {
      const result = parse(FLIGHT_BOOKING_RESULT_KEY);
      const payload = parse(FLIGHT_BOOKING_KEY);
      const mainResult = Array.isArray(result) ? result[0] : result;
      return {
        bookingRef: mainResult?.bookingReference || mainResult?.providerOrderId || "",
        total: payload?.total || 0,
        currency: payload?.currency || "SAR",
        details: [
          payload?.summary?.outbound && `الذهاب: ${payload.summary.outbound}`,
          payload?.summary?.inbound && `العودة: ${payload.summary.inbound}`,
          payload?.travelers?.length && `عدد المسافرين: ${payload.travelers.length}`,
        ].filter(Boolean),
      };
    }
    case "hotel": {
      const booking = parse(HOTEL_BOOKING_KEY);
      const result = parse(HOTEL_BOOKING_RESULT_KEY);
      return {
        bookingRef: result?.bookingId || result?.id || "",
        total: Number(booking?.offer?.price?.total || 0),
        currency: booking?.offer?.price?.currency || "SAR",
        details: [
          booking?.hotel?.name && `الفندق: ${booking.hotel.name}`,
          (booking?.hotel?.address?.cityName || booking?.hotel?.cityCode) && `المدينة: ${booking.hotel.address?.cityName || booking.hotel.cityCode}`,
          booking?.offer?.checkInDate && booking?.offer?.checkOutDate && `التواريخ: ${booking.offer.checkInDate} - ${booking.offer.checkOutDate}`,
        ].filter(Boolean),
      };
    }
    case "car": {
      const booking = parse(CAR_BOOKING_KEY);
      const result = parse(CAR_BOOKING_RESULT_KEY);
      return {
        bookingRef: result?.bookingId || result?.id || "",
        total: Number(booking?.car?.priceTotal || 0),
        currency: booking?.car?.currency || "SAR",
        details: [
          booking?.car?.name && `المركبة: ${booking.car.name}`,
          booking?.car?.vendor && `المزوّد: ${booking.car.vendor}`,
          booking?.pickupDate && `الاستلام: ${booking.pickupDate}`,
          booking?.dropoffDate && `الإرجاع: ${booking.dropoffDate}`,
        ].filter(Boolean),
      };
    }
    case "tour": {
      const booking = parse(TOUR_BOOKING_KEY);
      const result = parse(TOUR_BOOKING_RESULT_KEY);
      return {
        bookingRef: result?.bookingId || result?.id || "",
        total: Number(booking?.tour?.priceTotal || 0),
        currency: booking?.tour?.currency || "SAR",
        details: [
          booking?.tour?.name && `الجولة: ${booking.tour.name}`,
          booking?.tour?.city && `المدينة: ${booking.tour.city}`,
          booking?.date && `التاريخ: ${booking.date}`,
          booking?.people && `عدد الأشخاص: ${booking.people}`,
        ].filter(Boolean),
      };
    }
    case "transfer": {
      const booking = parse(TRANSFER_BOOKING_KEY);
      const result = parse(TRANSFER_BOOKING_RESULT_KEY);
      return {
        bookingRef: result?.bookingId || result?.id || "",
        total: Number(booking?.transfer?.priceTotal || 0),
        currency: booking?.transfer?.currency || "SAR",
        details: [
          booking?.transfer?.name && `الخدمة: ${booking.transfer.name}`,
          booking?.transfer?.vendor && `المزوّد: ${booking.transfer.vendor}`,
          booking?.pickupAddress && `الاستلام: ${booking.pickupAddress}`,
          booking?.date && `التاريخ: ${booking.date}`,
        ].filter(Boolean),
      };
    }
    default:
      return { bookingRef: "", total: 0, currency: "SAR", details: [] };
  }
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const bookingType = useMemo(() => detectBookingType(), []);
  const data = useMemo(() => getBookingData(bookingType), [bookingType]);
  const Icon = typeIcons[bookingType];

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Cleanup after reading
    const cleanup = () => {
      [
        FLIGHT_BOOKING_KEY, FLIGHT_BOOKING_RESULT_KEY, FLIGHT_BOOKING_STATUS_KEY,
        HOTEL_BOOKING_KEY, HOTEL_BOOKING_RESULT_KEY,
        CAR_BOOKING_KEY, CAR_BOOKING_RESULT_KEY,
        TOUR_BOOKING_KEY, TOUR_BOOKING_RESULT_KEY,
        TRANSFER_BOOKING_KEY, TRANSFER_BOOKING_RESULT_KEY,
      ].forEach((key) => localStorage.removeItem(key));
    };
    // Delay cleanup to ensure data is read
    const timer = setTimeout(cleanup, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadPdf = async () => {
    if (!data.bookingRef) return;
    setDownloadingPdf(true);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(data.bookingRef)}/invoice.pdf`);
      if (!res.ok) throw new Error("pdf_failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${data.bookingRef}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("تعذر تحميل الفاتورة. يرجى المحاولة لاحقًا.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <span className="text-primary-foreground/80">تأكيد الحجز</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            تم إصدار الحجز بنجاح
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            احتفظ برقم الحجز لاستخدامه لاحقًا.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-3xl p-8 shadow-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">حجز {typeLabels[bookingType]}</h2>
                </div>
                {data.bookingRef && (
                  <div className="mb-3">
                    <span className="text-sm text-muted-foreground">رقم الحجز:</span>
                    <p className="text-3xl font-bold text-primary">{data.bookingRef}</p>
                  </div>
                )}
                {data.details.length > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground space-y-2">
                    {data.details.map((detail, idx) => (
                      <div key={idx}>{detail}</div>
                    ))}
                  </div>
                )}
              </div>
              {data.total > 0 && (
                <div className="bg-muted rounded-2xl p-6 text-center min-w-[220px]">
                  <div className="text-sm text-muted-foreground">الإجمالي المدفوع</div>
                  <div className="text-2xl font-bold mt-2">
                    {Number(data.total).toLocaleString()} {data.currency}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {data.bookingRef && (
                <Button variant="outline" className="gap-2" disabled={downloadingPdf} onClick={handleDownloadPdf}>
                  <FileDown className="w-4 h-4" />
                  {downloadingPdf ? "جارٍ التحميل..." : "تحميل الفاتورة PDF"}
                </Button>
              )}
              <Button variant="hero" onClick={() => navigate("/profile")}>
                عرض الحجوزات
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                العودة للرئيسية
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
