-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  translation_group_id UUID NOT NULL DEFAULT gen_random_uuid(),
  lang TEXT NOT NULL CHECK (lang IN ('de','fr','en')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content_md TEXT NOT NULL,
  cover_image_url TEXT,
  cover_source TEXT CHECK (cover_source IN ('stock','ai','manual')),
  cover_attribution TEXT,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  external_links JSONB DEFAULT '[]'::jsonb,
  reading_time_min INTEGER DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft_generated' CHECK (status IN ('draft_generated','draft_reviewed','published','archived')),
  fact_check_notes JSONB DEFAULT '{}'::jsonb,
  source_input TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lang, slug)
);

CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_lang_status ON public.blog_posts(lang, status);
CREATE INDEX idx_blog_posts_translation_group ON public.blog_posts(translation_group_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can only read published posts
CREATE POLICY "Public can read published blog posts"
ON public.blog_posts FOR SELECT
USING (status = 'published');

-- Authenticated users have full access (admin)
CREATE POLICY "Authenticated users can view all blog posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create blog posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete blog posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (true);

-- updated_at trigger
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for blog cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated can upload blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Authenticated can update blog images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated can delete blog images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'blog-images');