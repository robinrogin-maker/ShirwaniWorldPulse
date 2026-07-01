
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'ar';
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_source_url_key;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_source_url_language_key;
ALTER TABLE public.articles ADD CONSTRAINT articles_source_url_language_key UNIQUE (source_url, language);
CREATE INDEX IF NOT EXISTS idx_articles_category_language_published
  ON public.articles (category, language, published_at DESC);
