import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const CHECKOUT_KEY = "mashrouk-flight-checkout";
const BOOKING_KEY = "mashrouk-flight-booking";
const BOOKING_STATUS_KEY = "mashrouk-flight-booking-status";
const ORDER_SNAPSHOT_KEY = "mashrouk-last-order";

type CheckoutPayload = {
  tripType: "oneway" | "roundtrip";
  passengers: number;
  cabinClass: string;
  offers: any[];
  summary?: {
    outbound?: string;
    inbound?: string;
  };
};

type TravelerForm = {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  passportNumber: string;
  passportExpiry: string;
  nationality: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
};

type TravelerErrors = Partial<Record<keyof TravelerForm, string>>;

const createTraveler = (): TravelerForm => ({
  firstName: "",
  lastName: "",
  gender: "MALE",
  dateOfBirth: "",
  passportNumber: "",
  passportExpiry: "",
  nationality: "SA",
  email: "",
  phoneCountryCode: "966",
  phoneNumber: "",
});

export default function FlightTravelerDetails() {
  const navigate = useNavigate();
  const [checkout, setCheckout] = useState<CheckoutPayload | null>(null);
  const [travelers, setTravelers] = useState<TravelerForm[]>([]);
  const [fieldErrors, setFieldErrors] = useState<TravelerErrors[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const flightApiBaseUrl =
    (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
    "https://jubilant-hope-production-a334.up.railway.app";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKOUT_KEY);
      if (!raw) return;
      const payload = JSON.parse(raw) as CheckoutPayload;
      if (!payload?.offers?.length) return;
      setCheckout(payload);
      const count = Math.max(1, Number(payload.passengers) || 1);
      setTravelers(Array.from({ length: count }, () => createTraveler()));
      setFieldErrors(Array.from({ length: count }, () => ({})));
    } catch {
      setCheckout(null);
    }
  }, []);

  const canContinue = useMemo(() => {
    if (!checkout) return false;
    if (!travelers.length) return false;
    return travelers.every((t) =>
      Boolean(
        t.firstName &&
          t.lastName &&
          t.dateOfBirth &&
          t.passportNumber &&
          t.passportExpiry &&
          t.nationality &&
          t.email &&
          t.phoneNumber
      )
    );
  }, [checkout, travelers]);

  const updateTraveler = (index: number, patch: Partial<TravelerForm>) => {
    setTravelers((prev) =>
      prev.map((t, idx) => (idx === index ? { ...t, ...patch } : t))
    );
    setFieldErrors((prev) =>
      prev.map((err, idx) => {
        if (idx !== index) return err;
        const next = { ...err };
        Object.keys(patch).forEach((key) => {
          delete next[key as keyof TravelerForm];
        });
        return next;
      })
    );
  };

  const validateTraveler = (traveler: TravelerForm): TravelerErrors => {
    const errors: TravelerErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passportRegex = /^[A-Za-z0-9]{5,20}$/;
    const nationalityRegex = /^[A-Za-z]{2,3}$/;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!traveler.firstName) errors.firstName = "الاسم الأول مطلوب";
    if (!traveler.lastName) errors.lastName = "اسم العائلة مطلوب";
    if (!traveler.dateOfBirth) errors.dateOfBirth = "تاريخ الميلاد مطلوب";
    if (!traveler.gender) errors.gender = "الجنس مطلوب";
    if (!traveler.nationality) {
      errors.nationality = "الجنسية مطلوبة";
    } else if (!nationalityRegex.test(traveler.nationality)) {
      errors.nationality = "رمز الجنسية يجب أن يكون 2-3 أحرف";
    }
    if (!traveler.passportNumber) {
      errors.passportNumber = "رقم الجواز مطلوب";
    } else if (!passportRegex.test(traveler.passportNumber)) {
      errors.passportNumber = "رقم الجواز غير صالح";
    }
    if (!traveler.passportExpiry) {
      errors.passportExpiry = "تاريخ انتهاء الجواز مطلوب";
    } else {
      const expiry = new Date(traveler.passportExpiry);
      if (Number.isNaN(expiry.getTime())) {
        errors.passportExpiry = "تاريخ انتهاء الجواز غير صالح";
      } else if (expiry < today) {
        errors.passportExpiry = "تاريخ انتهاء الجواز يجب أن يكون مستقبليًا";
      }
    }
    if (!traveler.email) {
      errors.email = "البريد الإلكتروني مطلوب";
    } else if (!emailRegex.test(traveler.email)) {
      errors.email = "صيغة البريد غير صحيحة";
    }
    if (!traveler.phoneCountryCode) errors.phoneCountryCode = "رمز الدولة مطلوب";
    if (!traveler.phoneNumber) {
      errors.phoneNumber = "رقم الجوال مطلوب";
    } else if (!/^[0-9]{5,15}$/.test(traveler.phoneNumber)) {
      errors.phoneNumber = "رقم الجوال غير صالح";
    }

    return errors;
  };

  const validateAll = () => {
    const errors = travelers.map(validateTraveler);
    setFieldErrors(errors);
    return errors.every((err) => Object.keys(err).length === 0);
  };

  const buildTravelerPayload = () =>
    travelers.map((t, index) => ({
      id: String(index + 1),
      dateOfBirth: t.dateOfBirth,
      name: {
        firstName: t.firstName,
        lastName: t.lastName,
      },
      gender: t.gender,
      contact: {
        emailAddress: t.email || undefined,
        phones: t.phoneNumber
          ? [
              {
                deviceType: "MOBILE",
                countryCallingCode: t.phoneCountryCode || "966",
                number: t.phoneNumber,
              },
            ]
          : [],
      },
      documents: [
        {
          documentType: "PASSPORT",
          number: t.passportNumber,
          expiryDate: t.passportExpiry,
          issuanceCountry: t.nationality,
          nationality: t.nationality,
          holder: true,
        },
      ],
    }));

  const handleSubmit = async () => {
    if (!checkout) return;
    if (!validateAll()) {
      setError("يرجى تصحيح بيانات المسافرين قبل المتابعة.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const priceRes = await fetch(
        `${flightApiBaseUrl.replace(/\/$/, "")}/api/flights/price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flightOffers: checkout.offers }),
        }
      );
      if (!priceRes.ok) {
        const body = await priceRes.json().catch(() => ({}));
        throw new Error(body?.error || "flight_price_failed");
      }
      const priceData = await priceRes.json();
      const pricedOffers =
        priceData?.data?.flightOffers ||
        priceData?.flightOffers ||
        checkout.offers;
      const total = (pricedOffers || []).reduce((sum: number, offer: any) => {
        const raw = offer?.price?.total;
        const value = Number(String(raw || 0).replace(/[^\d.]/g, "")) || 0;
        return sum + value;
      }, 0);
      const currency =
        pricedOffers?.[0]?.price?.currency || priceData?.data?.currency || "SAR";

      const bookingPayload = {
        createdAt: new Date().toISOString(),
        tripType: checkout.tripType,
        total,
        currency,
        offers: pricedOffers,
        travelers: buildTravelerPayload(),
        summary: checkout.summary || {},
      };
      localStorage.setItem(BOOKING_KEY, JSON.stringify(bookingPayload));
      localStorage.setItem(BOOKING_STATUS_KEY, "pending");

      const orderNumber = `ORD-${Date.now()}`;
      const orderSnapshot = {
        orderNumber,
        currency,
        total,
        items: [
          {
            id: orderNumber,
            title: checkout.summary?.outbound || "حجز طيران",
            price: total,
            quantity: 1,
          },
        ],
      };
      localStorage.setItem(ORDER_SNAPSHOT_KEY, JSON.stringify(orderSnapshot));

      const paymentRes = await fetch(
        `${flightApiBaseUrl.replace(/\/$/, "")}/api/payments/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            currency,
            description: "حجز طيران",
            returnUrl: window.location.origin,
          }),
        }
      );
      if (!paymentRes.ok) {
        const body = await paymentRes.json().catch(() => ({}));
        throw new Error(body?.error || "payment_failed");
      }
      const paymentData = await paymentRes.json();
      if (paymentData?.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
        return;
      }
      throw new Error("missing_payment_url");
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown_error";
      setError(
        code === "flight_price_failed"
          ? "تعذر تسعير الرحلة. حاول مرة أخرى."
          : "تعذر بدء الدفع. تحقق من البيانات أو أعد المحاولة."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!checkout) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-lg">
            <h2 className="text-xl font-bold mb-2">لا توجد رحلة محددة</h2>
            <p className="text-muted-foreground mb-4">يرجى اختيار رحلة أولاً من صفحة الرحلات.</p>
            <Button variant="hero" onClick={() => navigate("/trips")}>
              العودة للرحلات
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary-foreground/80">بيانات المسافرين</span>
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-3">
            أكمل بيانات الحجز
          </h1>
          <p className="text-primary-foreground/80 mt-3">
            سنستخدم هذه البيانات لإصدار تذاكر الطيران بعد الدفع.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="space-y-6">
            {travelers.map((traveler, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-card">
                <h3 className="text-lg font-bold mb-4">مسافر {index + 1}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم الأول</Label>
                    <Input
                      value={traveler.firstName}
                      onChange={(e) => updateTraveler(index, { firstName: e.target.value })}
                      placeholder="First Name"
                    />
                    {fieldErrors[index]?.firstName && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label>اسم العائلة</Label>
                    <Input
                      value={traveler.lastName}
                      onChange={(e) => updateTraveler(index, { lastName: e.target.value })}
                      placeholder="Last Name"
                    />
                    {fieldErrors[index]?.lastName && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.lastName}</p>
                    )}
                  </div>
                  <div>
                    <Label>تاريخ الميلاد</Label>
                    <Input
                      type="date"
                      value={traveler.dateOfBirth}
                      onChange={(e) => updateTraveler(index, { dateOfBirth: e.target.value })}
                    />
                    {fieldErrors[index]?.dateOfBirth && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.dateOfBirth}</p>
                    )}
                  </div>
                  <div>
                    <Label>الجنس</Label>
                    <select
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      value={traveler.gender}
                      onChange={(e) =>
                        updateTraveler(index, { gender: e.target.value as TravelerForm["gender"] })
                      }
                    >
                      <option value="MALE">ذكر</option>
                      <option value="FEMALE">أنثى</option>
                    </select>
                    {fieldErrors[index]?.gender && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.gender}</p>
                    )}
                  </div>
                  <div>
                    <Label>رقم الجواز</Label>
                    <Input
                      value={traveler.passportNumber}
                      onChange={(e) => updateTraveler(index, { passportNumber: e.target.value })}
                      placeholder="Passport Number"
                    />
                    {fieldErrors[index]?.passportNumber && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.passportNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label>تاريخ انتهاء الجواز</Label>
                    <Input
                      type="date"
                      value={traveler.passportExpiry}
                      onChange={(e) => updateTraveler(index, { passportExpiry: e.target.value })}
                    />
                    {fieldErrors[index]?.passportExpiry && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.passportExpiry}</p>
                    )}
                  </div>
                  <div>
                    <Label>الجنسية (رمز ISO مثل SA)</Label>
                    <Input
                      value={traveler.nationality}
                      onChange={(e) =>
                        updateTraveler(index, { nationality: e.target.value.toUpperCase() })
                      }
                      placeholder="SA"
                    />
                    {fieldErrors[index]?.nationality && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.nationality}</p>
                    )}
                  </div>
                  <div>
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={traveler.email}
                      onChange={(e) => updateTraveler(index, { email: e.target.value })}
                      placeholder="name@email.com"
                    />
                    {fieldErrors[index]?.email && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.email}</p>
                    )}
                  </div>
                  <div>
                    <Label>رمز الدولة</Label>
                    <Input
                      value={traveler.phoneCountryCode}
                      onChange={(e) => updateTraveler(index, { phoneCountryCode: e.target.value })}
                      placeholder="966"
                    />
                    {fieldErrors[index]?.phoneCountryCode && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.phoneCountryCode}</p>
                    )}
                  </div>
                  <div>
                    <Label>رقم الجوال</Label>
                    <Input
                      value={traveler.phoneNumber}
                      onChange={(e) => updateTraveler(index, { phoneNumber: e.target.value })}
                      placeholder="5XXXXXXXX"
                    />
                    {fieldErrors[index]?.phoneNumber && (
                      <p className="text-xs text-destructive mt-1">{fieldErrors[index]?.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card h-fit">
            <h3 className="text-xl font-bold mb-4">ملخص الحجز</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>نوع الرحلة: {checkout.tripType === "roundtrip" ? "ذهاب وعودة" : "ذهاب فقط"}</div>
              <div>عدد المسافرين: {checkout.passengers}</div>
              {checkout.summary?.outbound && (
                <div>الذهاب: {checkout.summary.outbound}</div>
              )}
              {checkout.summary?.inbound && (
                <div>العودة: {checkout.summary.inbound}</div>
              )}
            </div>
            {error && <p className="text-sm text-destructive mt-4">{error}</p>}
            <Button
              variant="hero"
              className="w-full mt-6"
              disabled={!canContinue || processing}
              onClick={handleSubmit}
            >
              {processing ? "جاري تجهيز الدفع..." : "المتابعة للدفع"}
            </Button>
            <Button variant="ghost" className="w-full mt-3" onClick={() => navigate("/trips")}>
              تعديل البحث
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
