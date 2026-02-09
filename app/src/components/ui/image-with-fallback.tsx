import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  fallbackSources?: Array<string | null | undefined>;
  fallbackClassName?: string;
  fallbackQuery?: string;
};

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc,
  fallbackSources,
  fallbackClassName,
  fallbackQuery,
}: ImageWithFallbackProps) {
  const safeQuery = (fallbackQuery || "").trim();
  const autoFallbackSrc = safeQuery
    ? `https://source.unsplash.com/1200x800/?${encodeURIComponent(safeQuery)}`
    : "";
  const localFallback = useMemo(() => {
    const label = encodeURIComponent(alt || "صورة");
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%236b7280' text-anchor='middle' dominant-baseline='middle'%3E${label}%3C/text%3E%3C/svg%3E`;
  }, [alt]);
  const sources = useMemo(() => {
    const list = [
      src,
      ...(fallbackSources || []),
      fallbackSrc,
      autoFallbackSrc,
      "/placeholder.svg",
      localFallback,
    ]
      .filter(Boolean)
      .map((value) => String(value));
    return Array.from(new Set(list));
  }, [src, fallbackSources, fallbackSrc, autoFallbackSrc, localFallback]);
  const [failedCount, setFailedCount] = useState(0);
  const resolvedSrc = sources[Math.min(failedCount, sources.length - 1)];
  const showFallback = !src || failedCount > 0;

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(className, showFallback && (fallbackClassName ?? "object-cover bg-muted"))}
      onError={() => {
        setFailedCount((count) => Math.min(count + 1, sources.length - 1));
      }}
    />
  );
}
