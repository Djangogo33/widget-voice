
-- 1) profiles_update_privesc: attach trigger to block privileged field self-updates
DROP TRIGGER IF EXISTS prevent_profile_privileged_updates ON public.profiles;
CREATE TRIGGER prevent_profile_privileged_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privileged_updates();

-- 2) Storage policies for feedback-screenshots bucket
DROP POLICY IF EXISTS "Owners read screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Owners insert screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Owners update screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Owners delete screenshots" ON storage.objects;

CREATE POLICY "Owners read screenshots"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'feedback-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = split_part(objects.name, '/', 1)
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners insert screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'feedback-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = split_part(objects.name, '/', 1)
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners update screenshots"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'feedback-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = split_part(objects.name, '/', 1)
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners delete screenshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'feedback-screenshots'
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id::text = split_part(objects.name, '/', 1)
        AND p.user_id = auth.uid()
    )
  );

-- 3) Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated.
-- All app callers use service_role (server functions / server routes),
-- so PostgREST-exposed execution isn't needed.
REVOKE EXECUTE ON FUNCTION public.get_public_project(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_public_feedback(text, text, text, text, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cast_public_vote(uuid, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_referral(uuid, text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privileged_updates() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.projects_set_slug() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.slugify(text) FROM anon, authenticated, PUBLIC;
