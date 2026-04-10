
CREATE TABLE public.pageviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  device_type TEXT,
  language TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pageviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous visitors)
CREATE POLICY "Anyone can log pageviews"
ON public.pageviews
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only authenticated users can read (admin)
CREATE POLICY "Authenticated users can view pageviews"
ON public.pageviews
FOR SELECT
TO authenticated
USING (true);

-- Index for querying by date and path
CREATE INDEX idx_pageviews_created_at ON public.pageviews (created_at DESC);
CREATE INDEX idx_pageviews_session ON public.pageviews (session_id);
CREATE INDEX idx_pageviews_path ON public.pageviews (path);
