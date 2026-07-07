-- Attach trigger to prevent users from modifying privileged profile columns (plan, trial_ends_at, free_months_credit, referred_by, referral_code)
DROP TRIGGER IF EXISTS profiles_prevent_privileged_updates ON public.profiles;
CREATE TRIGGER profiles_prevent_privileged_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privileged_updates();