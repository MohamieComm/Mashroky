import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminData } from "@/data/adminStore";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Plane,
  Hotel,
  Tag,
  Users,
  Settings,
  Link2,
  Key,
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  LogOut,
  Bell,
  Menu,
  CalendarCheck,
  MapPinned,
  Newspaper,
  PlayCircle,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

type FieldType = "text" | "number" | "textarea" | "list" | "pairlist" | "select";

type FieldConfig = {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

type SectionConfig = {
  id: string;
  title: string;
  description: string;
  listKey: "flights" | "hotels" | "offers" | "activities" | "articles" | "destinations" | "partners" | "airlines" | "apiKeys" | "users" | "pages";
  fields: FieldConfig[];
  primaryField?: string;
};

const sidebarItems = [
  { name: "لوحة التحكم", icon: LayoutDashboard, id: "dashboard" },
  { name: "الرحلات", icon: Plane, id: "trips" },
  { name: "الفنادق", icon: Hotel, id: "hotels" },
  { name: "العروض", icon: Tag, id: "offers" },
  { name: "مواسم", icon: CalendarCheck, id: "seasons" },
  { name: "النشاطات", icon: CalendarCheck, id: "activities" },
  { name: "الوجهات", icon: MapPinned, id: "destinations" },
  { name: "المقالات", icon: Newspaper, id: "articles" },
  { name: "المشتركين", icon: Users, id: "users" },
  { name: "الشركاء (Affiliate)", icon: Link2, id: "affiliate" },
  { name: "خطوط الطيران", icon: Plane, id: "airlines" },
  { name: "API Keys", icon: Key, id: "api" },
  { name: "الصفحات", icon: FileText, id: "pages" },
  { name: "المدفوعات", icon: CreditCard, id: "payments" },
  { name: "الإعدادات", icon: Settings, id: "settings" },
];

const sectionConfigs: Record<string, SectionConfig> = {
    seasons: {
      id: "seasons",
      title: "عروض مواسم",
      description: "إضافة عروض موسمية مثل رمضان، الحج، والصيف (دراسة بالخارج).",
      listKey: "seasons",
      primaryField: "title",
      fields: [
        { key: "title", label: "اسم العرض" },
        { key: "season", label: "الموسم", type: "select", options: [
          { label: "رمضان", value: "ramadan" },
          { label: "الحج", value: "hajj" },
          { label: "الصيف", value: "summer" },
        ] },
        { key: "description", label: "وصف العرض", type: "textarea" },
        { key: "image", label: "صورة العرض" },
        { key: "price", label: "السعر" },
        { key: "options", label: "خيارات (سكن، مواصلات، دراسة)", type: "list" },
      ],
    },
  trips: {
    id: "trips",
    title: "إدارة الرحلات",
    description: "إضافة وتعديل بيانات الرحلات المعروضة في صفحة الطيران.",
    listKey: "flights",
    primaryField: "from",
    fields: [
      { key: "from", label: "من" },
      { key: "to", label: "إلى" },
      { key: "airline", label: "شركة الطيران" },
      { key: "departTime", label: "وقت المغادرة" },
      { key: "arriveTime", label: "وقت الوصول" },
      { key: "duration", label: "مدة الرحلة" },
      { key: "price", label: "السعر" },
      { key: "stops", label: "التوقفات" },
      { key: "rating", label: "التقييم", type: "number" },
      { key: "image", label: "صورة" },
    ],
  },
  hotels: {
    id: "hotels",
    title: "إدارة الفنادق",
    description: "تعديل بطاقات الفنادق ومزاياها وأسعارها.",
    listKey: "hotels",
    primaryField: "name",
    fields: [
      { key: "name", label: "اسم الفندق" },
      { key: "location", label: "الموقع" },
      { key: "image", label: "الصورة" },
      { key: "rating", label: "التقييم", type: "number" },
      { key: "reviews", label: "عدد التقييمات", type: "number" },
      { key: "price", label: "السعر" },
      { key: "priceNote", label: "ملاحظة السعر" },
      { key: "description", label: "وصف الفندق", type: "textarea" },
      { key: "amenities", label: "المزايا (افصل بفواصل)", type: "list" },
      { key: "distances", label: "المسافات (سطر لكل عنصر: الاسم | المسافة)", type: "pairlist" },
      { key: "cuisine", label: "المطاعم" },
      { key: "tag", label: "وسم" },
    ],
  },
  offers: {
    id: "offers",
    title: "إدارة العروض",
    description: "تحديث الباقات الموسمية والخصومات.",
    listKey: "offers",
    primaryField: "title",
    fields: [
      { key: "title", label: "اسم العرض" },
      { key: "description", label: "وصف العرض", type: "textarea" },
      { key: "image", label: "الصورة" },
      { key: "discount", label: "نسبة الخصم", type: "number" },
      { key: "validUntil", label: "صالح حتى" },
      { key: "originalPrice", label: "السعر قبل الخصم" },
      { key: "newPrice", label: "السعر بعد الخصم" },
      { key: "season", label: "الموسم" },
      { key: "includes", label: "تشمل الباقة (افصل بفواصل)", type: "list" },
      { key: "tips", label: "نصائح (افصل بفواصل)", type: "list" },
    ],
  },
  activities: {
    id: "activities",
    title: "إدارة النشاطات",
    description: "إضافة مسابقات ومهرجانات وأنشطة متنوعة.",
    listKey: "activities",
    primaryField: "title",
    fields: [
      { key: "title", label: "اسم النشاط" },
      { key: "location", label: "المدينة" },
      { key: "category", label: "التصنيف" },
      { key: "price", label: "السعر" },
      { key: "image", label: "الصورة" },
    ],
  },
  destinations: {
    id: "destinations",
    title: "إدارة الوجهات السياحية",
    description: "إضافة وجهات جديدة وتحديد الموسم والأسعار.",
    listKey: "destinations",
    primaryField: "title",
    fields: [
      { key: "title", label: "الوجهة" },
      { key: "country", label: "الدولة أو المدينة" },
      {
        key: "region",
        label: "التصنيف",
        type: "select",
        options: [
          { label: "داخل السعودية", value: "saudi" },
          { label: "الشرق الأوسط", value: "middleeast" },
          { label: "وجهات عالمية", value: "international" },
        ],
      },
      { key: "tag", label: "وسم" },
      { key: "duration", label: "المدة" },
      { key: "priceFrom", label: "السعر يبدأ من" },
      { key: "description", label: "وصف مختصر", type: "textarea" },
      { key: "image", label: "الصورة" },
    ],
  },
  articles: {
    id: "articles",
    title: "إدارة المقالات",
    description: "إضافة أخبار ومقالات سياحية محدثة.",
    listKey: "articles",
    primaryField: "title",
    fields: [
      { key: "title", label: "عنوان المقال" },
      { key: "category", label: "التصنيف" },
      { key: "date", label: "التاريخ" },
      { key: "image", label: "الصورة" },
    ],
  },
  affiliate: {
    id: "affiliate",
    title: "إدارة الشركاء",
    description: "الشركات الشريكة ونسب العمولة.",
    listKey: "partners",
    primaryField: "name",
    fields: [
      { key: "name", label: "اسم الشريك" },
      { key: "type", label: "النوع" },
      { key: "website", label: "الموقع" },
      { key: "commission", label: "نسبة العمولة" },
    ],
  },
  airlines: {
    id: "airlines",
    title: "إدارة خطوط الطيران",
    description: "تحديث بيانات خطوط الطيران ومعلومات التواصل.",
    listKey: "airlines",
    primaryField: "name",
    fields: [
      { key: "name", label: "اسم الشركة" },
      { key: "code", label: "الكود" },
      { key: "website", label: "الموقع" },
      { key: "phone", label: "رقم التواصل" },
      { key: "logo", label: "رابط الشعار" },
    ],
  },
  api: {
    id: "api",
    title: "مفاتيح API والمدفوعات",
    description: "إدارة مفاتيح الربط مع Amadeus وGoogle وMoyasar وغير ذلك.",
    listKey: "apiKeys",
    primaryField: "name",
    fields: [
      { key: "name", label: "اسم المفتاح" },
      { key: "provider", label: "المزود" },
      { key: "key", label: "قيمة المفتاح" },
      {
        key: "status",
        label: "الحالة",
        type: "select",
        options: [
          { label: "مفعل", value: "enabled" },
          { label: "معطل", value: "disabled" },
        ],
      },
    ],
  },
  users: {
    id: "users",
    title: "إدارة المستخدمين",
    description: "قائمة المستخدمين وحالة الحساب.",
    listKey: "users",
    primaryField: "name",
    fields: [
      { key: "name", label: "الاسم" },
      { key: "email", label: "البريد الإلكتروني" },
      {
        key: "role",
        label: "الصلاحية",
        type: "select",
        options: [
          { label: "مستخدم", value: "user" },
          { label: "مدير", value: "admin" },
        ],
      },
      {
        key: "status",
        label: "الحالة",
        type: "select",
        options: [
          { label: "نشط", value: "active" },
          { label: "موقوف", value: "suspended" },
        ],
      },
    ],
  },
  pages: {
    id: "pages",
    title: "إدارة الصفحات",
    description: "صفحات تعريفية وسياسات الخدمة.",
    listKey: "pages",
    primaryField: "title",
    fields: [
      { key: "title", label: "عنوان الصفحة" },
      { key: "slug", label: "المسار" },
      { key: "summary", label: "ملخص الصفحة", type: "textarea" },
    ],
  },
};

const parseList = (value: string) =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const parsePairs = (value: string) =>
  value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, distance] = line.split("|").map((part) => part.trim());
      return { name: name || "", distance: distance || "" };
    })
    .filter((pair) => pair.name || pair.distance);

const formatPairs = (pairs: { name: string; distance: string }[] | undefined) =>
  (pairs || []).map((pair) => `${pair.name} | ${pair.distance}`).join("\n");

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  return Number.parseFloat(cleaned) || 0;
};

export default function Admin() {
  const { isAdmin, loading: authLoading, user, profile } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const {
    data: adminData,
    loading: adminLoading,
    upsertItem,
    deleteItem,
    updatePromoVideoUrl,
  } = useAdminData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [promoDraft, setPromoDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [authFailed, setAuthFailed] = useState(false);
  const isPageLoading = authLoading || adminLoading;
  const paymentProvider = (import.meta.env.VITE_PAYMENT_PROVIDER || "").toLowerCase();
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
  const moyasarPublicKey = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY || "";

  const activeConfig = sectionConfigs[activeSection];

  useEffect(() => {
    if (!activeConfig) return;
    const nextDraft = activeConfig.fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
    setDraft(nextDraft);
    setEditingId(null);
    setSearchTerm("");
  }, [activeSection]);

  useEffect(() => {
    setPromoDraft(adminData.promoVideoUrl || "");
  }, [adminData.promoVideoUrl]);

  const stats = useMemo(
    () => [
      { name: "العروض النشطة", value: adminData.offers.length.toString() },
      { name: "الفنادق", value: adminData.hotels.length.toString() },
      { name: "الوجهات", value: adminData.destinations.length.toString() },
      { name: "المقالات", value: adminData.articles.length.toString() },
    ],
    [adminData]
  );

  const handleDraftChange = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const buildItemFromDraft = () => {
    if (!activeConfig) return null;
    const nextItem: Record<string, unknown> = {
      id: editingId ?? `${activeConfig.id}-${Date.now()}`,
    };

    activeConfig.fields.forEach((field) => {
      const raw = draft[field.key] ?? "";
      if (field.type === "list") {
        nextItem[field.key] = parseList(raw);
        return;
      }
      if (field.type === "pairlist") {
        nextItem[field.key] = parsePairs(raw);
        return;
      }
      if (field.type === "number") {
        nextItem[field.key] = parseNumber(raw);
        return;
      }
      nextItem[field.key] = raw;
    });

    return nextItem;
  };

  const handleSaveItem = async () => {
    if (!activeConfig) return;
    const nextItem = buildItemFromDraft();
    if (!nextItem) return;
    const saved = await upsertItem(activeConfig.listKey, nextItem as any);
    if (!saved) return;

    const resetDraft = activeConfig.fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {});
    setDraft(resetDraft);
    setEditingId(null);
  };

  const handleEditItem = (item: Record<string, unknown>) => {
    if (!activeConfig) return;
    const nextDraft = activeConfig.fields.reduce<Record<string, string>>((acc, field) => {
      const value = item[field.key];
      if (field.type === "list") {
        acc[field.key] = Array.isArray(value) ? value.join(", ") : "";
        return acc;
      }
      if (field.type === "pairlist") {
        acc[field.key] = formatPairs(value as { name: string; distance: string }[] | undefined);
        return acc;
      }
      acc[field.key] = value ? String(value) : "";
      return acc;
    }, {});
    setDraft(nextDraft);
    setEditingId(String(item.id ?? ""));
  };

  const handleDeleteItem = async (id: string) => {
    if (!activeConfig) return;
    await deleteItem(activeConfig.listKey, id);
  };

  const filteredItems = useMemo(() => {
    if (!activeConfig) return [];
    const items = adminData[activeConfig.listKey] as Record<string, unknown>[];
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) =>
      activeConfig.fields.some((field) =>
        String(item[field.key] ?? "").toLowerCase().includes(term)
      )
    );
  }, [adminData, activeConfig, searchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!authLoading && !isAdmin) {
        setAuthFailed(true);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [authLoading, isAdmin]);

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="bg-card rounded-2xl p-10 shadow-card text-center max-w-lg">
          <h2 className="text-2xl font-bold mb-3">جاري التحقق من الصلاحيات</h2>
          <p className="text-muted-foreground">يرجى الانتظار لحظات...</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
            {authFailed && (
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="bg-card rounded-2xl p-10 shadow-card text-center max-w-lg">
          <h2 className="text-2xl font-bold mb-3">الوصول مقيّد</h2>
          <p className="text-muted-foreground mb-6">
            هذه الصفحة مخصّصة لحسابات الإدارة فقط. تأكد من تسجيل الدخول بحساب يمتلك صلاحيات الإدارة.
          </p>
          <a href="/auth" className="inline-flex items-center justify-center h-12 px-6 rounded-xl hero-gradient text-primary-foreground">
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex overflow-x-hidden" dir="rtl">
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-64 max-w-[80vw] bg-card shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
            mobileSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="مشروك" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gradient">مشروك</span>
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="p-2 hover:bg-muted rounded-lg">
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "hero-gradient text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <a href="/">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>العودة للموقع</span>
              </button>
            </a>
          </div>
        </aside>
      </div>

      <aside className={`hidden lg:flex ${sidebarOpen ? "w-64" : "w-20"} bg-card border-l border-border transition-all duration-300 flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="مشروك" className="w-10 h-10 object-contain" />
            {sidebarOpen && <span className="text-xl font-bold text-gradient">مشروك</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-muted rounded">
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "hero-gradient text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <a href="/">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>العودة للموقع</span>}
            </button>
          </a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">
              {sidebarItems.find((item) => item.id === activeSection)?.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm text-muted-foreground">{user?.email ?? ""}</span>
              <span className="text-xs text-primary">
                {isAdmin ? "مدير" : profile?.role ? "مستخدم" : "غير مسجل"}
              </span>
            </div>
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="بحث سريع..." className="pr-10 w-64" />
            </div>
            <button className="relative p-2 hover:bg-muted rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <div className="w-10 h-10 hero-gradient rounded-full flex items-center justify-center text-primary-foreground font-bold">
              أ
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.name} className="bg-card rounded-2xl p-6 shadow-card">
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <h2 className="text-2xl font-bold mb-4">إدارة محتوى مشروك</h2>
                <p className="text-muted-foreground">
                  استخدم القائمة الجانبية لإضافة أو تعديل المحتوى. جميع التعديلات تُحفظ فوراً وتنعكس على صفحات الموقع.
                </p>
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <PlayCircle className="w-6 h-6 text-secondary" />
                  <h2 className="text-2xl font-bold">الفيديو التعريفي أو صورة إعلان</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  ضع رابط فيديو (MP4) أو صورة إعلان جذابة (JPG/PNG) ليظهر في الصفحة الرئيسية. يمكن تحديثه في أي وقت.
                </p>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <Input
                    placeholder="https://example.com/promo.mp4"
                    value={promoDraft}
                    onChange={(event) => setPromoDraft(event.target.value)}
                  />
                  <Button
                    variant="hero"
                    onClick={() => updatePromoVideoUrl(promoDraft, user?.id)}
                  >
                    حفظ الرابط
                  </Button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      // رفع الملف إلى Supabase Storage
                      const fileName = `promo/${Date.now()}-${file.name}`;
                      const { data, error } = await supabase.storage.from("promo").upload(fileName, file);
                      if (error) {
                        alert("فشل رفع الملف: " + error.message);
                        return;
                      }
                      const url = supabase.storage.from("promo").getPublicUrl(fileName).publicUrl;
                      setPromoDraft(url);
                      await updatePromoVideoUrl(url, user?.id);
                    }}
                  />
                  <Button variant="secondary" onClick={() => setPromoDraft("")}>مسح الملف</Button>
                </div>
                <div className="mt-6 flex gap-6">
                  {adminData.promoImageUrl && (
                    <img src={adminData.promoImageUrl} alt="صورة إعلان" className="rounded-xl shadow-card w-64 h-40 object-cover" />
                  )}
                  {promoDraft && (
                    <video src={promoDraft} controls className="rounded-xl shadow-card w-64 h-40 object-cover" />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "payments" && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">لوحة المدفوعات</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  إعدادات الدفع المباشر تُدار عبر مزود خارجي. تأكد من تهيئة المفاتيح العامة في ملف البيئة وعدم تخزين المفاتيح السرية في الواجهة.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground">المزود الحالي</p>
                    <p className="text-lg font-semibold mt-2">
                      {paymentProvider ? paymentProvider : "غير مهيأ"}
                    </p>
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground">مفتاح Stripe العام</p>
                    <p className="text-lg font-semibold mt-2">
                      {stripePublicKey ? "موجود" : "غير موجود"}
                    </p>
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs text-muted-foreground">مفتاح Moyasar العام</p>
                    <p className="text-lg font-semibold mt-2">
                      {moyasarPublicKey ? "موجود" : "غير موجود"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-bold">جاهزية الأمان</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>تأكد من تفعيل 3D Secure لدى مزود الدفع.</li>
                    <li>استخدم Webhooks للتحقق من حالة الدفع من الخادم.</li>
                    <li>لا تحفظ بيانات البطاقة في المتصفح أو قاعدة البيانات.</li>
                  </ul>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg font-bold">المفاتيح والسرية</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    المفاتيح السرية يجب أن تبقى في الخادم فقط. يمكنك إدارة المفاتيح العامة من ملف البيئة وتحديثها بدون إعادة نشر قاعدة البيانات.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeConfig && (
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-8 shadow-card">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{activeConfig.title}</h2>
                    <p className="text-sm text-muted-foreground mt-2">{activeConfig.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="بحث داخل القائمة"
                        className="pr-9"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                      />
                    </div>
                    <Button variant="hero" className="gap-2" onClick={handleSaveItem}>
                      <Plus className="w-4 h-4" />
                      {editingId ? "تحديث" : "إضافة"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  {activeConfig.fields.map((field) => (
                    <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                      <label className="text-sm text-muted-foreground mb-2 block">{field.label}</label>
                      {(field.key === "image" || field.key === "logo") ? (
                        <div className="flex flex-col gap-2">
                          <Input
                            value={draft[field.key] ?? ""}
                            placeholder={field.placeholder}
                            onChange={(event) => handleDraftChange(field.key, event.target.value)}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (event) => {
                              const file = event.target.files?.[0];
                              if (!file) return;
                              const fileName = `${field.key}/${Date.now()}-${file.name}`;
                              const { data, error } = await supabase.storage.from("public").upload(fileName, file);
                              if (error) {
                                alert("فشل رفع الصورة: " + error.message);
                                return;
                              }
                              const url = supabase.storage.from("public").getPublicUrl(fileName).publicUrl;
                              handleDraftChange(field.key, url);
                            }}
                          />
                          {draft[field.key] && (
                            <img src={draft[field.key]} alt="صورة" className="rounded-xl shadow-card w-40 h-24 object-cover mt-2" />
                          )}
                        </div>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          value={draft[field.key] ?? ""}
                          placeholder={field.placeholder}
                          onChange={(event) => handleDraftChange(field.key, event.target.value)}
                        />
                      ) : field.type === "select" ? (
                        <select
                          className="h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
                          value={draft[field.key] ?? ""}
                          onChange={(event) => handleDraftChange(field.key, event.target.value)}
                        >
                          <option value="">اختر</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "list" || field.type === "pairlist" ? (
                        <Textarea
                          value={draft[field.key] ?? ""}
                          placeholder={field.placeholder}
                          onChange={(event) => handleDraftChange(field.key, event.target.value)}
                        />
                      ) : (
                        <Input
                          value={draft[field.key] ?? ""}
                          placeholder={field.placeholder}
                          onChange={(event) => handleDraftChange(field.key, event.target.value)}
                        />
                      )}
                      {field.type === "list" && (
                        <p className="text-xs text-muted-foreground mt-1">افصل العناصر بفاصلة أو سطر جديد.</p>
                      )}
                      {field.type === "pairlist" && (
                        <p className="text-xs text-muted-foreground mt-1">مثال: المطار | 20 دقيقة</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div key={String(item.id)} className="bg-card rounded-2xl p-6 shadow-card">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">
                        {String(item[activeConfig.primaryField || activeConfig.fields[0].key] ?? "عنصر")}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteItem(String(item.id))}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      {activeConfig.fields.map((field) => {
                        const value = item[field.key];
                        if (!value) return null;
                        if (field.type === "list" && Array.isArray(value)) {
                          return (
                            <p key={field.key}>
                              <span className="font-semibold text-foreground">{field.label}: </span>
                              {value.join("، ")}
                            </p>
                          );
                        }
                        if (field.type === "pairlist" && Array.isArray(value)) {
                          return (
                            <p key={field.key}>
                              <span className="font-semibold text-foreground">{field.label}: </span>
                              {value.map((pair) => `${pair.name} (${pair.distance})`).join("، ")}
                            </p>
                          );
                        }
                        return (
                          <p key={field.key}>
                            <span className="font-semibold text-foreground">{field.label}: </span>
                            {String(value)}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
