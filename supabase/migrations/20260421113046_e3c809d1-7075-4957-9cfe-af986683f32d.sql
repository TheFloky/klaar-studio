ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS alt_slugs text[] NOT NULL DEFAULT '{}'::text[];
CREATE INDEX IF NOT EXISTS idx_blog_posts_alt_slugs ON public.blog_posts USING GIN(alt_slugs);