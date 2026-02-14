-- ============================================================
-- Amadeus Integration — Supabase Database Schema
-- Tables: users, amadeus_config, bookings, api_logs, payments
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users (extends Supabase auth.users) ─────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  preferred_currency TEXT DEFAULT 'SAR',
  preferred_language TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Amadeus API Configuration ───────────────────────────────

CREATE TABLE IF NOT EXISTS public.amadeus_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT 'default',
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  base_url TEXT NOT NULL DEFAULT 'https://test.api.amadeus.com',
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Per-API enable/disable
  flights_enabled BOOLEAN NOT NULL DEFAULT true,
  hotels_enabled BOOLEAN NOT NULL DEFAULT true,
  transfers_enabled BOOLEAN NOT NULL DEFAULT true,
  activities_enabled BOOLEAN NOT NULL DEFAULT true,
  analytics_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Bookings ────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE booking_type_enum AS ENUM ('flight', 'hotel', 'transfer', 'activity');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'failed', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_type booking_type_enum NOT NULL,
  status booking_status_enum NOT NULL DEFAULT 'pending',
  -- Amadeus references
  amadeus_order_id TEXT,
  amadeus_confirm_nbr TEXT,
  -- Search / offer snapshot
  search_params JSONB NOT NULL DEFAULT '{}',
  selected_offer JSONB NOT NULL DEFAULT '{}',
  -- Traveler / guest details
  travelers JSONB NOT NULL DEFAULT '[]',
  -- Pricing
  currency TEXT NOT NULL DEFAULT 'SAR',
  total_amount DECIMAL(12,2),
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_type ON public.bookings(booking_type);
CREATE INDEX idx_bookings_created ON public.bookings(created_at DESC);

-- ── Payments ────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'debit_card', 'bank_transfer', 'wallet', 'cash');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SAR',
  status payment_status_enum NOT NULL DEFAULT 'pending',
  method payment_method_enum NOT NULL DEFAULT 'credit_card',
  -- Payment provider details
  provider_ref TEXT,
  provider_response JSONB,
  -- Card details (masked)
  card_last4 TEXT,
  card_brand TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON public.payments(booking_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);

-- ── API Logs ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_params JSONB,
  response_status INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_logs_user ON public.api_logs(user_id);
CREATE INDEX idx_api_logs_endpoint ON public.api_logs(endpoint);
CREATE INDEX idx_api_logs_created ON public.api_logs(created_at DESC);
CREATE INDEX idx_api_logs_status ON public.api_logs(response_status);

-- ── API Permissions (RBAC) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.api_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL, -- e.g. 'flights', 'hotels', 'admin', 'bookings'
  action TEXT NOT NULL,   -- e.g. 'read', 'write', 'delete', 'manage'
  allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default permissions
INSERT INTO public.api_permissions (role, resource, action, allowed) VALUES
  ('user', 'flights', 'read', true),
  ('user', 'flights', 'write', true),
  ('user', 'hotels', 'read', true),
  ('user', 'hotels', 'write', true),
  ('user', 'transfers', 'read', true),
  ('user', 'transfers', 'write', true),
  ('user', 'activities', 'read', true),
  ('user', 'bookings', 'read', true),
  ('user', 'bookings', 'write', true),
  ('admin', 'flights', 'read', true),
  ('admin', 'flights', 'write', true),
  ('admin', 'flights', 'manage', true),
  ('admin', 'hotels', 'read', true),
  ('admin', 'hotels', 'write', true),
  ('admin', 'hotels', 'manage', true),
  ('admin', 'transfers', 'read', true),
  ('admin', 'transfers', 'write', true),
  ('admin', 'transfers', 'manage', true),
  ('admin', 'activities', 'read', true),
  ('admin', 'activities', 'manage', true),
  ('admin', 'bookings', 'read', true),
  ('admin', 'bookings', 'write', true),
  ('admin', 'bookings', 'manage', true),
  ('admin', 'admin', 'read', true),
  ('super_admin', 'admin', 'manage', true)
ON CONFLICT DO NOTHING;

-- ── Row Level Security ──────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amadeus_config ENABLE ROW LEVEL SECURITY;

-- Profiles: users see own, admins see all
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Bookings: users see own, admins see all
CREATE POLICY "Users view own bookings" ON public.bookings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Payments: users see own
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all payments" ON public.payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- API Logs: admins only
CREATE POLICY "Admins view api logs" ON public.api_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Amadeus Config: super_admin only
CREATE POLICY "Super admins manage config" ON public.amadeus_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── Updated-at triggers ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_amadeus_config_updated_at BEFORE UPDATE ON public.amadeus_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
