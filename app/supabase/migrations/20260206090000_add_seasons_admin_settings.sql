-- Create seasons table for seasonal offers
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  season TEXT NOT NULL,
  description TEXT,
  image TEXT,
  price TEXT,
  options TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
ON public.seasons FOR SELECT
USING (true);

CREATE POLICY "Admins can manage seasons"
ON public.seasons FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create admin settings table for promo media
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_video_url TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin settings"
ON public.admin_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view admin settings"
ON public.admin_settings FOR SELECT
USING (true);

-- Update timestamps
CREATE TRIGGER update_seasons_updated_at
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

