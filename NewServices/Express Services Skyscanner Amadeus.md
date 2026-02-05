<div dir="rtl"># </div>  
<div dir="rtl"></div>  
سأعطيك هيكل مشروع كامل (Express + Services) يدعم Amadeus وSkyscanner وDuffel، مع شرح مكان وضع مفاتيح البيئة وكيف تحصل عليها.  
  
## 1) هيكل المجلدات المقترح  
  
```text  
flight-backend/  
  package.json  
  .env  
  src/  
    app.js  
    routes/  
      index.js  
      flights.routes.js  
    controllers/  
      flights.controller.js  
    services/  
      amadeus.service.js  
      skyscanner.service.js  
      duffel.service.js  
    config/  
      amadeus.config.js  
      skyscanner.config.js  
      duffel.config.js  
      env.config.js  
    middlewares/  
      error.middleware.js  
    utils/  
      logger.js  
```  
  
———- ———- ———- ———- ———-   
الفكرة:    
- `routes` = تعريف مسارات HTTP فقط.    
- `controllers` = استقبال الطلبات ونداء الخدمات.    
- `services` = المنطق الخاص بكل مزود (Amadeus / Skyscanner / Duffel).    
- `config` = تحميل متغيرات البيئة وتكوين الـ SDKs.[8][11]  
  
———- ———- ———- ———- ———-   
  
## 2) ملف `package.json` (مختصر)  
  
```json  
{  
  "name": "flight-backend",  
  "version": "1.0.0",  
  "main": "src/app.js",  
  "scripts": {  
    "start": "node src/app.js",  
    "dev": "nodemon src/app.js"  
  },  
  "dependencies": {  
    "amadeus": "^8.0.0",  
    "axios": "^1.7.0",  
    "cors": "^2.8.5",  
    "duffel-api": "^3.5.0",  
    "dotenv": "^16.4.0",  
    "express": "^4.19.0"  
  },  
  "devDependencies": {  
    "nodemon": "^3.1.0"  
  }  
}  
```  
  
***  
  
## 3) ملف البيئة `.env`  
  
```env  
PORT=4000  
  
# Amadeus  
AMADEUS_CLIENT_ID=your_amadeus_client_id  
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret  
  
# Skyscanner  
SKYSCANNER_API_KEY=your_skyscanner_api_key  
  
# Duffel  
DUFFEL_ACCESS_TOKEN=your_duffel_access_token  
```  
—— ——- ———- ———— ———- ———-  
### كيف تحصل على المفاتيح:  
  
1) Amadeus (Self‑Service APIs)    
- ادخل إلى موقع Amadeus for Developers وأنشئ حساب مطوّر.    
- أنشئ تطبيق جديد (Self‑Service) من لوحة التحكم.    
- ستظهر لك `API Key` و`API Secret` (ضعهما في `AMADEUS_CLIENT_ID` و`AMADEUS_CLIENT_SECRET`).[16][17][18][19]  
  
2) Skyscanner    
- تحتاج إلى الانضمام لبرنامج الشركاء B2B/Partner/Affiliate من بوابة Skyscanner Partners.    
- بعد قبول الطلب، ستحصل على `API Key` أو بيانات وصول للـ API؛ ضع المفتاح في `SKYSCANNER_API_KEY`. (التفاصيل الدقيقة تعتمد على عقد الشراكة، لكن النمط العام هو مفتاح HTTP في الهيدر.).[20][21]  
  
3) Duffel    
- أنشئ حسابًا في منصة Duffel (للمطورين/شركات السفر).    
- من لوحة التحكم Developer → API Keys، انسخ الـ `live` أو `test` token حسب المرحلة.    
- ضع القيمة في `DUFFEL_ACCESS_TOKEN`. (Duffel يوفر Tokens بنمط Bearer).    
  
  —— ——— ——- ———- ————- ———-  
  
## 4) ملفات الإعداد `config`  
  
### `src/config/env.config.js`  
  
```js  
const dotenv = require('dotenv');  
dotenv.config();  
  
module.exports = {  
  port: process.env.PORT || 4000,  
  
  amadeus: {  
    clientId: process.env.AMADEUS_CLIENT_ID,  
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,  
  },  
  
  skyscanner: {  
    apiKey: process.env.SKYSCANNER_API_KEY,  
  },  
  
  duffel: {  
    accessToken: process.env.DUFFEL_ACCESS_TOKEN,  
  },  
};  
```  
  
### `src/config/amadeus.config.js`  
  
```js  
const Amadeus = require('amadeus');  
const { amadeus } = require('./env.config');  
  
const amadeusClient = new Amadeus({  
  clientId: amadeus.clientId,  
  clientSecret: amadeus.clientSecret,  
});  
  
module.exports = amadeusClient;  
```  
  
### `src/config/skyscanner.config.js`  
  
```js  
const axios = require('axios');  
const { skyscanner } = require('./env.config');  
  
const skyscannerClient = axios.create({  
  baseURL: 'https://partners.api.skyscanner.net', // عدّل حسب التوثيق الفعلي  
  headers: {  
    'Content-Type': 'application/json',  
    'x-api-key': skyscanner.apiKey,  
  },  
});  
  
module.exports = skyscannerClient;  
```  
  
### `src/config/duffel.config.js`  
  
```js  
const { Duffel } = require('duffel-api');  
const { duffel } = require('./env.config');  
  
const duffelClient = new Duffel({  
  token: duffel.accessToken,  
});  
  
module.exports = duffelClient;  
```  
  
***  
  
## 5) الخدمات `services`  
  
### `src/services/amadeus.service.js`  
  
```js  
const amadeus = require('../config/amadeus.config');  
  
async function searchFlights({ origin, destination, departureDate, adults = 1 }) {  
  const response = await amadeus.shopping.flightOffersSearch.get({  
    originLocationCode: origin,  
    destinationLocationCode: destination,  
    departureDate,  
    adults: String(adults),  
    currencyCode: 'USD',  
    max: 30,  
  });  
  
  return response.result; // يحتوي على data, meta  
}  
  
async function priceFlights({ flightOffers }) {  
  const response = await amadeus.shopping.flightOffers.pricing.post(  
    JSON.stringify({  
       {  
        type: 'flight-offers-pricing',  
        flightOffers,  
      },  
    }),  
  );  
  return response.result;  
}  
  
async function bookFlights({ flightOffers, travelers }) {  
  const response = await amadeus.booking.flightOrders.post(  
    JSON.stringify({  
       {  
        type: 'flight-order',  
        flightOffers,  
        travelers,  
      },  
    }),  
  );  
  return response.result;  
}  
  
module.exports = {  
  searchFlights,  
  priceFlights,  
  bookFlights,  
};  
```  
  
### `src/services/skyscanner.service.js`  
  
```js  
const skyscanner = require('../config/skyscanner.config');  
  
// هذه مجرد بنية عامة، عدّل الـ URL والـ payload حسب التوثيق الرسمي  
async function searchFlights({ origin, destination, departureDate, adults = 1, currency = 'USD', market = 'SA', locale = 'en-US' }) {  
  const payload = {  
    query: {  
      market,  
      locale,  
      currency,  
      queryLegs: [  
        {  
          originPlaceId: { iata: origin },  
          destinationPlaceId: { iata: destination },  
          date: {  
            year: Number(departureDate.slice(0, 4)),  
            month: Number(departureDate.slice(5, 7)),  
            day: Number(departureDate.slice(8, 10)),  
          },  
        },  
      ],  
      adults,  
    },  
  };  
  
  const { data } = await skyscanner.post(  
    '/apiservices/v3/flights/live/search/create',  
    payload,  
  );  
  
  return data;  
}  
  
module.exports = {  
  searchFlights,  
};  
```  
  
### `src/services/duffel.service.js`  
  
```js  
const duffel = require('../config/duffel.config');  
  
async function searchFlights({ origin, destination, departureDate, adults = 1 }) {  
  const offerRequest = await duffel.offerRequests.create({  
    slices: [  
      {  
        origin,  
        destination,  
        departure_date: departureDate,  
      },  
    ],  
    passengers: Array.from({ length: adults }).map(() => ({ type: 'adult' })),  
    cabin_class: 'economy',  
  });  
  
  return offerRequest; // يحتوي على offer_request + offers  
}  
  
async function bookFlights({ offerId, passengers }) {  
  const order = await duffel.orders.create({  
    selected_offers: [offerId],  
    passengers: passengers.map((p) => ({  
      type: 'adult',  
      title: p.title || 'mr',  
      given_name: p.firstName,  
      family_name: p.lastName,  
      email: p.email,  
      phone_number: p.phone,  
    })),  
  });  
  
  return order;  
}  
  
module.exports = {  
  searchFlights,  
  bookFlights,  
};  
```  
  
***  
  
## 6) الكنترولر والمسارات  
  
### `src/controllers/flights.controller.js`  
  
```js  
const amadeusService = require('../services/amadeus.service');  
const skyscannerService = require('../services/skyscanner.service');  
const duffelService = require('../services/duffel.service');  
  
async function searchFlights(req, res, next) {  
  try {  
    const { provider = 'amadeus', ...params } = req.body;  
    let result;  
  
    if (provider === 'amadeus') {  
      result = await amadeusService.searchFlights(params);  
    } else if (provider === 'skyscanner') {  
      result = await skyscannerService.searchFlights(params);  
    } else if (provider === 'duffel') {  
      result = await duffelService.searchFlights(params);  
    } else {  
      return res.status(400).json({ error: 'unknown_provider' });  
    }  
  
    res.json({ provider, result });  
  } catch (err) {  
    next(err);  
  }  
}  
  
async function priceAmadeus(req, res, next) {  
  try {  
    const { flightOffers } = req.body;  
    const result = await amadeusService.priceFlights({ flightOffers });  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
  
async function bookAmadeus(req, res, next) {  
  try {  
    const { flightOffers, travelers } = req.body;  
    const result = await amadeusService.bookFlights({ flightOffers, travelers });  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
  
async function bookDuffel(req, res, next) {  
  try {  
    const { offerId, passengers } = req.body;  
    const result = await duffelService.bookFlights({ offerId, passengers });  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
  
module.exports = {  
  searchFlights,  
  priceAmadeus,  
  bookAmadeus,  
  bookDuffel,  
};  
```  
  
### `src/routes/flights.routes.js`  
  
```js  
const express = require('express');  
const flightsController = require('../controllers/flights.controller');  
  
const router = express.Router();  
  
router.post('/search', flightsController.searchFlights);  
  
// Amadeus specific  
router.post('/amadeus/price', flightsController.priceAmadeus);  
router.post('/amadeus/book', flightsController.bookAmadeus);  
  
// Duffel specific  
router.post('/duffel/book', flightsController.bookDuffel);  
  
module.exports = router;  
```  
  
### `src/routes/index.js`  
  
```js  
const express = require('express');  
const flightsRoutes = require('./flights.routes');  
  
const router = express.Router();  
  
router.use('/flights', flightsRoutes);  
  
module.exports = router;  
```  
  
***  
  
## 7) الميدلوير والتشغيل  
  
### `src/middlewares/error.middleware.js`  
  
```js  
function errorMiddleware(err, req, res, next) {  
  console.error(err);  
  res.status(500).json({  
    error: 'internal_error',  
    message: err.message,  
  });  
}  
  
module.exports = errorMiddleware;  
```  
  
### `src/app.js`  
  
```js  
const express = require('express');  
const cors = require('cors');  
const routes = require('./routes');  
const { port } = require('./config/env.config');  
const errorMiddleware = require('./middlewares/error.middleware');  
  
const app = express();  
  
app.use(cors());  
app.use(express.json());  
  
app.get('/health', (req, res) => res.json({ status: 'ok' }));  
  
app.use('/api', routes);  
  
app.use(errorMiddleware);  
  
app.listen(port, () => {  
  console.log(`Flight API listening on port ${port}`);  
});  
```  
  
***  
  
بهذا الهيكل يمكنك مباشرة:  
  
- تشغيل: `npm install` ثم `npm run dev`.    
- إرسال طلب POST إلى: `POST /api/flights/search` مع body مثل:  
  
```json  
{  
  "provider": "amadeus",  
  "origin": "RUH",  
  "destination": "DXB",  
  "departureDate": "2026-03-01",  
  "adults": 1  
}  
```  
<div dir="rtl"></div>  
<div dir="rtl">مصادر</div>  
[1] RPM Interactive, Inc. ; NO_TICKER ; 2018293 ; s-1 ; 2025-06-16 https://www.sec.gov/Archives/edgar/data/2018293/000121390025054837/ea0243614-s1_rpminter.htm  
[2] JS OPPORTUNITY FUND LLC SERIES Q24 ; NO_TICKER ; 2031360 ; d/a ; 2025-02-28 https://www.sec.gov/Archives/edgar/data/2031360/0002031360-25-000003-index.htm  
[3] Mercalot Inc. ; NO_TICKER ; 2029014 ; s-1/a ; 2024-11-15 https://www.sec.gov/Archives/edgar/data/2029014/000168316824008172/mercalot_s1a3.htm  
[4] LATAM AIRLINES GROUP S.A. ; LTMAQ,LTMAY ; 1047716 ; 20-f ; 2025-03-13 https://www.sec.gov/Archives/edgar/data/1047716/000162828025012639/ltm-20241231.htm  
[5] Mercalot Inc. ; NO_TICKER ; 2029014 ; s-1/a ; 2024-11-04 https://www.sec.gov/Archives/edgar/data/2029014/000168316824007592/mercalot_s1a2.htm  
[6] Mercalot Inc. ; NO_TICKER ; 2029014 ; s-1/a ; 2024-10-10 https://www.sec.gov/Archives/edgar/data/2029014/000168316824007043/mercalot_s1a1.htm  
[7] Jet.AI Inc. ; JTAI ; 1861622 ; s-1/a ; 2024-06-20 https://www.sec.gov/Archives/edgar/data/1861622/000149315224024380/forms-1a.htm  
[8] How to structure your Express and Node.Js project https://dev.to/nermine-slimane/how-to-structure-your-express-and-nodejs-project-3bl  
[9] Project structure for an Express REST API when there is no ... https://www.coreycleary.me/project-structure-for-an-express-rest-api-when-there-is-no-standard-way/  
[10] Best Practice to Structure REST API Using Express with ... https://stackoverflow.com/questions/26684614/best-practice-to-structure-rest-api-using-express-with-nodejs  
[11] Bulletproof node.js project architecture 🛡️ https://softwareontheroad.com/ideal-nodejs-project-structure  
[12] Structure of a NodeJS API Project https://github.com/Abdul-majid-ashrafi/nodejs-structure  
[13] Express Tutorial Part 7: Deploying to production https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/deployment  
[14] Building Scalable REST APIs with Node.js and Express https://www.alliance-it-solutions.com/blog/building-scalable-rest-apis-with-nodejs-and-express  
[15] Node.js project architecture best practices https://blog.logrocket.com/node-js-project-architecture-best-practices/  
[16] Node SDK Tutorial - Amadeus for Developers https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/developer-tools/node/  
[17] Getting started with the Amadeus Node SDK https://developers.amadeus.com/blog/get-started-amadeus-node-sdk  
[18] Building a hotel booking app with Node.js and React - Part 1 https://developers.amadeus.com/blog/react-hotel-booking-app-part1  
[19] Build a flight booking app with Angular and Node.js - Part 1 https://developers.amadeus.com/blog/flight-booking-app-angular-1  
[20] تطبيق Skyscanner - عروض السفر - App Store - Apple https://apps.apple.com/sa/app/skyscanner-%D8%B9%D8%B1%D9%88%D8%B6-%D8%A7%D9%84%D8%B3%D9%81%D8%B1/id415458524?l=ar  
[21] Skyscanner | !احصل على أرخص الرحلات وبسرعة: وفر وقتك، ... https://www.skyscanner.com.sa  
  
<div dir="rtl"></div>  
<div dir="rtl"></div>  
الفكرة هي أن تُرجِع دائمًا كائنًا موحّد الشكل من طبقة الـ Service، بغضّ النظر عن المزود (Amadeus / Skyscanner / Duffel)، ثم يتعامل الـ Frontend مع هذا الشكل فقط. هذا اقتراح DTO واضح، ثم يتضح كيف يطبق في كل Service.  
  
***  
  
## 1) تعريف DTO موحّد لرحلة واحدة  
  
لنعرّف نوعًا منطقيًا لعرض رحلة (FlightOfferDTO):  
  
```ts  
type FlightSegmentDTO = {  
  marketingCarrier: string;   // مثال: "SV"  
  operatingCarrier: string;   // إن وجد، أو نفس الـ marketing  
  flightNumber: string;       // "SV123"  
  origin: string;             // "RUH"  
  destination: string;        // "DXB"  
  departureTime: string;      // ISO 8601  
  arrivalTime: string;        // ISO 8601  
  durationMinutes: number;  
  aircraft: string | null;    // كود الطائرة إن توفر  
};  
  
type FlightPricingDTO = {  
  currency: string;           // "USD"  
  total: number;              // مثال: 350.75  
  base: number | null;  
  taxes: number | null;  
};  
  
type FlightOfferDTO = {  
  provider: 'amadeus' | 'skyscanner' | 'duffel';  
  providerOfferId: string;            // ID الذي سنستخدمه لاحقًا في الحجز  
  slices: FlightSegmentDTO[][];       // مصفوفة من الـ legs، كل leg مصفوفة مقاطع  
  pricing: FlightPricingDTO;  
  cabins: string[];                   // ["ECONOMY","BUSINESS"] عامة على مستوى العرض  
  refundable: boolean | null;  
  baggageInfo?: {  
    cabinBags?: string | null;  
    checkedBags?: string | null;  
  };  
};  
```  
  
بهذا تكون استجابة `/api/flights/search` كالتالي:  
  
```json  
{  
  "results": [ /* Array<FlightOfferDTO> */ ]  
}  
```  
  
***  
  
## 2) توحيد Amadeus إلى DTO  
  
داخل `amadeus.service.js`، بدل أن نرجع `response.result` كما هو، نبني دالة mapper:  
  
```js  
function mapAmadeusOfferToDTO(offer) {  
  const provider = 'amadeus';  
  
  const providerOfferId = offer.id; // نُبقي ID Amadeus الأصلي للحجز لاحقًا  
  
  const slices = offer.itineraries.map((itinerary) =>  
    itinerary.segments.map((seg) => {  
      const dep = seg.departure;  
      const arr = seg.arrival;  
      const durationMinutes = parseISODurationToMinutes(seg.duration); // دالة مساعدة  
  
      return {  
        marketingCarrier: seg.carrierCode,  
        operatingCarrier: seg.operating?.carrierCode || seg.carrierCode,  
        flightNumber: seg.number,  
        origin: dep.iataCode,  
        destination: arr.iataCode,  
        departureTime: dep.at,  
        arrivalTime: arr.at,  
        durationMinutes,  
        aircraft: seg.aircraft?.code || null,  
      };  
    }),  
  );  
  
  const price = offer.price;  
  const pricing = {  
    currency: price.currency,  
    total: Number(price.total),  
    base: price.base ? Number(price.base) : null,  
    taxes: price.fees && price.fees.length  
      ? Number(price.fees.reduce((sum, f) => sum + Number(f.amount), 0))  
      : null,  
  };  
  
  const cabinsSet = new Set();  
  offer.travelerPricings?.forEach((tp) => {  
    tp.fareDetailsBySegment?.forEach((fd) => {  
      if (fd.cabin) cabinsSet.add(fd.cabin.toUpperCase());  
    });  
  });  
  
  const cabins = Array.from(cabinsSet);  
  
  const dto = {  
    provider,  
    providerOfferId,  
    slices,  
    pricing,  
    cabins,  
    refundable: null, // يمكن استنتاجها من fareRules إن أردت لاحقًا  
    baggageInfo: {},  
  };  
  
  return dto;  
}  
  
function parseISODurationToMinutes(iso) {  
  // مثال "PT2H30M"  
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || '');  
  const hours = match && match[1] ? Number(match[1]) : 0;  
  const minutes = match && match[2] ? Number(match[2]) : 0;  
  return hours * 60 + minutes;  
}  
```  
  
ثم نعدّل `searchFlights` في `amadeus.service.js`:  
  
```js  
async function searchFlights({ origin, destination, departureDate, adults = 1 }) {  
  const response = await amadeus.shopping.flightOffersSearch.get({  
    originLocationCode: origin,  
    destinationLocationCode: destination,  
    departureDate,  
    adults: String(adults),  
    currencyCode: 'USD',  
    max: 30,  
  });  
  
  const offers = response.result.data || response.result; // حسب شكل الـ SDK  
  const dtos = offers.map(mapAmadeusOfferToDTO);  
  
  return dtos;  
}  
```  
  
الآن طبقة الكنترولر لا ترى Amadeus الأصلية، فقط `FlightOfferDTO[]`.  
  
***  
  
## 3) توحيد Skyscanner إلى DTO  
  
الـ structure الحقيقي يعتمد على الـ API version التي تحصل عليها، لكن الفكرة واحدة: تقرأ legs/segments/pricing وتحوّلها.  
  
مثال عام داخل `skyscanner.service.js`:  
  
```js  
function mapSkyscannerToDTOs(raw) {  
  // هذا مثال تجريدي، عدلّه ليتناسب مع الهيكل الفعلي:  
  const provider = 'skyscanner';  
  
  // نفترض أن raw يحتوي على offers أو itineraries  
  const offers = raw.itineraries || raw.offers || [];  
  
  return offers.map((offer) => {  
    const providerOfferId = offer.id || offer.itineraryId;  
  
    const slices = offer.legs.map((leg) =>  
      leg.segments.map((seg) => {  
        const durationMinutes = seg.durationInMinutes || seg.duration || 0;  
        return {  
          marketingCarrier: seg.marketingCarrier?.code || seg.carrierCode,  
          operatingCarrier: seg.operatingCarrier?.code || seg.marketingCarrier?.code,  
          flightNumber: seg.flightNumber,  
          origin: seg.origin?.iata || seg.origin,  
          destination: seg.destination?.iata || seg.destination,  
          departureTime: seg.departure || seg.departureTime,  
          arrivalTime: seg.arrival || seg.arrivalTime,  
          durationMinutes,  
          aircraft: seg.aircraft?.code || null,  
        };  
      }),  
    );  
  
    const pricing = {  
      currency: offer.price?.currency || 'USD',  
      total: Number(offer.price?.amount || offer.price?.total || 0),  
      base: null,  
      taxes: null,  
    };  
  
    const cabins = (offer.cabins || ['ECONOMY']).map((c) => c.toUpperCase());  
  
    return {  
      provider,  
      providerOfferId,  
      slices,  
      pricing,  
      cabins,  
      refundable: offer.refundable ?? null,  
      baggageInfo: {},  
    };  
  });  
}  
  
async function searchFlights(params) {  
  const { data } = await skyscanner.post(  
    '/apiservices/v3/flights/live/search/create',  
    buildSkyscannerPayload(params),  
  );  
  
  return mapSkyscannerToDTOs(data);  
}  
```  
  
ليه هذا التصميم مفيد؟ لأنه حين نغير شكل payload من Skyscanner تبقى طبقة DTO ثابتة.  
  
***  
  
## 4) توحيد Duffel إلى DTO  
  
Duffel له structure واضح نسبيًا (slices → segments، price).  
  
داخل `duffel.service.js`:  
  
```js  
function mapDuffelOfferToDTO(offer) {  
  const provider = 'duffel';  
  const providerOfferId = offer.id;  
  
  const slices = offer.slices.map((slice) =>  
    slice.segments.map((seg) => {  
      const durationMinutes = seg.duration ? parseISODurationToMinutes(seg.duration) : 0;  
      return {  
        marketingCarrier: seg.marketing_carrier?.iata_code,  
        operatingCarrier: seg.operating_carrier?.iata_code || seg.marketing_carrier?.iata_code,  
        flightNumber: seg.flight_number,  
        origin: seg.origin?.iata_code,  
        destination: seg.destination?.iata_code,  
        departureTime: seg.departing_at,  
        arrivalTime: seg.arriving_at,  
        durationMinutes,  
        aircraft: seg.aircraft?.name || seg.aircraft?.iata_code || null,  
      };  
    }),  
  );  
  
  const totalAmount = offer.total_amount || offer.price?.total || '0';  
  const currency = offer.total_currency || offer.price?.currency || 'USD';  
  
  const pricing = {  
    currency,  
    total: Number(totalAmount),  
    base: null,  
    taxes: null,  
  };  
  
  const cabinsSet = new Set();  
  offer.slices.forEach((slice) => {  
    slice.segments.forEach((seg) => {  
      if (seg.cabin_class) cabinsSet.add(seg.cabin_class.toUpperCase());  
    });  
  });  
  
  const cabins = Array.from(cabinsSet);  
  
  let refundable = null;  
  if (offer.refunds) {  
    refundable = offer.refunds.some((r) => r.type === 'refundable');  
  }  
  
  return {  
    provider,  
    providerOfferId,  
    slices,  
    pricing,  
    cabins,  
    refundable,  
    baggageInfo: {},  
  };  
}  
  
async function searchFlights({ origin, destination, departureDate, adults = 1 }) {  
  const offerRequest = await duffel.offerRequests.create({  
    slices: [  
      {  
        origin,  
        destination,  
        departure_date: departureDate,  
      },  
    ],  
    passengers: Array.from({ length: adults }).map(() => ({ type: 'adult' })),  
    cabin_class: 'economy',  
  });  
  
  const offers = offerRequest.offers || offerRequest.data || [];  
  return offers.map(mapDuffelOfferToDTO);  
}  
```  
  
نستخدم نفس `parseISODurationToMinutes` المستعملة مع Amadeus.  
  
***  
  
## 5) تعديل الكنترولر ليعيد DTO موحّد من كل مزوّد  
  
في `flights.controller.js` نغيّر `searchFlights`:  
  
```js  
async function searchFlights(req, res, next) {  
  try {  
    const { provider = 'amadeus', ...params } = req.body;  
    let results = [];  
  
    if (provider === 'amadeus') {  
      results = await amadeusService.searchFlights(params);   // يرجع Array<FlightOfferDTO>  
    } else if (provider === 'skyscanner') {  
      results = await skyscannerService.searchFlights(params);  
    } else if (provider === 'duffel') {  
      results = await duffelService.searchFlights(params);  
    } else if (provider === 'all') {  
      const [a, s, d] = await Promise.all([  
        amadeusService.searchFlights(params),  
        skyscannerService.searchFlights(params),  
        duffelService.searchFlights(params),  
      ]);  
      results = [...a, ...s, ...d];  
    } else {  
      return res.status(400).json({ error: 'unknown_provider' });  
    }  
  
    res.json({ results });  
  } catch (err) {  
    next(err);  
  }  
}  
```  
  
الآن الـ Frontend يتعامل مع شكل واحد فقط، ويمكن مثلًا:  
  
- ترتيب النتائج حسب `pricing.total` بغض النظر عن المزود.    
- عرض عدد الترانزيت من طول `slices[0].length - 1`.    
- عرض شعار شركة الطيران من `marketingCarrier`.  
  
***  
  
## 6) نصيحة إضافية  
  
انشاء (ملف)   
 TypeScript أو JSDoc يعرّف `FlightOfferDTO` و`FlightSegmentDTO`  
بوضوح، حتى لو كان المشروع JS فقط، لتسهيل التطوير والاستخدام داخل الفرونت والباك.  
<div dir="rtl"></div>  
<div dir="rtl">مصادر</div>  
[1] Draganfly Inc. ; DPRO ; 1786286 ; 6-k ; 2026-01-13 https://www.sec.gov/Archives/edgar/data/1786286/000149315226001996/form6-k.htm  
[2] Grupo Aeromexico, S.A.B. de C.V. ; NO_TICKER ; 1561861 ; f-1/a ; 2025-10-17 https://www.sec.gov/Archives/edgar/data/1561861/000119312525242656/d11281df1a.htm  
[3] Grupo Aeromexico, S.A.B. de C.V. ; NO_TICKER ; 1561861 ; f-1/a ; 2025-09-23 https://www.sec.gov/Archives/edgar/data/1561861/000119312525213530/d11281df1a.htm  
[4] Grupo Aeromexico, S.A.B. de C.V. ; NO_TICKER ; 1561861 ; f-1/a ; 2025-08-22 https://www.sec.gov/Archives/edgar/data/1561861/000119312525186482/d11281df1a.htm  
[5] Frontier Group Holdings, Inc. ; ULCC ; 1670076 ; 10-k ; 2025-02-18 https://www.sec.gov/Archives/edgar/data/1670076/000167007625000041/fron-20241231.htm  
[6] Flight Science, Inc. ; NO_TICKER ; 2045657 ; d/a ; 2025-03-13 https://www.sec.gov/Archives/edgar/data/2045657/0002045657-25-000001-index.htm  
[7] SOUTHWEST AIRLINES CO ; LUV ; 92380 ; 10-k ; 2025-02-07 https://www.sec.gov/Archives/edgar/data/92380/000009238025000024/luv-20241231.htm  
[8] Track flight fares with Amadeus & Skyscanner https://n8n.io/workflows/6233-track-flight-fares-with-amadeus-and-skyscanner-alerts-refunds-and-trends/  
[9] Following Search Best Practices | Duffel Documentation https://duffel.com/docs/guides/following-search-best-practices  
[10] Duffel vs Amadeus: Which Works Better for Modern API- ... https://dev.to/ravi_makhija/duffel-vs-amadeus-which-works-better-for-modern-api-first-integration-49p4  
[11] amadeus4dev/amadeus-flight-price-analysis-django https://github.com/amadeus4dev/amadeus-flight-price-analysis-django/blob/master/pricing/flight_price/views.py  
[12] Amadeus API shows too few flights? : r/learnprogramming https://www.reddit.com/r/learnprogramming/comments/1k2qp8l/amadeus_api_shows_too_few_flights/  
[13] Amadeus API does not show available direct flights https://stackoverflow.com/questions/77774612/amadeus-api-does-not-show-available-direct-flights  
[14] Skyscanner harnesses the power of ... https://amadeus.com/documents/products/travel-intelligence/skyscanner-case-study.pdf  
[15] Evolving our Flight Search technology to meet the needs of ... https://amadeus.com/en/blog/articles/evolving-flight-search-technology-meet-needs-travel-renewal  
[16] Travel Data Industry Market Map 2025: APIs & Data Providers https://www.joinmassive.com/zh/blog/the-travel-data-industry-market-map  
[17] Travel API Integration Services https://www.gurutechnolabs.com/travel-api-integration-service  
  
<div dir="rtl"></div>  
<div dir="rtl"></div>  
فيما يلي نسخة TypeScript كاملة (مبسّطة) لنفس المشروع، مع تعريف DTOs strongly typed. يمكن نسخ الهيكل كما هو ثم التعديل حسب الاحتياج.  
  
***  
  
## 1) تهيئة المشروع  
  
من الطرفية:  
  
```bash  
mkdir flight-backend-ts && cd flight-backend-ts  
npm init -y  
  
npm install express cors dotenv amadeus axios duffel-api  
npm install -D typescript ts-node-dev @types/node @types/express @types/cors  
  
npx tsc --init  
```  
  
في `tsconfig.json` تأكد من:  
  
```json  
{  
  "compilerOptions": {  
    "target": "ES2020",  
    "module": "CommonJS",  
    "rootDir": "src",  
    "outDir": "dist",  
    "esModuleInterop": true,  
    "strict": true,  
    "resolveJsonModule": true,  
    "skipLibCheck": true  
  }  
}  
```  
  
في `package.json`:  
  
```json  
{  
  "scripts": {  
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",  
    "build": "tsc",  
    "start": "node dist/app.js"  
  }  
}  
```  
  
ملف البيئة `.env` كما سبق:  
  
```env  
PORT=4000  
AMADEUS_CLIENT_ID=your_amadeus_client_id  
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret  
SKYSCANNER_API_KEY=your_skyscanner_api_key  
DUFFEL_ACCESS_TOKEN=your_duffel_access_token  
```  
  
***  
  
## 2) هيكل المجلدات TypeScript  
  
```text  
src/  
  app.ts  
  routes/  
    index.ts  
    flights.routes.ts  
  controllers/  
    flights.controller.ts  
  services/  
    amadeus.service.ts  
    skyscanner.service.ts  
    duffel.service.ts  
  config/  
    env.config.ts  
    amadeus.config.ts  
    skyscanner.config.ts  
    duffel.config.ts  
  middlewares/  
    error.middleware.ts  
  utils/  
    logger.ts  
    duration.ts  
  types/  
    flights.dto.ts  
```  
  
***  
  
## 3) تعريف الـ DTOs (Strongly Typed)  
  
`src/types/flights.dto.ts`:  
  
```ts  
export type ProviderName = 'amadeus' | 'skyscanner' | 'duffel';  
  
export interface FlightSegmentDTO {  
  marketingCarrier: string;  
  operatingCarrier: string;  
  flightNumber: string;  
  origin: string;  
  destination: string;  
  departureTime: string;    // ISO 8601  
  arrivalTime: string;      // ISO 8601  
  durationMinutes: number;  
  aircraft: string | null;  
}  
  
export interface FlightPricingDTO {  
  currency: string;  
  total: number;  
  base: number | null;  
  taxes: number | null;  
}  
  
export interface BaggageInfoDTO {  
  cabinBags?: string | null;  
  checkedBags?: string | null;  
}  
  
export interface FlightOfferDTO {  
  provider: ProviderName;  
  providerOfferId: string;  
  slices: FlightSegmentDTO[][]; // [leg][segment]  
  pricing: FlightPricingDTO;  
  cabins: string[];  
  refundable: boolean | null;  
  baggageInfo?: BaggageInfoDTO;  
}  
  
// باراميترات البحث المشتركة  
export interface FlightSearchParams {  
  origin: string;  
  destination: string;  
  departureDate: string; // 'YYYY-MM-DD'  
  adults?: number;  
  currency?: string;  
  market?: string;  
  locale?: string;  
}  
  
// طلبات الحجز (أمثلة مبسطة)  
export interface TravelerDTO {  
  firstName: string;  
  lastName: string;  
  title?: string;  
  email: string;  
  phone: string;  
}  
```  
  
***  
  
## 4) أدوات مساعدة  
  
`src/utils/duration.ts`:  
  
```ts  
export function parseISODurationToMinutes(iso?: string | null): number {  
  if (!iso) return 0;  
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);  
  const hours = match && match[1] ? Number(match[1]) : 0;  
  const minutes = match && match[2] ? Number(match[2]) : 0;  
  return hours * 60 + minutes;  
}  
```  
  
`src/utils/logger.ts` (بسيط):  
  
```ts  
export function log(...args: unknown[]): void {  
  // يمكنك لاحقاً استبداله بـ winston أو pino  
  console.log(...args);  
}  
```  
  
***  
  
## 5) إعدادات البيئة والـ SDKs  
  
`src/config/env.config.ts`:  
  
```ts  
import dotenv from 'dotenv';  
dotenv.config();  
  
export const env = {  
  port: Number(process.env.PORT || 4000),  
  
  amadeus: {  
    clientId: process.env.AMADEUS_CLIENT_ID || '',  
    clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',  
  },  
  
  skyscanner: {  
    apiKey: process.env.SKYSCANNER_API_KEY || '',  
  },  
  
  duffel: {  
    accessToken: process.env.DUFFEL_ACCESS_TOKEN || '',  
  },  
};  
```  
  
`src/config/amadeus.config.ts`:  
  
```ts  
import Amadeus from 'amadeus';  
import { env } from './env.config';  
  
export const amadeusClient = new Amadeus({  
  clientId: env.amadeus.clientId,  
  clientSecret: env.amadeus.clientSecret,  
});  
```  
  
`src/config/skyscanner.config.ts`:  
  
```ts  
import axios from 'axios';  
import { env } from './env.config';  
  
export const skyscannerClient = axios.create({  
  baseURL: 'https://partners.api.skyscanner.net',  
  headers: {  
    'Content-Type': 'application/json',  
    'x-api-key': env.skyscanner.apiKey,  
  },  
});  
```  
  
`src/config/duffel.config.ts`:  
  
```ts  
import { Duffel } from 'duffel-api';  
import { env } from './env.config';  
  
export const duffelClient = new Duffel({  
  token: env.duffel.accessToken,  
});  
```  
  
***  
  
## 6) الخدمات (Services)  
  
### 6.1 Amadeus Service  
  
`src/services/amadeus.service.ts`:  
  
```ts  
import { amadeusClient } from '../config/amadeus.config';  
import { FlightOfferDTO, FlightSearchParams } from '../types/flights.dto';  
import { parseISODurationToMinutes } from '../utils/duration';  
  
type AmadeusFlightOffer = any; // يمكن لاحقاً تعريف type حسب توثيق Amadeus  
  
function mapAmadeusOfferToDTO(offer: AmadeusFlightOffer): FlightOfferDTO {  
  const slices = (offer.itineraries || []).map((itinerary: any) =>  
    (itinerary.segments || []).map((seg: any) => {  
      const dep = seg.departure;  
      const arr = seg.arrival;  
      const durationMinutes = parseISODurationToMinutes(seg.duration);  
  
      return {  
        marketingCarrier: seg.carrierCode,  
        operatingCarrier: seg.operating?.carrierCode || seg.carrierCode,  
        flightNumber: seg.number,  
        origin: dep.iataCode,  
        destination: arr.iataCode,  
        departureTime: dep.at,  
        arrivalTime: arr.at,  
        durationMinutes,  
        aircraft: seg.aircraft?.code || null,  
      };  
    }),  
  );  
  
  const price = offer.price || {};  
  const fees = Array.isArray(price.fees) ? price.fees : [];  
  const taxes =  
    fees.length > 0  
      ? fees.reduce((sum: number, f: any) => sum + Number(f.amount || 0), 0)  
      : null;  
  
  const cabinsSet = new Set<string>();  
  (offer.travelerPricings || []).forEach((tp: any) => {  
    (tp.fareDetailsBySegment || []).forEach((fd: any) => {  
      if (fd.cabin) cabinsSet.add(String(fd.cabin).toUpperCase());  
    });  
  });  
  
  return {  
    provider: 'amadeus',  
    providerOfferId: offer.id,  
    slices,  
    pricing: {  
      currency: price.currency || 'USD',  
      total: Number(price.total || 0),  
      base: price.base ? Number(price.base) : null,  
      taxes,  
    },  
    cabins: Array.from(cabinsSet),  
    refundable: null,  
    baggageInfo: {},  
  };  
}  
  
export async function searchFlightsAmadeus(  
  params: FlightSearchParams,  
): Promise<FlightOfferDTO[]> {  
  const { origin, destination, departureDate, adults = 1, currency = 'USD' } = params;  
  
  const response = await amadeusClient.shopping.flightOffersSearch.get({  
    originLocationCode: origin,  
    destinationLocationCode: destination,  
    departureDate,  
    adults: String(adults),  
    currencyCode: currency,  
    max: 30,  
  });  
  
  const result = (response as any).result;  
  const offers: AmadeusFlightOffer[] = result.data || result;  
  
  return offers.map(mapAmadeusOfferToDTO);  
}  
```  
  
(يمكن إضافة دوال التسعير والحجز لاحقًا بنفس الأسلوب.)  
  
***  
  
### 6.2 Skyscanner Service  
  
`src/services/skyscanner.service.ts`:  
  
```ts  
import { skyscannerClient } from '../config/skyscanner.config';  
import { FlightOfferDTO, FlightSearchParams } from '../types/flights.dto';  
  
type SkyscannerRawResponse = any; // يمكن لاحقاً ضبطه  
  
function mapSkyscannerToDTOs(raw: SkyscannerRawResponse): FlightOfferDTO[] {  
  const offers = raw.itineraries || raw.offers || [];  
  
  return offers.map((offer: any): FlightOfferDTO => {  
    const slices = (offer.legs || []).map((leg: any) =>  
      (leg.segments || []).map((seg: any) => {  
        const duration =  
          seg.durationInMinutes || seg.duration || 0;  
  
        return {  
          marketingCarrier: seg.marketingCarrier?.code || seg.carrierCode,  
          operatingCarrier:  
            seg.operatingCarrier?.code || seg.marketingCarrier?.code,  
          flightNumber: seg.flightNumber,  
          origin: seg.origin?.iata || seg.origin,  
          destination: seg.destination?.iata || seg.destination,  
          departureTime: seg.departure || seg.departureTime,  
          arrivalTime: seg.arrival || seg.arrivalTime,  
          durationMinutes: Number(duration),  
          aircraft: seg.aircraft?.code || null,  
        };  
      }),  
    );  
  
    const price = offer.price || {};  
    const currency = price.currency || 'USD';  
    const total = Number(price.amount || price.total || 0);  
  
    const cabins = (offer.cabins || ['ECONOMY']).map((c: string) =>  
      c.toUpperCase(),  
    );  
  
    return {  
      provider: 'skyscanner',  
      providerOfferId: offer.id || offer.itineraryId,  
      slices,  
      pricing: {  
        currency,  
        total,  
        base: null,  
        taxes: null,  
      },  
      cabins,  
      refundable: offer.refundable ?? null,  
      baggageInfo: {},  
    };  
  });  
}  
  
function buildSkyscannerPayload(params: FlightSearchParams) {  
  const {  
    origin,  
    destination,  
    departureDate,  
    adults = 1,  
    currency = 'USD',  
    market = 'SA',  
    locale = 'en-US',  
  } = params;  
  
  const year = Number(departureDate.slice(0, 4));  
  const month = Number(departureDate.slice(5, 7));  
  const day = Number(departureDate.slice(8, 10));  
  
  return {  
    query: {  
      market,  
      locale,  
      currency,  
      queryLegs: [  
        {  
          originPlaceId: { iata: origin },  
          destinationPlaceId: { iata: destination },  
          date: { year, month, day },  
        },  
      ],  
      adults,  
    },  
  };  
}  
  
export async function searchFlightsSkyscanner(  
  params: FlightSearchParams,  
): Promise<FlightOfferDTO[]> {  
  const payload = buildSkyscannerPayload(params);  
  
  const { data } = await skyscannerClient.post(  
    '/apiservices/v3/flights/live/search/create',  
    payload,  
  );  
  
  return mapSkyscannerToDTOs(data);  
}  
```  
لاحقاً  
(يجب مطابقة الـ payload مع التوثيق الفعلي لـ Skyscanner .)  
  
***  
  
### 6.3 Duffel Service  
  
`src/services/duffel.service.ts`:  
  
```ts  
import { duffelClient } from '../config/duffel.config';  
import { FlightOfferDTO, FlightSearchParams } from '../types/flights.dto';  
import { parseISODurationToMinutes } from '../utils/duration';  
  
type DuffelOffer = any; // يمكن ضبطها لاحقًا من توثيق Duffel  
  
function mapDuffelOfferToDTO(offer: DuffelOffer): FlightOfferDTO {  
  const slices = (offer.slices || []).map((slice: any) =>  
    (slice.segments || []).map((seg: any) => {  
      const durationMinutes = parseISODurationToMinutes(seg.duration);  
  
      return {  
        marketingCarrier: seg.marketing_carrier?.iata_code,  
        operatingCarrier:  
          seg.operating_carrier?.iata_code ||  
          seg.marketing_carrier?.iata_code,  
        flightNumber: seg.flight_number,  
        origin: seg.origin?.iata_code,  
        destination: seg.destination?.iata_code,  
        departureTime: seg.departing_at,  
        arrivalTime: seg.arriving_at,  
        durationMinutes,  
        aircraft: seg.aircraft?.iata_code || seg.aircraft?.name || null,  
      };  
    }),  
  );  
  
  const totalAmount = offer.total_amount || offer.price?.total || '0';  
  const currency = offer.total_currency || offer.price?.currency || 'USD';  
  
  const cabinsSet = new Set<string>();  
  (offer.slices || []).forEach((slice: any) => {  
    (slice.segments || []).forEach((seg: any) => {  
      if (seg.cabin_class) cabinsSet.add(String(seg.cabin_class).toUpperCase());  
    });  
  });  
  
  let refundable: boolean | null = null;  
  if (offer.refunds && Array.isArray(offer.refunds)) {  
    refundable = offer.refunds.some((r: any) => r.type === 'refundable');  
  }  
  
  return {  
    provider: 'duffel',  
    providerOfferId: offer.id,  
    slices,  
    pricing: {  
      currency,  
      total: Number(totalAmount),  
      base: null,  
      taxes: null,  
    },  
    cabins: Array.from(cabinsSet),  
    refundable,  
    baggageInfo: {},  
  };  
}  
  
export async function searchFlightsDuffel(  
  params: FlightSearchParams,  
): Promise<FlightOfferDTO[]> {  
  const { origin, destination, departureDate, adults = 1 } = params;  
  
  const offerRequest = await duffelClient.offerRequests.create({  
    slices: [  
      {  
        origin,  
        destination,  
        departure_date: departureDate,  
      },  
    ],  
    passengers: Array.from({ length: adults }).map(() => ({ type: 'adult' })),  
    cabin_class: 'economy',  
  });  
  
  const offers: DuffelOffer[] =  
    (offerRequest as any).offers || (offerRequest as any).data || [];  
  
  return offers.map(mapDuffelOfferToDTO);  
}  
```  
  
***  
  
## 7) الكنترولر والمسارات (TypeScript)  
  
`src/controllers/flights.controller.ts`:  
  
```ts  
import { Request, Response, NextFunction } from 'express';  
import {  
  FlightOfferDTO,  
  FlightSearchParams,  
  ProviderName,  
} from '../types/flights.dto';  
import { searchFlightsAmadeus } from '../services/amadeus.service';  
import { searchFlightsSkyscanner } from '../services/skyscanner.service';  
import { searchFlightsDuffel } from '../services/duffel.service';  
  
interface SearchRequestBody extends FlightSearchParams {  
  provider?: ProviderName | 'all';  
}  
  
export async function searchFlightsController(  
  req: Request<unknown, unknown, SearchRequestBody>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const { provider = 'amadeus', ...params } = req.body;  
    let results: FlightOfferDTO[] = [];  
  
    if (provider === 'amadeus') {  
      results = await searchFlightsAmadeus(params);  
    } else if (provider === 'skyscanner') {  
      results = await searchFlightsSkyscanner(params);  
    } else if (provider === 'duffel') {  
      results = await searchFlightsDuffel(params);  
    } else if (provider === 'all') {  
      const [a, s, d] = await Promise.all([  
        searchFlightsAmadeus(params),  
        searchFlightsSkyscanner(params),  
        searchFlightsDuffel(params),  
      ]);  
      results = [...a, ...s, ...d];  
    } else {  
      res.status(400).json({ error: 'unknown_provider' });  
      return;  
    }  
  
    res.json({ results });  
  } catch (err) {  
    next(err);  
  }  
}  
```  
  
`src/routes/flights.routes.ts`:  
  
```ts  
import { Router } from 'express';  
import { searchFlightsController } from '../controllers/flights.controller';  
  
const router = Router();  
  
router.post('/search', searchFlightsController);  
  
export default router;  
```  
  
`src/routes/index.ts`:  
  
```ts  
import { Router } from 'express';  
import flightsRoutes from './flights.routes';  
  
const router = Router();  
  
router.use('/flights', flightsRoutes);  
  
export default router;  
```  
  
***  
  
## 8) الميدلوير والتشغيل  
  
`src/middlewares/error.middleware.ts`:  
  
```ts  
import { Request, Response, NextFunction } from 'express';  
import { log } from '../utils/logger';  
  
export function errorMiddleware(  
  err: any,  
  _req: Request,  
  res: Response,  
  _next: NextFunction,  
): void {  
  log('Error:', err);  
  res.status(500).json({  
    error: 'internal_error',  
    message: err?.message || 'Unknown error',  
  });  
}  
```  
  
`src/app.ts`:  
  
```ts  
import express from 'express';  
import cors from 'cors';  
import routes from './routes';  
import { env } from './config/env.config';  
import { errorMiddleware } from './middlewares/error.middleware';  
  
const app = express();  
  
app.use(cors());  
app.use(express.json());  
  
app.get('/health', (_req, res) => res.json({ status: 'ok' }));  
  
app.use('/api', routes);  
  
app.use(errorMiddleware);  
  
app.listen(env.port, () => {  
  console.log(`Flight API (TS) listening on port ${env.port}`);  
});  
```  
  
***  
  
لدينا الان مشروع TypeScript كامل به:  
  
- DTO موحّد `FlightOfferDTO`،    
- خدمات لكل مزوّد (Amadeus / Skyscanner / Duffel)،    
- Endpoint واحد `/api/flights/search` يرجع نفس الشكل بغض النظر عن المزود.  
<div dir="rtl"></div>  
<div dir="rtl"></div>  
<div dir="rtl"></div>  
اضافة دوال الحجز (Booking) لكل من Amadeus وDuffel فوق نفس مشروع TypeScript السابق، مع DTO بسيط لطلب الحجز.  
  
***  
  
## 1) تحديث الأنواع (Types) لإضافة حجز  
  
`src/types/flights.dto.ts` – أضف في آخر الملف:  
  
```ts  
export interface AmadeusTraveler {  
  id: string;  
  dateOfBirth: string; // 'YYYY-MM-DD'  
  name: {  
    firstName: string;  
    lastName: string;  
  };  
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';  
  contact?: {  
    emailAddress: string;  
    phones?: Array<{  
      deviceType: 'MOBILE' | 'LANDLINE';  
      countryCallingCode: string;  
      number: string;  
    }>;  
  };  
}  
  
export interface AmadeusBookingRequest {  
  flightOffers: any[];             // نعيد إرسال الـ offer الأصلي من Amadeus  
  travelers: AmadeusTraveler[];  
}  
  
export interface DuffelPassenger {  
  title?: string;  
  firstName: string;  
  lastName: string;  
  email: string;  
  phone: string;  
}  
  
export interface DuffelBookingRequest {  
  offerId: string;  
  passengers: DuffelPassenger[];  
}  
```  
  
(يمكن تضييق نوع `flightOffers` لاحقًا باستيراد Types دقيقة من توثيق Amadeus.)  
  
***  
  
## 2) Amadeus Booking Service (TS)  
  
`src/services/amadeus.service.ts` – أضف دالتين جديدتين:  
  
```ts  
import { amadeusClient } from '../config/amadeus.config';  
import {  
  FlightOfferDTO,  
  FlightSearchParams,  
  AmadeusBookingRequest,  
} from '../types/flights.dto';  
import { parseISODurationToMinutes } from '../utils/duration';  
  
// ... الكود السابق لـ searchFlightsAmadeus و mapAmadeusOfferToDTO ...  
  
export async function priceFlightsAmadeus(  
  flightOffers: any[],  
): Promise<any> {  
  const response = await amadeusClient.shopping.flightOffers.pricing.post(  
    JSON.stringify({  
       {  
        type: 'flight-offers-pricing',  
        flightOffers,  
      },  
    }),  
  );  
  
  return (response as any).result;  
}  
  
export async function bookFlightsAmadeus(  
  bookingRequest: AmadeusBookingRequest,  
): Promise<any> {  
  const { flightOffers, travelers } = bookingRequest;  
  
  const response = await amadeusClient.booking.flightOrders.post(  
    JSON.stringify({  
       {  
        type: 'flight-order',  
        flightOffers,  
        travelers,  
      },  
    }),  
  );  
  
  return (response as any).result; // يحتوي رقم الحجز وبياناته  
}  
```  
  
***  
  
## 3) Duffel Booking Service (TS)  
  
`src/services/duffel.service.ts` – أضف في الأعلى:  
  
```ts  
import {  
  FlightOfferDTO,  
  FlightSearchParams,  
  DuffelBookingRequest,  
} from '../types/flights.dto';  
```  
  
ثم أضف دالة الحجز:  
  
```ts  
export async function bookFlightsDuffel(  
  bookingRequest: DuffelBookingRequest,  
): Promise<any> {  
  const { offerId, passengers } = bookingRequest;  
  
  const order = await duffelClient.orders.create({  
    selected_offers: [offerId],  
    passengers: passengers.map((p, index) => ({  
      id: `passenger_${index + 1}`,  
      type: 'adult',  
      title: p.title || 'mr',  
      given_name: p.firstName,  
      family_name: p.lastName,  
      email: p.email,  
      phone_number: p.phone,  
    })),  
  });  
  
  return order;  
}  
```  
  
***  
  
## 4) تحديث الكنترولر لإضافة مسارات الحجز  
  
`src/controllers/flights.controller.ts` – استورد الدوال الجديدة:  
  
```ts  
import {  
  searchFlightsAmadeus,  
  priceFlightsAmadeus,  
  bookFlightsAmadeus,  
} from '../services/amadeus.service';  
import {  
  searchFlightsDuffel,  
  bookFlightsDuffel,  
} from '../services/duffel.service';  
import {  
  FlightOfferDTO,  
  FlightSearchParams,  
  ProviderName,  
  AmadeusBookingRequest,  
  DuffelBookingRequest,  
} from '../types/flights.dto';  
```  
  
أضف كنترولرات جديدة:  
  
```ts  
export async function priceAmadeusController(  
  req: Request<unknown, unknown, { flightOffers: any[] }>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const { flightOffers } = req.body;  
    const result = await priceFlightsAmadeus(flightOffers);  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
  
export async function bookAmadeusController(  
  req: Request<unknown, unknown, AmadeusBookingRequest>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const result = await bookFlightsAmadeus(req.body);  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
  
export async function bookDuffelController(  
  req: Request<unknown, unknown, DuffelBookingRequest>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const result = await bookFlightsDuffel(req.body);  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
```  
  
(كنترولر البحث `searchFlightsController` يبقى كما هو.)  
  
***  
  
## 5) تحديث المسارات (Routes)  
  
`src/routes/flights.routes.ts` – حدّثه:  
  
```ts  
import { Router } from 'express';  
import {  
  searchFlightsController,  
  priceAmadeusController,  
  bookAmadeusController,  
  bookDuffelController,  
} from '../controllers/flights.controller';  
  
const router = Router();  
  
// Search (موحّد)  
router.post('/search', searchFlightsController);  
  
// Amadeus pricing & booking  
router.post('/amadeus/price', priceAmadeusController);  
router.post('/amadeus/book', bookAmadeusController);  
  
// Duffel booking  
router.post('/duffel/book', bookDuffelController);  
  
export default router;  
```  
  
***  
  
## 6) أمثلة JSON للنداءات  
  
### 6.1 تسعير Amadeus  
  
`POST /api/flights/amadeus/price`  
  
```json  
{  
  "flightOffers": [  
    {  
      "id": "1",  
      "source": "GDS",  
      "itineraries": [ /* نفس العرض الذي أعادته Amadeus من search */ ],  
      "price": { "currency": "USD", "total": "350.00" },  
      "travelerPricings": [ /* ... */ ]  
    }  
  ]  
}  
```  
  
(ترسل العرض كما هو من استجابة البحث.)  
  
### 6.2 حجز Amadeus  
  
`POST /api/flights/amadeus/book`  
  
```json  
{  
  "flightOffers": [ /* نفس ما أرسلته في price أو النتيجة بعد pricing */ ],  
  "travelers": [  
    {  
      "id": "1",  
      "dateOfBirth": "1990-01-01",  
      "name": { "firstName": "Ahmed", "lastName": "Ali" },  
      "gender": "MALE",  
      "contact": {  
        "emailAddress": "ahmed@example.com",  
        "phones": [  
          {  
            "deviceType": "MOBILE",  
            "countryCallingCode": "966",  
            "number": "501234567"  
          }  
        ]  
      }  
    }  
  ]  
}  
```  
  
### 6.3 حجز Duffel  
  
`POST /api/flights/duffel/book`  
  
```json  
{  
  "offerId": "off_123456789",  
  "passengers": [  
    {  
      "firstName": "Ahmed",  
      "lastName": "Ali",  
      "title": "mr",  
      "email": "ahmed@example.com",  
      "phone": "+966501234567"  
    }  
  ]  
}  
```  
  
بهذا يصبح لدينا:  
  
- `/api/flights/search` → نتائج موحدة (DTO).    
- `/api/flights/amadeus/price` → تثبيت سعر Amadeus.    
- `/api/flights/amadeus/book` → إنشاء حجز Amadeus.    
- `/api/flights/duffel/book` → إنشاء حجز عبر Duffel.  
<div dir="rtl"></div>  
<div dir="rtl">***</div>  
  
## 1) تصميم DTO موحّد لنتائج الحجز  
  
أضف في `src/types/flights.dto.ts`:  
  
```ts  
import type { ProviderName } from './flights.dto'; // إن كانت في نفس الملف تجاهل هذا السطر  
  
export interface PassengerBookingDTO {  
  id: string;                       // ID الداخلي في المزوّد إن توفر  
  firstName: string;  
  lastName: string;  
  title?: string;  
  email?: string;  
  phone?: string;  
}  
  
export interface FlightOrderDTO {  
  provider: ProviderName;           // 'amadeus' | 'skyscanner' | 'duffel'  
  providerOrderId: string;          // رقم الحجز/الطلب عند المزوّد (PNR / order_id)  
  bookingReference?: string | null; // PNR أو referencecode إن وجد  
  createdAt?: string | null;        // ISO datetime  
  passengers: PassengerBookingDTO[];  
  offers: FlightOfferDTO[];         // العروض التي تم الحجز عليها (عادة عرض واحد)  
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'UNKNOWN';  
  raw?: any;                        // النتيجة الأصلية للاستخدام الداخلي/الديبغ  
}  
```  
  
> ملاحظة: نعيد استخدام `FlightOfferDTO` نفسه لتمثيل الرحلة المحجوزة؛ إما أن تبنيها من البيانات في نتيجة الحجز، أو تعيد حفظ العرض قبل الحجز وتربطه بالطلب.  
  
***  
  
## 2) توحيد نتيجة حجز Amadeus  
  
### 2.1 تعديل خدمة Amadeus  
  
في `src/services/amadeus.service.ts`:  
  
```ts  
import {  
  FlightOfferDTO,  
  FlightSearchParams,  
  AmadeusBookingRequest,  
  FlightOrderDTO,  
  PassengerBookingDTO,  
} from '../types/flights.dto';  
```  
  
أضف Mapper من نتيجة Amadeus إلى `FlightOrderDTO`:  
  
```ts  
function mapAmadeusOrderToDTO(order: any): FlightOrderDTO {  
  // structure النموذجي لنتيجة flightOrders.post:  
  // {  { id, type, associatedRecords, flightOffers, travelers, ... } }  
  const data = order.data || order;  
  
  // استخراج رقم الحجز المرجعي (PNR)  
  let bookingReference: string | null = null;  
  if (Array.isArray(data.associatedRecords) && data.associatedRecords.length > 0) {  
    bookingReference = data.associatedRecords[0].reference || null;  
  }  
  
  // تحويل الركاب  
  const passengers: PassengerBookingDTO[] = (data.travelers || []).map(  
    (t: any): PassengerBookingDTO => ({  
      id: t.id,  
      firstName: t.name?.firstName,  
      lastName: t.name?.lastName,  
      title: undefined, // Amadeus لا يرسل title غالباً في هذا المستوى  
      email: t.contact?.emailAddress,  
      phone: t.contact?.phones?.[0]  
        ? `+${t.contact.phones[0].countryCallingCode}${t.contact.phones[0].number}`  
        : undefined,  
    }),  
  );  
  
  // تحويل flightOffers داخل الطلب إلى DTO (يمكن أن يكون أكثر من عرض في بعض الحالات)  
  const offers: FlightOfferDTO[] = (data.flightOffers || []).map(  
    (fo: any) => mapAmadeusOfferToDTO(fo),  
  );  
  
  const createdAt = data.bookingDate || data.creationDate || null;  
  
  return {  
    provider: 'amadeus',  
    providerOrderId: data.id,  
    bookingReference,  
    createdAt,  
    passengers,  
    offers,  
    status: 'CONFIRMED', // أمكن التحسين لاحقًا من status الفعلي إن وجد  
    raw: order,  
  };  
}  
```  
  
ثم عدّل دالة `bookFlightsAmadeus` لتعيد DTO بدل raw:  
  
```ts  
export async function bookFlightsAmadeus(  
  bookingRequest: AmadeusBookingRequest,  
): Promise<FlightOrderDTO> {  
  const { flightOffers, travelers } = bookingRequest;  
  
  const response = await amadeusClient.booking.flightOrders.post(  
    JSON.stringify({  
       {  
        type: 'flight-order',  
        flightOffers,  
        travelers,  
      },  
    }),  
  );  
  
  const result = (response as any).result;  
  return mapAmadeusOrderToDTO(result);  
}  
```  
  
***  
  
## 3) توحيد نتيجة حجز Duffel  
  
### 3.1 تعديل خدمة Duffel  
  
في `src/services/duffel.service.ts`:  
  
```ts  
import {  
  FlightOfferDTO,  
  FlightSearchParams,  
  DuffelBookingRequest,  
  FlightOrderDTO,  
  PassengerBookingDTO,  
} from '../types/flights.dto';  
```  
  
أضف Mapper:  
  
```ts  
function mapDuffelOrderToDTO(order: any): FlightOrderDTO {  
  const data = order.data || order;  
  
  const providerOrderId = data.id;  
  const bookingReference = data.booking_reference || null;  
  const createdAt = data.created_at || null;  
  
  const passengers: PassengerBookingDTO[] = (data.passengers || []).map(  
    (p: any): PassengerBookingDTO => ({  
      id: p.id,  
      firstName: p.given_name,  
      lastName: p.family_name,  
      title: p.title,  
      email: p.email,  
      phone: p.phone_number,  
    }),  
  );  
  
  // بعض أوامر Duffel تحتوي على offers كأجزاء من الـ order  
  // إن لم توجد، يمكنك ربط الـ offer من الـ search السابق وتخزينه في DB لديك  
  const offers: FlightOfferDTO[] = (data.offers || []).map((offer: any) =>  
    mapDuffelOfferToDTO(offer),  
  );  
  
  // تقدير status  
  let status: FlightOrderDTO['status'] = 'UNKNOWN';  
  if (data.status === 'confirmed') status = 'CONFIRMED';  
  else if (data.status === 'cancelled') status = 'CANCELLED';  
  else if (data.status === 'pending') status = 'PENDING';  
  
  return {  
    provider: 'duffel',  
    providerOrderId,  
    bookingReference,  
    createdAt,  
    passengers,  
    offers,  
    status,  
    raw: order,  
  };  
}  
```  
  
وعدّل `bookFlightsDuffel` ليعيد DTO:  
  
```ts  
export async function bookFlightsDuffel(  
  bookingRequest: DuffelBookingRequest,  
): Promise<FlightOrderDTO> {  
  const { offerId, passengers } = bookingRequest;  
  
  const order = await duffelClient.orders.create({  
    selected_offers: [offerId],  
    passengers: passengers.map((p, index) => ({  
      id: `passenger_${index + 1}`,  
      type: 'adult',  
      title: p.title || 'mr',  
      given_name: p.firstName,  
      family_name: p.lastName,  
      email: p.email,  
      phone_number: p.phone,  
    })),  
  });  
  
  return mapDuffelOrderToDTO(order);  
}  
```  
  
***  
  
## 4) تحديث الكنترولر ليستفيد من DTO الموحّد  
  
في `src/controllers/flights.controller.ts`:  
  
```ts  
import {  
  FlightOfferDTO,  
  FlightSearchParams,  
  ProviderName,  
  AmadeusBookingRequest,  
  DuffelBookingRequest,  
  FlightOrderDTO,  
} from '../types/flights.dto';  
```  
  
الآن، الكنترولرات الخاصة بالحجز ستعيد `FlightOrderDTO` جاهزًا:  
  
```ts  
export async function bookAmadeusController(  
  req: Request<unknown, unknown, AmadeusBookingRequest>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const result: FlightOrderDTO = await bookFlightsAmadeus(req.body);  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
  
export async function bookDuffelController(  
  req: Request<unknown, unknown, DuffelBookingRequest>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const result: FlightOrderDTO = await bookFlightsDuffel(req.body);  
    res.json(result);  
  } catch (err) {  
    next(err);  
  }  
}  
```  
  
بهذا يصبح:  
  
- `/api/flights/amadeus/book` → يعيد `FlightOrderDTO` موحّد.    
- `/api/flights/duffel/book` → يعيد نفس الشكل `FlightOrderDTO`.  
  
الـ Frontend الآن يتعامل مع نفس الهيكل للحجز، بغض النظر عن المزود، ويمكنه مثلًا:  
  
- عرض `bookingReference` في صفحة التأكيد.    
- عرض قائمة الركاب من `passengers`.    
- عرض تفاصيل الرحلة من `offers[0].slices`.  
<div dir="rtl"></div>  
<div dir="rtl">بالاضافة إلى دعم `paymentInfo` في DTO وربطه بمنصة Moyasar بشكل نظري/عملي (بدون استدعاء فعلي لـ API حقيقية باتباع النمط المعروف لـ Moyasar).</div>  
  
***  
  
## 1) تحديث DTO لإضافة `paymentInfo`  
  
في `src/types/flights.dto.ts` أضف/عدّل:  
  
```ts  
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';  
  
export interface PaymentInfoDTO {  
  provider: 'moyasar';  
  paymentId: string;         // ID العملية في Moyasar  
  currency: string;          // "SAR" مثلاً  
  amount: number;            // بالقروش عادة (halalas) وفقاً لمعيار Moyasar  
  status: PaymentStatus;  
  createdAt?: string | null; // وقت إنشاء الدفع  
  paidAt?: string | null;    // وقت الدفع الفعلي إن وجد  
}  
  
export interface FlightOrderDTO {  
  // الحقول السابقة...  
  provider: ProviderName;  
  providerOrderId: string;  
  bookingReference?: string | null;  
  createdAt?: string | null;  
  passengers: PassengerBookingDTO[];  
  offers: FlightOfferDTO[];  
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'UNKNOWN';  
  paymentInfo?: PaymentInfoDTO;   // <== حقل جديد  
  raw?: any;  
}  
```  
  
***  
  
## 2) مفهوم التكامل مع Moyasar (تسلسل منطقي)  
  
السيناريو الشائع:  
  
1. العميل يختار الرحلة (من نتائج Amadeus / Duffel).    
2. Backend يحسب السعر النهائي المطلوب تحصيله (مثلاً من `FlightOfferDTO.pricing.total` ويحوّله إلى هللات `amount * 100`).    
3. Backend ينشئ Payment Intent أو Payment Request عند Moyasar.    
4. Moyasar يردّ بـ `paymentId` أو `id` ورابط أو بيانات لإتمام الدفع (Checkout URL أو Token).    
5. بعد نجاح الدفع (Webhook أو Redirect callback) يقوم Backend عندك بحجز الرحلة فعلياً عبر Amadeus/Duffel، ثم يربط الحجز `FlightOrderDTO` مع `paymentInfo`.  
  
سأعطيك أجزاء الكود اللازمة لهيكلة هذا.  
  
***  
  
## 3) إضافة Moyasar Service نظرياً  
  
### 3.1 إعداد الـ config  
  
أنشئ:  
  
```text  
src/config/moyasar.config.ts  
src/services/moyasar.service.ts  
```  
  
في `src/config/env.config.ts` أضف:  
  
```ts  
  moyasar: {  
    secretKey: process.env.MOYASAR_SECRET_KEY || '',  
    publishableKey: process.env.MOYASAR_PUBLISHABLE_KEY || '',  
  },  
```  
  
وفي `.env`:  
  
```env  
MOYASAR_SECRET_KEY=sk_test_xxx  
MOYASAR_PUBLISHABLE_KEY=pk_test_xxx  
```  
  
في `src/config/moyasar.config.ts` (تصوّر عام):  
  
```ts  
import axios from 'axios';  
import { env } from './env.config';  
  
export const moyasarClient = axios.create({  
  baseURL: 'https://api.moyasar.com/v1',  
  auth: {  
    username: env.moyasar.secretKey,  
    password: '', // Moyasar تستخدم Basic Auth بالـ secretKey فقط  
  },  
  headers: {  
    'Content-Type': 'application/json',  
  },  
});  
```  
  
صيغة الـ Auth والـ URLs تحتاج مطابقة للتوثيق الرسمي عند التطبيق الفعلي.  
  
***  
  
## 4) خدمة الدفع مع Moyasar  
  
`src/services/moyasar.service.ts`:  
  
```ts  
import { moyasarClient } from '../config/moyasar.config';  
import { PaymentInfoDTO, PaymentStatus } from '../types/flights.dto';  
  
interface CreatePaymentParams {  
  amount: number;   // بالقروش (مثلاً 10000 = 100.00 SAR)  
  currency: string; // "SAR"  
  description?: string;  
  source: {  
    type: 'token' | 'creditcard' | 'applepay'; // حسب ما تدعمه عندك  
    tokenId?: string;  
    name?: string;  
    number?: string;  
    cvc?: string;  
    month?: string;  
    year?: string;  
  };  
  metadata?: Record<string, any>;  
}  
  
export async function createMoyasarPayment(  
  params: CreatePaymentParams,  
): Promise<PaymentInfoDTO> {  
  const { amount, currency, description, source, metadata } = params;  
  
  // مثال عام، قد يختلف عن التوثيق الفعلي  
  const { data } = await moyasarClient.post('/payments', {  
    amount,  
    currency,  
    description,  
    source,  
    metadata,  
  });  
  
  const statusMap: Record<string, PaymentStatus> = {  
    initiated: 'PENDING',  
    paid: 'PAID',  
    failed: 'FAILED',  
    canceled: 'CANCELLED',  
  };  
  
  const status: PaymentStatus =  
    statusMap[data.status] || 'PENDING';  
  
  const paymentInfo: PaymentInfoDTO = {  
    provider: 'moyasar',  
    paymentId: data.id,  
    currency: data.currency,  
    amount: data.amount,  
    status,  
    createdAt: data.created_at || null,  
    paidAt: data.paid_at || null,  
  };  
  
  return paymentInfo;  
}  
```  
  
> في الواقع ستستخدم غالبًا token من واجهة JavaScript لمويصر في الواجهة الأمامية، وترسله هنا في `source.tokenId`.  
  
***  
  
## 5) ربط الدفع بالحجز في Flow واحد  
  
لنفرض أنك تريد Endpoint يقوم بالتالي:  
  
- تأكيد الدفع في Moyasar (أو إنشاءه واستقبال Webhook، لكن سنبسط).    
- إذا كانت حالة الدفع `PAID` → يقوم بعمل حجز عبر Amadeus أو Duffel.    
- يعيد `FlightOrderDTO` مع `paymentInfo` مدمج.  
  
### 5.1 مثال: Endpoint موحّد لحجز Amadeus مع دفع Moyasar  
  
في `src/controllers/flights.controller.ts` أضف:  
  
```ts  
import { createMoyasarPayment } from '../services/moyasar.service';  
import { PaymentInfoDTO } from '../types/flights.dto';  
```  
  
ثم كنترولر جديد:  
  
```ts  
interface BookWithPaymentBody extends AmadeusBookingRequest {  
  payment: {  
    amount: number;          // بالقروش (halalas)  
    currency: string;        // 'SAR'  
    description?: string;  
    source: {  
      type: 'token' | 'creditcard' | 'applepay';  
      tokenId?: string;  
      name?: string;  
      number?: string;  
      cvc?: string;  
      month?: string;  
      year?: string;  
    };  
  };  
}  
  
export async function bookAmadeusWithPaymentController(  
  req: Request<unknown, unknown, BookWithPaymentBody>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const { payment, ...bookingRequest } = req.body;  
  
    // 1) إنشاء عملية دفع في Moyasar  
    const paymentInfo: PaymentInfoDTO = await createMoyasarPayment({  
      amount: payment.amount,  
      currency: payment.currency,  
      description: payment.description,  
      source: payment.source,  
      meta {  
        provider: 'amadeus',  
        // يمكن حفظ جزء من بيانات الرحلة هنا (origin, destination...)  
      },  
    });  
  
    if (paymentInfo.status !== 'PAID') {  
      // لم يتم الدفع بنجاح، لا نقوم بالحجز  
      res.status(402).json({  
        error: 'payment_not_paid',  
        paymentInfo,  
      });  
      return;  
    }  
  
    // 2) دفع ناجح → نكمل الحجز في Amadeus  
    const order: FlightOrderDTO = await bookFlightsAmadeus(bookingRequest);  
  
    // 3) نحقن paymentInfo في نتيجة الحجز  
    const orderWithPayment: FlightOrderDTO = {  
      ...order,  
      paymentInfo,  
    };  
  
    res.json(orderWithPayment);  
  } catch (err) {  
    next(err);  
  }  
}  
```  
  
في `src/routes/flights.routes.ts` أضف:  
  
```ts  
import { bookAmadeusWithPaymentController } from '../controllers/flights.controller';  
  
router.post('/amadeus/book-with-payment', bookAmadeusWithPaymentController);  
```  
  
***  
  
## 6) نفس الفكرة لDuffel  
  
ببساطة تكرر نفس النمط لكن مع `DuffelBookingRequest`:  
  
```ts  
interface BookDuffelWithPaymentBody extends DuffelBookingRequest {  
  payment: {  
    amount: number;  
    currency: string;  
    description?: string;  
    source: {  
      type: 'token' | 'creditcard' | 'applepay';  
      tokenId?: string;  
      name?: string;  
      number?: string;  
      cvc?: string;  
      month?: string;  
      year?: string;  
    };  
  };  
}  
  
export async function bookDuffelWithPaymentController(  
  req: Request<unknown, unknown, BookDuffelWithPaymentBody>,  
  res: Response,  
  next: NextFunction,  
): Promise<void> {  
  try {  
    const { payment, ...bookingRequest } = req.body;  
  
    const paymentInfo = await createMoyasarPayment({  
      amount: payment.amount,  
      currency: payment.currency,  
      description: payment.description,  
      source: payment.source,  
      meta { provider: 'duffel', offerId: bookingRequest.offerId },  
    });  
  
    if (paymentInfo.status !== 'PAID') {  
      res.status(402).json({ error: 'payment_not_paid', paymentInfo });  
      return;  
    }  
  
    const order = await bookFlightsDuffel(bookingRequest);  
  
    const orderWithPayment: FlightOrderDTO = {  
      ...order,  
      paymentInfo,  
    };  
  
    res.json(orderWithPayment);  
  } catch (err) {  
    next(err);  
  }  
}  
```  
  
وفي routes:  
  
```ts  
router.post('/duffel/book-with-payment', bookDuffelWithPaymentController);  
```  
  
***  
  
## 7) ملاحظات عملية مهمّة  
  
- غالبًا لن تنفّذ الحجز بعد الدفع مباشرة من نفس الطلب، بل ستعتمد على Webhook من Moyasar يؤكد أن الدفع تم بنجاح (لتفادي العبث بالـ callback من العميل).    
- في الحالة الإنتاجية:  
  - تنشئ Payment في Moyasar وتخزن بياناته في DB مع حالة `PENDING`.    
  - عند وصول Webhook بحالة `paid`، تنفّذ من Backend فقط:  
    - حجز Amadeus/Duffel،    
    - تحديث سجل الدفع إلى `PAID`،    
    - إنشاء `FlightOrder` في DB مع `paymentInfo`.    
- ما عرضته هنا هو شكل مبسّط لتوضيح المعمارية وارتباط `paymentInfo` بـ `FlightOrderDTO`.  
  
بهذا أصبحت طبقة الحجز لديك موحّدة من حيث:  
  
- شكل نتيجة الحجز `FlightOrderDTO` (Amadeus / Duffel).    
- شكل معلومات الدفع `paymentInfo` (Moyasar).    
- إمكانية استبدال Moyasar لاحقًا بمزوّد آخر مع الحفاظ على نفس الـ DTO تقريبًا.  
  
