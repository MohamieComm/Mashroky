// مفاتيح API النشطة (amadeus, supabase, moyasar...)
export function getActiveApiKeyByProvider(apiKeys: ApiKeyItem[], provider: string): string | undefined {
  const found = apiKeys.find((k) => k.provider.toLowerCase() === provider.toLowerCase() && k.status === "enabled" && k.key);
  return found?.key;
}
export type SeasonOffer = {
  id: string;
  title: string;
  season: "ramadan" | "hajj" | "summer";
  description: string;
  image: string;
  price: string;
  options: string[];
};
export const defaultSeasons: SeasonOffer[] = [
  {
    id: "season-ramadan",
    title: "عروض رمضان في مكة والمدينة",
    season: "ramadan",
    description: "باقة روحانية تشمل إقامة قريبة من الحرمين وخدمات تنقل مريحة.",
    image: "https://source.unsplash.com/1200x800/?mecca,masjid",
    price: "2,500",
    options: ["إقامة 4 نجوم", "إفطار يومي", "تنقلات داخلية"],
  },
  {
    id: "season-hajj",
    title: "برامج الحج المميزة",
    season: "hajj",
    description: "برامج تنظيمية متكاملة للحج مع سكن قريب وخدمات إرشاد.",
    image: "https://source.unsplash.com/1200x800/?mecca,hajj",
    price: "7,500",
    options: ["سكن قريب", "إعاشة كاملة", "خدمة المشاعر"],
  },
  {
    id: "season-summer",
    title: "مصايف أبها والباحة",
    season: "summer",
    description: "استمتع بالأجواء المعتدلة والطبيعة الخلابة في جنوب المملكة.",
    image: "https://source.unsplash.com/1200x800/?abha,saudi",
    price: "12,000",
    options: ["جولات طبيعية", "مرشد محلي", "تنقلات"],
  },
];
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Flight = {
  id: string;
  from: string;
  to: string;
  airline: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  price: string;
  stops: string;
  rating: number;
  image: string;
};

export type HotelItem = {
  id: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  priceNote: string;
  description: string;
  amenities: string[];
  distances: { name: string; distance: string }[];
  cuisine: string;
  tag: string;
};

export type OfferItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: number;
  validUntil: string;
  originalPrice: string;
  newPrice: string;
  season: string;
  includes: string[];
  tips: string[];
};

export type ActivityItem = {
  id: string;
  title: string;
  location: string;
  category: string;
  price: string;
  image: string;
};

export type ArticleItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
};

export type DestinationItem = {
  id: string;
  title: string;
  country: string;
  region: string;
  tag: string;
  duration: string;
  priceFrom: string;
  description: string;
  image: string;
};

export type PartnerItem = {
  id: string;
  name: string;
  type: string;
  website: string;
  commission: string;
};

export type AirlineItem = {
  id: string;
  name: string;
  code: string;
  website: string;
  phone: string;
  logo?: string;
};

export type ApiKeyItem = {
  id: string;
  name: string;
  provider: string;
  key?: string;
  baseUrl?: string;
  status: "enabled" | "disabled";
};

export type ManagedUserItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "suspended";
};

export type PageItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
};

export type AdminSettings = {
  promoVideoUrl: string;
  appDownloadImageUrl: string;
  appDownloadLink: string;
  featuredImageUrl: string;
  featuredTitle: string;
  featuredDescription: string;
  featuredLink: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactAddress: string;
};

export type AdminData = {
  flights: Flight[];
  hotels: HotelItem[];
  offers: OfferItem[];
  activities: ActivityItem[];
  articles: ArticleItem[];
  destinations: DestinationItem[];
  partners: PartnerItem[];
  airlines: AirlineItem[];
  apiKeys: ApiKeyItem[];
  users: ManagedUserItem[];
  pages: PageItem[];
  promoVideoUrl: string;
  appDownloadImageUrl: string;
  appDownloadLink: string;
  featuredImageUrl: string;
  featuredTitle: string;
  featuredDescription: string;
  featuredLink: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactAddress: string;
  seasons: SeasonOffer[];
};

export const defaultFlights: Flight[] = [
  {
    id: "flight-1",
    from: "جدة",
    to: "الرياض",
    airline: "الخطوط السعودية",
    departTime: "08:00",
    arriveTime: "09:30",
    duration: "1 ساعة و30 دقيقة",
    price: "650",
    stops: "مباشر",
    rating: 4.8,
    image: "https://source.unsplash.com/800x600/?jeddah,airport",
  },
  {
    id: "flight-2",
    from: "الرياض",
    to: "الدمام",
    airline: "طيران ناس",
    departTime: "14:30",
    arriveTime: "15:40",
    duration: "1 ساعة و10 دقائق",
    price: "430",
    stops: "مباشر",
    rating: 4.6,
    image: "https://source.unsplash.com/800x600/?riyadh,airport",
  },
  {
    id: "flight-3",
    from: "جدة",
    to: "المدينة",
    airline: "طيران أديل",
    departTime: "11:00",
    arriveTime: "12:00",
    duration: "ساعة واحدة",
    price: "320",
    stops: "مباشر",
    rating: 4.5,
    image: "https://source.unsplash.com/800x600/?madinah,airport",
  },
  {
    id: "flight-4",
    from: "الرياض",
    to: "دبي",
    airline: "طيران الإمارات",
    departTime: "18:20",
    arriveTime: "20:55",
    duration: "2 ساعات و35 دقيقة",
    price: "980",
    stops: "مباشر",
    rating: 4.7,
    image: "https://source.unsplash.com/800x600/?dubai,airport",
  },
  {
    id: "flight-5",
    from: "الدمام",
    to: "القاهرة",
    airline: "مصر للطيران",
    departTime: "07:10",
    arriveTime: "10:05",
    duration: "2 ساعات و55 دقيقة",
    price: "1,150",
    stops: "مباشر",
    rating: 4.4,
    image: "https://source.unsplash.com/800x600/?cairo,airport",
  },
  {
    id: "flight-6",
    from: "جدة",
    to: "عمان",
    airline: "الملكية الأردنية",
    departTime: "13:15",
    arriveTime: "15:40",
    duration: "2 ساعات و25 دقيقة",
    price: "1,050",
    stops: "مباشر",
    rating: 4.3,
    image: "https://source.unsplash.com/800x600/?amman,airport",
  },
];

export const defaultHotels: HotelItem[] = [
  {
    id: "hotel-1",
    name: "فندق كورنيش جدة",
    location: "جدة - الكورنيش",
    image: "https://source.unsplash.com/1200x800/?jeddah,hotel",
    rating: 4.7,
    reviews: 1890,
    price: "1,800",
    priceNote: "يبدأ من",
    description: "إقامة راقية بإطلالة بحرية وخدمات عائلية متكاملة.",
    amenities: ["واي فاي مجاني", "مسبح", "موقف سيارات", "إفطار", "صالة رياضية", "خدمة غرف"],
    distances: [
      { name: "واجهة جدة البحرية", distance: "2 كم" },
      { name: "مطار الملك عبدالعزيز", distance: "25 كم" },
      { name: "البلد التاريخية", distance: "6 كم" },
    ],
    cuisine: "مطعم بحري ومقهى",
    tag: "الأكثر طلبا",
  },
  {
    id: "hotel-2",
    name: "فندق الأعمال بالرياض",
    location: "الرياض - العليا",
    image: "https://source.unsplash.com/1200x800/?riyadh,hotel",
    rating: 4.6,
    reviews: 1420,
    price: "1,250",
    priceNote: "يبدأ من",
    description: "موقع مثالي لرجال الأعمال بالقرب من المراكز التجارية.",
    amenities: ["واي فاي عالي السرعة", "مركز أعمال", "صالة رياضية", "موقف سيارات", "خدمة غرف"],
    distances: [
      { name: "بوليفارد الرياض", distance: "5 كم" },
      { name: "مركز المملكة", distance: "2 كم" },
      { name: "مطار الملك خالد", distance: "28 كم" },
    ],
    cuisine: "مطبخ عالمي وعربي",
    tag: "رجال أعمال",
  },
  {
    id: "hotel-3",
    name: "منتجع العلا الصحراوي",
    location: "العلا - وادي عشار",
    image: "https://source.unsplash.com/1200x800/?alula,resort",
    rating: 4.8,
    reviews: 980,
    price: "2,900",
    priceNote: "يبدأ من",
    description: "تجربة فاخرة وسط الصخور الطبيعية مع أنشطة ليلية مميزة.",
    amenities: ["منتجع صحي", "جولات خاصة", "مسبح", "خدمة كونسيرج"],
    distances: [
      { name: "مدائن صالح", distance: "22 كم" },
      { name: "مطار العلا", distance: "30 كم" },
    ],
    cuisine: "مطبخ محلي فاخر",
    tag: "فاخر",
  },
  {
    id: "hotel-4",
    name: "فندق المدينة سنتر",
    location: "المدينة المنورة - المنطقة المركزية",
    image: "https://source.unsplash.com/1200x800/?madinah,hotel",
    rating: 4.5,
    reviews: 2100,
    price: "1,100",
    priceNote: "يبدأ من",
    description: "موقع قريب من الحرم مع خدمات عائلية مريحة.",
    amenities: ["واي فاي مجاني", "إفطار", "خدمة غرف", "موقف سيارات"],
    distances: [
      { name: "الحرم النبوي", distance: "1 كم" },
      { name: "متحف المدينة", distance: "3 كم" },
      { name: "مطار الأمير محمد", distance: "18 كم" },
    ],
    cuisine: "مطعم عربي",
    tag: "عائلي",
  },
  {
    id: "hotel-5",
    name: "منتجع أبها الجبلي",
    location: "أبها - السودة",
    image: "https://source.unsplash.com/1200x800/?abha,hotel",
    rating: 4.4,
    reviews: 760,
    price: "1,350",
    priceNote: "يبدأ من",
    description: "إطلالات جبلية وهواء بارد وأنشطة عائلية متنوعة.",
    amenities: ["مواقف", "كافيه", "جلسات خارجية", "واي فاي"],
    distances: [
      { name: "منتزه السودة", distance: "2 كم" },
      { name: "مطار أبها", distance: "30 كم" },
    ],
    cuisine: "مطبخ محلي",
    tag: "طبيعة",
  },
  {
    id: "hotel-6",
    name: "فندق الخبر المطل",
    location: "الخبر - الكورنيش",
    image: "https://source.unsplash.com/1200x800/?khobar,hotel",
    rating: 4.3,
    reviews: 640,
    price: "950",
    priceNote: "يبدأ من",
    description: "خيار اقتصادي بإطلالة بحرية وموقع قريب من المقاهي.",
    amenities: ["واي فاي", "موقف سيارات", "غرف عائلية"],
    distances: [
      { name: "كورنيش الخبر", distance: "1 كم" },
      { name: "مطار الملك فهد", distance: "45 كم" },
    ],
    cuisine: "مقهى وحلويات",
    tag: "اقتصادي",
  },
];

export const defaultOffers: OfferItem[] = [
  {
    id: "offer-1",
    title: "عرض شتاء العلا",
    description: "تجربة صحراوية فاخرة مع جولات تاريخية وإقامة مميزة.",
    image: "https://source.unsplash.com/1200x800/?alula,saudi",
    discount: 35,
    validUntil: "2026-03-31",
    originalPrice: "4,200",
    newPrice: "2,730",
    season: "winter",
    includes: ["إقامة 3 ليال", "جولة مدائن صالح", "تنقلات داخلية"],
    tips: ["احجز قبل أسبوعين", "أفضل وقت مساء"],
  },
  {
    id: "offer-2",
    title: "باقة جدة البحرية",
    description: "إقامة على الكورنيش مع رحلة بحرية وأنشطة مائية.",
    image: "https://source.unsplash.com/1200x800/?jeddah,sea",
    discount: 25,
    validUntil: "2026-04-15",
    originalPrice: "3,100",
    newPrice: "2,325",
    season: "spring",
    includes: ["إقامة ليلتين", "رحلة بحرية", "تذاكر نشاط بحري"],
    tips: ["اختر الصباح المبكر", "أضف وجبة بحرية"],
  },
  {
    id: "offer-3",
    title: "عطلة الرياض العائلية",
    description: "باقة عائلية قريبة من الفعاليات والترفيه.",
    image: "https://source.unsplash.com/1200x800/?riyadh,city",
    discount: 20,
    validUntil: "2026-05-01",
    originalPrice: "2,400",
    newPrice: "1,920",
    season: "spring",
    includes: ["إقامة 2 ليال", "تذاكر فعالية", "تنقلات"],
    tips: ["احجز عطلة نهاية الأسبوع", "تحقق من العروض العائلية"],
  },
  {
    id: "offer-4",
    title: "جولة الطائف الباردة",
    description: "أجواء لطيفة وزيارات للمرتفعات والأسواق التراثية.",
    image: "https://source.unsplash.com/1200x800/?taif,saudi",
    discount: 18,
    validUntil: "2026-06-10",
    originalPrice: "2,000",
    newPrice: "1,640",
    season: "summer",
    includes: ["إقامة ليلة", "جولة مرتفعات", "مرشد محلي"],
    tips: ["خذ ملابس خفيفة", "أفضل وقت عصرًا"],
  },
  {
    id: "offer-5",
    title: "رحلة أبها الجبلية",
    description: "باقة طبيعة لعشاق الضباب والمناظر الخلابة.",
    image: "https://source.unsplash.com/1200x800/?abha,mountains",
    discount: 22,
    validUntil: "2026-07-15",
    originalPrice: "2,800",
    newPrice: "2,184",
    season: "summer",
    includes: ["إقامة 3 ليال", "جولات طبيعية", "تنقلات"],
    tips: ["احجز باكرًا", "استمتع بجلسات المساء"],
  },
  {
    id: "offer-6",
    title: "زيارة المدينة المنورة",
    description: "إقامة قريبة من الحرم النبوي مع خدمات مريحة.",
    image: "https://source.unsplash.com/1200x800/?madinah,saudi",
    discount: 15,
    validUntil: "2026-03-20",
    originalPrice: "1,900",
    newPrice: "1,615",
    season: "ramadan",
    includes: ["إقامة ليلتين", "خدمة نقل", "إفطار"],
    tips: ["اختر الغرف القريبة", "تحقق من مواقيت الدخول"],
  },
];

export const defaultActivities: ActivityItem[] = [
  {
    id: "activity-1",
    title: "جولة بحرية في جدة",
    location: "جدة",
    category: "بحرية",
    price: "180",
    image: "https://source.unsplash.com/1200x800/?jeddah,boat",
  },
  {
    id: "activity-2",
    title: "زيارة الدرعية التاريخية",
    location: "الرياض",
    category: "ثقافية",
    price: "120",
    image: "https://source.unsplash.com/1200x800/?diriyah,saudi",
  },
  {
    id: "activity-3",
    title: "رحلة هضاب العلا",
    location: "العلا",
    category: "طبيعة",
    price: "260",
    image: "https://source.unsplash.com/1200x800/?alula,rocks",
  },
  {
    id: "activity-4",
    title: "أسواق الطائف التقليدية",
    location: "الطائف",
    category: "تسوق",
    price: "90",
    image: "https://source.unsplash.com/1200x800/?taif,market",
  },
  {
    id: "activity-5",
    title: "الهايكينج في أبها",
    location: "أبها",
    category: "مغامرة",
    price: "210",
    image: "https://source.unsplash.com/1200x800/?abha,hiking",
  },
  {
    id: "activity-6",
    title: "جولة متاحف المدينة",
    location: "المدينة المنورة",
    category: "ثقافة",
    price: "110",
    image: "https://source.unsplash.com/1200x800/?madinah,museum",
  },
];

export const defaultArticles: ArticleItem[] = [
  {
    id: "article-1",
    title: "دليل السفر إلى العلا",
    category: "وجهات",
    date: "2026-02-01",
    image: "https://source.unsplash.com/1200x800/?alula,saudi",
  },
  {
    id: "article-2",
    title: "أفضل الأنشطة في جدة البحرية",
    category: "تجارب",
    date: "2026-01-20",
    image: "https://source.unsplash.com/1200x800/?jeddah,sea",
  },
  {
    id: "article-3",
    title: "الرياض الحديثة: ماذا تزور؟",
    category: "مدن",
    date: "2026-01-10",
    image: "https://source.unsplash.com/1200x800/?riyadh,city",
  },
  {
    id: "article-4",
    title: "شتاء أبها وكيف تستمتع به",
    category: "مواسم",
    date: "2025-12-22",
    image: "https://source.unsplash.com/1200x800/?abha,mountains",
  },
  {
    id: "article-5",
    title: "دليل زيارة المدينة المنورة",
    category: "روحانيات",
    date: "2025-12-05",
    image: "https://source.unsplash.com/1200x800/?madinah,mosque",
  },
  {
    id: "article-6",
    title: "أفضل وجهات الربيع في السعودية",
    category: "مواسم",
    date: "2025-11-18",
    image: "https://source.unsplash.com/1200x800/?saudi,nature",
  },
];

export const defaultDestinations: DestinationItem[] = [
  {
    id: "destination-1",
    title: "جدة",
    country: "السعودية",
    region: "الغربية",
    tag: "بحرية",
    duration: "3 أيام",
    priceFrom: "2,600",
    description: "واجهة بحرية وأسواق قديمة وتجارب طعام متنوعة.",
    image: "https://source.unsplash.com/1200x800/?jeddah,saudi",
  },
  {
    id: "destination-2",
    title: "الرياض",
    country: "السعودية",
    region: "الوسطى",
    tag: "مدينة",
    duration: "3 أيام",
    priceFrom: "2,300",
    description: "عاصمة نابضة بالحياة مع فعاليات ومراكز تسوق.",
    image: "https://source.unsplash.com/1200x800/?riyadh,saudi",
  },
  {
    id: "destination-3",
    title: "العلا",
    country: "السعودية",
    region: "الشمالية",
    tag: "تراث",
    duration: "2 أيام",
    priceFrom: "3,100",
    description: "وجهة تاريخية فريدة بمواقع أثرية ومناظر صحراوية.",
    image: "https://source.unsplash.com/1200x800/?alula,saudi",
  },
  {
    id: "destination-4",
    title: "المدينة المنورة",
    country: "السعودية",
    region: "الغربية",
    tag: "روحاني",
    duration: "4 أيام",
    priceFrom: "3,600",
    description: "رحلة روحانية مع خدمات مريحة وقريبة من الحرم.",
    image: "https://source.unsplash.com/1200x800/?madinah,saudi",
  },
  {
    id: "destination-5",
    title: "أبها",
    country: "السعودية",
    region: "الجنوبية",
    tag: "طبيعة",
    duration: "4 أيام",
    priceFrom: "2,500",
    description: "أجواء جبلية وضباب لطيف وقرى تراثية.",
    image: "https://source.unsplash.com/1200x800/?abha,saudi",
  },
  {
    id: "destination-6",
    title: "دبي",
    country: "الإمارات",
    region: "الخليج",
    tag: "تسوق",
    duration: "5 أيام",
    priceFrom: "4,200",
    description: "مدينة عالمية بتجارب تسوق وترفيه متنوعة.",
    image: "https://source.unsplash.com/1200x800/?dubai,uae",
  },
];

export const defaultPartners: PartnerItem[] = [
  {
    id: "partner-1",
    name: "ناس للطيران",
    type: "شركة طيران",
    website: "https://www.flynas.com",
    commission: "4%",
  },
  {
    id: "partner-2",
    name: "هيئة السياحة السعودية",
    type: "جهة سياحية",
    website: "https://www.visitsaudi.com",
    commission: "2%",
  },
  {
    id: "partner-3",
    name: "موياسر",
    type: "بوابة دفع",
    website: "https://moyasar.com",
    commission: "1.8%",
  },
  {
    id: "partner-4",
    name: "سابتكو",
    type: "نقل بري",
    website: "https://www.saptco.com.sa",
    commission: "3%",
  },
  {
    id: "partner-5",
    name: "Amadeus",
    type: "مزود تقني",
    website: "https://developers.amadeus.com",
    commission: "حسب العقد",
  },
];

export const defaultAirlines: AirlineItem[] = [
  {
    id: "airline-1",
    name: "الخطوط السعودية",
    code: "SV",
    website: "https://www.saudia.com",
    phone: "+966-920022222",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/SV.png",
  },
  {
    id: "airline-2",
    name: "طيران ناس",
    code: "XY",
    website: "https://www.flynas.com",
    phone: "+966-920001234",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/XY.png",
  },
  {
    id: "airline-3",
    name: "طيران أديل",
    code: "F3",
    website: "https://www.flyadeal.com",
    phone: "+966-920000177",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/F3.png",
  },
  {
    id: "airline-4",
    name: "فلاي دبي",
    code: "FZ",
    website: "https://www.flydubai.com",
    phone: "+971-600544445",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/FZ.png",
  },
  {
    id: "airline-5",
    name: "الخطوط القطرية",
    code: "QR",
    website: "https://www.qatarairways.com",
    phone: "+974-4144-5555",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/QR.png",
  },
  {
    id: "airline-6",
    name: "العربية للطيران",
    code: "G9",
    website: "https://www.airarabia.com",
    phone: "+971-600508001",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png",
  },
  {
    id: "airline-7",
    name: "الخطوط التركية",
    code: "TK",
    website: "https://www.turkishairlines.com",
    phone: "+90-212-4636363",
    logo: "https://www.gstatic.com/flights/airline_logos/70px/TK.png",
  },
];

export const defaultApiKeys: ApiKeyItem[] = [
  
];

export const defaultUsers: ManagedUserItem[] = [
  {
    id: "user-1",
    name: "أحمد العبدالله",
    email: "ahmed@example.com",
    role: "user",
    status: "active",
  },
  {
    id: "user-2",
    name: "سارة العتيبي",
    email: "admin@mashrouk.com",
    role: "admin",
    status: "active",
  },
];

export const defaultPages: PageItem[] = [
  {
    id: "page-1",
    title: "عن مشروك",
    slug: "/about",
    summary: "تعرف على منصة مشروك وخدمات الحجز المتكاملة بسهولة.",
  },
  {
    id: "page-2",
    title: "سياسة الخصوصية",
    slug: "/privacy",
    summary: "نوضح كيفية حماية بياناتك وخصوصيتك أثناء استخدام المنصة.",
  },
  {
    id: "page-3",
    title: "الشروط والأحكام",
    slug: "/terms",
    summary: "اطلع على شروط الاستخدام وسياسة الإلغاء والاسترجاع.",
  },
];

export const defaultAdminSettings: AdminSettings = {
  promoVideoUrl: "",
  appDownloadImageUrl: "",
  appDownloadLink: "",
  featuredImageUrl: "",
  featuredTitle: "",
  featuredDescription: "",
  featuredLink: "",
  contactPhone: "+966 54 245 4094",
  contactEmail: "ibrahemest@outlook.sa",
  contactWhatsapp: "+966542454094",
  contactAddress: "الرياض، المملكة العربية السعودية",
};

export const defaultAdminData: AdminData = {
  flights: defaultFlights,
  hotels: defaultHotels,
  offers: defaultOffers,
  activities: defaultActivities,
  articles: defaultArticles,
  destinations: defaultDestinations,
  partners: defaultPartners,
  airlines: defaultAirlines,
  apiKeys: defaultApiKeys,
  users: defaultUsers,
  pages: defaultPages,
  promoVideoUrl: defaultAdminSettings.promoVideoUrl,
  appDownloadImageUrl: defaultAdminSettings.appDownloadImageUrl,
  appDownloadLink: defaultAdminSettings.appDownloadLink,
  featuredImageUrl: defaultAdminSettings.featuredImageUrl,
  featuredTitle: defaultAdminSettings.featuredTitle,
  featuredDescription: defaultAdminSettings.featuredDescription,
  featuredLink: defaultAdminSettings.featuredLink,
  contactPhone: defaultAdminSettings.contactPhone,
  contactEmail: defaultAdminSettings.contactEmail,
  contactWhatsapp: defaultAdminSettings.contactWhatsapp,
  contactAddress: defaultAdminSettings.contactAddress,
  seasons: defaultSeasons,
};

const isBrowser = typeof window !== "undefined";
const ADMIN_FETCH_TIMEOUT_MS = 8000;

const withTimeout = async <T,>(promise: Promise<T>, ms = ADMIN_FETCH_TIMEOUT_MS): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("timeout")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

type CollectionKey =
  | "flights"
  | "hotels"
  | "offers"
  | "activities"
  | "articles"
  | "destinations"
  | "partners"
  | "airlines"
  | "apiKeys"
  | "users"
  | "pages"
  | "seasons";

type DbRow = Record<string, unknown>;

const mojibakeDecoder =
  typeof TextDecoder !== "undefined" ? new TextDecoder("windows-1256") : null;
const utf8Decoder =
  typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8") : null;
let mojibakeMap: Map<string, number> | null = null;

const getMojibakeMap = () => {
  if (!mojibakeDecoder) return null;
  if (mojibakeMap) return mojibakeMap;
  const map = new Map<string, number>();
  for (let i = 0; i < 256; i += 1) {
    const ch = mojibakeDecoder.decode(new Uint8Array([i]));
    if (!map.has(ch)) map.set(ch, i);
  }
  mojibakeMap = map;
  return map;
};

const countArabic = (value: string) => (value.match(/[\u0600-\u06FF]/g) || []).length;
const countMojibakeLetters = (value: string) => (value.match(/[\u0637\u0638]/g) || []).length;
const countMojibakePairs = (value: string) => (value.match(/[\u0637\u0638][\u0600-\u06FF]/g) || []).length;
const countReplacement = (value: string) => (value.match(/\uFFFD/g) || []).length;

const latin1Pattern = /[\u00C0-\u00FF]/;

const isLikelyMojibake = (value: string) => {
  const arabicCount = countArabic(value);
  if (!arabicCount && !latin1Pattern.test(value) && !countReplacement(value)) return false;
  const mojibakeCount = countMojibakeLetters(value);
  const pairCount = countMojibakePairs(value);
  const ratio = mojibakeCount / Math.max(arabicCount, 1);
  if (ratio > 0.16) return true;
  if (pairCount >= 3) return true;
  if (latin1Pattern.test(value)) return true;
  if (countReplacement(value) > 0) return true;
  return value.includes('8&7');
};

const scoreArabic = (value: string) => {
  const arabicCount = countArabic(value);
  const mojibakeCount = countMojibakeLetters(value);
  const pairCount = countMojibakePairs(value);
  const latin1Count = (value.match(latin1Pattern) || []).length;
  const replacementCount = countReplacement(value);
  return arabicCount * 3 - mojibakeCount * 5 - pairCount * 4 - latin1Count * 3 - replacementCount * 12;
};

const decodeWindows1256 = (value: string) => {
  const map = getMojibakeMap();
  if (!map || !utf8Decoder) return null;
  const bytes = new Uint8Array(value.length);
  let index = 0;
  for (const ch of value) {
    const b = map.get(ch);
    if (b === undefined) return null;
    bytes[index++] = b;
  }
  return utf8Decoder.decode(bytes);
};

const decodeLatin1 = (value: string) => {
  if (!utf8Decoder) return null;
  const bytes = new Uint8Array([...value].map((ch) => ch.charCodeAt(0)));
  return utf8Decoder.decode(bytes);
};

const fixMojibake = (value: string) => {
  if (!value) return value;
  if (!isLikelyMojibake(value)) return value;
  const candidates = [value];
  const win = decodeWindows1256(value);
  if (win) candidates.push(win);
  const latin = decodeLatin1(value);
  if (latin) candidates.push(latin);
  let best = value;
  let bestScore = scoreArabic(value);
  for (const candidate of candidates) {
    const score = scoreArabic(candidate);
    if (score > bestScore + 1) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
};

const stripInvalidChars = (value: string) =>
  // eslint-disable-next-line no-control-regex
  value.replace(/\uFFFD+/g, "").replace(/[\x00-\x1F\x7F]/g, "").trim();

const sanitizeText = (value: string, fallback = "") => {
  const fixed = fixMojibake(value);
  const cleaned = stripInvalidChars(fixed);
  return cleaned || fallback;
};

const containsReplacement = (value: unknown): boolean => {
  if (typeof value === "string") return value.includes("\uFFFD");
  if (Array.isArray(value)) return value.some(containsReplacement);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(containsReplacement);
  }
  return false;
};

const asString = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return sanitizeText(String(value), fallback);
};
const asNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};
const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => sanitizeText(String(item))) : [];
const asArray = <T,>(value: unknown) => (Array.isArray(value) ? (value as T[]) : []);

type CollectionConfig<T> = {
  table: string;
  select?: string;
  fromDb: (row: DbRow) => T;
  toDb: (item: T) => DbRow;
};

type CollectionConfigMap = {
  [K in CollectionKey]: CollectionConfig<AdminData[K][number]>;
};

const collectionConfigs: CollectionConfigMap = {
  flights: {
    table: "flights",
    fromDb: (row) => ({
      id: asString(row.id),
      from: asString(row.from),
      to: asString(row.to),
      airline: asString(row.airline),
      departTime: asString(row.depart_time ?? row.departTime),
      arriveTime: asString(row.arrive_time ?? row.arriveTime),
      duration: asString(row.duration),
      price: asString(row.price),
      stops: asString(row.stops),
      rating: asNumber(row.rating),
      image: asString(row.image),
    }),
    toDb: (item: Flight) => ({
      id: item.id,
      from: item.from,
      to: item.to,
      airline: item.airline,
      depart_time: item.departTime,
      arrive_time: item.arriveTime,
      duration: item.duration,
      price: item.price,
      stops: item.stops,
      rating: item.rating,
      image: item.image,
    }),
  },
  hotels: {
    table: "hotels",
    fromDb: (row) => ({
      id: asString(row.id),
      name: asString(row.name),
      location: asString(row.location),
      image: asString(row.image),
      rating: asNumber(row.rating),
      reviews: asNumber(row.reviews),
      price: asString(row.price),
      priceNote: asString(row.price_note ?? row.priceNote),
      description: asString(row.description),
      amenities: asStringArray(row.amenities),
      distances: asArray<{ name: string; distance: string }>(row.distances),
      cuisine: asString(row.cuisine),
      tag: asString(row.tag),
    }),
    toDb: (item: HotelItem) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      image: item.image,
      rating: item.rating,
      reviews: item.reviews,
      price: item.price,
      price_note: item.priceNote,
      description: item.description,
      amenities: item.amenities,
      distances: item.distances,
      cuisine: item.cuisine,
      tag: item.tag,
    }),
  },
  offers: {
    table: "offers",
    fromDb: (row) => ({
      id: asString(row.id),
      title: asString(row.title),
      description: asString(row.description),
      image: asString(row.image),
      discount: asNumber(row.discount),
      validUntil: asString(row.valid_until ?? row.validUntil),
      originalPrice: asString(row.original_price ?? row.originalPrice),
      newPrice: asString(row.new_price ?? row.newPrice),
      season: asString(row.season),
      includes: asStringArray(row.includes),
      tips: asStringArray(row.tips),
    }),
    toDb: (item: OfferItem) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      image: item.image,
      discount: item.discount,
      valid_until: item.validUntil,
      original_price: item.originalPrice,
      new_price: item.newPrice,
      season: item.season,
      includes: item.includes,
      tips: item.tips,
    }),
  },
  activities: {
    table: "activities",
    fromDb: (row) => ({
      id: asString(row.id),
      title: asString(row.title),
      location: asString(row.location),
      category: asString(row.category),
      price: asString(row.price),
      image: asString(row.image),
    }),
    toDb: (item: ActivityItem) => ({
      id: item.id,
      title: item.title,
      location: item.location,
      category: item.category,
      price: item.price,
      image: item.image,
    }),
  },
  articles: {
    table: "articles",
    fromDb: (row) => ({
      id: asString(row.id),
      title: asString(row.title),
      category: asString(row.category),
      date: asString(row.date),
      image: asString(row.image),
    }),
    toDb: (item: ArticleItem) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      date: item.date,
      image: item.image,
    }),
  },
  destinations: {
    table: "destinations",
    fromDb: (row) => ({
      id: asString(row.id),
      title: asString(row.title),
      country: asString(row.country),
      region: asString(row.region),
      tag: asString(row.tag),
      duration: asString(row.duration),
      priceFrom: asString(row.price_from ?? row.priceFrom),
      description: asString(row.description),
      image: asString(row.image),
    }),
    toDb: (item: DestinationItem) => ({
      id: item.id,
      title: item.title,
      country: item.country,
      region: item.region,
      tag: item.tag,
      duration: item.duration,
      price_from: item.priceFrom,
      description: item.description,
      image: item.image,
    }),
  },
  partners: {
    table: "partners",
    fromDb: (row) => ({
      id: asString(row.id),
      name: asString(row.name),
      type: asString(row.type),
      website: asString(row.website),
      commission: asString(row.commission),
    }),
    toDb: (item: PartnerItem) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      website: item.website,
      commission: item.commission,
    }),
  },
  airlines: {
    table: "airlines",
    fromDb: (row) => ({
      id: asString(row.id),
      name: asString(row.name),
      code: asString(row.code),
      website: asString(row.website),
      phone: asString(row.phone),
      logo: asString(row.logo),
    }),
    toDb: (item: AirlineItem) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      website: item.website,
      phone: item.phone,
      logo: item.logo ?? "",
    }),
  },
  apiKeys: {
    table: "api_keys",
    select: "id, name, provider, key, base_url, status",
    fromDb: (row) => ({
      id: asString(row.id),
      name: asString(row.name),
      provider: asString(row.provider),
      key: asString(row.key),
      baseUrl: asString(row.base_url),
      status: (asString(row.status, "disabled") as ApiKeyItem["status"]) || "disabled",
    }),
    toDb: (item: ApiKeyItem) => ({
      id: item.id,
      name: item.name,
      provider: item.provider,
      key: item.key ?? null,
      base_url: item.baseUrl ?? null,
      status: item.status,
    }),
  },
  users: {
    table: "users_admin",
    fromDb: (row) => ({
      id: asString(row.id),
      name: asString(row.name),
      email: asString(row.email),
      role: (asString(row.role, "user") as ManagedUserItem["role"]) || "user",
      status: (asString(row.status, "active") as ManagedUserItem["status"]) || "active",
    }),
    toDb: (item: ManagedUserItem) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
      status: item.status,
    }),
  },
  pages: {
    table: "pages",
    fromDb: (row) => ({
      id: asString(row.id),
      title: asString(row.title),
      slug: asString(row.slug),
      summary: asString(row.summary),
    }),
    toDb: (item: PageItem) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
    }),
  },
  seasons: {
    table: "seasons",
    fromDb: (row) => ({
      id: asString(row.id),
      title: asString(row.title),
      season: (asString(row.season, "ramadan") as SeasonOffer["season"]) || "ramadan",
      description: asString(row.description),
      image: asString(row.image),
      price: asString(row.price),
      options: asStringArray(row.options),
    }),
    toDb: (item: SeasonOffer) => ({
      id: item.id,
      title: item.title,
      season: item.season,
      description: item.description,
      image: item.image,
      price: item.price,
      options: item.options,
    }),
  },
};

const emptyOrFallback = <T,>(items: T[] | null | undefined, fallback: T[]) =>
  Array.isArray(items) && items.length ? items : fallback;

const fetchAdminSettings = async (): Promise<AdminSettings> => {
  if (!isBrowser) return defaultAdminSettings;
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("admin_settings")
        .select(
          "promo_video_url, app_download_image_url, app_download_link, featured_image_url, featured_title, featured_description, featured_link, contact_phone, contact_email, contact_whatsapp, contact_address, updated_at"
        )
        .order("updated_at", { ascending: false })
        .limit(1)
    );
    if (error) return defaultAdminSettings;
    const row = data?.[0] ?? {};
    return {
      promoVideoUrl: asString(row.promo_video_url),
      appDownloadImageUrl: asString(row.app_download_image_url),
      appDownloadLink: asString(row.app_download_link),
      featuredImageUrl: asString(row.featured_image_url),
      featuredTitle: asString(row.featured_title),
      featuredDescription: asString(row.featured_description),
      featuredLink: asString(row.featured_link),
      contactPhone: asString(row.contact_phone, defaultAdminSettings.contactPhone),
      contactEmail: asString(row.contact_email, defaultAdminSettings.contactEmail),
      contactWhatsapp: asString(row.contact_whatsapp, defaultAdminSettings.contactWhatsapp),
      contactAddress: asString(row.contact_address, defaultAdminSettings.contactAddress),
    };
  } catch {
    return defaultAdminSettings;
  }
};

export const saveAdminSettings = async (settings: AdminSettings, userId?: string | null) => {
  await supabase.from("admin_settings").insert({
    promo_video_url: settings.promoVideoUrl,
    app_download_image_url: settings.appDownloadImageUrl,
    app_download_link: settings.appDownloadLink,
    featured_image_url: settings.featuredImageUrl,
    featured_title: settings.featuredTitle,
    featured_description: settings.featuredDescription,
    featured_link: settings.featuredLink,
    contact_phone: settings.contactPhone,
    contact_email: settings.contactEmail,
    contact_whatsapp: settings.contactWhatsapp,
    contact_address: settings.contactAddress,
    updated_by: userId ?? null,
  });
  if (isBrowser) window.dispatchEvent(new Event("admin-data-updated"));
};


const fetchAdminCollection = async <K extends CollectionKey>(
  key: K,
  fallback: AdminData[K]
): Promise<AdminData[K]> => {
  if (!isBrowser) return fallback;
  const config = collectionConfigs[key];
  try {
    const { data, error } = await withTimeout(
      supabase.from(config.table).select(config.select ?? "*")
    );
    if (error) return fallback;
    const rows = (data || []) as DbRow[];
    if (rows.length && rows.some(containsReplacement)) return fallback;
    const mapped = rows.map(config.fromDb);
    return emptyOrFallback(mapped, fallback);
  } catch {
    return fallback;
  }
};

export const useAdminCollection = <K extends CollectionKey>(
  key: K,
  fallback: AdminData[K]
): AdminData[K] => {
  const [collection, setCollection] = useState<AdminData[K]>(fallback);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const data = await fetchAdminCollection(key, fallback);
      if (active) setCollection(data);
    };
    load();
    const handleUpdate = () => load();
    if (isBrowser) {
      window.addEventListener("admin-data-updated", handleUpdate);
      return () => {
        active = false;
        window.removeEventListener("admin-data-updated", handleUpdate);
      };
    }
    return () => {
      active = false;
    };
  }, [key, fallback]);

  return collection;
};

const upsertItemInList = <T extends { id: string }>(items: T[], item: T) => {
  const index = items.findIndex((entry) => entry.id === item.id);
  if (index === -1) return [...items, item];
  const next = [...items];
  next[index] = item;
  return next;
};

export const useAdminData = () => {
  const [data, setData] = useState<AdminData>(defaultAdminData);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, ADMIN_FETCH_TIMEOUT_MS + 4000);

    const [
      flights,
      hotels,
      offers,
      activities,
      articles,
      destinations,
      partners,
      airlines,
      apiKeys,
      users,
      pages,
      adminSettings,
      seasons,
    ] = await Promise.all([
      fetchAdminCollection("flights", defaultFlights),
      fetchAdminCollection("hotels", defaultHotels),
      fetchAdminCollection("offers", defaultOffers),
      fetchAdminCollection("activities", defaultActivities),
      fetchAdminCollection("articles", defaultArticles),
      fetchAdminCollection("destinations", defaultDestinations),
      fetchAdminCollection("partners", defaultPartners),
      fetchAdminCollection("airlines", defaultAirlines),
      fetchAdminCollection("apiKeys", defaultApiKeys),
      fetchAdminCollection("users", defaultUsers),
      fetchAdminCollection("pages", defaultPages),
      fetchAdminSettings(),
      fetchAdminCollection("seasons", defaultSeasons),
    ]);

    setData({
      flights,
      hotels,
      offers,
      activities,
      articles,
      destinations,
      partners,
      airlines,
      apiKeys,
      users,
      pages,
      ...adminSettings,
      seasons,
    });
    clearTimeout(timeoutId);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      await refresh();
      if (!active) return;
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const upsertItem = async <K extends CollectionKey>(
    key: K,
    item: AdminData[K][number]
  ) => {
    const config = collectionConfigs[key];
    const { data: saved, error } = await supabase
      .from(config.table)
      .upsert(config.toDb(item))
      .select("*")
      .maybeSingle();
    if (error || !saved) return null;
    const mapped = config.fromDb(saved);
    setData((prev) => ({
      ...prev,
      [key]: upsertItemInList(prev[key], mapped),
    }));
    if (isBrowser) window.dispatchEvent(new Event("admin-data-updated"));
    return mapped;
  };

  const deleteItem = async <K extends CollectionKey>(key: K, id: string) => {
    const config = collectionConfigs[key];
    await supabase.from(config.table).delete().eq("id", id);
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((entry) => entry.id !== id),
    }));
    if (isBrowser) window.dispatchEvent(new Event("admin-data-updated"));
  };

  const updateAdminSettings = async (
    updates: Partial<AdminSettings>,
    userId?: string | null
  ) => {
    const next: AdminSettings = {
      promoVideoUrl: data.promoVideoUrl,
      appDownloadImageUrl: data.appDownloadImageUrl,
      appDownloadLink: data.appDownloadLink,
      featuredImageUrl: data.featuredImageUrl,
      featuredTitle: data.featuredTitle,
      featuredDescription: data.featuredDescription,
      featuredLink: data.featuredLink,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      contactWhatsapp: data.contactWhatsapp,
      contactAddress: data.contactAddress,
      ...updates,
    };
    await saveAdminSettings(next, userId);
    setData((prev) => ({ ...prev, ...next }));
  };

  const updatePromoVideoUrl = async (url: string, userId?: string | null) => {
    await updateAdminSettings({ promoVideoUrl: url }, userId);
  };

  return {
    data,
    loading,
    refresh,
    upsertItem,
    deleteItem,
    updatePromoVideoUrl,
    updateAdminSettings,
  };
};

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>(defaultAdminSettings);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const value = await fetchAdminSettings();
      if (active) setSettings(value);
    };
    load();
    const handleUpdate = () => load();
    if (isBrowser) window.addEventListener("admin-data-updated", handleUpdate);
    return () => {
      active = false;
      if (isBrowser) window.removeEventListener("admin-data-updated", handleUpdate);
    };
  }, []);

  return settings;
};

export const usePromoVideoUrl = () => {
  const settings = useAdminSettings();
  return settings.promoVideoUrl;
};

export const getPromoVideoUrl = () => "";
