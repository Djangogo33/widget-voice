
CREATE POLICY "Owners read screenshots" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'feedback-screenshots'
  AND EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id::text = split_part(name, '/', 1) AND p.user_id = auth.uid()
  )
);
