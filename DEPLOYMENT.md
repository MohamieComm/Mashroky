# نشر Mashrok على Railway والربط مع النطاق

## الخطوات المطلوبة

### 1. متطلبات النشر
- حساب GitHub مع مستودع pushذا Git history
- حساب Railway (https://railway.app)
- نطاق مسجل (www.mashrok.online)
- بيانات اعتماد APIs:
  - Supabase Project URL و Anon Key
  - Amadeus API credentials
  - Skyscanner API Key (اختياري)
  - Duffel API Key (اختياري)

### 2. تحضير المستودع

```bash
# 1. تأكد من وجود جميع الملفات المطلوبة
- Dockerfile ✓
- docker-compose.yml ✓
- railway.json ✓
- .env.example ✓
- app/package.json ✓
- flight-backend/package.json ✓

# 2. دفع التغييرات إلى GitHub
cd c:\\Users\\ishou\\Desktop\\MashroukGit\\Tmahshruk
git add .
git commit -m "chore: add deployment configuration for Railway"
git push origin main
```

### 3. نشر على Railway

#### الطريقة أ: استخدام Railway CLI (الموصى به)

```bash
# 1. تثبيت Railway CLI
npm install -g @railway/cli

# 2. تسجيل الدخول
railway login

# 3. إنشاء مشروع جديد
railway init

# أو ربط مع مشروع موجود
railway link --project=YOUR_PROJECT_ID

# 4. تعيين متغيرات البيئة
railway variables set VITE_SUPABASE_URL=https://...
railway variables set VITE_SUPABASE_ANON_KEY=...
railway variables set VITE_ADMIN_EMAILS=...
railway variables set AMADEUS_CLIENT_ID=...
railway variables set AMADEUS_CLIENT_SECRET=...
railway variables set SKYSCANNER_API_KEY=... (اختياري)
railway variables set DUFFEL_API_KEY=... (اختياري)
railway variables set PORT=3000

# 5. نشر (يتم بناؤه تلقائياً عند الـ push)
railway up
```

#### الطريقة ب: استخدام واجهة الويب (أبسط)

1. اذهب إلى https://railway.app/dashboard
2. انقر "Create Project"
3. اختر "Deploy from GitHub"
4. اختر المستودع MohamieComm/Mashroky
5. Railway سيكتشف تلقائياً اسم الـ service
6. في "Settings" → "Environment Variables" أضف:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_ADMIN_EMAILS
   - AMADEUS_CLIENT_ID
   - AMADEUS_CLIENT_SECRET
   - وغيرها...
7. النشر سيحدث تلقائياً عند كل push

### 4. ربط النطاق مع Railway

#### في لوحة تحكم Railway:

1. اذهب إلى Project Settings
2. انقر "Domains"
3. انقر "Add Domain"
4. أدخل: www.mashrok.online
5. Railway سيعطيك CNAME أو NS records

#### في مسجل النطاق (GoDaddy, Namecheap, etc):

**إذا استخدمت CNAME:**
```
subdomain: www
type: CNAME
value: your-railway-cname.railway.app
TTL: 3600 (أو افتراضي)
```

**أو استخدم NS records:**
```
استبدل nameservers حسابك بـ nameservers Railway:
ns1.railway.app
ns2.railway.app
ns3.railway.app
ns4.railway.app
```

### 5. التحقق من النشر

```bash
# 1. تحقق من URL Railway
# مثال: https://mashroky-production.up.railway.app

# 2. تحقق من النطاق المخصص
curl https://www.mashrok.online

# 3. تحقق من لوح التحكم
- Railway Dashboard → Project → Logs
- ابحث عن "listening on port 3000"
```

### 6. مراقبة استمرارية الخدمة

#### Health Check Configuration (موجود في Dockerfile)
- يفحص `/health` كل 30 ثانية
- إذا فشل 3 مرات متتالية، سيتم إعادة تشغيل الـ service

#### Logs Monitoring
```bash
railway logs -f
```

### 7. قائمة التحقق النهائية

- [ ] GitHub push نجح
- [ ] Railway project تم إنشاؤه
- [ ] جميع متغيرات البيئة موجودة
- [ ] البناء نجح (لا توجد أخطاء في Logs)
- [ ] التطبيق يعمل على المنفذ 3000
- [ ] النطاق www.mashrok.online يشير إلى Railway
- [ ] الوصول إلى www.mashrok.online يعمل بدون أخطاء
- [ ] Supabase auth يعمل
- [ ] Cart functionality يعمل
- [ ] Admin panel accessible

### 8. استكشاف الأخطاء

#### البناء يفشل
- تحقق من Dockerfile syntax
- تحقق من وجود جميع الملفات المرجعية
- تحقق من package.json scripts

#### الخدمة تتعطل بعد البناء
- تحقق من أخطاء في Railway Logs
- تحقق من متغيرات البيئة الناقصة
- تحقق من منفذ الاستماع

#### النطاق لا يعمل
- تحقق من DNS propagation (قد يستغرق 24 ساعة)
- تحقق من CNAME/NS records في مسجل النطاق
- اختبر باستخدام `nslookup www.mashrok.online`

### 9. عملية CI/CD التلقائية

بمجرد ربط المستودع:
1. أي push إلى `main` سيبدأ البناء التلقائي
2. إذا نجح، سيتم نشره على Production
3. يمكنك رؤية التقدم في Railway Dashboard

### 10. Commands مفيدة

```bash
# عرض URL الخدمة الحالية
railway open

# إعادة تشغيل الخدمة
railway restart

# عرض metrics
railway metrics

# فصل المشروع
railway unlink
```

## ملاحظات مهمة

1. **backend URL**: يجب أن يتم تحديث أي hard-coded URLs لـ Flight APIs
2. **CORS**: تأكد من أن CORS مكبرة لـ www.mashrok.online
3. **SSL/TLS**: Railway توفر SSL تلقائياً
4. **البيانات**: تأكد من أن Supabase RLS policies تسمح بـ API access
5. **عمليات النسخ الاحتياطي**: قم بإعداد نسخ احتياطية منتظمة من Supabase

## دعم إضافي

للمساعدة:
- Railway Documentation: https://docs.railway.app
- Railway Community: https://railway.community
- Supabase: https://supabase.com/docs
