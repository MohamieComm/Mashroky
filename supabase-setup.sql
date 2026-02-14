-- =============================================
-- مشروك — إعادة إنشاء جداول Supabase
-- يُنفّذ من: Supabase Dashboard → SQL Editor
-- =============================================

-- ========== الخطوة 1: حذف الجداول القديمة ==========
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.api_keys CASCADE;
DROP TABLE IF EXISTS public.users_admin CASCADE;
DROP TABLE IF EXISTS public.airlines CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.destinations CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.offers CASCADE;
DROP TABLE IF EXISTS public.hotels CASCADE;
DROP TABLE IF EXISTS public.flights CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.seasons CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;

-- حذف الدوال والمشغلات
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role) CASCADE;

-- ========== الخطوة 2: إنشاء الجداول ==========

-- نوع الأدوار
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- جدول الملفات الشخصية
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- جدول الأدوار
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- دالة فحص الأدوار
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- جدول الرحلات
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL, destination TEXT NOT NULL, country TEXT NOT NULL,
  description TEXT, image_url TEXT,
  price DECIMAL(10,2) NOT NULL, original_price DECIMAL(10,2),
  duration_days INTEGER NOT NULL DEFAULT 7,
  start_date DATE, end_date DATE,
  included_services TEXT[], visa_required BOOLEAN DEFAULT false,
  visa_info TEXT, travel_procedures TEXT, best_season TEXT,
  rating DECIMAL(2,1) DEFAULT 0, reviews_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active trips" ON public.trips FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage trips" ON public.trips FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول الحجوزات
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  travelers_count INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT, payment_status TEXT DEFAULT 'unpaid',
  special_requests TEXT, contact_phone TEXT, contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول المواسم
CREATE TABLE public.seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL, season TEXT NOT NULL, description TEXT,
  image TEXT, price TEXT, options TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Admins can manage seasons" ON public.seasons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- إعدادات المدير
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_video_url TEXT, updated_by UUID REFERENCES auth.users(id),
  app_download_image_url TEXT, app_download_link TEXT,
  featured_image_url TEXT, featured_title TEXT,
  featured_description TEXT, featured_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage admin settings" ON public.admin_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view admin settings" ON public.admin_settings FOR SELECT USING (true);

-- جدول الرحلات الجوية
CREATE TABLE public.flights (
  id TEXT PRIMARY KEY, "from" TEXT, "to" TEXT, airline TEXT,
  "departTime" TEXT, "arriveTime" TEXT, duration TEXT,
  price TEXT, stops TEXT, rating DECIMAL(2,1), image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view flights" ON public.flights FOR SELECT USING (true);
CREATE POLICY "Admins can manage flights" ON public.flights FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول الفنادق
CREATE TABLE public.hotels (
  id TEXT PRIMARY KEY, name TEXT, location TEXT, image TEXT,
  rating DECIMAL(2,1), reviews INTEGER, price TEXT,
  "priceNote" TEXT, description TEXT, amenities TEXT[],
  distances JSONB, cuisine TEXT, tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admins can manage hotels" ON public.hotels FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول العروض
CREATE TABLE public.offers (
  id TEXT PRIMARY KEY, title TEXT, description TEXT, image TEXT,
  discount INTEGER, "validUntil" TEXT,
  "originalPrice" TEXT, "newPrice" TEXT, season TEXT,
  includes TEXT[], tips TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Admins can manage offers" ON public.offers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول الأنشطة
CREATE TABLE public.activities (
  id TEXT PRIMARY KEY, title TEXT, location TEXT,
  category TEXT, price TEXT, image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Admins can manage activities" ON public.activities FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول المقالات
CREATE TABLE public.articles (
  id TEXT PRIMARY KEY, title TEXT, category TEXT,
  date TEXT, image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول الوجهات
CREATE TABLE public.destinations (
  id TEXT PRIMARY KEY, title TEXT, country TEXT,
  region TEXT, tag TEXT, duration TEXT,
  "priceFrom" TEXT, description TEXT, image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Admins can manage destinations" ON public.destinations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول الشركاء
CREATE TABLE public.partners (
  id TEXT PRIMARY KEY, name TEXT, type TEXT,
  website TEXT, commission TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- جدول شركات الطيران
CREATE TABLE public.airlines (
  id TEXT PRIMARY KEY, name TEXT, code TEXT,
  website TEXT, phone TEXT, logo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view airlines" ON public.airlines FOR SELECT USING (true);
CREATE POLICY "Admins can manage airlines" ON public.airlines FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- مفاتيح API
CREATE TABLE public.api_keys (
  id TEXT PRIMARY KEY, provider TEXT, key TEXT,
  environment TEXT DEFAULT 'test',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage api keys" ON public.api_keys FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- مستخدمو الإدارة
CREATE TABLE public.users_admin (
  id TEXT PRIMARY KEY, email TEXT, role TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.users_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage users" ON public.users_admin FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- الصفحات
CREATE TABLE public.pages (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE, title TEXT,
  content TEXT, status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published pages" ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- المدفوعات
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  booking_id UUID REFERENCES public.bookings(id),
  amount DECIMAL(10,2) NOT NULL, currency TEXT DEFAULT 'SAR',
  status TEXT DEFAULT 'pending', provider TEXT DEFAULT 'moyasar',
  provider_id TEXT, metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ========== الخطوة 3: الدوال والمشغّلات ==========

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON public.seasons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== الخطوة 4: إدخال البيانات العربية النظيفة ==========

-- الرحلات الجوية
INSERT INTO public.flights (id, "from", "to", airline, "departTime", "arriveTime", duration, price, stops, rating, image) VALUES
('flight-1', 'جدة', 'الرياض', 'الخطوط السعودية', '08:00', '09:30', '1 ساعة و30 دقيقة', '650', 'مباشر', 4.8, 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80'),
('flight-2', 'الرياض', 'الدمام', 'طيران ناس', '14:30', '15:40', '1 ساعة و10 دقائق', '430', 'مباشر', 4.6, 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=800&q=80'),
('flight-3', 'جدة', 'المدينة', 'طيران أديل', '11:00', '12:00', 'ساعة واحدة', '320', 'مباشر', 4.5, 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?auto=format&fit=crop&w=800&q=80'),
('flight-4', 'الرياض', 'دبي', 'طيران الإمارات', '18:20', '20:55', '2 ساعات و35 دقيقة', '980', 'مباشر', 4.7, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'),
('flight-5', 'الدمام', 'القاهرة', 'مصر للطيران', '07:10', '10:05', '2 ساعات و55 دقيقة', '1,150', 'مباشر', 4.4, 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'),
('flight-6', 'جدة', 'عمان', 'الملكية الأردنية', '13:15', '15:40', '2 ساعات و25 دقيقة', '1,050', 'مباشر', 4.3, 'https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?auto=format&fit=crop&w=800&q=80');

-- الفنادق
INSERT INTO public.hotels (id, name, location, image, rating, reviews, price, "priceNote", description, amenities, distances, cuisine, tag) VALUES
('hotel-1', 'فندق كورنيش جدة', 'جدة - الكورنيش', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 4.7, 1890, '1,800', 'يبدأ من', 'إقامة راقية بإطلالة بحرية وخدمات عائلية متكاملة.', ARRAY['واي فاي مجاني','مسبح','موقف سيارات','إفطار','صالة رياضية','خدمة غرف'], '[{"name":"واجهة جدة البحرية","distance":"2 كم"},{"name":"مطار الملك عبدالعزيز","distance":"25 كم"},{"name":"البلد التاريخية","distance":"6 كم"}]'::jsonb, 'مطعم بحري ومقهى', 'الأكثر طلبا'),
('hotel-2', 'فندق الأعمال بالرياض', 'الرياض - العليا', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80', 4.6, 1420, '1,250', 'يبدأ من', 'موقع مثالي لرجال الأعمال بالقرب من المراكز التجارية.', ARRAY['واي فاي عالي السرعة','مركز أعمال','صالة رياضية','موقف سيارات','خدمة غرف'], '[{"name":"بوليفارد الرياض","distance":"5 كم"},{"name":"مركز المملكة","distance":"2 كم"},{"name":"مطار الملك خالد","distance":"28 كم"}]'::jsonb, 'مطبخ عالمي وعربي', 'رجال أعمال'),
('hotel-3', 'منتجع العلا الصحراوي', 'العلا - وادي عشار', 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1200&q=80', 4.8, 980, '2,900', 'يبدأ من', 'تجربة فاخرة وسط الصخور الطبيعية مع أنشطة ليلية مميزة.', ARRAY['منتجع صحي','جولات خاصة','مسبح','خدمة كونسيرج'], '[{"name":"مدائن صالح","distance":"22 كم"},{"name":"مطار العلا","distance":"30 كم"}]'::jsonb, 'مطبخ محلي فاخر', 'فاخر'),
('hotel-4', 'فندق المدينة سنتر', 'المدينة المنورة - المنطقة المركزية', 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?auto=format&fit=crop&w=1200&q=80', 4.5, 2100, '1,100', 'يبدأ من', 'موقع قريب من الحرم مع خدمات عائلية مريحة.', ARRAY['واي فاي مجاني','إفطار','خدمة غرف','موقف سيارات'], '[{"name":"الحرم النبوي","distance":"1 كم"},{"name":"متحف المدينة","distance":"3 كم"},{"name":"مطار الأمير محمد","distance":"18 كم"}]'::jsonb, 'مطعم عربي', 'عائلي'),
('hotel-5', 'منتجع أبها الجبلي', 'أبها - السودة', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80', 4.4, 760, '1,350', 'يبدأ من', 'إطلالات جبلية وهواء بارد وأنشطة عائلية متنوعة.', ARRAY['مواقف','كافيه','جلسات خارجية','واي فاي'], '[{"name":"منتزه السودة","distance":"2 كم"},{"name":"مطار أبها","distance":"30 كم"}]'::jsonb, 'مطبخ محلي', 'طبيعة'),
('hotel-6', 'فندق الخبر المطل', 'الخبر - الكورنيش', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 4.3, 640, '950', 'يبدأ من', 'خيار اقتصادي بإطلالة بحرية وموقع قريب من المقاهي.', ARRAY['واي فاي','موقف سيارات','غرف عائلية'], '[{"name":"كورنيش الخبر","distance":"1 كم"},{"name":"مطار الملك فهد","distance":"45 كم"}]'::jsonb, 'مقهى وحلويات', 'اقتصادي');

-- العروض
INSERT INTO public.offers (id, title, description, image, discount, "validUntil", "originalPrice", "newPrice", season, includes, tips) VALUES
('offer-1', 'عرض شتاء العلا', 'تجربة صحراوية فاخرة مع جولات تاريخية وإقامة مميزة.', 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1200&q=80', 35, '2026-03-31', '4,200', '2,730', 'winter', ARRAY['إقامة 3 ليال','جولة مدائن صالح','تنقلات داخلية'], ARRAY['احجز قبل أسبوعين','أفضل وقت مساء']),
('offer-2', 'باقة جدة البحرية', 'إقامة على الكورنيش مع رحلة بحرية وأنشطة مائية.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 25, '2026-04-15', '3,100', '2,325', 'spring', ARRAY['إقامة ليلتين','رحلة بحرية','تذاكر نشاط بحري'], ARRAY['اختر الصباح المبكر','أضف وجبة بحرية']),
('offer-3', 'عطلة الرياض العائلية', 'باقة عائلية قريبة من الفعاليات والترفيه.', 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1200&q=80', 20, '2026-05-01', '2,400', '1,920', 'spring', ARRAY['إقامة 2 ليال','تذاكر فعالية','تنقلات'], ARRAY['احجز عطلة نهاية الأسبوع','تحقق من العروض العائلية']),
('offer-4', 'جولة الطائف الباردة', 'أجواء لطيفة وزيارات للمرتفعات والأسواق التراثية.', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80', 18, '2026-06-10', '2,000', '1,640', 'summer', ARRAY['إقامة ليلة','جولة مرتفعات','مرشد محلي'], ARRAY['خذ ملابس خفيفة','أفضل وقت عصرًا']),
('offer-5', 'رحلة أبها الجبلية', 'باقة طبيعة لعشاق الضباب والمناظر الخلابة.', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80', 22, '2026-07-15', '2,800', '2,184', 'summer', ARRAY['إقامة 3 ليال','جولات طبيعية','تنقلات'], ARRAY['احجز باكرًا','استمتع بجلسات المساء']),
('offer-6', 'زيارة المدينة المنورة', 'إقامة قريبة من الحرم النبوي مع خدمات مريحة.', 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?auto=format&fit=crop&w=1200&q=80', 15, '2026-03-20', '1,900', '1,615', 'ramadan', ARRAY['إقامة ليلتين','خدمة نقل','إفطار'], ARRAY['اختر الغرف القريبة','تحقق من مواقيت الدخول']);

-- الأنشطة
INSERT INTO public.activities (id, title, location, category, price, image) VALUES
('activity-1', 'جولة بحرية في جدة', 'جدة', 'بحرية', '180', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'),
('activity-2', 'زيارة الدرعية التاريخية', 'الرياض', 'ثقافية', '120', 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=1200&q=80'),
('activity-3', 'رحلة هضاب العلا', 'العلا', 'طبيعة', '260', 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1200&q=80'),
('activity-4', 'أسواق الطائف التقليدية', 'الطائف', 'تسوق', '90', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80'),
('activity-5', 'الهايكينج في أبها', 'أبها', 'مغامرة', '210', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'),
('activity-6', 'جولة متاحف المدينة', 'المدينة المنورة', 'ثقافة', '110', 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?auto=format&fit=crop&w=1200&q=80');

-- المقالات
INSERT INTO public.articles (id, title, category, date, image) VALUES
('article-1', 'دليل السفر إلى العلا', 'وجهات', '2026-02-01', 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1200&q=80'),
('article-2', 'أفضل الأنشطة في جدة البحرية', 'تجارب', '2026-01-20', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'),
('article-3', 'الرياض الحديثة: ماذا تزور؟', 'مدن', '2026-01-10', 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1200&q=80'),
('article-4', 'شتاء أبها وكيف تستمتع به', 'مواسم', '2025-12-22', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'),
('article-5', 'دليل زيارة المدينة المنورة', 'روحانيات', '2025-12-05', 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?auto=format&fit=crop&w=1200&q=80'),
('article-6', 'أفضل وجهات الربيع في السعودية', 'مواسم', '2025-11-18', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80');

-- الوجهات
INSERT INTO public.destinations (id, title, country, region, tag, duration, "priceFrom", description, image) VALUES
('destination-1', 'جدة', 'السعودية', 'الغربية', 'بحرية', '3 أيام', '2,600', 'واجهة بحرية وأسواق قديمة وتجارب طعام متنوعة.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'),
('destination-2', 'الرياض', 'السعودية', 'الوسطى', 'مدينة', '3 أيام', '2,300', 'عاصمة نابضة بالحياة مع فعاليات ومراكز تسوق.', 'https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1200&q=80'),
('destination-3', 'العلا', 'السعودية', 'الشمالية', 'تراث', '2 أيام', '3,100', 'وجهة تاريخية فريدة بمواقع أثرية ومناظر صحراوية.', 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=1200&q=80'),
('destination-4', 'المدينة المنورة', 'السعودية', 'الغربية', 'روحاني', '4 أيام', '3,600', 'رحلة روحانية مع خدمات مريحة وقريبة من الحرم.', 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?auto=format&fit=crop&w=1200&q=80'),
('destination-5', 'أبها', 'السعودية', 'الجنوبية', 'طبيعة', '4 أيام', '2,500', 'أجواء جبلية وضباب لطيف وقرى تراثية.', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'),
('destination-6', 'دبي', 'الإمارات', 'الخليج', 'تسوق', '5 أيام', '4,200', 'مدينة عالمية بتجارب تسوق وترفيه متنوعة.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80');

-- الشركاء
INSERT INTO public.partners (id, name, type, website, commission) VALUES
('partner-1', 'ناس للطيران', 'شركة طيران', 'https://www.flynas.com', '4%'),
('partner-2', 'هيئة السياحة السعودية', 'جهة سياحية', 'https://www.visitsaudi.com', '2%'),
('partner-3', 'موياسر', 'بوابة دفع', 'https://moyasar.com', '1.8%'),
('partner-4', 'سابتكو', 'نقل بري', 'https://www.saptco.com.sa', '3%'),
('partner-5', 'Amadeus', 'مزود تقني', 'https://developers.amadeus.com', 'حسب العقد');

-- شركات الطيران
INSERT INTO public.airlines (id, name, code, website, phone, logo) VALUES
('airline-1', 'الخطوط السعودية', 'SV', 'https://www.saudia.com', '+966-920022222', 'https://www.gstatic.com/flights/airline_logos/70px/SV.png'),
('airline-2', 'طيران ناس', 'XY', 'https://www.flynas.com', '+966-920001234', 'https://www.gstatic.com/flights/airline_logos/70px/XY.png'),
('airline-3', 'طيران أديل', 'F3', 'https://www.flyadeal.com', '+966-920000177', 'https://www.gstatic.com/flights/airline_logos/70px/F3.png'),
('airline-4', 'فلاي دبي', 'FZ', 'https://www.flydubai.com', '+971-600544445', 'https://www.gstatic.com/flights/airline_logos/70px/FZ.png'),
('airline-5', 'الخطوط القطرية', 'QR', 'https://www.qatarairways.com', '+974-4144-5555', 'https://www.gstatic.com/flights/airline_logos/70px/QR.png'),
('airline-6', 'العربية للطيران', 'G9', 'https://www.airarabia.com', '+971-600508001', 'https://www.gstatic.com/flights/airline_logos/70px/G9.png'),
('airline-7', 'الخطوط التركية', 'TK', 'https://www.turkishairlines.com', '+90-212-4636363', 'https://www.gstatic.com/flights/airline_logos/70px/TK.png');

-- الصفحات
INSERT INTO public.pages (id, slug, title, content, status) VALUES
('page-about', 'about', 'عن مشروك', 'منصة سعودية متخصصة في خدمات السفر والسياحة.', 'published'),
('page-terms', 'terms', 'الشروط والأحكام', 'شروط استخدام منصة مشروك للسفر والسياحة.', 'published'),
('page-privacy', 'privacy', 'سياسة الخصوصية', 'سياسة حماية البيانات الشخصية للمستخدمين.', 'published'),
('page-support', 'support', 'الدعم الفني', 'تواصل معنا لأي استفسار أو مساعدة.', 'published'),
('page-faq', 'faq', 'الأسئلة الشائعة', 'إجابات على أكثر الأسئلة شيوعًا.', 'published');

-- ========== تم بنجاح ✅ ==========
