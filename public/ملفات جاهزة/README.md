
Architecture + Setup + Usage + SDKs + Frontend + Backend + Security + Teams + API Keys.

---

# 📘 README.md — Travel SaaS Platform

```markdown
# ✈️ Travel SaaS Platform  
منصة سفر متكاملة تعتمد على الذكاء الاصطناعي، التحليلات، الحجوزات، الوجهات، الطقس، والمدفوعات — مع نظام مصادقة كامل (JWT + Refresh Tokens) ونظام API Keys متعدد الفرق، ولوحة إدارة مبنية بـ Next.js.

---

## 🚀 المميزات الأساسية

### 🔐 Authentication
- تسجيل دخول/تسجيل مستخدمين
- JWT Access Tokens
- Refresh Tokens + Sessions
- حماية Endpoints عبر Bearer Token

### 🔑 API Keys (SaaS-Ready)
- مفاتيح متعددة لكل فريق
- تدوير المفاتيح (Rotate)
- إلغاء المفاتيح (Revoke)
- ربط المفاتيح بالفرق أو المستخدمين

### 👥 Teams & Roles
- مالك الحساب (OWNER)
- مدير (ADMIN)
- عضو (MEMBER)
- صلاحيات كاملة مبنية على Prisma + Middleware

### 🌍 Travel APIs Integration
- Amadeus (رحلات)
- Google Maps Places (أماكن)
- OpenWeather (طقس)
- GeoDB Cities (مدن)
- Unified Travel Search Endpoint

### 🖥️ Dashboard (Next.js)
- إدارة مفاتيح API
- عرض بيانات السفر
- ثيم أزرق داكن مشابه للوحة مشروع السفر

### 📦 SDKs جاهزة
- TypeScript SDK
- Dart SDK
- Swift SDK

---

# 🏗️ Architecture Overview

```
travel-saas/
  backend/        ← Node.js + TypeScript + Prisma + MongoDB
  frontend/       ← Next.js Dashboard (Blue Dark Theme)
  sdk/            ← TS / Dart / Swift SDKs
  README.md
```

## 🔧 Backend Architecture

```
backend/
  prisma/
    schema.prisma        ← User, Team, TeamMember, ApiKey, RefreshSession
  src/
    lib/prisma.ts        ← Prisma Client
    config/              ← API providers config
    services/            ← JWT, API Keys, Travel APIs
    repositories/        ← UserRepo, AuthRepo, ApiKeyRepo
    middleware/          ← apiKeyAuth, authGuard, requireRole
    routes/              ← auth, travel, teams/api-keys
    server.ts            ← Express App
  openapi.yaml           ← Swagger Documentation
  public/                ← HTML Docs (mohamie style)
```

## 🎨 Frontend Architecture (Next.js)

```
frontend/
  app/
    dashboard/
      api-keys/          ← إدارة مفاتيح API
    layout.tsx
    page.tsx
  lib/authClient.ts
  styles/globals.css
```

## 📦 SDKs

```
sdk/
  ts/
    src/travelClient.ts
  dart/
    lib/travel_client.dart
  swift/
    Sources/TravelClient.swift
```

---

# ⚙️ Setup

## 1. Clone

```bash
git clone https://github.com/your-org/travel-saas.git
cd travel-saas
```

## 2. Backend Setup

```bash
cd backend
npm install
```

### Configure `.env`

```env
DATABASE_URL="mongodb+srv://..."
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"

AMADEUS_API_KEY=""
AMADEUS_API_SECRET=""
GOOGLE_MAPS_API_KEY=""
OPENWEATHER_API_KEY=""
GEODB_API_KEY=""
```

### Run Prisma

```bash
npx prisma db push
```

### Start Backend

```bash
npm run dev
```

Backend will run at:

```
http://localhost:4000
```

Swagger Docs:

```
http://localhost:4000/docs
```

mohamie-style HTML Docs:

```
http://localhost:4000/public/docs-mohamie.html
```

---

# 🖥️ Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

# 🔑 API Keys Usage

### Send API Key in header:

```
X-API-Key: your_api_key_here
```

### Send JWT Access Token:

```
Authorization: Bearer your_access_token
```

---

# 📡 Unified Travel Search

```
GET /api/travel/search?origin=RUH&destination=DXB&date=2025-02-10
```

Response includes:

- Flights (Amadeus)
- Places (Google Maps)
- Cities (GeoDB)
- Weather (OpenWeather)

---

# 👥 Teams & Roles

| Role   | صلاحيات |
|--------|----------|
| OWNER  | إدارة الفريق + المفاتيح + الأعضاء |
| ADMIN  | إدارة المفاتيح + الأعضاء |
| MEMBER | استخدام API فقط |

---

# 🔧 SDK Usage

## TypeScript

```ts
import { TravelClient } from "@travel/sdk";

const client = new TravelClient({
  baseUrl: "http://localhost:4000"
});

await client.login("email@example.com", "password");

const result = await client.unifiedSearch({
  origin: "RUH",
  destination: "DXB",
  date: "2025-02-10"
});
```

## Dart

```dart
final client = TravelClient(baseUrl: "http://localhost:4000");
await client.login("email@example.com", "password");
final data = await client.unifiedSearch("RUH", "DXB", "2025-02-10");
```

## Swift

```swift
let client = TravelClient(baseUrl: URL(string:"http://localhost:4000")!)
client.unifiedSearch(origin:"RUH", destination:"DXB", date:"2025-02-10") { result in
    print(result)
}
```

---

# 🧪 Testing

Use the included Postman Collection:

```
backend/travel-api.postman_collection.json
```

---

# 📊 Next Step: Populate Dashboard with Real Data

بعد تشغيل المنصة، الخطوة التالية:

### ✔ إضافة بيانات حقيقية للوحة مشروع السفر:
- عدد الحجوزات اليوم
- إجمالي الإيرادات
- الوجهات النشطة
- متوسط قيمة الحجز
- الحجوزات حسب الوجهة (Chart.js)
- العملاء المحتملين
- توصيات الذكاء الاصطناعي

### ✔ ربطها بـ backend:
- `/analytics/bookings`
- `/analytics/revenue`
- `/analytics/destinations`
- `/analytics/insights`

### ✔ إضافة Webhooks للـ SDKs

---

# 🎯 جاهز للانطلاق

هذا الريبو الآن جاهز ليكون **منتج SaaS سفر حقيقي**.

نبدأ الآن مرحلة **التجربة الحقيقية**:
- توليد بيانات حجوزات وهمية
- ربطها بلوحة مشروع السفر
- بناء Charts
- إضافة AI Insights
