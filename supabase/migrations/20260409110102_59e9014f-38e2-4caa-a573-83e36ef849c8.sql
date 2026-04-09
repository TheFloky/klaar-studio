CREATE TABLE public.prospects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website TEXT NOT NULL,
  company_name TEXT,
  niche TEXT,
  description TEXT,
  contacts JSONB DEFAULT '[]'::jsonb,
  financials JSONB DEFAULT '{}'::jsonb,
  reputation JSONB DEFAULT '{}'::jsonb,
  compliance_score INTEGER DEFAULT 0,
  compliance_details JSONB DEFAULT '{}'::jsonb,
  research_summary TEXT,
  email_draft TEXT,
  email_language TEXT DEFAULT 'de',
  demo_site_url TEXT,
  demo_site_password TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view prospects" ON public.prospects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create prospects" ON public.prospects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update prospects" ON public.prospects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete prospects" ON public.prospects FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON public.prospects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();