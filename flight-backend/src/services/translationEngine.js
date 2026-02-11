// Simple internal translation engine (rule-based + dictionary).
// Designed to be extended later with AI-based translation.

const SUPPORTED_LANGS = new Set(["ar", "en", "fr", "tr", "ur"]);

const PHRASE_MAP = {
  en: {
    ar: {
      "book now": "احجز الآن",
      "book": "احجز",
      "booking": "الحجز",
      "flight booking": "حجز طيران",
      "hotel booking": "حجز فندق",
      "car rental": "تأجير سيارة",
      "tours": "الجولات",
      "transfers": "النقل الخاص",
      "search flights": "بحث الرحلات",
      "payment": "الدفع",
      "payments": "المدفوعات",
      "confirmation": "التأكيد",
      "traveler details": "بيانات المسافرين",
      "total": "الإجمالي",
      "price": "السعر",
      "discount": "الخصم",
      "destination": "الوجهة",
      "departure": "المغادرة",
      "arrival": "الوصول",
      "date": "التاريخ",
      "submit": "إرسال",
      "cancel": "إلغاء",
      "search": "بحث",
      "offers": "العروض",
      "seasonal offers": "العروض الموسمية",
      "popular destinations": "الوجهات الشائعة",
      "admin": "لوحة الإدارة",
      "settings": "الإعدادات",
    },
    fr: {
      "book now": "Réserver maintenant",
      "booking": "Réservation",
      "flight booking": "Réservation de vol",
      "hotel booking": "Réservation d'hôtel",
      "car rental": "Location de voiture",
      "tours": "Excursions",
      "transfers": "Transferts",
      "search": "Rechercher",
      "offers": "Offres",
      "price": "Prix",
      "discount": "Remise",
      "destination": "Destination",
      "departure": "Départ",
      "arrival": "Arrivée",
      "payment": "Paiement",
      "confirmation": "Confirmation",
    },
    tr: {
      "book now": "Şimdi rezervasyon yap",
      "booking": "Rezervasyon",
      "flight booking": "Uçuş rezervasyonu",
      "hotel booking": "Otel rezervasyonu",
      "car rental": "Araç kiralama",
      "tours": "Turlar",
      "transfers": "Transferler",
      "search": "Ara",
      "offers": "Teklifler",
      "price": "Fiyat",
      "discount": "İndirim",
      "destination": "Destinasyon",
      "departure": "Kalkış",
      "arrival": "Varış",
      "payment": "Ödeme",
      "confirmation": "Onay",
    },
    ur: {
      "book now": "ابھی بک کریں",
      "booking": "بکنگ",
      "flight booking": "فلائٹ بکنگ",
      "hotel booking": "ہوٹل بکنگ",
      "car rental": "کار کرایہ",
      "tours": "ٹورز",
      "transfers": "ٹرانسفرز",
      "search": "تلاش",
      "offers": "آفرز",
      "price": "قیمت",
      "discount": "ڈسکاؤنٹ",
      "destination": "منزل",
      "departure": "روانگی",
      "arrival": "آمد",
      "payment": "ادائیگی",
      "confirmation": "تصدیق",
    },
  },
  ar: {
    en: {
      "احجز الآن": "Book now",
      "الحجز": "Booking",
      "حجز طيران": "Flight booking",
      "حجز فندق": "Hotel booking",
      "تأجير سيارة": "Car rental",
      "الجولات": "Tours",
      "النقل الخاص": "Transfers",
      "بحث الرحلات": "Search flights",
      "الدفع": "Payment",
      "المدفوعات": "Payments",
      "التأكيد": "Confirmation",
      "بيانات المسافرين": "Traveler details",
      "الإجمالي": "Total",
      "السعر": "Price",
      "الخصم": "Discount",
      "الوجهة": "Destination",
      "المغادرة": "Departure",
      "الوصول": "Arrival",
      "التاريخ": "Date",
      "إرسال": "Submit",
      "إلغاء": "Cancel",
      "بحث": "Search",
      "العروض": "Offers",
      "العروض الموسمية": "Seasonal offers",
      "الوجهات الشائعة": "Popular destinations",
      "لوحة الإدارة": "Admin",
      "الإعدادات": "Settings",
    },
    fr: {
      "احجز الآن": "Réserver maintenant",
      "الحجز": "Réservation",
      "حجز طيران": "Réservation de vol",
      "حجز فندق": "Réservation d'hôtel",
      "تأجير سيارة": "Location de voiture",
      "الجولات": "Excursions",
      "النقل الخاص": "Transferts",
      "الدفع": "Paiement",
      "التأكيد": "Confirmation",
      "السعر": "Prix",
      "الخصم": "Remise",
    },
    tr: {
      "احجز الآن": "Şimdi rezervasyon yap",
      "الحجز": "Rezervasyon",
      "حجز طيران": "Uçuş rezervasyonu",
      "حجز فندق": "Otel rezervasyonu",
      "تأجير سيارة": "Araç kiralama",
      "الجولات": "Turlar",
      "النقل الخاص": "Transferler",
      "الدفع": "Ödeme",
      "التأكيد": "Onay",
      "السعر": "Fiyat",
      "الخصم": "İndirim",
    },
    ur: {
      "احجز الآن": "ابھی بک کریں",
      "الحجز": "بکنگ",
      "حجز طيران": "فلائٹ بکنگ",
      "حجز فندق": "ہوٹل بکنگ",
      "تأجير سيارة": "کار کرایہ",
      "الجولات": "ٹورز",
      "النقل الخاص": "ٹرانسفرز",
      "الدفع": "ادائیگی",
      "التأكيد": "تصدیق",
      "السعر": "قیمت",
      "الخصم": "ڈسکاؤنٹ",
    },
  },
};

const WORD_MAP = {
  en: {
    ar: {
      flight: "طيران",
      flights: "رحلات",
      hotel: "فندق",
      hotels: "فنادق",
      car: "سيارة",
      cars: "سيارات",
      tour: "جولة",
      tours: "جولات",
      transfer: "نقل",
      transfers: "نقل",
      search: "بحث",
      book: "احجز",
      booking: "حجز",
      price: "سعر",
      total: "الإجمالي",
      payment: "الدفع",
    },
  },
  ar: {
    en: {
      "طيران": "Flight",
      "رحلات": "Flights",
      "فندق": "Hotel",
      "فنادق": "Hotels",
      "سيارة": "Car",
      "سيارات": "Cars",
      "جولة": "Tour",
      "جولات": "Tours",
      "نقل": "Transfer",
      "بحث": "Search",
      "احجز": "Book",
      "حجز": "Booking",
      "سعر": "Price",
      "الإجمالي": "Total",
      "الدفع": "Payment",
    },
  },
};

const MAX_CACHE_SIZE = 5000;
const cache = new Map();

const normalizeLang = (lang) => String(lang || "").trim().toLowerCase();

const normalizeText = (text, from) => {
  if (from === "en" || from === "fr" || from === "tr" || from === "ur") {
    return text.toLowerCase();
  }
  return text;
};

const preservePlaceholders = (text) => {
  const placeholders = [];
  const tokenized = text.replace(/(\{\{[^}]+\}\}|\{[^}]+\})/g, (match) => {
    const key = `__PH_${placeholders.length}__`;
    placeholders.push(match);
    return key;
  });
  return { tokenized, placeholders };
};

const restorePlaceholders = (text, placeholders) =>
  text.replace(/__PH_(\d+)__/g, (_, index) => placeholders[Number(index)] || "");

const translatePhrase = (text, from, to) => {
  const map = PHRASE_MAP?.[from]?.[to];
  if (!map) return null;
  const key = normalizeText(text, from);
  if (map[key]) return map[key];
  return null;
};

const translateWord = (word, from, to) => {
  const map = WORD_MAP?.[from]?.[to];
  if (!map) return null;
  const key = normalizeText(word, from);
  return map[key] || null;
};

const splitWord = (token) => {
  const match = token.match(/^(\W*)([\p{L}\p{M}]+)(\W*)$/u);
  if (!match) return { prefix: "", core: token, suffix: "" };
  return { prefix: match[1], core: match[2], suffix: match[3] };
};

function translate(text, from, to) {
  const source = normalizeLang(from);
  const target = normalizeLang(to);
  if (!SUPPORTED_LANGS.has(source) || !SUPPORTED_LANGS.has(target)) return text;
  if (!text || typeof text !== "string" || source === target) return text;

  const cacheKey = `${source}|${target}|${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const { tokenized, placeholders } = preservePlaceholders(text);
  const direct = translatePhrase(tokenized.trim(), source, target);
  if (direct) {
    const restored = restorePlaceholders(direct, placeholders);
    cacheSet(cacheKey, restored);
    return restored;
  }

  const tokens = tokenized.split(/\s+/);
  const translated = tokens.map((token) => {
    if (!token) return token;
    if (token.startsWith("__PH_")) return token;
    const { prefix, core, suffix } = splitWord(token);
    const word = translateWord(core, source, target);
    return `${prefix}${word || core}${suffix}`;
  });

  const output = restorePlaceholders(translated.join(" "), placeholders);
  cacheSet(cacheKey, output);
  return output;
}

function cacheSet(key, value) {
  cache.set(key, value);
  if (cache.size > MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

// Placeholder for future AI enhancement
async function translateWithAI(_text, _from, _to) {
  return null;
}

export { translate, translateWithAI, SUPPORTED_LANGS };

export default {
  translate,
  translateWithAI,
  SUPPORTED_LANGS,
};
