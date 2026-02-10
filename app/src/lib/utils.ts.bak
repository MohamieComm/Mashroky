import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Replace replacement characters and trim; provide fallback if string looks corrupted
export function safeText(value?: unknown, fallback = "غير متوفر") {
  if (!value && value !== 0) return fallback;
  const s = String(value);
  // If contains many replacement chars, return fallback
  const replacementCount = (s.match(/�/g) || []).length;
  if (replacementCount > 2) return fallback;
  // Remove any lone replacement chars and control characters
  const cleaned = s.replace(/�+/g, "").replace(/[\x00-\x1F\x7F]/g, "").trim();
  return cleaned || fallback;
}
