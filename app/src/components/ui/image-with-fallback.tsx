import { useState } from "react";
import { cn } from "@/lib/utils";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  fallbackClassName?: string;
  fallbackQuery?: string;
};

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc,
  fallbackClassName,
  fallbackQuery,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;
  const safeQuery = (fallbackQuery || alt || "travel").trim();
  const autoFallbackSrc = `https://source.unsplash.com/featured/?${encodeURIComponent(
    safeQuery
  )}`;
  const resolvedFallback = fallbackSrc || autoFallbackSrc;

  return (
    <img
      src={showFallback ? resolvedFallback : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(className, showFallback && (fallbackClassName ?? "object-cover bg-muted"))}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
