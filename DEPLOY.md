# نشر المشروع على Cloudflare

سبب الرسالة `Missing Supabase environment variable(s): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY`:
البناء (build) ينجح لأن هذه المتغيرات تُقرأ **وقت التشغيل** على الخادم، وليس وقت البناء.
لذلك يجب أن تكون موجودة في إعدادات Cloudflare نفسها.

## 1) متغيرات وقت البناء (Build variables)

تُحقن داخل ملفات المتصفح أثناء `npm run build`، لذلك يجب إضافتها كـ **Variables** (نص عادي)
في: **Settings → Variables and Secrets → Build**

| الاسم | القيمة |
|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | مفتاح anon / publishable |

بعد أي تعديل عليها يجب عمل **Retry deployment / Redeploy** (وليس مجرد حفظ).

## 2) متغيرات وقت التشغيل (Runtime secrets)

أضِفها كـ **Secrets** في: **Settings → Variables and Secrets → Runtime**

| الاسم | القيمة |
|---|---|
| `SUPABASE_URL` | رابط مشروع Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | مفتاح anon / publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح service_role (سرّي) |
| `FIRECRAWL_API_KEY` | لجلب الأخبار |
| `REFRESH_SECRET` | حماية رابط التحديث اليدوي |
| `REFRESH_CRON_TOKEN` | التحديث المجدول |
| `ADMIN_USER_IDS` | معرفات المشرفين (اختياري) |

> مهم: أضِفها كـ **Secret** وليس كـ Variable نصي.
> عندما يحتوي المشروع على إعداد wrangler، فإن قيم `vars` النصية في الإعداد تستبدل ما في اللوحة،
> أما **Secrets** فتبقى محفوظة. لهذا السبب لا يحتوي `wrangler.jsonc` على أي `vars`.

## 3) ملف `wrangler.jsonc`

أُضيف في جذر المستودع ليصبح إعداد النشر واضحاً وثابتاً:

- `main`: `.output/server/index.mjs`
- `assets.directory`: `.output/public`
- `compatibility_flags`: `nodejs_compat` (مطلوب لعمل SSR ودوال الخادم)

## 4) إعدادات البناء في Cloudflare

- Build command: `npm run build`
- Deploy command / Output: يعتمد على `wrangler.jsonc` أعلاه
- المشروع يحتاج **Workers / Pages Functions** لأنه SSR، وليس استضافة ملفات ثابتة فقط.

## 5) ملف `.env`

`.env` داخل المستودع لا يُستخدم إطلاقاً أثناء النشر على Cloudflare — القيم الفعلية تأتي من لوحة Cloudflare فقط.
