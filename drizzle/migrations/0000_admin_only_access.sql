CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'julian.vidal@klaar-studio.ch';

DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['blog_posts','clients','prospects','bookings'] LOOP
  EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can delete %1$s" ON public.%1$I', t);
  EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can update %1$s" ON public.%1$I', t);
  EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can create %1$s" ON public.%1$I', t);
  EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can view %1$s" ON public.%1$I', t);
  EXECUTE format('CREATE POLICY "Admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.has_role(auth.uid(),''admin'')) WITH CHECK (public.has_role(auth.uid(),''admin''))', t);
END LOOP; END $$;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON public.blog_posts;

DROP POLICY "Anyone can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (
  length(name) BETWEEN 1 AND 200 AND length(business) BETWEEN 1 AND 200 AND length(needs) BETWEEN 1 AND 5000
  AND (email IS NULL OR length(email) <= 320) AND status IN ('pending','pending_scheduling') AND calendar_event_id IS NULL);

DROP POLICY "Anyone can log pageviews" ON public.pageviews;
CREATE POLICY "Anyone can log pageviews" ON public.pageviews FOR INSERT TO anon, authenticated WITH CHECK (
  length(session_id) BETWEEN 1 AND 100 AND length(path) BETWEEN 1 AND 500 AND (referrer IS NULL OR length(referrer) <= 1000)
  AND (duration_ms IS NULL OR duration_ms BETWEEN 0 AND 86400000));
DROP POLICY "Authenticated users can view pageviews" ON public.pageviews;
CREATE POLICY "Admins view pageviews" ON public.pageviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY "Allow all access to settings" ON public.settings;
CREATE POLICY "Public can read settings" ON public.settings FOR SELECT TO anon, authenticated USING (key = 'CAL_BOOKING_LINK' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY "Authenticated can delete blog images" ON storage.objects;
DROP POLICY "Authenticated can update blog images" ON storage.objects;
DROP POLICY "Authenticated can upload blog images" ON storage.objects;
DROP POLICY "Authenticated users can delete audit reports" ON storage.objects;
DROP POLICY "Authenticated users can update audit reports" ON storage.objects;
DROP POLICY "Authenticated users can upload audit reports" ON storage.objects;
CREATE POLICY "Admins upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('blog-images','audit-reports') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('blog-images','audit-reports') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('blog-images','audit-reports') AND public.has_role(auth.uid(),'admin'));