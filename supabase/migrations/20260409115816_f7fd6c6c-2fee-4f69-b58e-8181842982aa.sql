
INSERT INTO storage.buckets (id, name, public) VALUES ('audit-reports', 'audit-reports', true);

CREATE POLICY "Audit reports are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'audit-reports');

CREATE POLICY "Authenticated users can upload audit reports"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audit-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update audit reports"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audit-reports' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete audit reports"
ON storage.objects FOR DELETE
USING (bucket_id = 'audit-reports' AND auth.role() = 'authenticated');
