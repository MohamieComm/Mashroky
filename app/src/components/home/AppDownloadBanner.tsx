import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useAdminSettings } from "@/data/adminStore";
import { Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

export function AppDownloadBanner() {
  const { appDownloadImageUrl, appDownloadLink } = useAdminSettings();
  const link = (appDownloadLink || "").trim();
  const hasLink = Boolean(link);
  const isExternal = /^https?:\/\//.test(link);

  const wrapLink = (children: JSX.Element) => {
    if (!hasLink) return children;
    if (isExternal) {
      return (
        <a href={link} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return <Link to={link}>{children}</Link>;
  };

  const renderCta = () => {
    if (!hasLink) {
      return (
        <Button
          variant="outline"
          size="lg"
          disabled
          className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground"
        >
          حمّل التطبيق الآن
        </Button>
      );
    }
    if (isExternal) {
      return (
        <Button
          variant="outline"
          size="lg"
          className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/25"
          asChild
        >
          <a href={link} target="_blank" rel="noreferrer">
            حمّل التطبيق الآن
          </a>
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="lg"
        className="bg-primary-foreground/15 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/25"
        asChild
      >
        <Link to={link}>حمّل التطبيق الآن</Link>
      </Button>
    );
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-primary to-emerald-500 text-primary-foreground shadow-hover">
          <div className="absolute inset-0 opacity-15 dot-pattern" />
          <div className="relative z-10 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center p-8 md:p-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-foreground/15 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Smartphone className="w-4 h-4" />
                تحميل التطبيق
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                احصل على عروض حصرية عبر تطبيق مشروك
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                حمل التطبيق لتتابع الحجوزات، العروض الموسمية، والتنبيهات الفورية في أي وقت.
              </p>
              {renderCta()}
            </div>

            <div className="flex justify-center">
              {wrapLink(
                <ImageWithFallback
                  src={appDownloadImageUrl}
                  alt="تحميل تطبيق مشروك"
                  className="w-full max-w-md h-64 object-cover rounded-2xl shadow-card"
                  fallbackQuery="تطبيق سفر سياحة"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
