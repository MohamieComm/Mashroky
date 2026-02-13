const mojibakeSignatures = /[\uFFFD]/;
const arabicChars = /[\u0600-\u06FF]/g;
const suspiciousArabicChars = /[\u0637\u0638]/g;

const cityImageMap: Array<{ pattern: RegExp; image: string }> = [
  { pattern: /(مكة|الحرم|حج|رمضان|المدينة)/i, image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /جدة|البحر|كورنيش/i, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /الرياض/i, image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /العلا/i, image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /(أبها|الطائف|جبال|صيف)/i, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /الغوص|البحر الأحمر|مرجان/i, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /تخييم|مخيم|camp/i, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /فندق|hotel/i, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" },
];

export const isCorruptedArabicText = (value?: string | null): boolean => {
  const text = String(value || "").trim();
  if (!text) return true;
  if (mojibakeSignatures.test(text)) return true;

  const arabicCount = (text.match(arabicChars) || []).length;
  const suspiciousCount = (text.match(suspiciousArabicChars) || []).length;
  if (arabicCount === 0) return false;

  return suspiciousCount / arabicCount > 0.2;
};

export const safeArabicText = (value: string | null | undefined, fallback: string): string => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return isCorruptedArabicText(text) ? fallback : text;
};

export const resolveRelevantImage = (
  source: string | null | undefined,
  title: string | null | undefined,
  location: string | null | undefined,
  fallback: string
): string => {
  const current = String(source || "").trim();
  const context = `${title || ""} ${location || ""}`.trim();
  const mapped = cityImageMap.find(({ pattern }) => pattern.test(context));
  if (mapped) return mapped.image;
  if (current) return current;
  return fallback;
};