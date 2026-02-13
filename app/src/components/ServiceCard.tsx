import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type ServiceCardProps = {
  title: string;
  description: string;
  details?: string[];
  icon?: ReactNode;
  ctaLabel?: string;
  ctaLink?: string;
  onCta?: () => void;
  className?: string;
};

export function ServiceCard({
  title,
  description,
  details = [],
  icon,
  ctaLabel,
  ctaLink,
  onCta,
  className,
}: ServiceCardProps) {
  const [tab, setTab] = useState<"description" | "details">("description");
  const hasDetails = details.length > 0;
  const link = (ctaLink || "").trim();
  const isExternal = /^https?:\/\//.test(link);

  const renderCta = () => {
    if (!ctaLabel) return null;
    if (onCta) {
      return (
        <Button variant="hero" size="sm" className="w-full" onClick={onCta}>
          {ctaLabel}
        </Button>
      );
    }
    if (!link) {
      return (
        <Button variant="hero" size="sm" className="w-full" disabled>
          {ctaLabel}
        </Button>
      );
    }
    if (isExternal) {
      return (
        <Button variant="hero" size="sm" className="w-full" asChild>
          <a href={link} target="_blank" rel="noreferrer">
            {ctaLabel}
          </a>
        </Button>
      );
    }
    return (
      <Button variant="hero" size="sm" className="w-full" asChild>
        <Link to={link}>{ctaLabel}</Link>
      </Button>
    );
  };

  return (
    <div className={cn("bg-card rounded-2xl p-6 shadow-card", className)}>
      {icon ? (
        <div className="w-12 h-12 rounded-xl hero-gradient flex items-center justify-center text-primary-foreground mb-4">
          {icon}
        </div>
      ) : null}
      <h4 className="text-lg font-bold mb-3">{title}</h4>
      <div className="flex items-center gap-2 mb-4">
        <button
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold transition",
            tab === "description"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
          onClick={() => setTab("description")}
        >
          الوصف
        </button>
        {hasDetails && (
          <button
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition",
              tab === "details"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            onClick={() => setTab("details")}
          >
            التفاصيل
          </button>
        )}
      </div>
      {tab === "details" && hasDetails ? (
        <ul className="space-y-2 text-sm text-muted-foreground mb-4 text-right">
          {details.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground mb-4 text-right">{description}</p>
      )}
      {renderCta()}
    </div>
  );
}
