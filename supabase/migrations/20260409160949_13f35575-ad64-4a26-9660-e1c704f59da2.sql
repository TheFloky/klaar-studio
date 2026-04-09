
ALTER TABLE public.prospects
ADD COLUMN email_demo_sent boolean NOT NULL DEFAULT false,
ADD COLUMN email_sent boolean NOT NULL DEFAULT false,
ADD COLUMN meeting_done boolean NOT NULL DEFAULT false;

ALTER TABLE public.clients
ADD COLUMN project_fee numeric DEFAULT 0,
ADD COLUMN maintenance_fee numeric DEFAULT 0;
