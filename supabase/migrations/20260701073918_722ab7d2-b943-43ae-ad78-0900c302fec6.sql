CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  new_code text;
  done boolean := false;
BEGIN
  WHILE NOT done LOOP
    new_code := upper(substring(replace(encode(extensions.gen_random_bytes(6), 'base64'), '/', '') || replace(encode(extensions.gen_random_bytes(6), 'base64'), '+', ''), 1, 8));
    new_code := regexp_replace(new_code, '[^A-Z0-9]', 'X', 'g');
    PERFORM 1 FROM public.profiles WHERE referral_code = new_code;
    IF NOT FOUND THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, public.generate_referral_code());
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Do not block auth signup if profile creation fails
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;