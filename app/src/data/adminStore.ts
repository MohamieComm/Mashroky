// ��� ��� ����� ����� ����� ���� (amadeus, supabase, moyasar...)
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
    title: "����� ����� ��� ��� �������",
    season: "ramadan",
    description: "���� ����� ������� �� ��� ������� ���� ��� ����� ������ߡ ���� ����� ���������� ������ ������ ��� ������ ������.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
    price: "2,500",
    options: ["��� 4 ����", "������� ����", "����� ����"],
  },
  {
    id: "season-hajj",
    title: "���� ���� �������",
    season: "hajj",
    description: "���� ���� �� ����� ����� ���������� �������ϡ ����� ������ ����� ���� ����������.",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800",
    price: "7,500",
    options: ["��� ���� �� �����", "������� �����", "����� ����"],
  },
  {
    id: "season-summer",
    title: "����� ����� ���������� �� ������ (�����)",
    season: "summer",
    description: "���� ������ ����� ���������� �� �������� �� ������ ���� ������� ������ɡ ���� ����� �������� ����������.",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800",
    price: "12,000",
    options: ["��� ����� �� �����", "���� ��� �����", "����� ������"],
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
    from: "������",
    to: "���",
    airline: "������ ��������",
    departTime: "08:00",
    arriveTime: "10:00",
    duration: "2 ����",
    price: "650",
    stops: "�����",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1520425155577-aaad47db1d1f?w=400",
  },
  {
    id: "flight-2",
    from: "���",
    to: "�������",
    airline: "����� ���",
    departTime: "14:30",
    arriveTime: "19:00",
    duration: "4.5 ����",
    price: "1,200",
    stops: "�����",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400",
  },
  {
    id: "flight-3",
    from: "������",
    to: "�������",
    airline: "��� �������",
    departTime: "06:00",
    arriveTime: "08:30",
    duration: "2.5 ����",
    price: "800",
    stops: "�����",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400",
  },
  {
    id: "flight-4",
    from: "������",
    to: "�����",
    airline: "������ ��������",
    departTime: "22:00",
    arriveTime: "06:00",
    duration: "8 �����",
    price: "3,500",
    stops: "���� �����",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1500422017585-53bff1160f14?w=400",
  },
  {
    id: "flight-5",
    from: "������",
    to: "����",
    airline: "������ ����������",
    departTime: "13:45",
    arriveTime: "19:30",
    duration: "6.5 ����",
    price: "2,900",
    stops: "�����",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1505236858576-d1b2c6ce53b9?w=400",
  },
  {
    id: "flight-6",
    from: "���",
    to: "������",
    airline: "������ ����������",
    departTime: "23:00",
    arriveTime: "09:30",
    duration: "8.5 ����",
    price: "2,400",
    stops: "���� �����",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
  },
];

export const defaultHotels: HotelItem[] = [
  {
    id: "hotel-1",
    name: "���� ��� ����� �����",
    location: "���� �������� ������� �������",
    image: "https://images.unsplash.com/photo-1512453995560-851157e9a028?w=800",
    rating: 5,
    reviews: 2450,
    price: "3,500",
    priceNote: "����� �������",
    description: "���� 7 ���� ���� ����� ����� �� ���� ��� �� ������� ����� ��� ������ ������",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "������", distance: "25 �����" },
      { name: "��� ���", distance: "15 �����" },
      { name: "��� �����", distance: "20 �����" },
    ],
    cuisine: "������� ������ ������ - 9 ����� �����",
    tag: "������ �����",
  },
  {
    id: "hotel-2",
    name: "���� ��� ������ ��������",
    location: "������� �����",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
    rating: 4.9,
    reviews: 1890,
    price: "1,800",
    priceNote: "����� �������",
    description: "���� ������ ��� ���� �������� ���� ��� ������� ��������� �������� �������",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool"],
    distances: [
      { name: "������", distance: "40 �����" },
      { name: "������� ������", distance: "10 �����" },
      { name: "��� �����", distance: "5 �����" },
    ],
    cuisine: "������� ����� ������� - 3 �����",
    tag: "������ ��������",
  },
  {
    id: "hotel-3",
    name: "����� �������� ��������",
    location: "��� ��������",
    image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=800",
    rating: 5,
    reviews: 980,
    price: "5,200",
    priceNote: "����� �������",
    description: "����� ����� ��� ����� �� ����� ���� �������� �� ����� ��� ������ ������",
    amenities: ["wifi", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "������ ������", distance: "30 ����� �������" },
      { name: "���� �����", distance: "�� �������" },
    ],
    cuisine: "������� ������ ������� - 4 ����� ��� ������",
    tag: "��� �����",
  },
  {
    id: "hotel-4",
    name: "���� ���� ������� �����",
    location: "����ӡ �����",
    image: "https://images.unsplash.com/photo-1495195129352-a9d3c9469a46?w=800",
    rating: 4.8,
    reviews: 1560,
    price: "4,200",
    priceNote: "����� �������",
    description: "���� ������ �� ��� ����� ���� ������� �������� ��������� ����������",
    amenities: ["wifi", "parking", "breakfast", "gym", "restaurant"],
    distances: [
      { name: "��� ����", distance: "10 �����" },
      { name: "������", distance: "5 �����" },
      { name: "�����������", distance: "�������" },
    ],
    cuisine: "������� ������ ����� - ���� ���� ��� ���� ������",
    tag: "������� ����",
  },
  {
    id: "hotel-5",
    name: "��� ��������",
    location: "������� �������� ������� �������",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
    rating: 4.9,
    reviews: 1320,
    price: "2,900",
    priceNote: "����� �������",
    description: "����� ����� ��� ���� ��� �� ����� ����� ����� ������ �������.",
    amenities: ["wifi", "parking", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "������", distance: "35 �����" },
      { name: "��������", distance: "10 �����" },
      { name: "��� �����", distance: "8 �����" },
    ],
    cuisine: "������� ����� ������� - 7 �����",
    tag: "����� �����",
  },
  {
    id: "hotel-6",
    name: "����� ������ ����� ������",
    location: "����� �����ѡ ��������",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    rating: 4.8,
    reviews: 610,
    price: "3,800",
    priceNote: "����� �������",
    description: "��� ������ ������ ����� ����� �� ���� ��� ���� �������� ��� �����.",
    amenities: ["wifi", "breakfast", "gym", "pool", "restaurant"],
    distances: [
      { name: "������", distance: "45 �����" },
      { name: "������ �����", distance: "���� �������" },
    ],
    cuisine: "������� ����� ������ - 3 �����",
    tag: "���� ������",
  },
];

export const defaultOffers: OfferItem[] = [
  {
    id: "offer-1",
    title: "���� ������ ��������",
    description: "����� ����� ���� ������ ������� �� ������ ���� ������� �������� ��������.",
    image: "https://images.unsplash.com/photo-1534080764596-47f3efd8e0d5?w=800",
    discount: 20,
    validUntil: "��� ����� ������",
    originalPrice: "4,200",
    newPrice: "3,350",
    season: "������ �������",
    includes: ["����� ����� ���� �����", "����� 3 �����", "���� ����� �� �����", "������ ������"],
    tips: [
      "���� ������ ����� �������� �������",
      "����� ����� �� ������ ��������� �� �����",
      "����� ����� ����� ������� ���������",
    ],
  },
  {
    id: "offer-2",
    title: "��� ����� ������",
    description: "������� ������ ������ ����� �� ������ ������ ��������.",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
    discount: 18,
    validUntil: "��� ����� ������",
    originalPrice: "5,600",
    newPrice: "4,600",
    season: "���� �����",
    includes: ["����� 4 ����� �� ����� ����", "����� ��� ������� �����", "������ ����"],
    tips: [
      "���� ����� ������� ����� ������",
      "����� ���� ��� ��������� �����",
      "��� ���� ����� ���� ��� ������",
    ],
  },
  {
    id: "offer-3",
    title: "��� �������� �������",
    description: "���� ���� ������� ������� �������� ��������� ����������.",
    image: "https://images.unsplash.com/photo-1512453995560-851157e9a028?w=800",
    discount: 30,
    validUntil: "��� ����� ������",
    originalPrice: "4,500",
    newPrice: "3,150",
    season: "������",
    includes: ["����� ����� ���� �����", "����� 4 �����", "����� ����� ������", "������ �����"],
    tips: ["���� ����� ��������� ������", "���� ������ ������ �� ������� ���������"],
  },
  {
    id: "offer-4",
    title: "������� ������� ���������",
    description: "����� ������ ������ ������� �� ���� �������� �����.",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800",
    discount: 28,
    validUntil: "��� ����� ������",
    originalPrice: "5,000",
    newPrice: "3,600",
    season: "������ �������",
    includes: ["����� + ���� 4 ����", "���� ��������", "����� ������� ��������"],
    tips: ["��� ����� ������ ��������� ��� ����", "��� ������� ������� ������ �� ������"],
  },
  {
    id: "offer-5",
    title: "���� ���� ������",
    description: "���� ����� ���� ������� ������� ������ ������ ������ �� ����.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    discount: 22,
    validUntil: "��� ����� ������",
    originalPrice: "8,500",
    newPrice: "6,600",
    season: "������",
    includes: ["����� ���� �����", "����� 4 �����", "����� ����", "������ �����"],
    tips: ["���� ����� ������ ������", "���� ������ ������� ��� �������"],
  },
  {
    id: "offer-6",
    title: "������ ��� ����",
    description: "������ ������� ���� ������� ������� �� ����� �����.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    discount: 18,
    validUntil: "��� ����� ������",
    originalPrice: "7,200",
    newPrice: "5,900",
    season: "������",
    includes: ["����� + ����", "���� �����", "���� ��� �������"],
    tips: ["���� ����� ����� �����", "��� ����� ����� ������"],
  },
];

export const defaultActivities: ActivityItem[] = [
  {
    id: "activity-1",
    title: "������ ����� ������",
    location: "���",
    category: "��������",
    price: "450",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
  },
  {
    id: "activity-2",
    title: "���� �������",
    location: "������",
    category: "�������",
    price: "650",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
  {
    id: "activity-3",
    title: "������ ������",
    location: "������",
    category: "�������",
    price: "300",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200",
  },
  {
    id: "activity-4",
    title: "���� ��� ����",
    location: "����� ������",
    category: "����� �����",
    price: "900",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200",
  },
  {
    id: "activity-5",
    title: "������ ����� �������",
    location: "������",
    category: "����� �����",
    price: "250",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200",
  },
  {
    id: "activity-6",
    title: "���� ����� ������",
    location: "������� �������",
    category: "�������",
    price: "780",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
  },
];

export const defaultArticles: ArticleItem[] = [
  {
    id: "article-1",
    title: "���� ��� ������ ������ ������ ������� ���� �������",
    category: "����� ��������",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1534080764596-47f3efd8e0d5?w=1200",
  },
  {
    id: "article-2",
    title: "���� ������� �����: ��� ����� ������ ������� ������߿",
    category: "����� �����",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200",
  },
  {
    id: "article-3",
    title: "����� ������� �������� �������� ������ ��������� ���������",
    category: "������� �����",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200",
  },
  {
    id: "article-4",
    title: "���� ������� ������� ������� ������� �� ����� �������",
    category: "����� �����",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
  },
  {
    id: "article-5",
    title: "���� ����� ��������� �������� �������� ��������",
    category: "����� ������",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200",
  },
  {
    id: "article-6",
    title: "����� ������� ����� ������ ������ ������",
    category: "����� �����",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200",
  },
  {
    id: "article-7",
    title: "������� ������� �������� �� 2026: ��������� �������� �������",
    category: "����� ������",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200",
  },
  {
    id: "article-8",
    title: "���� ����� �������� �������� �������� ��������",
    category: "����� ������",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  },
  {
    id: "article-9",
    title: "���� ����� �� ����� ������ ���� ����� ������ �������",
    category: "�������",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200",
  },
  {
    id: "article-10",
    title: "����� ������: ����� ����� ���� ������� ����������",
    category: "����� ���",
    date: "������ 2026",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
  },
];

export const defaultDestinations: DestinationItem[] = [
  {
    id: "dest-1",
    title: "������",
    country: "������ �������",
    region: "international",
    tag: "�����",
    duration: "5 ����",
    priceFrom: "2,600",
    description: "����� ������ ���� ����ɡ ������ ����� ����� �������.",
    image: "https://source.unsplash.com/1200x800/?georgia,tbilisi,travel",
  },
  {
    id: "dest-2",
    title: "���������",
    country: "�����",
    region: "international",
    tag: "��������",
    duration: "4 ����",
    priceFrom: "3,150",
    description: "����� ������� ������ ������ ������ ����� �������.",
    image: "https://source.unsplash.com/1200x800/?cappadocia,balloons,travel",
  },
  {
    id: "dest-3",
    title: "��������",
    country: "������ ������",
    region: "international",
    tag: "����",
    duration: "6 ����",
    priceFrom: "6,900",
    description: "������� ���� ��� ����� ������ ����� �����.",
    image: "https://source.unsplash.com/1200x800/?maldives,beach,resort",
  },
  {
    id: "dest-4",
    title: "������ ��������",
    country: "��������",
    region: "saudi",
    tag: "����",
    duration: "3 ����",
    priceFrom: "1,200",
    description: "���� ����� ���� ������ ������ ������ ������.",
    image: "https://source.unsplash.com/1200x800/?riyadh,diriyah,saudi",
  },
  {
    id: "dest-5",
    title: "��������",
    country: "���� �����",
    region: "international",
    tag: "�����",
    duration: "5 ����",
    priceFrom: "3,400",
    description: "����� ����� ������ ����� ������ ������ �������.",
    image: "https://source.unsplash.com/1200x800/?baku,azerbaijan,travel",
  },
  {
    id: "dest-6",
    title: "�����",
    country: "����� ����",
    region: "middleeast",
    tag: "�����",
    duration: "4 ����",
    priceFrom: "2,100",
    description: "���� ����ɡ ������ ����� ������ ������ �����.",
    image: "https://source.unsplash.com/1200x800/?salalah,oman,landscape",
  },
  {
    id: "dest-7",
    title: "������",
    country: "��������",
    region: "saudi",
    tag: "����",
    duration: "3 ����",
    priceFrom: "1,450",
    description: "������� ������� ������ ���� ����� ������ ������ ���.",
    image: "https://source.unsplash.com/1200x800/?alula,saudi,desert",
  },
  {
    id: "dest-8",
    title: "���",
    country: "��������",
    region: "saudi",
    tag: "�����",
    duration: "3 ����",
    priceFrom: "980",
    description: "������ ���� ������ ������� ������ ����� �����.",
    image: "https://source.unsplash.com/1200x800/?jeddah,saudi,sea",
  },
  {
    id: "dest-9",
    title: "���",
    country: "��������",
    region: "middleeast",
    tag: "�����",
    duration: "4 ����",
    priceFrom: "2,350",
    description: "����� ���� ������ ������ ������ ����� �������.",
    image: "https://source.unsplash.com/1200x800/?dubai,skyline,travel",
  },
  {
    id: "dest-10",
    title: "������",
    country: "���",
    region: "middleeast",
    tag: "������",
    duration: "3 ����",
    priceFrom: "1,950",
    description: "����� ������ ������ ������� ������� ����� �����.",
    image: "https://source.unsplash.com/1200x800/?doha,qatar,corniche",
  },
  {
    id: "dest-11",
    title: "����",
    country: "������� �������",
    region: "international",
    tag: "�����",
    duration: "6 ����",
    priceFrom: "4,750",
    description: "����� ������ ������ ������� �������� ��������.",
    image: "https://source.unsplash.com/1200x800/?london,uk,travel",
  },
  {
    id: "dest-12",
    title: "�����",
    country: "�����",
    region: "international",
    tag: "��������",
    duration: "5 ����",
    priceFrom: "4,200",
    description: "����� ���� ������ ����� ������ ������� �����.",
    image: "https://source.unsplash.com/1200x800/?paris,eiffel,travel",
  },
];

export const defaultPartners: PartnerItem[] = [
  {
    id: "partner-1",
    name: "Booking.com",
    type: "�����",
    website: "https://www.booking.com",
    commission: "8%",
  },
  {
    id: "partner-2",
    name: "Skyscanner",
    type: "�����",
    website: "https://www.skyscanner.net",
    commission: "6%",
  },
];

export const defaultAirlines: AirlineItem[] = [
  {
    id: "airline-1",
    name: "������ ��������",
      code: "SV",
      website: "https://www.saudia.com",
      phone: "+966 920022222",
      logo: "https://www.gstatic.com/flights/airline_logos/70px/SV.png",
    },
    {
      id: "airline-2",
      name: "����� ���",
      code: "XY",
      website: "https://www.flynas.com",
      phone: "+966 920001234",
      logo: "https://www.gstatic.com/flights/airline_logos/70px/XY.png",
    },
    {
      id: "airline-3",
      name: "����� ��������",
      code: "EK",
      website: "https://www.emirates.com",
      phone: "+971 600555555",
      logo: "https://www.gstatic.com/flights/airline_logos/70px/EK.png",
    },
    {
      id: "airline-4",
      name: "������ �������",
      code: "QR",
      website: "https://www.qatarairways.com",
      phone: "+974 40230000",
      logo: "https://www.gstatic.com/flights/airline_logos/70px/QR.png",
    },
    {
      id: "airline-5",
      name: "��� �������",
      code: "MS",
      website: "https://www.egyptair.com",
      phone: "+202 2598 0000",
      logo: "https://www.gstatic.com/flights/airline_logos/70px/MS.png",
    },
    {
      id: "airline-6",
      name: "������� �������",
      code: "G9",
      website: "https://www.airarabia.com",
      phone: "+971 600508001",
      logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png",
    },
    {
      id: "airline-7",
      name: "flyadeal",
      code: "F3",
      website: "https://www.flyadeal.com",
      phone: "+966 920000212",
      logo: "https://www.gstatic.com/flights/airline_logos/70px/F3.png",
    },
];

export const defaultApiKeys: ApiKeyItem[] = [
  
];

export const defaultUsers: ManagedUserItem[] = [
  {
    id: "user-1",
    name: "���� �������",
    email: "ahmed@example.com",
    role: "user",
    status: "active",
  },
  {
    id: "user-2",
    name: "���� �������",
    email: "admin@mashrouk.com",
    role: "admin",
    status: "active",
  },
];

export const defaultPages: PageItem[] = [
  {
    id: "page-1",
    title: "�� ������",
    slug: "/about",
    summary: "����� ������� ������ ��� ���.",
  },
  {
    id: "page-2",
    title: "����� ��������",
    slug: "/privacy",
    summary: "����� �������� ������ ��������.",
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
  contactAddress: "�����֡ ������� ������� ��������",
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
const countMojibakeLetters = (value: string) => (value.match(/[طظ]/g) || []).length;

const shouldFixMojibake = (value: string) => {
  const arabicCount = countArabic(value);
  if (!arabicCount) return false;
  return countMojibakeLetters(value) / arabicCount > 0.2;
};

const fixMojibake = (value: string) => {
  if (!value) return value;
  if (!shouldFixMojibake(value)) return value;
  const map = getMojibakeMap();
  if (!map || !utf8Decoder) return value;
  const bytes = new Uint8Array(value.length);
  let index = 0;
  for (const ch of value) {
    const b = map.get(ch);
    if (b === undefined) return value;
    bytes[index++] = b;
  }
  const fixed = utf8Decoder.decode(bytes);
  return shouldFixMojibake(fixed) ? value : fixed;
};

const asString = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return fixMojibake(String(value));
};
const asNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};
const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((item) => fixMojibake(String(item))) : [];
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

