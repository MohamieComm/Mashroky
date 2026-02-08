export type Airport = {
  code: string;
  city: string;
  cityEn: string;
  country: string;
  countryEn: string;
  region: string;
};

export const AIRPORTS: Airport[] = [
  // السعودية
  { code: "RUH", city: "الرياض", cityEn: "Riyadh", country: "السعودية", countryEn: "Saudi Arabia", region: "saudi" },
  { code: "JED", city: "جدة", cityEn: "Jeddah", country: "السعودية", countryEn: "Saudi Arabia", region: "saudi" },
  { code: "DMM", city: "الدمام", cityEn: "Dammam", country: "السعودية", countryEn: "Saudi Arabia", region: "saudi" },
  { code: "AHB", city: "أبها", cityEn: "Abha", country: "السعودية", countryEn: "Saudi Arabia", region: "saudi" },
  { code: "TIF", city: "الطائف", cityEn: "Taif", country: "السعودية", countryEn: "Saudi Arabia", region: "saudi" },

  // الإمارات
  { code: "DXB", city: "دبي", cityEn: "Dubai", country: "الإمارات", countryEn: "United Arab Emirates", region: "middle_east" },
  { code: "AUH", city: "أبو ظبي", cityEn: "Abu Dhabi", country: "الإمارات", countryEn: "United Arab Emirates", region: "middle_east" },

  // مصر
  { code: "CAI", city: "القاهرة", cityEn: "Cairo", country: "مصر", countryEn: "Egypt", region: "middle_east" },
  { code: "HRG", city: "الغردقة", cityEn: "Hurghada", country: "مصر", countryEn: "Egypt", region: "middle_east" },

  // دول أخرى
  { code: "IST", city: "إسطنبول", cityEn: "Istanbul", country: "تركيا", countryEn: "Turkey", region: "international" },
  { code: "LHR", city: "لندن", cityEn: "London", country: "المملكة المتحدة", countryEn: "United Kingdom", region: "international" },
  { code: "CDG", city: "باريس", cityEn: "Paris", country: "فرنسا", countryEn: "France", region: "international" },
  { code: "FCO", city: "روما", cityEn: "Rome", country: "إيطاليا", countryEn: "Italy", region: "international" },
  { code: "AMS", city: "أمستردام", cityEn: "Amsterdam", country: "هولندا", countryEn: "Netherlands", region: "international" },
];

export const isArabicText = (value: string) => /[\u0600-\u06FF]/.test(value);
export const isLatinText = (value: string) => /[A-Za-z]/.test(value);

export const getInputLanguage = (value: string) => {
  if (isArabicText(value)) return "ar";
  if (isLatinText(value)) return "en";
  return "ar";
};

export const formatAirportLabel = (airport: Airport, lang: "ar" | "en" = "ar") => {
  const city = lang === "en" ? airport.cityEn : airport.city;
  return `${city} (${airport.code})`;
};

const normalize = (value: string) => value.trim().toLowerCase();

export const resolveAirportCode = (input: string, airports: Airport[] = AIRPORTS) => {
  const raw = input || "";
  const normalized = normalize(raw);
  if (!normalized) return "";

  const codeMatch = raw.match(/\(([A-Za-z0-9]{3})\)/);
  const codeCandidate = codeMatch?.[1] ? normalize(codeMatch[1]) : normalized;

  const byCode = airports.find((airport) => normalize(airport.code) === codeCandidate);
  if (byCode) return byCode.code;

  const byCity = airports.find((airport) => normalize(airport.city) === normalized);
  if (byCity) return byCity.code;

  const byCityEn = airports.find((airport) => normalize(airport.cityEn) === normalized);
  if (byCityEn) return byCityEn.code;

  return "";
};
