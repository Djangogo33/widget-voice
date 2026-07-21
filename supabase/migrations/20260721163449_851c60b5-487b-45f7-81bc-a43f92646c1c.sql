
-- Feedback type column
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'other';
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_type_check CHECK (type IN ('idea','bug','question','other'));
CREATE INDEX IF NOT EXISTS feedbacks_project_type_idx ON public.feedbacks(project_id, type);

-- Backfill type from message prefix
UPDATE public.feedbacks
SET type = CASE
  WHEN message ~* '^\[bug\]' THEN 'bug'
  WHEN message ~* '^\[idea\]' THEN 'idea'
  WHEN message ~* '^\[question\]' THEN 'question'
  ELSE 'other'
END
WHERE type = 'other';

-- Rate limits (sliding window per bucket+key)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  key text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 1,
  UNIQUE(bucket, key, window_start)
);
CREATE INDEX IF NOT EXISTS rate_limits_lookup_idx ON public.rate_limits(bucket, key, window_start DESC);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No public policies; service_role only.

-- Rate limit helper: returns true if allowed, false if over quota.
CREATE OR REPLACE FUNCTION public.rate_limit_check(_bucket text, _key text, _max int, _window_seconds int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur_window timestamptz := date_trunc('minute', now());
  total int;
BEGIN
  -- Insert or bump the current-window counter
  INSERT INTO public.rate_limits(bucket, key, window_start, count)
    VALUES (_bucket, _key, cur_window, 1)
    ON CONFLICT (bucket, key, window_start)
    DO UPDATE SET count = public.rate_limits.count + 1;

  SELECT COALESCE(SUM(count),0) INTO total
    FROM public.rate_limits
    WHERE bucket = _bucket AND key = _key
      AND window_start > now() - make_interval(secs => _window_seconds);

  -- Cleanup old rows opportunistically (5% chance)
  IF random() < 0.05 THEN
    DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 hour';
  END IF;

  RETURN total <= _max;
END;
$$;
REVOKE ALL ON FUNCTION public.rate_limit_check(text,text,int,int) FROM PUBLIC, anon, authenticated;

-- Duplicate detection: returns true if identical message posted for this project in the last N seconds.
CREATE OR REPLACE FUNCTION public.feedback_is_duplicate(_project_id uuid, _message text, _window_seconds int)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.feedbacks
    WHERE project_id = _project_id
      AND message = _message
      AND created_at > now() - make_interval(secs => _window_seconds)
  )
$$;
REVOKE ALL ON FUNCTION public.feedback_is_duplicate(uuid,text,int) FROM PUBLIC, anon, authenticated;
