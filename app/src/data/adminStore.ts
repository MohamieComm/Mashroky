// ط¬ظ„ط¨ ط£ظˆظ„ ظ…ظپطھط§ط­ ظ…ظپط¹ظ‘ظ„ ظ„ظ…ط²ظˆط¯ ظ…ط¹ظٹظ† (amadeus, supabase, moyasar...)
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
    title: "ط±ط­ظ„ط§طھ ط±ظ…ط¶ط§ظ† ط¥ظ„ظ‰ ظ…ظƒط© ط§ظ„ظ…ظƒط±ظ…ط©",
    season: "ramadan",
    description: "ط¨ط§ظ‚ط© ط´ط§ظ…ظ„ط© ظ„ظ„ط¥ظ‚ط§ظ…ط© ظپظٹ ظ…ظƒط© ط§ظ„ظ…ظƒط±ظ…ط© ط®ظ„ط§ظ„ ط´ظ‡ط± ط±ظ…ط¶ط§ظ† ط§ظ„ظ…ط¨ط§ط±ظƒطŒ طھط´ظ…ظ„ ط§ظ„ط³ظƒظ† ظˆط§ظ„ظ…ظˆط§طµظ„ط§طھ ظˆط®ط¯ظ…ط§طھ ط¥ط¶ط§ظپظٹط© ط­ط³ط¨ ط§ط®طھظٹط§ط± ط§ظ„ط¹ظ…ظٹظ„.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    price: "2,500",
    options: ["ط³ظƒظ† 4 ظ†ط¬ظˆظ…", "ظ…ظˆط§طµظ„ط§طھ ط®ط§طµط©", "ط¥ظپط·ط§ط± ظٹظˆظ…ظٹ"],
  },
  {
    id: "season-hajj",
    title: "ط¨ط§ظ‚ط© ط§ظ„ط­ط¬ ط§ظ„ظƒط§ظ…ظ„ط©",
    season: "hajj",
    description: "ط±ط­ظ„ط© ط§ظ„ط­ط¬ ظ…ط¹ ط®ط¯ظ…ط§طھ ط§ظ„ط³ظƒظ† ظˆط§ظ„ظ…ظˆط§طµظ„ط§طھ ظˆط§ظ„ط¥ط±ط´ط§ط¯طŒ ط¨ط§ظ‚ط§طھ ظ…طھظ†ظˆط¹ط© طھظ†ط§ط³ط¨ ط¬ظ…ظٹط¹ ط§ظ„ط§ط­طھظٹط§ط¬ط§طھ.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800",
    price: "7,500",
    options: ["ط³ظƒظ† ظ‚ط±ظٹط¨ ظ…ظ† ط§ظ„ط­ط±ظ…", "ظ…ظˆط§طµظ„ط§طھ ظ…ظƒظٹظپط©", "ط¥ط±ط´ط§ط¯ ط¯ظٹظ†ظٹ"],
  },
  {
    id: "season-summer",
    title: "ط¯ط±ط§ط³ط© ط§ظ„ظ„ط؛ط© ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط© ظپظٹ ط§ظ„ط®ط§ط±ط¬ (ط§ظ„طµظٹظپ)",
    season: "summer",
    description: "ظپط±طµط© ظ„ط¯ط±ط§ط³ط© ط§ظ„ظ„ط؛ط© ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط© ظپظٹ ط¨ط±ظٹط·ط§ظ†ظٹط§ ط£ظˆ ط£ظ…ط±ظٹظƒط§ ط®ظ„ط§ظ„ ط§ظ„ط¥ط¬ط§ط²ط© ط§ظ„طµظٹظپظٹط©طŒ طھط´ظ…ظ„ ط§ظ„ط³ظƒظ† ظˆط§ظ„ط¯ط±ط§ط³ط© ظˆط§ظ„ظ…ظˆط§طµظ„ط§طھ.",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
    price: "12,000",
    options: ["ط³ظƒظ† ط¹ط§ط¦ظ„ظٹ ط£ظˆ ط·ظ„ط§ط¨ظٹ", "ط¯ط±ظˆط³ ظ„ط؛ط© ظ…ظƒط«ظپط©", "ط±ط­ظ„ط§طھ ط³ظٹط§ط­ظٹط©"],
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
    from: "ط§ظ„ط±ظٹط§ط¶",
    to: "ط¯ط¨ظٹ",
    airline: "ط§ظ„ط®ط·ظˆط· ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    departTime: "08:00",
    arriveTime: "10:00",
    duration: "2 ط³ط§ط¹ط©",
    price: "650",
    stops: "ظ…ط¨ط§ط´ط±",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1520425155577-aaad47db1d1f?w=400",
  },
  {
    id: "flight-2",
    from: "ط¬ط¯ط©",
    to: "ط¥ط³ط·ظ†ط¨ظˆظ„",
    airline: "ط·ظٹط±ط§ظ† ظ†ط§ط³",
    departTime: "14:30",
    arriveTime: "19:00",
    duration: "4.5 ط³ط§ط¹ط©",
    price: "1,200",
    stops: "ظ…ط¨ط§ط´ط±",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400",
  },
  {
    id: "flight-3",
    from: "ط§ظ„ط±ظٹط§ط¶",
    to: "ط§ظ„ظ‚ط§ظ‡ط±ط©",
    airline: "ظ…طµط± ظ„ظ„ط·ظٹط±ط§ظ†",
    departTime: "06:00",
    arriveTime: "08:30",
    duration: "2.5 ط³ط§ط¹ط©",
    price: "800",
    stops: "ظ…ط¨ط§ط´ط±",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
  },
  {
    id: "flight-4",
    from: "ط§ظ„ط¯ظ…ط§ظ…",
    to: "ط¨ط§ط±ظٹط³",
    airline: "ط§ظ„ط®ط·ظˆط· ط§ظ„ظپط±ظ†ط³ظٹط©",
    departTime: "22:00",
    arriveTime: "06:00",
    duration: "8 ط³ط§ط¹ط§طھ",
    price: "3,500",
    stops: "ظ…ط­ط·ط© ظˆط§ط­ط¯ط©",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1500422017585-53bff1160f14?w=400",
  },
  {
    id: "flight-5",
    from: "ط§ظ„ط±ظٹط§ط¶",
    to: "ظ„ظ†ط¯ظ†",
    airline: "ط§ظ„ط®ط·ظˆط· ط§ظ„ط¨ط±ظٹط·ط§ظ†ظٹط©",
    departTime: "13:45",
    arriveTime: "19:30",
    duration: "6.5 ط³ط§ط¹ط©",
    price: "2,900",
    stops: "ظ…ط¨ط§ط´ط±",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1505236858576-d1b2c6ce53b9?w=400",
  },
  {
    id: "flight-6",
    from: "ط¬ط¯ط©",
    to: "ط¨ط§ظ†ظƒظˆظƒ",
    airline: "ط§ظ„ط®ط·ظˆط· ط§ظ„طھط§ظٹظ„ظ†ط¯ظٹط©",
    departTime: "23:00",
    arriveTime: "09:30",
    duration: "8.5 ط³ط§ط¹ط©",
    price: "2,400",
    stops: "ظ…ط­ط·ط© ظˆط§ط­ط¯ط©",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
  },
];

export const defaultHotels: HotelItem[] = [
  {
    id: "hotel-1",
    name: "ظپظ†ط¯ظ‚ ط¨ط±ط¬ ط§ظ„ط¹ط±ط¨ ط¬ظ…ظٹط±ط§",
    location: "ط¯ط¨ظٹطŒ ط§ظ„ط¥ظ…ط§ط±ط§طھ ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ظ…طھط­ط¯ط©",
    image: "https://images.unsplash.com/photo-1512453995560-851157e9a028?w=800",
    rating: 5,
    reviews: 2450,
    price: "3,500",
    priceNote: "ظ„ظ„ظٹظ„ط© ط§ظ„ظˆط§ط­ط¯ط©",
    description: "ظپظ†ط¯ظ‚ 7 ظ†ط¬ظˆظ… ظٹظ‚ط¯ظ… طھط¬ط±ط¨ط© ظپط§ط®ط±ط© ظ„ط§ ظ…ط«ظٹظ„ ظ„ظ‡ط§ ظ…ط¹ ط¥ط·ظ„ط§ظ„ط§طھ ط®ظ„ط§ط¨ط© ط¹ظ„ظ‰ ط§ظ„ط®ظ„ظٹط¬ ط§ظ„ط¹ط±ط¨ظٹ",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "ط§ظ„ظ…ط·ط§ط±", distance: "25 ط¯ظ‚ظٹظ‚ط©" },
      { name: "ط¯ط¨ظٹ ظ…ظˆظ„", distance: "15 ط¯ظ‚ظٹظ‚ط©" },
      { name: "ط¨ط±ط¬ ط®ظ„ظٹظپط©", distance: "20 ط¯ظ‚ظٹظ‚ط©" },
    ],
    cuisine: "ظ…ط£ظƒظˆظ„ط§طھ ط¹ط§ظ„ظ…ظٹط© ظ…طھظ†ظˆط¹ط© - 9 ظ…ط·ط§ط¹ظ… ظپط§ط®ط±ط©",
    tag: "ط§ظ„ط£ظƒط«ط± ظپط®ط§ظ…ط©",
  },
  {
    id: "hotel-2",
    name: "ظپظ†ط¯ظ‚ ظپظˆط± ط³ظٹط²ظˆظ†ط² ط§ظ„ط¨ظˆط³ظپظˆط±",
    location: "ط¥ط³ط·ظ†ط¨ظˆظ„طŒ طھط±ظƒظٹط§",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
    rating: 4.9,
    reviews: 1890,
    price: "1,800",
    priceNote: "ظ„ظ„ظٹظ„ط© ط§ظ„ظˆط§ط­ط¯ط©",
    description: "ظپظ†ط¯ظ‚ طھط§ط±ظٹط®ظٹ ط¹ظ„ظ‰ ط¶ظپط§ظپ ط§ظ„ط¨ظˆط³ظپظˆط± ظٹط¬ظ…ط¹ ط¨ظٹظ† ط§ظ„ط£طµط§ظ„ط© ط§ظ„ط¹ط«ظ…ط§ظ†ظٹط© ظˆط§ظ„ظپط®ط§ظ…ط© ط§ظ„ط¹طµط±ظٹط©",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool"],
    distances: [
      { name: "ط§ظ„ظ…ط·ط§ط±", distance: "40 ط¯ظ‚ظٹظ‚ط©" },
      { name: "ط§ظ„ط¨ط§ط²ط§ط± ط§ظ„ظƒط¨ظٹط±", distance: "10 ط¯ظ‚ط§ط¦ظ‚" },
      { name: "ط¢ظٹط§ طµظˆظپظٹط§", distance: "5 ط¯ظ‚ط§ط¦ظ‚" },
    ],
    cuisine: "ظ…ط£ظƒظˆظ„ط§طھ طھط±ظƒظٹط© ظˆط¹ط§ظ„ظ…ظٹط© - 3 ظ…ط·ط§ط¹ظ…",
    tag: "ط¥ط·ظ„ط§ظ„ط© ط§ظ„ط¨ظˆط³ظپظˆط±",
  },
  {
    id: "hotel-3",
    name: "ظ…ظ†طھط¬ط¹ ط£ظ†ط§ظ†طھط§ط±ط§ ط§ظ„ظ…ط§ظ„ط¯ظٹظپ",
    location: "ط¬ط²ط± ط§ظ„ظ…ط§ظ„ط¯ظٹظپ",
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800",
    rating: 5,
    reviews: 980,
    price: "5,200",
    priceNote: "ظ„ظ„ظٹظ„ط© ط§ظ„ظˆط§ط­ط¯ط©",
    description: "ظپظٹظ„ط§طھ ظپط§ط®ط±ط© ظپظˆظ‚ ط§ظ„ظ…ط§ط، ظ…ط¹ ظ…ط³ط§ط¨ط­ ط®ط§طµط© ظˆط¥ط·ظ„ط§ظ„ط§طھ ظ„ط§ طھظڈظ†ط³ظ‰ ط¹ظ„ظ‰ ط§ظ„ظ…ط­ظٹط· ط§ظ„ظ‡ظ†ط¯ظٹ",
    amenities: ["wifi", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "ط§ظ„ظ…ط·ط§ط± ط§ظ„ظ…ط§ط¦ظٹ", distance: "30 ط¯ظ‚ظٹظ‚ط© ط¨ط§ظ„ظ‚ط§ط±ط¨" },
      { name: "ظ…ط±ظƒط² ط§ظ„ط؛ظˆطµ", distance: "ظپظٹ ط§ظ„ظ…ظ†طھط¬ط¹" },
    ],
    cuisine: "ظ…ط£ظƒظˆظ„ط§طھ ط¢ط³ظٹظˆظٹط© ظˆط¹ط§ظ„ظ…ظٹط© - 4 ظ…ط·ط§ط¹ظ… ط¹ظ„ظ‰ ط§ظ„ط´ط§ط·ط¦",
    tag: "ط´ظ‡ط± ط§ظ„ط¹ط³ظ„",
  },
  {
    id: "hotel-4",
    name: "ظپظ†ط¯ظ‚ ط±ظٹطھط² ظƒط§ط±ظ„طھظˆظ† ط¨ط§ط±ظٹط³",
    location: "ط¨ط§ط±ظٹط³طŒ ظپط±ظ†ط³ط§",
    image: "https://images.unsplash.com/photo-1495195129352-a9d3c9469a46?w=800",
    rating: 4.8,
    reviews: 1560,
    price: "4,200",
    priceNote: "ظ„ظ„ظٹظ„ط© ط§ظ„ظˆط§ط­ط¯ط©",
    description: "ظپظ†ط¯ظ‚ ط£ط³ط·ظˆط±ظٹ ظپظٹ ظ‚ظ„ط¨ ط¨ط§ط±ظٹط³ ظٹط¬ط³ط¯ ط§ظ„ط£ظ†ط§ظ‚ط© ط§ظ„ظپط±ظ†ط³ظٹط© ظˆط§ظ„ط±ظپط§ظ‡ظٹط© ط§ظ„ظƒظ„ط§ط³ظٹظƒظٹط©",
    amenities: ["wifi", "parking", "breakfast", "gym", "restaurant"],
    distances: [
      { name: "ط¨ط±ط¬ ط¥ظٹظپظ„", distance: "10 ط¯ظ‚ط§ط¦ظ‚" },
      { name: "ط§ظ„ظ„ظˆظپط±", distance: "5 ط¯ظ‚ط§ط¦ظ‚" },
      { name: "ط§ظ„ط´ط§ظ†ط²ظ„ظٹط²ظٹظ‡", distance: "ط¯ظ‚ظٹظ‚طھط§ظ†" },
    ],
    cuisine: "ظ…ط£ظƒظˆظ„ط§طھ ظپط±ظ†ط³ظٹط© ط±ط§ظ‚ظٹط© - ظ…ط·ط¹ظ… ط­ط§ط¦ط² ط¹ظ„ظ‰ ظ†ط¬ظ…ط© ظ…ظٹط´ظ„ط§ظ†",
    tag: "ظƒظ„ط§ط³ظٹظƒظٹ ظپط§ط®ط±",
  },
  {
    id: "hotel-5",
    name: "ظ‚طµط± ط§ظ„ط¥ظ…ط§ط±ط§طھ",
    location: "ط£ط¨ظˆط¸ط¨ظٹطŒ ط§ظ„ط¥ظ…ط§ط±ط§طھ ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ظ…طھط­ط¯ط©",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
    rating: 4.9,
    reviews: 1320,
    price: "2,900",
    priceNote: "ظ„ظ„ظٹظ„ط© ط§ظ„ظˆط§ط­ط¯ط©",
    description: "ط¥ظ‚ط§ظ…ط© ظ…ظ„ظƒظٹط© ط¹ظ„ظ‰ ط´ط§ط·ط¦ ط®ط§طµ ظ…ط¹ ط®ط¯ظ…ط§طھ ط¶ظٹط§ظپط© ط±ط§ظ‚ظٹط© ظˆظ…ط±ط§ظپظ‚ ظ…طھظƒط§ظ…ظ„ط©.",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "ط§ظ„ظ…ط·ط§ط±", distance: "35 ط¯ظ‚ظٹظ‚ط©" },
      { name: "ط§ظ„ظƒظˆط±ظ†ظٹط´", distance: "10 ط¯ظ‚ط§ط¦ظ‚" },
      { name: "ظ‚طµط± ط§ظ„ظˆط·ظ†", distance: "8 ط¯ظ‚ط§ط¦ظ‚" },
    ],
    cuisine: "ظ…ط£ظƒظˆظ„ط§طھ ط¹ط±ط¨ظٹط© ظˆط¹ط§ظ„ظ…ظٹط© - 7 ظ…ط·ط§ط¹ظ…",
    tag: "ط¥ظ‚ط§ظ…ط© ظ…ظ„ظƒظٹط©",
  },
  {
    id: "hotel-6",
    name: "ظ…ظ†طھط¬ط¹ ط´ظٹط¨ط§ط±ط§ ط§ظ„ط¨ط­ط± ط§ظ„ط£ط­ظ…ط±",
    location: "ط§ظ„ط¨ط­ط± ط§ظ„ط£ط­ظ…ط±طŒ ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    rating: 4.8,
    reviews: 610,
    price: "3,800",
    priceNote: "ظ„ظ„ظٹظ„ط© ط§ظ„ظˆط§ط­ط¯ط©",
    description: "ظپظ„ظ„ ط³ط§ط­ظ„ظٹط© ظˆطھط¬ط§ط±ط¨ ط¨ط­ط±ظٹط© ظ…ظ…ظٹط²ط© ظ…ط¹ ط®ط¯ظ…ط© ظ†ظ‚ظ„ ط®ط§طµط© ظˆط¥ط·ظ„ط§ظ„ط§طھ ط¹ظ„ظ‰ ط§ظ„ط¬ط²ط±.",
    amenities: ["wifi", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "ط§ظ„ظ…ط·ط§ط±", distance: "45 ط¯ظ‚ظٹظ‚ط©" },
      { name: "ط§ظ„ط´ط§ط·ط¦ ط§ظ„ط®ط§طµ", distance: "ط¯ط§ط®ظ„ ط§ظ„ظ…ظ†طھط¬ط¹" },
    ],
    cuisine: "ظ…ط£ظƒظˆظ„ط§طھ ط¨ط­ط±ظٹط© ظˆظ…ط­ظ„ظٹط© - 3 ظ…ط·ط§ط¹ظ…",
    tag: "ظˆط¬ظ‡ط© ط´ط§ط·ط¦ظٹط©",
  },
];

export const defaultOffers: OfferItem[] = [
  {
    id: "offer-1",
    title: "ط¨ط§ظ‚ط© ط§ظ„ط¹ظڈظ„ط§ ط§ظ„طھط±ط§ط«ظٹط©",
    description: "ط§ظƒطھط´ظپ ظ…ط¯ط§ط¦ظ† طµط§ظ„ط­ ظˆطھط¬ط§ط±ط¨ ط§ظ„طµط­ط±ط§ط، ظپظٹ ط¨ط±ظ†ط§ظ…ط¬ ط´ط§ظ…ظ„ ظ„ظ„ط·ظٹط±ط§ظ† ظˆط§ظ„ط¥ظ‚ط§ظ…ط© ظˆط§ظ„ط¬ظˆظ„ط§طھ.",
    image: "https://images.unsplash.com/photo-1534080764596-47f3efd8e0d5?w=800",
    discount: 20,
    validUntil: "ط­طھظ‰ ظ†ظ‡ط§ظٹط© ط§ظ„ظ…ظˆط³ظ…",
    originalPrice: "4,200",
    newPrice: "3,350",
    season: "ط§ظ„ط´طھط§ط، ظˆط§ظ„ط±ط¨ظٹط¹",
    includes: ["ط·ظٹط±ط§ظ† ط¯ط§ط®ظ„ظٹ ط°ظ‡ط§ط¨ ظˆط¹ظˆط¯ط©", "ط¥ظ‚ط§ظ…ط© 3 ظ„ظٹط§ظ„ظچ", "ط¬ظˆظ„ط© ط£ط«ط±ظٹط© ظپظٹ ظ‡ظگط¬ط±ط§", "طھظ†ظ‚ظ„ط§طھ ط¯ط§ط®ظ„ظٹط©"],
    tips: [
      "ط§ط­ط¬ط² ظ…ط¨ظƒط±ظ‹ط§ ظ„ط¹ط±ظˆط¶ ط§ظ„ظ…ط®ظٹظ…ط§طھ ط§ظ„ظپط§ط®ط±ط©",
      "ظٹظڈظپط¶ظ„ ط§ظ„ط³ظپط± ظپظٹ ط§ظ„طµط¨ط§ط­ ظ„ظ„ط§ط³طھظپط§ط¯ط© ظ…ظ† ط§ظ„ط·ظ‚ط³",
      "ط§ط±طھط¯ظگ ط£ط­ط°ظٹط© ظ…ط±ظٹط­ط© ظ„ظ„ط£ظ†ط´ط·ط© ط§ظ„طµط­ط±ط§ظˆظٹط©",
    ],
  },
  {
    id: "offer-2",
    title: "ط³ط­ط± ط§ظ„ط¨ط­ط± ط§ظ„ط£ط­ظ…ط±",
    description: "ظ…ظ†طھط¬ط¹ط§طھ ط´ط§ط·ط¦ظٹط© ظˆط£ظ†ط´ط·ط© ط¨ط­ط±ظٹط© ظ…ط¹ ط¨ط±ظ†ط§ظ…ط¬ ظ…طھظƒط§ظ…ظ„ ظ„ظ„ط¹ط§ط¦ظ„ط§طھ.",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
    discount: 18,
    validUntil: "ط­طھظ‰ ظ†ظ‡ط§ظٹط© ط§ظ„ظ…ظˆط³ظ…",
    originalPrice: "5,600",
    newPrice: "4,600",
    season: "ط·ظˆط§ظ„ ط§ظ„ط¹ط§ظ…",
    includes: ["ط¥ظ‚ط§ظ…ط© 4 ظ„ظٹط§ظ„ظچ ظپظٹ ظ…ظ†طھط¬ط¹ ط¨ط­ط±ظٹ", "ط£ظ†ط´ط·ط© ط؛ظˆطµ ظˆط±ظٹط§ط¶ط§طھ ظ…ط§ط¦ظٹط©", "طھظ†ظ‚ظ„ط§طھ ط®ط§طµط©"],
    tips: [
      "ط§ط­ط¬ط² ط؛ط±ظپظ‹ط§ ط¨ط¥ط·ظ„ط§ظ„ط© ط¨ط­ط±ظٹط© ظ…ط¨ظƒط±ظ‹ط§",
      "ط§طµط·ط­ط¨ ظˆط§ظ‚ظٹ ط´ظ…ط³ ظˆظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط؛ظˆطµ",
      "ط£ط¶ظپ ط±ط­ظ„ط© ط¨ط­ط±ظٹط© ط®ط§طµط© ط¹ظ†ط¯ ط§ظ„ط؛ط±ظˆط¨",
    ],
  },
  {
    id: "offer-3",
    title: "ط¯ط¨ظٹ ط§ظ„ط¹ط§ط¦ظ„ظٹط© ط§ظ„ط´ط§ظ…ظ„ط©",
    description: "ط¨ط§ظ‚ط© طھط´ظ…ظ„ ط§ظ„ط·ظٹط±ط§ظ† ظˆط§ظ„ظپظ†ط¯ظ‚ ظˆط§ظ„ط£ظ†ط´ط·ط© ط§ظ„طھط±ظپظٹظ‡ظٹط© ظˆط§ظ„ظ…ظˆط§طµظ„ط§طھ.",
    image: "https://images.unsplash.com/photo-1512453995560-851157e9a028?w=800",
    discount: 30,
    validUntil: "ط­طھظ‰ ظ†ظ‡ط§ظٹط© ط§ظ„ظ…ظˆط³ظ…",
    originalPrice: "4,500",
    newPrice: "3,150",
    season: "ط§ظ„ط´طھط§ط،",
    includes: ["طھط°ظƒط±ط© ط·ظٹط±ط§ظ† ط°ظ‡ط§ط¨ ظˆط¹ظˆط¯ط©", "ط¥ظ‚ط§ظ…ط© 4 ظ„ظٹط§ظ„ظچ", "طھط°ط§ظƒط± ط£ظ†ط´ط·ط© ط¹ط§ط¦ظ„ظٹط©", "طھظ†ظ‚ظ„ط§طھ ظٹظˆظ…ظٹط©"],
    tips: ["ط§ط­ط¬ط² طھط°ط§ظƒط± ط§ظ„ظپط¹ط§ظ„ظٹط§طھ ظ…ط³ط¨ظ‚ظ‹ط§", "ط§ط®طھط± ظپظ†ط¯ظ‚ظ‹ط§ ظ‚ط±ظٹط¨ظ‹ط§ ظ…ظ† ط§ظ„ظ…ط±ط§ظƒط² ط§ظ„طھط±ظپظٹظ‡ظٹط©"],
  },
  {
    id: "offer-4",
    title: "ط§ط³طھظƒط´ط§ظپ ط¥ط³ط·ظ†ط¨ظˆظ„ ط§ظ„طھط§ط±ظٹط®ظٹط©",
    description: "ط¬ظˆظ„ط§طھ ط«ظ‚ط§ظپظٹط© ظˆط£ط³ظˆط§ظ‚ طھظ‚ظ„ظٹط¯ظٹط© ظ…ط¹ ط¨ط§ظ‚ط© ط§ظ‚طھطµط§ط¯ظٹط© ط´ط§ظ…ظ„ط©.",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
    discount: 28,
    validUntil: "ط­طھظ‰ ظ†ظ‡ط§ظٹط© ط§ظ„ظ…ظˆط³ظ…",
    originalPrice: "5,000",
    newPrice: "3,600",
    season: "ط§ظ„ط±ط¨ظٹط¹ ظˆط§ظ„ط®ط±ظٹظپ",
    includes: ["ط·ظٹط±ط§ظ† + ظپظ†ط¯ظ‚ 4 ظ†ط¬ظˆظ…", "ط¬ظˆظ„ط© ط§ظ„ط¨ظˆط³ظپظˆط±", "ط²ظٹط§ط±ط© ط§ظ„ط£ط³ظˆط§ظ‚ ط§ظ„طھط±ط§ط«ظٹط©"],
    tips: ["ط®طµطµ ظٹظˆظ…ظ‹ط§ ظ„ط²ظٹط§ط±ط© ظƒط§ط¨ط§ط¯ظˆظƒظٹط§ ط¥ط°ط§ ط£ظ…ظƒظ†", "ط¬ط±ط¨ ط§ظ„ظ…ط·ط§ط¹ظ… ط§ظ„ظ…ط­ظ„ظٹط© ط¨ط¹ظٹط¯ظ‹ط§ ط¹ظ† ط§ظ„ط²ط­ط§ظ…"],
  },
  {
    id: "offer-5",
    title: "ط´طھط§ط، ط¬ظ†ظٹظپ ط§ظ„ظپط§ط®ط±",
    description: "ط¨ط§ظ‚ط© ط´طھظˆظٹط© طھط´ظ…ظ„ ط§ظ„ط·ظٹط±ط§ظ† ظˆط§ظ„ظپظ†ط¯ظ‚ ط§ظ„ظپط§ط®ط± ظˆطھط¬ط±ط¨ط© ط§ظ„طھط²ظ„ط¬ ظ…ط¹ ظ…ط±ط´ط¯.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    discount: 22,
    validUntil: "ط­طھظ‰ ظ†ظ‡ط§ظٹط© ط§ظ„ط´طھط§ط،",
    originalPrice: "8,500",
    newPrice: "6,600",
    season: "ط§ظ„ط´طھط§ط،",
    includes: ["ط·ظٹط±ط§ظ† ط°ظ‡ط§ط¨ ظˆط¹ظˆط¯ط©", "ط¥ظ‚ط§ظ…ط© 4 ظ„ظٹط§ظ„ظچ", "طھط°ط§ظƒط± طھط²ظ„ط¬", "طھظ†ظ‚ظ„ط§طھ ظٹظˆظ…ظٹط©"],
    tips: ["ط§ط­ط¬ط² ظ…ط¹ط¯ط§طھ ط§ظ„طھط²ظ„ط¬ ظ…ط³ط¨ظ‚ظ‹ط§", "ط§ط®طھط± ط§ظ„ط؛ط±ظپط© ط¨ط¥ط·ظ„ط§ظ„ط© ط¹ظ„ظ‰ ط§ظ„ط¨ط­ظٹط±ط©"],
  },
  {
    id: "offer-6",
    title: "ظ…ط؛ط§ظ…ط±ط© ظƒظٹط¨ طھط§ظˆظ†",
    description: "ط¨ط±ظ†ط§ظ…ط¬ ظ…ط؛ط§ظ…ط±ط§طھ ظٹط´ظ…ظ„ ط§ظ„ط³ظپط§ط±ظٹ ظˆط§ظ„ط¬ط¨ط§ظ„ ظ…ط¹ ط¥ظ‚ط§ظ…ط© ظ…ط±ظٹط­ط©.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    discount: 18,
    validUntil: "ط­طھظ‰ ظ†ظ‡ط§ظٹط© ط§ظ„ط±ط¨ظٹط¹",
    originalPrice: "7,200",
    newPrice: "5,900",
    season: "ط§ظ„ط±ط¨ظٹط¹",
    includes: ["ط·ظٹط±ط§ظ† + ظپظ†ط¯ظ‚", "ط±ط­ظ„ط© ط³ظپط§ط±ظٹ", "ط¬ظˆظ„ط© ط¬ط¨ظ„ ط§ظ„ط·ط§ظˆظ„ط©"],
    tips: ["ط§ط¬ط¹ظ„ ط¬ط¯ظˆظ„ظƒ ظ…ط±ظ†ظ‹ط§ ظ„ظ„ط·ظ‚ط³", "ط£ط¶ظپ ط²ظٹط§ط±ط© ظ…ط²ط§ط±ط¹ ط§ظ„ظƒط±ظˆظ…"],
  },
];

export const defaultActivities: ActivityItem[] = [
  {
    id: "activity-1",
    title: "ظ…ظ‡ط±ط¬ط§ظ† ط§ظ„ط¨ط­ط± ط§ظ„ط£ط­ظ…ط±",
    location: "ط¬ط¯ط©",
    category: "ظ…ظ‡ط±ط¬ط§ظ†ط§طھ",
    price: "450",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
  },
  {
    id: "activity-2",
    title: "ط³ط¨ط§ظ‚ ط§ظ„طµط­ط§ط±ظ‰",
    location: "ط§ظ„ط¹ظڈظ„ط§",
    category: "ظ…ط؛ط§ظ…ط±ط§طھ",
    price: "650",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
  {
    id: "activity-3",
    title: "ظƒط±ظ†ظپط§ظ„ ط§ظ„ط±ظٹط§ط¶",
    location: "ط§ظ„ط±ظٹط§ط¶",
    category: "ظپط¹ط§ظ„ظٹط§طھ",
    price: "300",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200",
  },
  {
    id: "activity-4",
    title: "ط±ط­ظ„ط© ط؛ظˆطµ ط®ط§طµط©",
    location: "ط§ظ„ط¨ط­ط± ط§ظ„ط£ط­ظ…ط±",
    category: "ط£ظ†ط´ط·ط© ط¨ط­ط±ظٹط©",
    price: "900",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200",
  },
  {
    id: "activity-5",
    title: "ظ…ظ‡ط±ط¬ط§ظ† ط§ظ„ط¹ظˆط¯ ط§ظ„ط«ظ‚ط§ظپظٹ",
    location: "ط§ظ„ط±ظٹط§ط¶",
    category: "ط«ظ‚ط§ظپط© ظˆظپظ†ظˆظ†",
    price: "250",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200",
  },
  {
    id: "activity-6",
    title: "طھط­ط¯ظٹ ط§ظ„ط±ط¨ط¹ ط§ظ„ط®ط§ظ„ظٹ",
    location: "ط§ظ„ظ…ظ†ط·ظ‚ط© ط§ظ„ط´ط±ظ‚ظٹط©",
    category: "ظ…ط؛ط§ظ…ط±ط§طھ",
    price: "780",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
  },
];

export const defaultArticles: ArticleItem[] = [
  {
    id: "article-1",
    title: "ط£ظپط¶ظ„ ظˆظ‚طھ ظ„ط²ظٹط§ط±ط© ط§ظ„ط¹ظڈظ„ط§ ظˆظ„ظ…ط§ط°ط§ ظٹظپط¶ظ‘ظ„ظ‡ط§ ط¹ط´ط§ظ‚ ط§ظ„ط·ط¨ظٹط¹ط©",
    category: "ط³ظٹط§ط­ط© ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1534080764596-47f3efd8e0d5?w=1200",
  },
  {
    id: "article-2",
    title: "ط¯ظ„ظٹظ„ ط§ظ„ظ…ط³ط§ظپط± ط§ظ„ط°ظƒظٹ: ظƒظٹظپ طھط®طھط§ط± ط§ظ„ظپظ†ط¯ظ‚ ط§ظ„ظ…ظ†ط§ط³ط¨ ظ„ط¹ط§ط¦ظ„طھظƒطں",
    category: "ظ†طµط§ط¦ط­ ط§ظ„ط³ظپط±",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200",
  },
  {
    id: "article-3",
    title: "ط®ط·ظˆط§طھ ط§ط³طھط®ط±ط§ط¬ ط§ظ„طھط£ط´ظٹط±ط© ط§ظ„ط³ظٹط§ط­ظٹط© ط¨ط³ظ‡ظˆظ„ط© ظ„ظ„ظ…ط³ط§ظپط±ظٹظ† ط§ظ„ط³ط¹ظˆط¯ظٹظٹظ†",
    category: "ط¥ط¬ط±ط§ط،ط§طھ ط§ظ„ط³ظپط±",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
  },
  {
    id: "article-4",
    title: "ط£ط¨ط±ط² ط§ظ„ظˆط¬ظ‡ط§طھ ط§ظ„ط¹ط±ط¨ظٹط© ظ„ظ„ط¹ط·ظ„ط§طھ ط§ظ„ظ‚طµظٹط±ط© ظپظٹ ظ†ظ‡ط§ظٹط© ط§ظ„ط£ط³ط¨ظˆط¹",
    category: "ظˆط¬ظ‡ط§طھ ظ‚ط±ظٹط¨ط©",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
  },
  {
    id: "article-5",
    title: "ط£ظپط¶ظ„ ط§ظ„ظ…ط¯ظ† ط§ظ„ط£ظˆط±ظˆط¨ظٹط© ط§ظ„ظ…ظ†ط§ط³ط¨ط© ظ„ظ„ط¹ط§ط¦ظ„ط§طھ ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    category: "ظˆط¬ظ‡ط§طھ ط¹ط§ظ„ظ…ظٹط©",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200",
  },
  {
    id: "article-6",
    title: "ظ‚ط§ط¦ظ…ط© طھط¬ظ‡ظٹط²ط§طھ ط§ظ„ط³ظپط± ط§ظ„ط°ظƒظٹط© ظ„ظ„ظ…ظˆط³ظ… ط§ظ„ط´طھظˆظٹ",
    category: "ظ†طµط§ط¦ط­ ط§ظ„ط³ظپط±",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
  },
  {
    id: "article-7",
    title: "ط§طھط¬ط§ظ‡ط§طھ ط§ظ„ط³ظٹط§ط­ط© ط§ظ„ط¹ط§ظ„ظ…ظٹط© ظپظٹ 2026: ط§ظ„ط§ط³طھط¯ط§ظ…ط© ظˆط§ظ„ط±ط­ظ„ط§طھ ط§ظ„ظ‚طµظٹط±ط©",
    category: "ط£ط®ط¨ط§ط± ط¹ط§ظ„ظ…ظٹط©",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200",
  },
  {
    id: "article-8",
    title: "ط£ظپط¶ظ„ ط§ظ„ظ…ط¯ظ† ط§ظ„ط¢ط³ظٹظˆظٹط© ط§ظ„ظ…ظ†ط§ط³ط¨ط© ظ„ظ„ط¹ط§ط¦ظ„ط§طھ ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    category: "ظˆط¬ظ‡ط§طھ ط¹ط§ظ„ظ…ظٹط©",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
  {
    id: "article-9",
    title: "ط¯ظ„ظٹظ„ ط§ظ„ط³ظپط± ظپظٹ ظ…ظˆط§ط³ظ… ط§ظ„ط°ط±ظˆط© ظˆظƒظٹظپ طھطھط¬ظ†ط¨ ط§ط±طھظپط§ط¹ ط§ظ„ط£ط³ط¹ط§ط±",
    category: "ط¥ط±ط´ط§ط¯ط§طھ",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200",
  },
  {
    id: "article-10",
    title: "ط±ط­ظ„ط§طھ ط§ظ„ظƒط±ظˆط²: طھط¬ط±ط¨ط© ط¨ط­ط±ظٹط© طھط¬ظ…ط¹ ط§ظ„طھط±ظپظٹظ‡ ظˆط§ظ„ط§ط³طھط±ط®ط§ط،",
    category: "طھط¬ط§ط±ط¨ ط³ظپط±",
    date: "ظپط¨ط±ط§ظٹط± 2026",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
  },
];

export const defaultDestinations: DestinationItem[] = [
  {
    id: "dest-1",
    title: "ط¬ظˆط±ط¬ظٹط§",
    country: "طھط¨ظ„ظٹط³ظٹ ظˆط¨ط§طھظˆظ…ظٹ",
    region: "international",
    tag: "ط´طھظˆظٹط©",
    duration: "5 ط£ظٹط§ظ…",
    priceFrom: "2,600",
    description: "ط·ط¨ظٹط¹ط© ط®ط¶ط±ط§ط،طŒ ط¬ط¨ط§ظ„ ط®ظ„ط§ط¨ط©طŒ ظˆط£ط³ظˆط§ظ‚ ط´ط¹ط¨ظٹط© طھظ†ط§ط³ط¨ ط§ظ„ط¹ط§ط¦ظ„ط©.",
    image: "https://source.unsplash.com/1200x800/?georgia,tbilisi,travel",
  },
  {
    id: "dest-2",
    title: "ظƒط§ط¨ط§ط¯ظˆظƒظٹط§",
    country: "طھط±ظƒظٹط§",
    region: "international",
    tag: "ط±ظˆظ…ط§ظ†ط³ظٹط©",
    duration: "4 ط£ظٹط§ظ…",
    priceFrom: "3,150",
    description: "ظ…ظ†ط§ط¸ط± ط¨ط§ظ„ظˆظ†ط§طھ ط§ظ„ظ‡ظˆط§ط، ظˆطھط¬ط§ط±ط¨ ط³ظٹط§ط­ظٹط© ظ…ظ…ظٹط²ط© ظ„ظ„ط²ظˆط¬ظٹظ†.",
    image: "https://source.unsplash.com/1200x800/?cappadocia,balloons,travel",
  },
  {
    id: "dest-3",
    title: "ط§ظ„ظ…ط§ظ„ط¯ظٹظپ",
    country: "ط§ظ„ظ…ط­ظٹط· ط§ظ„ظ‡ظ†ط¯ظٹ",
    region: "international",
    tag: "ظپط§ط®ط±",
    duration: "6 ط£ظٹط§ظ…",
    priceFrom: "6,900",
    description: "ظ…ظ†طھط¬ط¹ط§طھ ظپط®ظ…ط© ط¹ظ„ظ‰ ط§ظ„ظ…ط§ط، ظˆطھط¬ط§ط±ط¨ ط¨ط­ط±ظٹط© ط­طµط±ظٹط©.",
    image: "https://source.unsplash.com/1200x800/?maldives,beach,resort",
  },
  {
    id: "dest-4",
    title: "ط§ظ„ط±ظٹط§ط¶ ظˆط§ظ„ط¯ط±ط¹ظٹط©",
    country: "ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    region: "saudi",
    tag: "طھط±ط§ط«",
    duration: "3 ط£ظٹط§ظ…",
    priceFrom: "1,200",
    description: "طھط±ط§ط« ط³ط¹ظˆط¯ظٹ ط£طµظٹظ„ ظˆطھط¬ط§ط±ط¨ ط­ط¶ط§ط±ظٹط© ظˆظ…ط¹ط§ط±ط¶ ط«ظ‚ط§ظپظٹط©.",
    image: "https://source.unsplash.com/1200x800/?riyadh,diriyah,saudi",
  },
  {
    id: "dest-5",
    title: "ط£ط°ط±ط¨ظٹط¬ط§ظ†",
    country: "ط¨ط§ظƒظˆ ظˆظ‚ظˆط¨ط§",
    region: "international",
    tag: "ط¹ط§ط¦ظ„ظٹ",
    duration: "5 ط£ظٹط§ظ…",
    priceFrom: "3,400",
    description: "ط·ط¨ظٹط¹ط© ط¬ط¨ظ„ظٹط© ظˆط£ط³ظˆط§ظ‚ ط­ط¯ظٹط«ط© ظˆط£ظ†ط´ط·ط© ظ…ظ†ط§ط³ط¨ط© ظ„ظ„ط¹ط§ط¦ظ„ط©.",
    image: "https://source.unsplash.com/1200x800/?baku,azerbaijan,travel",
  },
  {
    id: "dest-6",
    title: "طµظ„ط§ظ„ط©",
    country: "ط³ظ„ط·ظ†ط© ط¹ظ…ط§ظ†",
    region: "middleeast",
    tag: "طµظٹظپظٹط©",
    duration: "4 ط£ظٹط§ظ…",
    priceFrom: "2,100",
    description: "ط®ط±ظٹظپ طµظ„ط§ظ„ط©طŒ ط´ظ„ط§ظ„ط§طھ ظˆط¶ط¨ط§ط¨ ظˆط¬ظˆظ„ط§طھ ط·ط¨ظٹط¹ظٹط© ظ…ظ†ط¹ط´ط©.",
    image: "https://source.unsplash.com/1200x800/?salalah,oman,landscape",
  },
  {
    id: "dest-7",
    title: "ط§ظ„ط¹ظڈظ„ط§",
    country: "ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    region: "saudi",
    tag: "طھط±ط§ط«",
    duration: "3 ط£ظٹط§ظ…",
    priceFrom: "1,450",
    description: "ظ…ط؛ط§ظ…ط±ط§طھ طµط­ط±ط§ظˆظٹط© ظˆظ…ظˆط§ظ‚ط¹ طھط±ط§ط« ط¹ط§ظ„ظ…ظٹ ظˆطھط¬ط§ط±ط¨ ط«ظ‚ط§ظپظٹط© ط­ظٹط©.",
    image: "https://source.unsplash.com/1200x800/?alula,saudi,desert",
  },
  {
    id: "dest-8",
    title: "ط¬ط¯ط©",
    country: "ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    region: "saudi",
    tag: "ط¨ط­ط±ظٹط©",
    duration: "3 ط£ظٹط§ظ…",
    priceFrom: "980",
    description: "ظƒظˆط±ظ†ظٹط´ ط³ط§ط­ط± ظˆط£ط³ظˆط§ظ‚ طھط§ط±ظٹط®ظٹط© ظˆطھط¬ط§ط±ط¨ ط¨ط­ط±ظٹط© ظ…ظ…طھط¹ط©.",
    image: "https://source.unsplash.com/1200x800/?jeddah,saudi,sea",
  },
  {
    id: "dest-9",
    title: "ط¯ط¨ظٹ",
    country: "ط§ظ„ط¥ظ…ط§ط±ط§طھ",
    region: "middleeast",
    tag: "ط¹ط§ط¦ظ„ظٹ",
    duration: "4 ط£ظٹط§ظ…",
    priceFrom: "2,350",
    description: "طھط¬ط§ط±ط¨ طھط³ظˆظ‚ ظˆطھط±ظپظٹظ‡ ظˆظ…ط·ط§ط¹ظ… ط¹ط§ظ„ظ…ظٹط© طھظ†ط§ط³ط¨ ط§ظ„ط¹ط§ط¦ظ„ط©.",
    image: "https://source.unsplash.com/1200x800/?dubai,skyline,travel",
  },
  {
    id: "dest-10",
    title: "ط§ظ„ط¯ظˆط­ط©",
    country: "ظ‚ط·ط±",
    region: "middleeast",
    tag: "ط«ظ‚ط§ظپظٹط©",
    duration: "3 ط£ظٹط§ظ…",
    priceFrom: "1,950",
    description: "ظ…طھط§ط­ظپ ط¹ط§ظ„ظ…ظٹط© ظˆط£ط³ظˆط§ظ‚ طھظ‚ظ„ظٹط¯ظٹط© ظˆط¥ط·ظ„ط§ظ„ط© ط¨ط­ط±ظٹط© ط£ظ†ظٹظ‚ط©.",
    image: "https://source.unsplash.com/1200x800/?doha,qatar,corniche",
  },
  {
    id: "dest-11",
    title: "ظ„ظ†ط¯ظ†",
    country: "ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ظ…طھط­ط¯ط©",
    region: "international",
    tag: "طھط¹ظ„ظٹظ…",
    duration: "6 ط£ظٹط§ظ…",
    priceFrom: "4,750",
    description: "ظ…ط¯ظٹظ†ط© ط«ظ‚ط§ظپظٹط© ظ…ظ†ط§ط³ط¨ط© ظ„ظ„ط¯ط±ط§ط³ط© ظˆط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ظ…طھظ†ظˆط¹ط©.",
    image: "https://source.unsplash.com/1200x800/?london,uk,travel",
  },
  {
    id: "dest-12",
    title: "ط¨ط§ط±ظٹط³",
    country: "ظپط±ظ†ط³ط§",
    region: "international",
    tag: "ط±ظˆظ…ط§ظ†ط³ظٹط©",
    duration: "5 ط£ظٹط§ظ…",
    priceFrom: "4,200",
    description: "طھط¬ط§ط±ط¨ ظپظ†ظٹط© ظˆظ…ط·ط§ط¹ظ… ط±ط§ظ‚ظٹط© ظˆظ…ط¹ط§ظ„ظ… طھط§ط±ظٹط®ظٹط© ط®ظ„ط§ط¨ط©.",
    image: "https://source.unsplash.com/1200x800/?paris,eiffel,travel",
  },
];

export const defaultPartners: PartnerItem[] = [
  {
    id: "partner-1",
    name: "Booking.com",
    type: "ظپظ†ط§ط¯ظ‚",
    website: "https://www.booking.com",
    commission: "8%",
  },
  {
    id: "partner-2",
    name: "Skyscanner",
    type: "ط·ظٹط±ط§ظ†",
    website: "https://www.skyscanner.net",
    commission: "6%",
  },
];

export const defaultAirlines: AirlineItem[] = [
  {
    id: "airline-1",
    name: "ط§ظ„ط®ط·ظˆط· ط§ظ„ط³ط¹ظˆط¯ظٹط©",
    code: "SV",
    website: "https://www.saudia.com",
    phone: "+966 920022222",
    logo: "https://logo.clearbit.com/saudia.com",
  },
  {
    id: "airline-2",
    name: "ط·ظٹط±ط§ظ† ظ†ط§ط³",
    code: "XY",
    website: "https://www.flynas.com",
    phone: "+966 920001234",
    logo: "https://logo.clearbit.com/flynas.com",
  },
  {
    id: "airline-3",
    name: "ط·ظٹط±ط§ظ† ط§ظ„ط¥ظ…ط§ط±ط§طھ",
    code: "EK",
    website: "https://www.emirates.com",
    phone: "+971 600555555",
    logo: "https://logo.clearbit.com/emirates.com",
  },
  {
    id: "airline-4",
    name: "ط§ظ„ط®ط·ظˆط· ط§ظ„ظ‚ط·ط±ظٹط©",
    code: "QR",
    website: "https://www.qatarairways.com",
    phone: "+974 40230000",
    logo: "https://logo.clearbit.com/qatarairways.com",
  },
  {
    id: "airline-5",
    name: "ظ…طµط± ظ„ظ„ط·ظٹط±ط§ظ†",
    code: "MS",
    website: "https://www.egyptair.com",
    phone: "+202 2598 0000",
    logo: "https://logo.clearbit.com/egyptair.com",
  },
  {
    id: "airline-6",
    name: "ط§ظ„ط¹ط±ط¨ظٹط© ظ„ظ„ط·ظٹط±ط§ظ†",
    code: "G9",
    website: "https://www.airarabia.com",
    phone: "+971 600508001",
    logo: "https://logo.clearbit.com/airarabia.com",
  },
  {
    id: "airline-7",
    name: "flyadeal",
    code: "F3",
    website: "https://www.flyadeal.com",
    phone: "+966 920000212",
    logo: "https://logo.clearbit.com/flyadeal.com",
  },
];

export const defaultApiKeys: ApiKeyItem[] = [
  
];

export const defaultUsers: ManagedUserItem[] = [
  {
    id: "user-1",
    name: "ط£ط­ظ…ط¯ ط§ظ„ط¹طھظٹط¨ظٹ",
    email: "ahmed@example.com",
    role: "user",
    status: "active",
  },
  {
    id: "user-2",
    name: "ظپط±ظٹظ‚ ط§ظ„ط¥ط¯ط§ط±ط©",
    email: "admin@mashrouk.com",
    role: "admin",
    status: "active",
  },
];

export const defaultPages: PageItem[] = [
  {
    id: "page-1",
    title: "ط¹ظ† ط§ظ„ظ…ظ†طµط©",
    slug: "/about",
    summary: "طھط¹ط±ظٹظپ ط¨ط§ظ„ظ…ظ†طµط© ظˆظ„ظ…ط§ط°ط§ ظ†ط«ظ‚ ط¨ظ‡ط§.",
  },
  {
    id: "page-2",
    title: "ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط©",
    slug: "/privacy",
    summary: "ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط© ظˆط­ظ…ط§ظٹط© ط§ظ„ط¨ظٹط§ظ†ط§طھ.",
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
  contactAddress: "ط§ظ„ط±ظٹط§ط¶طŒ ط§ظ„ظ…ظ…ظ„ظƒط© ط§ظ„ط¹ط±ط¨ظٹط© ط§ظ„ط³ط¹ظˆط¯ظٹط©",
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

const asString = (value: unknown, fallback = "") => (value === null || value === undefined ? fallback : String(value));
const asNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};
const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => String(item)) : [];
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
      promoVideoUrl: row.promo_video_url ?? "",
      appDownloadImageUrl: row.app_download_image_url ?? "",
      appDownloadLink: row.app_download_link ?? "",
      featuredImageUrl: row.featured_image_url ?? "",
      featuredTitle: row.featured_title ?? "",
      featuredDescription: row.featured_description ?? "",
      featuredLink: row.featured_link ?? "",
      contactPhone: row.contact_phone ?? defaultAdminSettings.contactPhone,
      contactEmail: row.contact_email ?? defaultAdminSettings.contactEmail,
      contactWhatsapp: row.contact_whatsapp ?? defaultAdminSettings.contactWhatsapp,
      contactAddress: row.contact_address ?? defaultAdminSettings.contactAddress,
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

