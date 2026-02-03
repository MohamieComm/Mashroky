import { useState } from "react";
import { cn } from "@/lib/utils";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  fallbackClassName?: string;
};

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  fallbackClassName,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const showFallback = !src || failed;

  return (
    <img
      src={showFallback ? fallbackSrc : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(className, showFallback && (fallbackClassName ?? "object-contain bg-muted"))}
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}
