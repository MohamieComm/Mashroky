import { useEffect, useState } from "react";

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
};

export type ApiKeyItem = {
  id: string;
  name: string;
  provider: string;
  key: string;
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
};

export const defaultFlights: Flight[] = [
  {
    id: "flight-1",
    from: "الرياض",
    to: "دبي",
    airline: "الخطوط السعودية",
    departTime: "08:00",
    arriveTime: "10:00",
    duration: "2 ساعة",
    price: "650",
    stops: "مباشر",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400",
  },
  {
    id: "flight-2",
    from: "جدة",
    to: "إسطنبول",
    airline: "طيران ناس",
    departTime: "14:30",
    arriveTime: "19:00",
    duration: "4.5 ساعة",
    price: "1,200",
    stops: "مباشر",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=400",
  },
  {
    id: "flight-3",
    from: "الرياض",
    to: "القاهرة",
    airline: "مصر للطيران",
    departTime: "06:00",
    arriveTime: "08:30",
    duration: "2.5 ساعة",
    price: "800",
    stops: "مباشر",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=400",
  },
  {
    id: "flight-4",
    from: "الدمام",
    to: "باريس",
    airline: "الخطوط الفرنسية",
    departTime: "22:00",
    arriveTime: "06:00",
    duration: "8 ساعات",
    price: "3,500",
    stops: "محطة واحدة",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400",
  },
  {
    id: "flight-5",
    from: "الرياض",
    to: "لندن",
    airline: "الخطوط البريطانية",
    departTime: "13:45",
    arriveTime: "19:30",
    duration: "6.5 ساعة",
    price: "2,900",
    stops: "مباشر",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400",
  },
  {
    id: "flight-6",
    from: "جدة",
    to: "بانكوك",
    airline: "الخطوط التايلندية",
    departTime: "23:00",
    arriveTime: "09:30",
    duration: "8.5 ساعة",
    price: "2,400",
    stops: "محطة واحدة",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400",
  },
];

export const defaultHotels: HotelItem[] = [
  {
    id: "hotel-1",
    name: "فندق برج العرب جميرا",
    location: "دبي، الإمارات العربية المتحدة",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    rating: 5,
    reviews: 2450,
    price: "3,500",
    priceNote: "لليلة الواحدة",
    description: "فندق 7 نجوم يقدم تجربة فاخرة لا مثيل لها مع إطلالات خلابة على الخليج العربي",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "المطار", distance: "25 دقيقة" },
      { name: "دبي مول", distance: "15 دقيقة" },
      { name: "برج خليفة", distance: "20 دقيقة" },
    ],
    cuisine: "مأكولات عالمية متنوعة - 9 مطاعم فاخرة",
    tag: "الأكثر فخامة",
  },
  {
    id: "hotel-2",
    name: "فندق فور سيزونز البوسفور",
    location: "إسطنبول، تركيا",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    rating: 4.9,
    reviews: 1890,
    price: "1,800",
    priceNote: "لليلة الواحدة",
    description: "فندق تاريخي على ضفاف البوسفور يجمع بين الأصالة العثمانية والفخامة العصرية",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool"],
    distances: [
      { name: "المطار", distance: "40 دقيقة" },
      { name: "البازار الكبير", distance: "10 دقائق" },
      { name: "آيا صوفيا", distance: "5 دقائق" },
    ],
    cuisine: "مأكولات تركية وعالمية - 3 مطاعم",
    tag: "إطلالة البوسفور",
  },
  {
    id: "hotel-3",
    name: "منتجع أنانتارا المالديف",
    location: "جزر المالديف",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
    rating: 5,
    reviews: 980,
    price: "5,200",
    priceNote: "لليلة الواحدة",
    description: "فيلات فاخرة فوق الماء مع مسابح خاصة وإطلالات لا تُنسى على المحيط الهندي",
    amenities: ["wifi", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "المطار المائي", distance: "30 دقيقة بالقارب" },
      { name: "مركز الغوص", distance: "في المنتجع" },
    ],
    cuisine: "مأكولات آسيوية وعالمية - 4 مطاعم على الشاطئ",
    tag: "شهر العسل",
  },
  {
    id: "hotel-4",
    name: "فندق ريتز كارلتون باريس",
    location: "باريس، فرنسا",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    rating: 4.8,
    reviews: 1560,
    price: "4,200",
    priceNote: "لليلة الواحدة",
    description: "فندق أسطوري في قلب باريس يجسد الأناقة الفرنسية والرفاهية الكلاسيكية",
    amenities: ["wifi", "parking", "breakfast", "gym", "restaurant"],
    distances: [
      { name: "برج إيفل", distance: "10 دقائق" },
      { name: "اللوفر", distance: "5 دقائق" },
      { name: "الشانزليزيه", distance: "دقيقتان" },
    ],
    cuisine: "مأكولات فرنسية راقية - مطعم حائز على نجمة ميشلان",
    tag: "كلاسيكي فاخر",
  },
  {
    id: "hotel-5",
    name: "قصر الإمارات",
    location: "أبوظبي، الإمارات العربية المتحدة",
    image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d6?w=800",
    rating: 4.9,
    reviews: 1320,
    price: "2,900",
    priceNote: "لليلة الواحدة",
    description: "إقامة ملكية على شاطئ خاص مع خدمات ضيافة راقية ومرافق متكاملة.",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "المطار", distance: "35 دقيقة" },
      { name: "الكورنيش", distance: "10 دقائق" },
      { name: "قصر الوطن", distance: "8 دقائق" },
    ],
    cuisine: "مأكولات عربية وعالمية - 7 مطاعم",
    tag: "إقامة ملكية",
  },
  {
    id: "hotel-6",
    name: "منتجع شيبارا البحر الأحمر",
    location: "البحر الأحمر، السعودية",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800",
    rating: 4.8,
    reviews: 610,
    price: "3,800",
    priceNote: "لليلة الواحدة",
    description: "فلل ساحلية وتجارب بحرية مميزة مع خدمة نقل خاصة وإطلالات على الجزر.",
    amenities: ["wifi", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "المطار", distance: "45 دقيقة" },
      { name: "الشاطئ الخاص", distance: "داخل المنتجع" },
    ],
    cuisine: "مأكولات بحرية ومحلية - 3 مطاعم",
    tag: "وجهة شاطئية",
  },
];

export const defaultOffers: OfferItem[] = [
  {
    id: "offer-1",
    title: "باقة العُلا التراثية",
    description: "اكتشف مدائن صالح وتجارب الصحراء في برنامج شامل للطيران والإقامة والجولات.",
    image: "https://images.unsplash.com/photo-1547234934-7b6dff7f1f48?w=800",
    discount: 20,
    validUntil: "حتى نهاية الموسم",
    originalPrice: "4,200",
    newPrice: "3,350",
    season: "الشتاء والربيع",
    includes: ["طيران داخلي ذهاب وعودة", "إقامة 3 ليالٍ", "جولة أثرية في هِجرا", "تنقلات داخلية"],
    tips: [
      "احجز مبكرًا لعروض المخيمات الفاخرة",
      "يُفضل السفر في الصباح للاستفادة من الطقس",
      "ارتدِ أحذية مريحة للأنشطة الصحراوية",
    ],
  },
  {
    id: "offer-2",
    title: "سحر البحر الأحمر",
    description: "منتجعات شاطئية وأنشطة بحرية مع برنامج متكامل للعائلات.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    discount: 18,
    validUntil: "حتى نهاية الموسم",
    originalPrice: "5,600",
    newPrice: "4,600",
    season: "طوال العام",
    includes: ["إقامة 4 ليالٍ في منتجع بحري", "أنشطة غوص ورياضات مائية", "تنقلات خاصة"],
    tips: [
      "احجز غرفًا بإطلالة بحرية مبكرًا",
      "اصطحب واقي شمس ومستلزمات الغوص",
      "أضف رحلة بحرية خاصة عند الغروب",
    ],
  },
  {
    id: "offer-3",
    title: "دبي العائلية الشاملة",
    description: "باقة تشمل الطيران والفندق والأنشطة الترفيهية والمواصلات.",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800",
    discount: 30,
    validUntil: "حتى نهاية الموسم",
    originalPrice: "4,500",
    newPrice: "3,150",
    season: "الشتاء",
    includes: ["تذكرة طيران ذهاب وعودة", "إقامة 4 ليالٍ", "تذاكر أنشطة عائلية", "تنقلات يومية"],
    tips: ["احجز تذاكر الفعاليات مسبقًا", "اختر فندقًا قريبًا من المراكز الترفيهية"],
  },
  {
    id: "offer-4",
    title: "استكشاف إسطنبول التاريخية",
    description: "جولات ثقافية وأسواق تقليدية مع باقة اقتصادية شاملة.",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
    discount: 28,
    validUntil: "حتى نهاية الموسم",
    originalPrice: "5,000",
    newPrice: "3,600",
    season: "الربيع والخريف",
    includes: ["طيران + فندق 4 نجوم", "جولة البوسفور", "زيارة الأسواق التراثية"],
    tips: ["خصص يومًا لزيارة كابادوكيا إذا أمكن", "جرب المطاعم المحلية بعيدًا عن الزحام"],
  },
  {
    id: "offer-5",
    title: "شتاء جنيف الفاخر",
    description: "باقة شتوية تشمل الطيران والفندق الفاخر وتجربة التزلج مع مرشد.",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800",
    discount: 22,
    validUntil: "حتى نهاية الشتاء",
    originalPrice: "8,500",
    newPrice: "6,600",
    season: "الشتاء",
    includes: ["طيران ذهاب وعودة", "إقامة 4 ليالٍ", "تذاكر تزلج", "تنقلات يومية"],
    tips: ["احجز معدات التزلج مسبقًا", "اختر الغرفة بإطلالة على البحيرة"],
  },
  {
    id: "offer-6",
    title: "مغامرة كيب تاون",
    description: "برنامج مغامرات يشمل السفاري والجبال مع إقامة مريحة.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    discount: 18,
    validUntil: "حتى نهاية الربيع",
    originalPrice: "7,200",
    newPrice: "5,900",
    season: "الربيع",
    includes: ["طيران + فندق", "رحلة سفاري", "جولة جبل الطاولة"],
    tips: ["اجعل جدولك مرنًا للطقس", "أضف زيارة مزارع الكروم"],
  },
];

export const defaultActivities: ActivityItem[] = [
  {
    id: "activity-1",
    title: "مهرجان البحر الأحمر",
    location: "جدة",
    category: "مهرجانات",
    price: "450",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
  },
  {
    id: "activity-2",
    title: "سباق الصحارى",
    location: "العُلا",
    category: "مغامرات",
    price: "650",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
  {
    id: "activity-3",
    title: "كرنفال الرياض",
    location: "الرياض",
    category: "فعاليات",
    price: "300",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200",
  },
  {
    id: "activity-4",
    title: "رحلة غوص خاصة",
    location: "البحر الأحمر",
    category: "أنشطة بحرية",
    price: "900",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
  },
  {
    id: "activity-5",
    title: "مهرجان العود الثقافي",
    location: "الرياض",
    category: "ثقافة وفنون",
    price: "250",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
  },
  {
    id: "activity-6",
    title: "تحدي الربع الخالي",
    location: "المنطقة الشرقية",
    category: "مغامرات",
    price: "780",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
];

export const defaultArticles: ArticleItem[] = [
  {
    id: "article-1",
    title: "أفضل وقت لزيارة العُلا ولماذا يفضّلها عشاق الطبيعة",
    category: "سياحة السعودية",
    date: "فبراير 2026",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
  {
    id: "article-2",
    title: "دليل المسافر الذكي: كيف تختار الفندق المناسب لعائلتك؟",
    category: "نصائح السفر",
    date: "فبراير 2026",
    image: "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d6?w=1200",
  },
  {
    id: "article-3",
    title: "خطوات استخراج التأشيرة السياحية بسهولة للمسافرين السعوديين",
    category: "إجراءات السفر",
    date: "فبراير 2026",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200",
  },
  {
    id: "article-4",
    title: "أبرز الوجهات العربية للعطلات القصيرة في نهاية الأسبوع",
    category: "وجهات قريبة",
    date: "فبراير 2026",
    image: "https://images.unsplash.com/photo-1495195129352-a9d3c9469a46?w=1200",
  },
  {
    id: "article-5",
    title: "أفضل المدن الأوروبية المناسبة للعائلات السعودية",
    category: "وجهات عالمية",
    date: "فبراير 2026",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200",
  },
  {
    id: "article-6",
    title: "قائمة تجهيزات السفر الذكية للموسم الشتوي",
    category: "نصائح السفر",
    date: "فبراير 2026",
    image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200",
  },
];

export const defaultDestinations: DestinationItem[] = [
  {
    id: "dest-1",
    title: "جورجيا",
    country: "تبليسي وباتومي",
    tag: "شتوية",
    duration: "5 أيام",
    priceFrom: "2,600",
    description: "طبيعة خضراء، جبال خلابة، وأسواق شعبية تناسب العائلة.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
  {
    id: "dest-2",
    title: "كابادوكيا",
    country: "تركيا",
    tag: "رومانسية",
    duration: "4 أيام",
    priceFrom: "3,150",
    description: "مناظر بالونات الهواء وتجارب سياحية مميزة للزوجين.",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
  },
  {
    id: "dest-3",
    title: "المالديف",
    country: "المحيط الهندي",
    tag: "فاخر",
    duration: "6 أيام",
    priceFrom: "6,900",
    description: "منتجعات فخمة على الماء وتجارب بحرية حصرية.",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200",
  },
  {
    id: "dest-4",
    title: "الرياض والدرعية",
    country: "السعودية",
    tag: "تراث",
    duration: "3 أيام",
    priceFrom: "1,200",
    description: "تراث سعودي أصيل وتجارب حضارية ومعارض ثقافية.",
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b95cf7cf?w=1200",
  },
  {
    id: "dest-5",
    title: "أذربيجان",
    country: "باكو وقوبا",
    tag: "عائلي",
    duration: "5 أيام",
    priceFrom: "3,400",
    description: "طبيعة جبلية وأسواق حديثة وأنشطة مناسبة للعائلة.",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200",
  },
  {
    id: "dest-6",
    title: "صلالة",
    country: "سلطنة عمان",
    tag: "صيفية",
    duration: "4 أيام",
    priceFrom: "2,100",
    description: "خريف صلالة، شلالات وضباب وجولات طبيعية منعشة.",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200",
  },
];

export const defaultPartners: PartnerItem[] = [
  {
    id: "partner-1",
    name: "Booking.com",
    type: "فنادق",
    website: "https://www.booking.com",
    commission: "8%",
  },
  {
    id: "partner-2",
    name: "Skyscanner",
    type: "طيران",
    website: "https://www.skyscanner.net",
    commission: "6%",
  },
];

export const defaultAirlines: AirlineItem[] = [
  {
    id: "airline-1",
    name: "الخطوط السعودية",
    code: "SV",
    website: "https://www.saudia.com",
    phone: "+966 920022222",
  },
  {
    id: "airline-2",
    name: "طيران ناس",
    code: "XY",
    website: "https://www.flynas.com",
    phone: "+966 920001234",
  },
];

export const defaultApiKeys: ApiKeyItem[] = [
  {
    id: "api-1",
    name: "Amadeus API",
    provider: "Amadeus",
    key: "amadeus_live_xxxxx",
    status: "enabled",
  },
];

export const defaultUsers: ManagedUserItem[] = [
  {
    id: "user-1",
    name: "أحمد العتيبي",
    email: "ahmed@example.com",
    role: "user",
    status: "active",
  },
  {
    id: "user-2",
    name: "فريق الإدارة",
    email: "admin@mashrouk.com",
    role: "admin",
    status: "active",
  },
];

export const defaultPages: PageItem[] = [
  {
    id: "page-1",
    title: "عن المنصة",
    slug: "/about",
    summary: "تعريف بالمنصة ولماذا نثق بها.",
  },
  {
    id: "page-2",
    title: "سياسة الخصوصية",
    slug: "/privacy",
    summary: "سياسة الخصوصية وحماية البيانات.",
  },
];

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
  promoVideoUrl: "",
};

const STORAGE_KEY = "mashrouk_admin_data";

const isBrowser = typeof window !== "undefined";

const mergeCollection = <T,>(stored: T[] | undefined, fallback: T[]) =>
  Array.isArray(stored) && stored.length ? stored : fallback;

export const loadAdminData = (): AdminData => {
  if (!isBrowser) return defaultAdminData;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAdminData;
    const parsed = JSON.parse(raw) as Partial<AdminData>;
    return {
      flights: mergeCollection(parsed.flights, defaultFlights),
      hotels: mergeCollection(parsed.hotels, defaultHotels),
      offers: mergeCollection(parsed.offers, defaultOffers),
      activities: mergeCollection(parsed.activities, defaultActivities),
      articles: mergeCollection(parsed.articles, defaultArticles),
      destinations: mergeCollection(parsed.destinations, defaultDestinations),
      partners: mergeCollection(parsed.partners, defaultPartners),
      airlines: mergeCollection(parsed.airlines, defaultAirlines),
      apiKeys: mergeCollection(parsed.apiKeys, defaultApiKeys),
      users: mergeCollection(parsed.users, defaultUsers),
      pages: mergeCollection(parsed.pages, defaultPages),
      promoVideoUrl: parsed.promoVideoUrl ?? "",
    };
  } catch {
    return defaultAdminData;
  }
};

export const saveAdminData = (data: AdminData) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("admin-data-updated"));
};

export const useAdminData = (): [AdminData, (value: AdminData) => void] => {
  const [data, setData] = useState<AdminData>(() => loadAdminData());

  useEffect(() => {
    saveAdminData(data);
  }, [data]);

  return [data, setData];
};

export const getAdminCollection = <K extends keyof AdminData>(
  key: K,
  fallback: AdminData[K]
): AdminData[K] => {
  if (!isBrowser) return fallback;
  const data = loadAdminData();
  const value = data[key];
  if (Array.isArray(fallback)) {
    return (Array.isArray(value) && value.length ? value : fallback) as AdminData[K];
  }
  return (value ?? fallback) as AdminData[K];
};

export const getPromoVideoUrl = (): string => {
  if (!isBrowser) return "";
  return loadAdminData().promoVideoUrl || "";
};
