# Mashrok Deployment Guide - دليل النشر

## النسخة العربية

### متطلبات النشر قبل البدء

#### 1. الحسابات والمفاتيح المطلوبة
```
✓ حساب GitHub (يتم استخدامه للـ version control)
✓ حساب Railway (https://railway.app - للنشر)
✓ نطاق مسجَّل: www.mashrok.online
✓ بيانات Supabase:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
✓ بيانات Amadeus API:
  - AMADEUS_CLIENT_ID
  - AMADEUS_CLIENT_SECRET
✓ بيانات Moyasar:
  - MOYASAR_SECRET_KEY
  - MOYASAR_PUBLISHABLE_KEY
  - VITE_MOYASAR_PUBLISHABLE_KEY
✓ رابط API للرحلات:
  - VITE_FLIGHT_API_URL
✓ روابط الرجوع:
  - APP_BASE_URL
  - BACKEND_BASE_URL
```

---

## خطوات النشر بسهولة

### المرحلة الأولى: الإعداد المحلي

```powershell
# 1. انسخ الملف
copy .env.example .env

# 2. حدّث .env بـ بيانات اعتماداتك
notepad .env
# أضف:
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key
# إلخ...

# 3. اختبر البناء محلياً
cd app
npm ci
npm run build
cd ..
```

### المرحلة الثانية: دفع إلى GitHub

```powershell
# قم بهذا مرة واحدة لتجهيز المستودع
cd c:\Users\ishou\Desktop\MashroukGit\Tmahshruk

# 1. أضف ملفات الإعدادات
git add Dockerfile docker-compose.yml railway.json .env.example deploy.ps1 deploy.sh DEPLOYMENT.md

# 2. اكتب رسالة
git commit -m "chore: add deployment configuration for Railway"

# 3. دفع إلى GitHub (سيطلب تسجيل دخول عبر المتصفح)
git push origin main
```

### المرحلة الثالثة: النشر على Railway

#### **الطريقة الأولى: استخدام سكريبت PowerShell (الأسهل للـ Windows)**

```powershell
# افتح PowerShell في مجلد المشروع
cd c:\Users\ishou\Desktop\MashroukGit\Tmahshruk

# شغّل السكريبت
powershell -ExecutionPolicy Bypass -File deploy.ps1

# السكريبت سيقوم بـ:
# ✓ التحقق من تثبيت Railway CLI
# ✓ تسجيل الدخول إلى Railway
# ✓ بناء التطبيق محلياً
# ✓ تعيين متغيرات البيئة
# ✓ نشر التطبيق
```

#### **الطريقة الثانية: استخدام واجهة الويب (بدون أوامر)**

1. اذهب إلى https://railway.app/dashboard
2. انقر **"Create Project"**
3. اختر **"Deploy from GitHub"**
4. اختر المستودع: **MohamieComm/Mashroky**
5. اختر الفرع: **main**
6. Railway سيكتشف Dockerfile تلقائياً

**إضافة متغيرات البيئة:**
1. في Dashboard، اذهب إلى **Project → Variables**
2. أضف كل متغير:
   ```
   VITE_SUPABASE_URL = https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJxx...
   VITE_ADMIN_EMAILS = admin@example.com
   AMADEUS_CLIENT_ID = xxxxx
   AMADEUS_CLIENT_SECRET = xxxxx
   VITE_FLIGHT_API_URL = https://jubilant-hope-production-a334.up.railway.app
   MOYASAR_SECRET_KEY = sk_test_xxxxx
   MOYASAR_PUBLISHABLE_KEY = pk_test_xxxxx
   VITE_MOYASAR_PUBLISHABLE_KEY = pk_test_xxxxx
   APP_BASE_URL = https://www.mashrok.online
   BACKEND_BASE_URL = https://jubilant-hope-production-a334.up.railway.app
   NODE_ENV = production
   PORT = 3000
   ```

### المرحلة الرابعة: ربط النطاق

#### في لوحة تحكم Railway:

1. اذهب إلى **Project Settings**
2. انقر **Domains**
3. انقر **Add Custom Domain**
4. اكتب: **www.mashrok.online**
5. انسخ CNAME الذي تعطيه لك Railway
   - مثال: `cname.railway.app`

#### عند مسجّل النطاق (GoDaddy، Namecheap، إلخ):

1. اذهب إلى إدارة الـ DNS
2. ألغِ أي سجلات قديمة لـ www
3. أضف سجل جديد:

| الحقل | القيمة |
|-------|--------|
| **الاسم** | www |
| **النوع** | CNAME |
| **القيمة** | cname.railway.app |
| **TTL** | 3600 |

4. احفظ التغييرات

**Note:** قد يستغرق انتشار DNS 5 دقائق إلى 24 ساعة

---

## التحقق من النشر

### تحقق من حالة البناء
```powershell
# شغّل أوامر Railway مباشرة
railway login

# عرض logs البناء والتشغيل
railway logs -f

# افتح Dashboard
railway open

# رؤية معلومات الخدمة
railway status
```

### اختبر الموقع
```powershell
# بعد أن ينشر Railway:
# تحقق من: https://www.mashrok.online

# أو استخدم Railway URL الموقتة أثناء انتشار DNS
# مثال: https://mashroky-production.up.railway.app
```

---

## النشر التلقائي (CI/CD)

بعد ربط المستودع بـ Railway:

1. أي **push** إلى `main` سيبدأ البناء تلقائياً
2. إذا نجح البناء → يتم النشر على production
3. تراقب التقدم في **Railway Dashboard**

مثال:
```powershell
# اكتب كود جديد
# git add changes
git commit -m "feat: add new feature"
git push origin main

# سينطلق البناء تلقائياً في Railway!
# لا تحتاج تشغيل أوامر إضافية
```

---

## استكشاف الأخطاء

### المشكلة: بناء فاشل

**الحل:**
```powershell
# عرض الـ logs التفصيلي
railway logs --limit=100

# تحقق من:
# - Dockerfile syntax (قواعد البناء)
# - package.json scripts موجودة
# - جميع الملفات المرجعية موجودة
```

### المشكلة: الخدمة تتعطل بعد البناء

**الحل:**
```powershell
# عرض آخر الأخطاء
railway logs -f

# التحقق من متغيرات البيئة الناقصة
railway variables

# إعادة تشغيل
railway restart
```

### المشكلة: النطاق لا يعمل

**الحل:**
```powershell
# تحقق من DNS propagation
nslookup www.mashrok.online

# إذا لم ينتشر بعد، انتظر 24 ساعة
# أو تحقق من CNAME في مسجل النطاق
```

---

## أوامر مفيدة

```powershell
# تسجيل الدخول
railway login

# ربط مشروع موجود
railway link --project=PROJECT_ID

# عرض معلومات المشروع الحالي
railway project

# عرض المتغيرات المعرّفة
railway variables

# تعيين متغير جديد
railway variables set KEY=value

# حذف متغير
railway variables unset KEY

# إعادة تشغيل الخدمة
railway restart

# عرض الـ logs المباشر (live)
railway logs -f

# فتح Dashboard في المتصفح
railway open

# معرفة الـ service status
railway status

# فصل المشروع (عند التبديل لمشروع آخر)
railway unlink
```

---

## الخطوات النهائية والتحقق

بعد النشر مباشرة:

```powershell
# 1. اختبر الصفحة الرئيسية
Invoke-WebRequest https://www.mashrok.online -UseBasicParsing

# 2. اختبر تسجيل الدخول (Supabase)
# - ادخل الموقع
# - حاول تسجيل حساب جديد
# - تحقق من عدم ظهور أخطاء

# 3. اختبر العربية والتصميم
# - تصفح الصفحات
# - اقرأ النصوص العربية
# - تحقق من الـ responsive design

# 4. اختبر الـ APIs
# - نشاطات (لا أخطاء في الـ console)
# - عرض (صور تحمل)
# - سلة التسوق (تخزين local)
```

---

## ملاحظات مهمة

### 🔒 الأمان
- لا تضع كلمات المرور في `.env` الذي يُرسل
- استخدم Railway Dashboard فقط لـ secrets
- فعّل GitHub Branch Protection على `main`

### 📊 المراقبة
- راقب الـ logs يومياً للأخطاء
- استخدم `railway metrics` لرؤية الاستخدام
- اعدل الـ environment إذا لزم الأمر

### 🔄 التحديثات
- Railway يوفر auto-updates للـ dependencies
- تحقق من Updates في settings
- Test قبل النشر في development branch

### 💾 النسخ الاحتياطية
- استخدم Supabase Backup في لوحة التحكم
- احفظ نسخة من الـ secrets والمفاتيح بأمان

---

## روابط مفيدة

- **Railway Docs:** https://docs.railway.app
- **Railway Status:** https://status.railway.app
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Docs:** https://docs.github.com
- **Docker Docs:** https://docs.docker.com

---

## دعم وتوصيات

إذا واجهت مشكلة:
1. تحقق من Railway logs
2. اتصل بـ Railway support: https://railway.app/support
3. اطلب في GitHub Issues في المستودع

**Good luck! 🚀**
