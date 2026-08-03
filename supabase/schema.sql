-- ============================================================
-- World Spectrum — full database schema (PostgreSQL / Supabase)
-- Run this once in a fresh Supabase project (SQL Editor).
-- ============================================================

-- 1) Category enum -------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_category') THEN
    CREATE TYPE public.article_category AS ENUM (
      'sports',
      'politics',
      'shopping',
      'music',
      'medicine',
      'tourism',
      'economy',
      'weather',
      'onthisday',
      'cars'
    );
  END IF;
END
$$;

-- 2) Articles table ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category      public.article_category NOT NULL,
  title         text NOT NULL,
  summary       text,
  source_url    text NOT NULL,
  source_name   text,
  image_url     text,
  language      text NOT NULL DEFAULT 'ar',
  published_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT articles_source_url_language_key UNIQUE (source_url, language)
);

-- 3) Indexes -------------------------------------------------------
CREATE INDEX IF NOT EXISTS articles_category_published_idx
  ON public.articles (category, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_category_language_published
  ON public.articles (category, language, published_at DESC);

-- 4) Data API grants (required by PostgREST) ------------------------
GRANT SELECT ON public.articles TO anon;
GRANT SELECT ON public.articles TO authenticated;
GRANT ALL    ON public.articles TO service_role;

-- 5) Row Level Security --------------------------------------------
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Articles are publicly readable" ON public.articles;
CREATE POLICY "Articles are publicly readable"
  ON public.articles
  FOR SELECT
  USING (true);

-- Writes are performed only with the service role key (bypasses RLS),
-- so no INSERT/UPDATE/DELETE policies are defined on purpose.

-- 6) OPTIONAL: automatic refresh every 15 minutes -------------------
-- Requires the pg_cron and pg_net extensions.
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- SELECT cron.schedule(
--   'refresh-news-15min',
--   '*/15 * * * *',
--   $$
--     SELECT net.http_post(
--       url     := 'https://YOUR-DOMAIN/api/public/hooks/refresh-news',
--       headers := '{"Content-Type":"application/json","x-refresh-secret":"YOUR_REFRESH_CRON_TOKEN"}'::jsonb,
--       body    := '{}'::jsonb,
--       timeout_milliseconds := 120000
--     );
--   $$
-- );
