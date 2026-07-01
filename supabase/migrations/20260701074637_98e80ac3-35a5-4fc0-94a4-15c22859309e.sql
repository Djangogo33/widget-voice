
-- 1) Prevent privilege escalation on profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at
     OR NEW.free_months_credit IS DISTINCT FROM OLD.free_months_credit
     OR NEW.referred_by IS DISTINCT FROM OLD.referred_by
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
  THEN
    RAISE EXCEPTION 'Not allowed to modify privileged profile fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_privileged_updates ON public.profiles;
CREATE TRIGGER profiles_prevent_privileged_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW
WHEN (
  current_setting('request.jwt.claims', true) IS NOT NULL
  AND (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'authenticated'
)
EXECUTE FUNCTION public.prevent_profile_privileged_updates();

-- 2) Restrict feedbacks inserts to project owners
CREATE POLICY "Owners insert feedbacks"
ON public.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = feedbacks.project_id
      AND p.user_id = auth.uid()
  )
);
