# ربط الموقع بـ Cloudflare

هذا الدليل يشرح خطوات ربط موقع `ShirwaniWorldPulse` (موقع ثابت HTML/CSS/JS) بخدمة **Cloudflare Pages** للاستضافة، مع إمكانية ربط دومين مخصص عبر Cloudflare DNS.

> ملاحظة أمنية: لا يمكن لأي مساعد آلي الدخول إلى حسابك في Cloudflare أو GitHub نيابةً عنك (لا صلاحية ولا بيانات اعتماد). لذلك تم تجهيز كل الإعدادات التقنية في هذا المستودع، وما تبقى هو خطوات بسيطة تنفّذها أنت بنفسك من لوحتي التحكم.

## ماذا تم تجهيزه في هذا المستودع؟

تمت إضافة ملف GitHub Actions:

```
.github/workflows/deploy-cloudflare-pages.yml
```

هذا الملف يقوم تلقائياً بنشر الموقع على Cloudflare Pages في كل مرة يتم فيها الدفع (push) إلى الفرع `main`. الموقع لا يحتاج أي خطوة بناء (build) لأنه ملفات ثابتة، لذلك المجلد المنشور هو جذر المستودع.

## الخطوات المطلوبة منك

### 1. إنشاء مشروع Cloudflare Pages
1. سجّل الدخول إلى [dash.cloudflare.com](https://dash.cloudflare.com).
2. من القائمة الجانبية اختر **Workers & Pages** ثم **Create application** > **Pages**.
3. اختر **Connect to Git** وحدد المستودع `robinrogin-maker/ShirwaniWorldPulse`.
4. عند إعداد البناء، اترك:
   - Build command: (فارغ)
   - Build output directory: `/`
5. اضغط **Save and Deploy** (يمكنك حذف هذا الربط التلقائي لاحقاً واستخدام GitHub Actions بدلاً منه إذا رغبت بتحكم أدق، أو تركه كما هو — كلاهما يعمل).

### 2. الحصول على المفاتيح المطلوبة لـ GitHub Actions
1. **Account ID**: يظهر في يمين لوحة تحكم Cloudflare (أسفل أي صفحة Domain/Workers).
2. **API Token**: من [My Profile > API Tokens](https://dash.cloudflare.com/profile/api-tokens) أنشئ Token بصلاحية **Cloudflare Pages: Edit**.
3. **اسم مشروع Pages**: الاسم الذي اخترته عند إنشاء المشروع في الخطوة 1 (مثلاً `shirwaniworldpulse`).

### 3. إضافة الأسرار (Secrets) في GitHub
اذهب إلى: `Settings > Secrets and variables > Actions` في المستودع، وأضف:

| اسم Secret | القيمة |
|---|---|
| `CLOUDFLARE_API_TOKEN` | الـ Token الذي أنشأته |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID |
| `CLOUDFLARE_PAGES_PROJECT` | اسم مشروع Pages |

بعد إضافتها، أي دفع جديد إلى `main` سينشر الموقع تلقائياً عبر GitHub Actions.

### 4. ربط دومين مخصص
1. في مشروع Pages، اذهب إلى **Custom domains** وأضف الدومين الخاص بك.
2. إذا كان الدومين مسجلاً خارج Cloudflare، أضفه أولاً كموقع (Site) في Cloudflare (**Add a Site**)، ثم غيّر الـ Nameservers لدى مسجّل الدومين إلى Nameservers التي يعطيك إياها Cloudflare.
3. بعد تفعيل الدومين في Cloudflare، ستُضاف سجلات DNS المطلوبة (CNAME) تلقائياً عند ربطه كـ Custom domain في Pages.
4. فعّل **Always Use HTTPS** و **Auto Minify** (اختياري) من إعدادات الدومين لتحسين الأداء والأمان.

## إذا كان الموقع مستضافاً حالياً على GitHub Pages وتريد فقط استخدام Cloudflare كحماية/CDN
بدلاً من الخطوات أعلاه، يكفي:
1. أضف الدومين كموقع في Cloudflare (**Add a Site**) وغيّر الـ Nameservers كما في الخطوة 4 أعلاه.
2. أنشئ سجل **CNAME** باسم الدومين (أو `www`) يشير إلى `robinrogin-maker.github.io`، مع تفعيل السحابة البرتقالية (Proxy) للاستفادة من حماية Cloudflare.
3. في إعدادات GitHub Pages بالمستودع، أضف نفس الدومين المخصص (Custom domain) واحفظ.

---
لأي استفسار إضافي حول أي خطوة من هذه الخطوات، تواصل من جديد وسأساعدك بالتفصيل.
