ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS app_download_image_url TEXT,
  ADD COLUMN IF NOT EXISTS app_download_link TEXT,
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
  ADD COLUMN IF NOT EXISTS featured_title TEXT,
  ADD COLUMN IF NOT EXISTS featured_description TEXT,
  ADD COLUMN IF NOT EXISTS featured_link TEXT;
