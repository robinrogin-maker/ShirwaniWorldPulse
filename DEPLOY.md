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

> مهم: أضِفها في مشروع **Pages نفسه** ضمن البيئة الصحيحة (**Production** للموقع المنشور، و**Preview** للفروع/المعاينات). يمكن أن تكون القيم الحساسة **Encrypt**، أما `SUPABASE_URL` فيمكن أن تكون نصية.
> بعد الإضافة يجب إنشاء **نشر جديد بالكامل**؛ النشر القديم لا يلتقط القيم الجديدة.
> عندما يحتوي المشروع على إعداد wrangler، فإن قيم `vars` النصية في الإعداد تستبدل ما في اللوحة،
> أما **Secrets** فتبقى محفوظة. لهذا السبب لا يحتوي `wrangler.jsonc` على أي `vars`.

## 3) ملف `wrangler.jsonc`

أُضيف في جذر المستودع كإعداد نشر خاص بـ **Cloudflare Pages** فقط:

- `pages_build_output_dir`: `dist`
- `compatibility_flags`: `nodejs_compat` (مطلوب لعمل SSR ودوال الخادم)

كما تم ضبط Nitro صراحةً على `cloudflare-pages` داخل `vite.config.ts`. هذا هو الإصلاح الأساسي:
الإعداد الافتراضي لحزمة Lovable يستهدف **Cloudflare Workers Module**، بينما المشروع هنا يُنشر على
**Cloudflare Pages**. خلط محوّل Workers مع نشر Pages يمنع ربط متغيرات Pages بطلبات SSR بالشكل الصحيح.

عند البناء، ينشئ محوّل Pages مجلد `dist` متضمناً `_worker.js` وملفات الموقع. لا تستخدم
`.output/public` ولا تضف `main` أو `assets` إلى `wrangler.jsonc`.

ملاحظة: لا يُستخدم المفتاح `main` أو `assets` هنا، لأنهما خاصّان بـ Cloudflare Workers، ومشاريع Pages لا تدعمهما.

## 4) إعدادات البناء في Cloudflare

- Build command: `npm run build`
- Build output directory: `dist`
- لا حاجة إلى Deploy command عند استخدام تكامل Git الخاص بـ Cloudflare Pages
- المشروع يحتاج **Pages Functions** لأنه SSR، وليس استضافة ملفات ثابتة فقط.

## 5) خطوات التطبيق الدقيقة في Cloudflare

1. افتح مشروع **ShirwaniWorldPulse** في Cloudflare Pages.
2. افتح **Settings → Variables and Secrets**.
3. اختر بيئة **Production** وأضف الأسماء التالية بالأحرف نفسها دون بادئة أو مسافات:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FIRECRAWL_API_KEY`
   - `REFRESH_SECRET`
   - `REFRESH_CRON_TOKEN`
4. إن كنت تختبر رابط Preview، كرر القيم في بيئة **Preview**؛ قيم Production لا تنتقل إليها تلقائياً.
5. في إعدادات البناء اجعل الأمر `npm run build` ومجلد الإخراج `dist`.
6. احفظ ثم شغّل **Retry deployment / Redeploy** من أحدث commit. لا تختبر deployment أُنشئ قبل حفظ الأسرار.
7. تأكد في سجل البناء من استخدام preset باسم `cloudflare-pages` ومن إنشاء `dist/_worker.js`.

لا توجد خطوة ربط إضافية داخل Lovable Cloud عند تشغيل النسخة المصدّرة. الرسالة
`Connect Supabase in Lovable Cloud` نص عام داخل العميل المولّد، وليست اعتماداً تقنياً يمنع قراءة
أسرار Cloudflare.

## 6) ملف `.env`

`.env` داخل المستودع لا يُستخدم إطلاقاً أثناء النشر على Cloudflare — القيم الفعلية تأتي من لوحة Cloudflare فقط.
