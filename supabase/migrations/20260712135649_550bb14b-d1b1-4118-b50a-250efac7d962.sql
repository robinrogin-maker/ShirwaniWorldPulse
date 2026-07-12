SELECT cron.unschedule('mazaj-refresh-news') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'mazaj-refresh-news');
SELECT cron.unschedule('refresh-news-every-15-min') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-news-every-15-min');

SELECT cron.schedule(
  'refresh-news-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://worldspectrum.lovable.app/api/public/hooks/refresh-news',
    headers := '{"Content-Type":"application/json","x-refresh-secret":"05e47f12fb91b9fecab1af9121a9a1f1773f833de8aee75793a876e9ff6f214b"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  ) AS request_id;
  $$
);