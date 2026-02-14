-- Fix: Authenticated users with admin role need to read api_keys
-- The "Admins can manage api keys" FOR ALL policy covers this,
-- but an explicit SELECT for authenticated ensures it works with RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'api_keys'
      AND policyname = 'Authenticated can view api keys'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can view api keys" ON public.api_keys FOR SELECT TO authenticated USING (true)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users_admin'
      AND policyname = 'Authenticated can view users admin'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated can view users admin" ON public.users_admin FOR SELECT TO authenticated USING (true)';
  END IF;
END;
$$;

-- Fix: seasons table id column should accept TEXT (admin generates text ids)
-- Must drop default first, change type, then set new default
ALTER TABLE public.seasons ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.seasons ALTER COLUMN id TYPE TEXT USING id::text;
ALTER TABLE public.seasons ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Fix: admin_settings should allow INSERT for authenticated admin users
-- The existing "Admins can manage admin settings" FOR ALL covers this,
-- but ensure INSERT policy explicitly exists for RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_settings'
      AND policyname = 'Authenticated admins can insert admin settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated admins can insert admin settings" ON public.admin_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END;
$$;

-- Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('public', 'public', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('promo', 'promo', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

-- Ensure authenticated users can upload to storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Authenticated admins can upload'
  ) THEN
    EXECUTE 'CREATE POLICY "Authenticated admins can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), ''admin''))';
  END IF;
END;
$$;
