
-- 1. Slug on projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug text UNIQUE;

CREATE OR REPLACE FUNCTION public.slugify(_v text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(_v, '')), '[^a-z0-9]+', '-', 'g'))
$$;

CREATE OR REPLACE FUNCTION public.projects_set_slug()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  base text;
  candidate text;
  n int := 0;
BEGIN
  IF NEW.slug IS NOT NULL AND length(NEW.slug) > 0 THEN
    RETURN NEW;
  END IF;
  base := nullif(public.slugify(NEW.name), '');
  IF base IS NULL THEN
    base := substr(replace(NEW.id::text, '-', ''), 1, 8);
  END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.projects WHERE slug = candidate AND id <> NEW.id) LOOP
    n := n + 1;
    candidate := base || '-' || n::text;
  END LOOP;
  NEW.slug := candidate;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_set_slug_trg ON public.projects;
CREATE TRIGGER projects_set_slug_trg BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.projects_set_slug();

-- Backfill
UPDATE public.projects SET slug = NULL WHERE slug = '';
DO $$
DECLARE r record; base text; candidate text; n int;
BEGIN
  FOR r IN SELECT id, name FROM public.projects WHERE slug IS NULL LOOP
    base := nullif(public.slugify(r.name), '');
    IF base IS NULL THEN base := substr(replace(r.id::text, '-', ''), 1, 8); END IF;
    candidate := base; n := 0;
    WHILE EXISTS (SELECT 1 FROM public.projects WHERE slug = candidate) LOOP
      n := n + 1; candidate := base || '-' || n::text;
    END LOOP;
    UPDATE public.projects SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.projects ALTER COLUMN slug SET NOT NULL;

-- 2. Changelog entries
CREATE TABLE IF NOT EXISTS public.changelog_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text not null default '',
  tag text,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.changelog_entries TO authenticated;
GRANT ALL ON public.changelog_entries TO service_role;
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage changelog" ON public.changelog_entries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TRIGGER update_changelog_updated_at BEFORE UPDATE ON public.changelog_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Feature requests
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'open' check (status in ('open','planned','in_progress','done','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_requests TO authenticated;
GRANT ALL ON public.feature_requests TO service_role;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage feature_requests" ON public.feature_requests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

CREATE TRIGGER update_feature_requests_updated_at BEFORE UPDATE ON public.feature_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Anonymous votes
CREATE TABLE IF NOT EXISTS public.feature_votes (
  id uuid primary key default gen_random_uuid(),
  feature_request_id uuid not null references public.feature_requests(id) on delete cascade,
  voter_id text not null,
  created_at timestamptz not null default now(),
  UNIQUE (feature_request_id, voter_id)
);
CREATE INDEX IF NOT EXISTS feature_votes_fr_idx ON public.feature_votes(feature_request_id);
GRANT SELECT ON public.feature_votes TO authenticated;
GRANT ALL ON public.feature_votes TO service_role;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read votes" ON public.feature_votes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.feature_requests fr
    JOIN public.projects p ON p.id = fr.project_id
    WHERE fr.id = feature_request_id AND p.user_id = auth.uid()
  ));

-- 5. Public RPCs (bypass RLS, expose only safe columns)

CREATE OR REPLACE FUNCTION public.get_public_project(_slug text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'project', to_jsonb(p) - 'user_id' - 'widget_key',
    'changelog', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', c.id, 'title', c.title, 'body', c.body, 'tag', c.tag,
        'published_at', c.published_at
      ) ORDER BY c.published_at DESC)
      FROM public.changelog_entries c
      WHERE c.project_id = p.id AND c.published = true
    ), '[]'::jsonb),
    'features', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', f.id, 'title', f.title, 'description', f.description,
        'status', f.status, 'created_at', f.created_at,
        'votes', (SELECT count(*) FROM public.feature_votes v WHERE v.feature_request_id = f.id)
      ) ORDER BY f.created_at DESC)
      FROM public.feature_requests f
      WHERE f.project_id = p.id
    ), '[]'::jsonb)
  )
  FROM public.projects p
  WHERE p.slug = _slug
$$;
GRANT EXECUTE ON FUNCTION public.get_public_project(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.cast_public_vote(_feature_id uuid, _voter text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cnt int;
BEGIN
  IF _voter IS NULL OR length(_voter) < 8 THEN
    RAISE EXCEPTION 'invalid voter';
  END IF;
  INSERT INTO public.feature_votes (feature_request_id, voter_id)
    VALUES (_feature_id, _voter)
    ON CONFLICT DO NOTHING;
  SELECT count(*) INTO cnt FROM public.feature_votes WHERE feature_request_id = _feature_id;
  RETURN cnt;
END;
$$;
GRANT EXECUTE ON FUNCTION public.cast_public_vote(uuid, text) TO anon, authenticated;

-- 6. Public widget insert RPC (bypasses RLS)
CREATE OR REPLACE FUNCTION public.submit_public_feedback(
  _widget_key text, _message text, _page_url text, _browser text, _screenshot_url text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid; new_id uuid;
BEGIN
  IF _message IS NULL OR length(trim(_message)) = 0 THEN
    RAISE EXCEPTION 'message required';
  END IF;
  IF length(_message) > 5000 THEN
    RAISE EXCEPTION 'message too long';
  END IF;
  SELECT id INTO pid FROM public.projects WHERE widget_key = _widget_key;
  IF pid IS NULL THEN RAISE EXCEPTION 'invalid widget_key'; END IF;
  INSERT INTO public.feedbacks (project_id, message, page_url, browser, screenshot_url)
    VALUES (pid, _message, _page_url, _browser, _screenshot_url)
    RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.submit_public_feedback(text, text, text, text, text) TO anon, authenticated;
