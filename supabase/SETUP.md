# ربط المشروع المُصدَّر بمشروع Supabase الخاص بك

## 1) إنشاء قاعدة البيانات
1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com).
2. افتح **SQL Editor** → **New query**.
3. الصق كامل محتوى الملف `supabase/schema.sql` ثم اضغط **Run**.
4. تحقق من ظهور جدول `articles` في **Table Editor**.

## 2) نقل البيانات القديمة (اختياري)
- من Lovable: **Cloud → Advanced settings → Export data** لتحميل بياناتك.
- في Supabase: **Table Editor → articles → Import data from CSV**.

## 3) الحصول على المفاتيح
من **Project Settings → API**:
- `Project URL`
- `anon / publishable key`
- `service_role key` (سرّي — للخادم فقط، لا يوضع أبداً في كود المتصفح)

## 4) متغيرات البيئة المطلوبة
| المتغير | الاستخدام |
|---|---|
| `VITE_SUPABASE_URL` | المتصفح (وقت البناء) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | المتصفح (وقت البناء) |
| `SUPABASE_URL` | الخادم |
| `SUPABASE_PUBLISHABLE_KEY` | الخادم |
| `SUPABASE_SERVICE_ROLE_KEY` | الخادم (سرّي) |
| `FIRECRAWL_API_KEY` | جلب الأخبار |
| `REFRESH_SECRET` | حماية رابط التحديث |
| `REFRESH_CRON_TOKEN` | التحديث المجدول |

محلياً: ضعها في ملف `.env` في جذر المشروع.
على Cloudflare: **Workers & Pages → مشروعك → Settings → Variables and Secrets**، ثم **Redeploy** (متغيرات `VITE_*` تُحقن وقت البناء).

## 5) تنبيه مهم بخصوص الاستضافة
المشروع مبني على TanStack Start مع دوال خادم (SSR)، لذا يحتاج **Cloudflare Workers / Pages Functions** وليس استضافة ملفات ثابتة فقط.

## 6) التشغيل محلياً
```bash
npm install
npm run dev
```

## 7) تفعيل التحديث التلقائي
فعّل القسم رقم 6 (المعلَّق) في `supabase/schema.sql` بعد استبدال `YOUR-DOMAIN` و `YOUR_REFRESH_CRON_TOKEN` بقيمك الفعلية.
