
-- =====================================================
-- PROFILES
-- =====================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  plan text NOT NULL DEFAULT 'free',
  referral_code text UNIQUE NOT NULL,
  referred_by uuid REFERENCES public.profiles(id),
  free_months_credit int NOT NULL DEFAULT 0,
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =====================================================
-- REFERRALS
-- =====================================================
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read referrals they participate in"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- =====================================================
-- PROMO CODES
-- =====================================================
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent int NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_codes TO authenticated, anon;
GRANT ALL ON public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Public read so the signup/pricing pages can validate codes
CREATE POLICY "Anyone can read promo codes"
  ON public.promo_codes FOR SELECT TO authenticated, anon
  USING (true);

-- =====================================================
-- HELPERS: updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- HELPERS: generate unique referral code
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  done boolean := false;
BEGIN
  WHILE NOT done LOOP
    -- 8-char uppercase alphanumeric
    new_code := upper(substring(replace(encode(gen_random_bytes(6), 'base64'), '/', '') || replace(encode(gen_random_bytes(6), 'base64'), '+', ''), 1, 8));
    new_code := regexp_replace(new_code, '[^A-Z0-9]', 'X', 'g');
    PERFORM 1 FROM public.profiles WHERE referral_code = new_code;
    IF NOT FOUND THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- =====================================================
-- SIGNUP HOOK: create profile automatically
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, public.generate_referral_code());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- APPLY REFERRAL (called from server fn after signup)
-- =====================================================
CREATE OR REPLACE FUNCTION public.apply_referral(_new_user_id uuid, _code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_id uuid;
  norm_code text := upper(trim(_code));
BEGIN
  IF norm_code IS NULL OR length(norm_code) = 0 THEN
    RETURN false;
  END IF;

  -- already referred?
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = _new_user_id AND referred_by IS NOT NULL) THEN
    RETURN false;
  END IF;

  SELECT id INTO ref_id FROM public.profiles
    WHERE referral_code = norm_code AND id <> _new_user_id;
  IF ref_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.profiles
    SET referred_by = ref_id,
        trial_ends_at = GREATEST(trial_ends_at, now() + interval '14 days')
    WHERE id = _new_user_id;

  UPDATE public.profiles
    SET free_months_credit = free_months_credit + 1
    WHERE id = ref_id;

  INSERT INTO public.referrals (referrer_id, referred_id, code)
    VALUES (ref_id, _new_user_id, norm_code)
    ON CONFLICT (referred_id) DO NOTHING;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.apply_referral(uuid, text) TO authenticated, service_role;

-- =====================================================
-- SEED a couple of promo codes for testing
-- =====================================================
INSERT INTO public.promo_codes (code, discount_percent, max_uses, expires_at)
VALUES
  ('LAUNCH20', 20, 1000, now() + interval '60 days'),
  ('WELCOME50', 50, 100, now() + interval '30 days');
