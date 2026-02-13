const mojibakeSignatures = /[\uFFFD\uFFFE\uFFFF]/;
const arabicChars = /[\u0600-\u06FF]/g;
const suspiciousArabicChars = /[\u0637\u0638]/g;
// Common double-encoded UTF-8 patterns that appear as garbled "diamond" characters
const doubleEncodedPattern = /[\u00C0-\u00FF][\u0080-\u00BF]/;
// Isolated surrogates or private-use characters indicate encoding issues
const brokenUnicodePattern = /[\uD800-\uDFFF]|[\uE000-\uF8FF]|[\uFFF0-\uFFFD]/;

const cityImageMap: Array<{ pattern: RegExp; image: string }> = [
  // مكة والمدينة - صور حقيقية للحرمين
  { pattern: /(مكة|الحرم|حج)/i, image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /(رمضان)/i, image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80" },
  { pattern: /المدينة|المنورة|الحرم النبوي/i, image: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?auto=format&fit=crop&w=1200&q=80" },
  // جدة - واجهة بحرية وكورنيش
  { pattern: /جدة|كورنيش|البلد التاريخية/i, image: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1200&q=80" },
  // الرياض - أبراج وأفق حديث
  { pattern: /الرياض|بوليفارد|العليا/i, image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1200&q=80" },
  // العلا - صخور وتاريخ
  { pattern: /العلا|مدائن صالح/i, image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1200&q=80" },
  // أبها - جبال وضباب
  { pattern: /أبها|السودة|الباحة/i, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80" },
  // الطائف - ورد ومرتفعات
  { pattern: /الطائف|الشفا|الهدا/i, image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80" },
  // البحر الأحمر
  { pattern: /الغوص|البحر الأحمر|مرجان|أملج|ينبع/i, image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80" },
  // إسطنبول
  { pattern: /إسطنبول|istanbul/i, image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80" },
  // دبي
  { pattern: /دبي|dubai/i, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80" },
  // جورجيا
  { pattern: /جورجيا|تبليسي|georgia/i, image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=1200&q=80" },
  // المالديف
  { pattern: /المالديف|مالديف|maldives/i, image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80" },
  // سانتوريني
  { pattern: /سانتوريني|اليونان|santorini/i, image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=1200&q=80" },
  // بالي
  { pattern: /بالي|إندونيسيا|bali/i, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80" },
  // مراكش
  { pattern: /مراكش|المغرب|marrakech/i, image: "https://images.unsplash.com/photo-1509905793968-49bacb3f7400?auto=format&fit=crop&w=1200&q=80" },
  // لندن
  { pattern: /لندن|london|بريطانيا/i, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80" },
  // القاهرة
  { pattern: /القاهرة|مصر|cairo/i, image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80" },
  // عمان (الأردن)
  { pattern: /عمان|الأردن|amman/i, image: "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?auto=format&fit=crop&w=1200&q=80" },
  // تخييم
  { pattern: /تخييم|مخيم|camp/i, image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1200&q=80" },
  // فنادق عام
  { pattern: /فندق|hotel|منتجع|resort/i, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" },
  // الخبر والدمام
  { pattern: /الخبر|الدمام|الشرقية/i, image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80" },
  // الدرعية
  { pattern: /الدرعية|diriyah/i, image: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80" },
];

export const isCorruptedArabicText = (value?: string | null): boolean => {
  const text = String(value || "").trim();
  if (!text) return true;
  if (mojibakeSignatures.test(text)) return true;
  if (doubleEncodedPattern.test(text)) return true;
  if (brokenUnicodePattern.test(text)) return true;

  const arabicCount = (text.match(arabicChars) || []).length;
  const suspiciousCount = (text.match(suspiciousArabicChars) || []).length;

  // Text with no Arabic AND no Latin letters is likely garbled
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasDigits = /\d/.test(text);
  if (arabicCount === 0 && !hasLatin && !hasDigits && text.length > 3) return true;

  if (arabicCount === 0) return false;

  // High ratio of ط/ظ is a strong mojibake signal
  if (suspiciousCount / arabicCount > 0.2) return true;

  // Long runs of the same character class without spaces indicate encoding issues
  const longRunNoSpace = /[^\s\d\u0600-\u06FFa-zA-Z]{4,}/;
  if (longRunNoSpace.test(text)) return true;

  return false;
};

export const safeArabicText = (value: string | null | undefined, fallback: string): string => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  if (isCorruptedArabicText(text)) return fallback;
  // Final sanity check: if the text has Arabic-range chars but none are common Arabic letters,
  // it's likely garbled encoding
  const arabicRange = (text.match(arabicChars) || []).length;
  const commonArabicLetters = /[\u0627\u0644\u0645\u0646\u0648\u0631\u062A\u0629\u064A\u0628\u0639\u062F\u062D\u0643\u0647]/;
  if (arabicRange > 3 && !commonArabicLetters.test(text)) return fallback;
  return text;
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
  // source.unsplash.com is deprecated and returns 302/broken images
  const isDeprecatedUnsplash = /source\.unsplash\.com/i.test(current);
  if (current && !isDeprecatedUnsplash) return current;
  return fallback || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
};