-- Admin content tables
CREATE TABLE IF NOT EXISTS public.flights (
  id TEXT PRIMARY KEY,
  "from" TEXT,
  "to" TEXT,
  airline TEXT,
  depart_time TEXT,
  arrive_time TEXT,
  duration TEXT,
  price TEXT,
  stops TEXT,
  rating NUMERIC,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hotels (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT,
  image TEXT,
  rating NUMERIC,
  reviews INTEGER,
  price TEXT,
  price_note TEXT,
  description TEXT,
  amenities TEXT[],
  distances JSONB,
  cuisine TEXT,
  tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image TEXT,
  discount NUMERIC,
  valid_until TEXT,
  original_price TEXT,
  new_price TEXT,
  season TEXT,
  includes TEXT[],
  tips TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  title TEXT,
  location TEXT,
  category TEXT,
  price TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.articles (
  id TEXT PRIMARY KEY,
  title TEXT,
  category TEXT,
  date TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY,
  title TEXT,
  country TEXT,
  region TEXT,
  tag TEXT,
  duration TEXT,
  price_from TEXT,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.partners (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  website TEXT,
  commission TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.airlines (
  id TEXT PRIMARY KEY,
  name TEXT,
  code TEXT,
  website TEXT,
  phone TEXT,
  logo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id TEXT PRIMARY KEY,
  name TEXT,
  provider TEXT,
  key TEXT,
  status TEXT DEFAULT 'disabled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.users_admin (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pages (
  id TEXT PRIMARY KEY,
  title TEXT,
  slug TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table for webhook storage
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  provider_payment_id TEXT NOT NULL,
  provider_event_id TEXT,
  event_type TEXT,
  status TEXT,
  amount INTEGER,
  currency TEXT,
  live BOOLEAN,
  account_name TEXT,
  metadata JSONB,
  raw JSONB,
  event_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_payment_id)
);

-- Ensure role helper exists (compatible with user_roles or profiles.role)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_user_roles BOOLEAN;
BEGIN
  SELECT to_regclass('public.user_roles') IS NOT NULL INTO has_user_roles;
  IF has_user_roles THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id
        AND lower(role::text) = lower(_role)
    );
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id
      AND lower(coalesce(role, '')) = lower(_role)
  );
END;
$$;

-- Add missing admin_settings columns
ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS promo_video_url TEXT,
  ADD COLUMN IF NOT EXISTS app_download_image_url TEXT,
  ADD COLUMN IF NOT EXISTS app_download_link TEXT,
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
  ADD COLUMN IF NOT EXISTS featured_title TEXT,
  ADD COLUMN IF NOT EXISTS featured_description TEXT,
  ADD COLUMN IF NOT EXISTS featured_link TEXT;

-- Enable RLS
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'flights'
      AND policyname = 'Anyone can view flights'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view flights" ON public.flights FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'hotels'
      AND policyname = 'Anyone can view hotels'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view hotels" ON public.hotels FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'offers'
      AND policyname = 'Anyone can view offers'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view offers" ON public.offers FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'activities'
      AND policyname = 'Anyone can view activities'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'articles'
      AND policyname = 'Anyone can view articles'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view articles" ON public.articles FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'destinations'
      AND policyname = 'Anyone can view destinations'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view destinations" ON public.destinations FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'partners'
      AND policyname = 'Anyone can view partners'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view partners" ON public.partners FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'airlines'
      AND policyname = 'Anyone can view airlines'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view airlines" ON public.airlines FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pages'
      AND policyname = 'Anyone can view pages'
  ) THEN
    EXECUTE 'CREATE POLICY "Anyone can view pages" ON public.pages FOR SELECT USING (true)';
  END IF;
END;
$$;

-- Admin-only policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'flights'
      AND policyname = 'Admins can manage flights'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage flights" ON public.flights FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'hotels'
      AND policyname = 'Admins can manage hotels'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage hotels" ON public.hotels FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'offers'
      AND policyname = 'Admins can manage offers'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage offers" ON public.offers FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'activities'
      AND policyname = 'Admins can manage activities'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage activities" ON public.activities FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'articles'
      AND policyname = 'Admins can manage articles'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'destinations'
      AND policyname = 'Admins can manage destinations'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage destinations" ON public.destinations FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'partners'
      AND policyname = 'Admins can manage partners'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage partners" ON public.partners FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'airlines'
      AND policyname = 'Admins can manage airlines'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage airlines" ON public.airlines FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pages'
      AND policyname = 'Admins can manage pages'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'api_keys'
      AND policyname = 'Admins can manage api keys'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage api keys" ON public.api_keys FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users_admin'
      AND policyname = 'Admins can manage users admin'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage users admin" ON public.users_admin FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'payments'
      AND policyname = 'Admins can manage payments'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), ''admin''))';
  END IF;
END;
$$;

-- Bookings policies (user-owned + admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Users can view own bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Users can insert bookings as self'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert bookings as self" ON public.bookings FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Users can update own bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Users can delete own bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete own bookings" ON public.bookings FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'bookings'
      AND policyname = 'Admins can manage bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin''))';
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Ensure update_updated_at_column() exists for triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Updated at triggers
DROP TRIGGER IF EXISTS update_flights_updated_at ON public.flights;
CREATE TRIGGER update_flights_updated_at
  BEFORE UPDATE ON public.flights
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotels_updated_at ON public.hotels;
CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities;
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_destinations_updated_at ON public.destinations;
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_airlines_updated_at ON public.airlines;
CREATE TRIGGER update_airlines_updated_at
  BEFORE UPDATE ON public.airlines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_admin_updated_at ON public.users_admin;
CREATE TRIGGER update_users_admin_updated_at
  BEFORE UPDATE ON public.users_admin
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
