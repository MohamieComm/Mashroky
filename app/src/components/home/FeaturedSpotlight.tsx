import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAdminSettings } from "@/data/adminStore";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function FeaturedSpotlight() {
  const {
    featuredImageUrl,
    featuredTitle,
    featuredDescription,
    featuredLink,
  } = useAdminSettings();

  const title = featuredTitle || "عرض الموسم المميز";
  const description =
    featuredDescription ||
    "اختر باقتك المفضلة واستمتع بتجربة سفر متكاملة بأسعار شفافة وخيارات مرنة.";
  const link = (featuredLink || "/offers").trim();
  const isExternal = /^https?:\/\//.test(link);

  const renderCta = () => {
    if (isExternal) {
      return (
        <Button variant="hero" size="lg" className="gap-2" asChild>
          <a href={link} target="_blank" rel="noreferrer">
            استكشف العرض
          </a>
        </Button>
      );
    }
    return (
      <Button variant="hero" size="lg" className="gap-2" asChild>
        <Link to={link}>استكشف العرض</Link>
      </Button>
    );
  };

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-3xl p-8 md:p-10 shadow-card grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              العرض المميز
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">{title}</h3>
            <p className="text-muted-foreground mb-6">{description}</p>
            {renderCta()}
          </div>
          <div className="relative">
            {isExternal ? (
              <a href={link} target="_blank" rel="noreferrer">
                <ImageWithFallback
                  src={featuredImageUrl}
                  alt={title}
                  className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-card"
                  fallbackQuery={`${title} سفر`}
                />
              </a>
            ) : (
              <Link to={link}>
                <ImageWithFallback
                  src={featuredImageUrl}
                  alt={title}
                  className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-card"
                  fallbackQuery={`${title} سفر`}
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
