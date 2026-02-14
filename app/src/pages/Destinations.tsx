import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ServiceCard } from "@/components/ServiceCard";
import { defaultAirlines, defaultDestinations, useAdminCollection, useAdminSettings } from "@/data/adminStore";
import { adminBenefitCards, popularDestinationsByRegion } from "@/data/content";
import { getAirlineLogoCandidates } from "@/lib/media";
import { ArrowLeft, MapPin, Sparkles, Star, FileText, CalendarCheck, Smartphone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";

const tagStyles: Record<string, string> = {
  "شتوية": "bg-sky-100 text-sky-700",
  "صيفية": "bg-amber-100 text-amber-700",
  "رومانسية": "bg-rose-100 text-rose-700",
  "فاخر": "bg-amber-100 text-amber-700",
  "تراث": "bg-emerald-100 text-emerald-700",
  "عائلي": "bg-orange-100 text-orange-700",
};

const benefitIcons: Record<string, typeof Star> = {
  checkin: FileText,
  bookings: CalendarCheck,
  app: Smartphone,
};

export default function Destinations() {
  const [activeTab, setActiveTab] = useState<"saudi" | "international" | "middleeast">("saudi");
  const destinations = useAdminCollection("destinations", defaultDestinations);
  const airlines = useAdminCollection("airlines", defaultAirlines);
  const { appDownloadLink } = useAdminSettings();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const handleBook = (dest: (typeof destinations)[number]) => {
    addItem({
      id: `destination-${dest.title}-${Date.now()}`,
      title: dest.title || "وجهة سياحية",
      price: Number(String(dest.priceFrom ?? "0").replace(/[^\d.]/g, "")) || 0,
      details: `${dest.country} • ${dest.duration}`,
      image: dest.image,
      type: "destination",
    });
    navigate("/cart");
  };

  const destinationList = useMemo(() => {
    const fromAdmin = destinations
      .filter((dest) => dest.region === activeTab)
      .map((dest) => dest.title);
    const fallback = popularDestinationsByRegion[activeTab];
    return Array.from(new Set([...fromAdmin, ...fallback]));
  }, [destinations, activeTab]);

  const destinationColumns = useMemo(() => {
    const columns = 3;
    const chunkSize = Math.ceil(destinationList.length / columns);
    return Array.from({ length: columns }, (_, index) =>
      destinationList.slice(index * chunkSize, (index + 1) * chunkSize)
    ).filter((col) => col.length);
  }, [destinationList]);

  return (
    <Layout>
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-emerald-50 to-sky-50" />
        <div className="absolute inset-0 opacity-40 dot-pattern" />
        <div className="absolute -top-24 -left-16 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/70 rounded-full px-4 py-2 mb-6 shadow-soft">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">وجهات مختارة بعناية</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            وجهتك القادمة
            <span className="block mt-2 text-primary">بين التراث والحداثة والرفاهية</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            استكشف وجهات تناسب ذوقك وعائلتك — من العطلات اللاذعة إلى المغامرات الثقافية مع باقات شاملة للطيران والإقامة.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["شتوية", "صيفية", "رومانسية", "فاخر", "تراث", "عائلي"].map((tag) => (
              <span key={tag} className={`px-4 py-2 rounded-full text-sm font-semibold ${tagStyles[tag]}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-6 flex-wrap mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">استكشف الوجهات</h2>
              <p className="text-muted-foreground mt-2">
                تصفح الوجهات حسب المنطقة لتخطيط رحلتك بسهولة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "saudi", label: "أشهر الوجهات الداخلية" },
                  { id: "international", label: "أشهر الوجهات الدولية" },
                  { id: "middleeast", label: "أشهر الوجهات في الشرق الأوسط" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    activeTab === tab.id
                      ? "hero-gradient text-primary-foreground border-transparent shadow-soft"
                      : "bg-muted text-muted-foreground border-border hover:bg-accent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm mb-12">
            {destinationColumns.map((column, index) => (
              <ul key={index} className="space-y-2 text-muted-foreground">
                {column.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ))}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h3 className="text-2xl font-bold">أشهر شركات الطيران</h3>
            <Button variant="outline">عرض الكل</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-16">
            {airlines.map((airline) => (
              <div key={airline.id} className="bg-card rounded-xl px-4 py-3 shadow-card flex items-center gap-3">
                {(() => {
                  const logoCandidates = getAirlineLogoCandidates(airline.code, airline.website);
                  const logoSrc = airline.logo || logoCandidates[0];
                  return (
                    <ImageWithFallback
                      src={logoSrc}
                      alt={airline.name}
                      className="w-20 h-8 object-contain"
                      fallbackClassName="w-20 h-8 object-contain bg-muted"
                      fallbackSources={logoCandidates}
                      fallbackSrc="/airline-placeholder.svg"
                    />
                  );
                })()}
                <span className="text-sm font-semibold">{airline.name}</span>
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">وجهات موصى بها لهذا الموسم</h2>
              <p className="text-muted-foreground mt-2">
                باقات منتقاة بعناية مع توصيات خبرائنا ونقاط جذب حصرية لكل وجهة.
              </p>
            </div>
            <Link to="/offers">
              <Button variant="outline" className="gap-2">
                استعرض العروض
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest, index) => (
              <div
                key={dest.id}
                className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    fallbackQuery={`${dest.title} ${dest.country}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${tagStyles[dest.tag] || "bg-white/80 text-foreground"}`}>
                    {dest.tag}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{dest.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{dest.country}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">يبدأ من</p>
                      <p className="text-xl font-bold text-primary">{dest.priceFrom} ر.س</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{dest.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">المدة: {dest.duration}</span>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => handleBook(dest)}
                  >
                    احجز الآن
                  </Button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {adminBenefitCards.map((item, index) => (
              <div
                key={item.title}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {(() => {
                  const resolvedLink =
                    item.id === "app" && appDownloadLink ? appDownloadLink : item.ctaLink;
                  const Icon = benefitIcons[item.id] ?? Star;
                  return (
                    <ServiceCard
                      title={item.title}
                      description={item.description}
                      details={item.details}
                      ctaLabel={item.ctaLabel}
                      ctaLink={resolvedLink}
                      icon={<Icon className="w-6 h-6" />}
                    />
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
