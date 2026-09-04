/* =========================================================================
   script.js — ShirwaniWorldPulse  (v3 — fully repaired)
   -------------------------------------------------------------------------
   Reads everything from data.js (SITE, CAT_META, CAT_ORDER,
   NAV_STRUCTURE, T, RSS_FEEDS, SPORTS_LEAGUES, ZODIAC_EMOJIS).
   Works for BOTH index.html and pages/category.html.

   KEY FIXES in v3:
   1. 3-second revert bug FIXED: live RSS results are MERGED with cached
      news, not replaced. Cache shows instantly; live results supplement.
   2. Cross-language contamination FIXED: feeds are strictly per-language
      AND language-validation filter added for RSS results.
   3. News count bug FIXED: removed hasRealImage() filter from rendering
      pipeline; items without real images now show category icon as placeholder.
   4. All RSS feeds fetched in parallel (Promise.all) instead of sequential
      with early break; no more slice(0,8) limiting sources.
   5. Search overlay added.
   6. About Us popover added.
   7. Footer restructured (3-column: search+about left, copyright center,
      logo right).
   8. Sports live scores section + goals ticker.
   9. Horoscope zodiac emoji grid at section top.
  10. Bazaar / Middle East / Kids sections fully removed.
  ========================================================================= */

// ---- Path helpers (so links/icons work from / and from /pages/) ---------
const IN_PAGES = location.pathname.indexOf("/pages/") !== -1;
const ROOT = IN_PAGES ? "../" : "";
function homeLink(){ return ROOT + "index.html"; }
function iconSrc(name){ return ROOT + "icons/" + name + ".png"; }
function catLink(id, lang, region, sub){
  const base = (IN_PAGES ? "" : "pages/") + "category.html";
  const params = new URLSearchParams({ cat:id, lang:lang });
  if (region) params.set("region", region);
  if (sub) params.set("sub", sub);
  return base + "?" + params.toString();
}

// ---- URL state -------------------------------------------------------
function getParam(name, fallback){
  const v = new URLSearchParams(location.search).get(name);
  return v || fallback;
}
let currentLang = getParam("lang", SITE.defaultLang);
window.currentSportSub = "news"; // "news" or "matches" — sport sub-page toggle

// ─────────────────────────────────────────────────────────────────────────
// SEARCH OVERLAY
// ─────────────────────────────────────────────────────────────────────────
function openSearchOverlay(lang){
  const existing = document.getElementById("searchOverlay");
  if (existing) { existing.remove(); return; }
  const d = T[lang];
  const overlay = document.createElement("div");
  overlay.id = "searchOverlay";
  overlay.className = "search-overlay";
  overlay.innerHTML = `
    <div class="search-overlay-inner">
      <button class="search-overlay-close" id="searchCloseBtn">✕</button>
      <div class="search-overlay-title">${escapeHtml(d.searchPlaceholder || "Search...")}</div>
      <input type="text" id="searchOverlayInput" class="search-overlay-input" placeholder="${escapeHtml(d.searchPlaceholder || "Search...")}" autofocus>
      <div id="searchOverlayResults" class="search-overlay-results"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#searchCloseBtn").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  const input = overlay.querySelector("#searchOverlayInput");
  input.focus();
  let debounce;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => performSearch(input.value.trim(), lang), 400);
  });
}

function performSearch(query, lang){
  const resultsEl = document.getElementById("searchOverlayResults");
  if (!resultsEl) return;
  if (!query || query.length < 2) { resultsEl.innerHTML = ""; return; }
  const q = query.toLowerCase();
  const results = [];
  // Search through cached news
  const langs = [lang];
  for (const l of langs){
    if (typeof NEWS_CACHE === "undefined" || !NEWS_CACHE[l]) continue;
    for (const catId of CAT_ORDER){
      const items = NEWS_CACHE[l][catId] || [];
      for (const item of items){
        const title = (item.title || "").toLowerCase();
        const desc = (item.description || item.content || "").toLowerCase();
        if (title.includes(q) || desc.includes(q)){
          results.push({...item, _catId: catId, _lang: l});
        }
      }
    }
  }
  // Also search live news from all visible cards
  document.querySelectorAll(".news-card").forEach(card => {
    const titleEl = card.querySelector(".news-title");
    if (titleEl && titleEl.textContent.toLowerCase().includes(q)){
      if (!results.some(r => (r.link||"") === (card.href||""))){
        results.push({ title: titleEl.textContent, link: card.href || "#", _catId: "", _lang: lang });
      }
    }
  });

  const d = T[lang];
  if (!results.length) {
    resultsEl.innerHTML = `<div class="search-no-results" style="color:var(--muted);padding:12px;text-align:center;">${lang==="ar" ? "لا توجد نتائج" : (lang==="sv" ? "Inga resultat" : "No results found")}</div>`;
    return;
  }
  const shown = results.slice(0, 50);
  resultsEl.innerHTML = shown.map(item => {
    const img = hasRealImage(item) ? `<img src="${escapeHtml(pickImage(item))}" alt="" loading="lazy" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex-shrink:0;">` : "";
    const catLabel = item._catId ? (d.cats[item._catId] ? d.cats[item._catId].title : "") : "";
    const url = safeUrl(item.link) ? `href="${escapeHtml(safeUrl(item.link))}" target="_blank" rel="noopener noreferrer"` : "";
    return `<a class="search-result-item" ${url}>
      ${img}
      <div class="search-result-info">
        <div class="search-result-title">${escapeHtml(stripHtml(item.title||""))}</div>
        ${catLabel ? `<div class="search-result-cat" style="font-size:11px;color:var(--muted);">${escapeHtml(catLabel)}</div>` : ""}
      </div>
    </a>`;
  }).join("\n");
}

// ─────────────────────────────────────────────────────────────────────────
// ABOUT US POPOVER
// ─────────────────────────────────────────────────────────────────────────
function openAboutUs(lang){
  const existing = document.getElementById("aboutUsOverlay");
  if (existing) { existing.remove(); return; }
  const d = T[lang];
  const overlay = document.createElement("div");
  overlay.id = "aboutUsOverlay";
  overlay.className = "about-us-overlay";
  overlay.innerHTML = `
    <div class="about-us-inner">
      <button class="about-us-close" id="aboutUsCloseBtn">✕</button>
      <h2 class="about-us-title">${escapeHtml(d.aboutUsTitle)}</h2>
      <p class="about-us-text">${escapeHtml(d.aboutUsText)}</p>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#aboutUsCloseBtn").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
}

// ─────────────────────────────────────────────────────────────────────────
// Shared: logo, nav, language switch, footer
// ─────────────────────────────────────────────────────────────────────────
function renderChrome(lang){
  const d = T[lang];
  const html = document.documentElement;
  html.setAttribute("lang", d.htmlLang);
  html.setAttribute("dir", d.dir);
  if (document.body) document.body.setAttribute("dir", d.dir);
  html.classList.remove("lang-ar","lang-en","lang-sv");
  html.classList.add("lang-" + lang);

  // logo
  const logoBadge = document.getElementById("logoBadge");
  const logoText = document.getElementById("logoText");
  const logoLink = document.getElementById("logoLink");
  if (logoBadge) { logoBadge.style.width = SITE.logoWidth + "px"; logoBadge.style.height = SITE.logoHeight + "px"; }
  if (logoText) logoText.textContent = SITE.name;
  if (logoLink) logoLink.href = homeLink();

  // nav (built from NAV_STRUCTURE — no bazaar/middle-east/kids)
  const navEl = document.getElementById("mainNav");
  const activeCat = IN_PAGES ? getParam("cat", "") : "";
  if (navEl){
    navEl.innerHTML = NAV_STRUCTURE.map(item=>{
      if (item.type === "link"){
        const href = item.id === "home" ? homeLink() : catLink(item.id, lang);
        const isActive = (item.id === "home" && !IN_PAGES) || (item.id === activeCat);
        return `<div class="nav-item"><a class="nav-link${isActive ? " active" : ""}" href="${href}">${d.navGroup[item.id]}</a></div>`;
      }
      // dropdown (kept for future use)
      const topHref = catLink(item.target, lang);
      const groupActive = item.children.some(c=>c.id === activeCat);
      const children = item.children.map(c=>{
        const label = c.labelKey ? d[c.labelKey] : d.cats[c.id].title;
        return `<a href="${catLink(c.id, lang, c.region)}">${label}</a>`;
      }).join("");
      return `<div class="nav-item">
        <a class="nav-link${groupActive ? " active" : ""}" href="${topHref}">${d.navGroup[item.id]} <span class="nav-caret">▼</span></a>
        <div class="dropdown">${children}</div>
      </div>`;
    }).join("");
  }

  // language switch
  document.querySelectorAll(".lang-btn").forEach(b=>{
    b.classList.toggle("active", b.getAttribute("data-lang") === lang);
  });

  // FOOTER — 3-column layout:
  //   Left: Search + About Us buttons
  //   Center: Copyright text
  //   Right: Logo
  const footerLeft = document.getElementById("footerLeft");
  const footerCenter = document.getElementById("footerCenter");
  const footerRight = document.getElementById("footerRight");
  if (footerLeft) {
    // FIX (طلب المستخدم): حُذف زر التحديث من الفوتر وحلّت محلّه أزرار
    // وسائل التواصل (إنستغرام ، تيك توك ، X). الروابط تُقرأ من SITE.social
    // في data.js، وأي رابط فارغ لا يظهر زرّه إطلاقاً.
    const social = (typeof SITE !== "undefined" && SITE.social) || {};
    const socialBtn = (url, label, svg) => {
      const safe = safeUrl(url);
      if (!safe) return "";
      return `<a class="footer-btn footer-social" href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer"
        title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${svg}</a>`;
    };
    const igSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>`;
    const ttSvg = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M16.5 3h-2.6v11.2a2.5 2.5 0 1 1-2.5-2.5c.3 0 .5 0 .8.1V9.2a5 5 0 1 0 4.3 5V8.6a5.6 5.6 0 0 0 3.3 1.1V7.2a3.3 3.3 0 0 1-3.3-3.3V3z"/></svg>`;
    const xSvg  = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M17.6 3h3.2l-7 8 7.4 10h-3.4l-5.2-7-5.9 7H3.5l7.3-8.6L3.6 3H7l4.9 6.6L17.6 3z"/></svg>`;
    footerLeft.innerHTML = `
      <button class="footer-btn" id="footerSearchBtn" title="${escapeHtml(d.searchPlaceholder)}">🔍</button>
      <button class="footer-btn" id="footerAboutBtn" title="${escapeHtml(d.aboutUsTitle)}">ℹ️</button>
      ${socialBtn(social.instagram, d.socialInstagram || "Instagram", igSvg)}
      ${socialBtn(social.tiktok, d.socialTiktok || "TikTok", ttSvg)}
      ${socialBtn(social.x, d.socialX || "X", xSvg)}
    `;
    const searchBtn = footerLeft.querySelector("#footerSearchBtn");
    const aboutBtn = footerLeft.querySelector("#footerAboutBtn");
    if (searchBtn) searchBtn.addEventListener("click", () => openSearchOverlay(currentLang));
    if (aboutBtn) aboutBtn.addEventListener("click", () => openAboutUs(currentLang));
  }
  if (footerCenter) {
    footerCenter.innerHTML = `<span class="footer-copyright">${escapeHtml(d.footerNote)} ${escapeHtml(d.footerCopyright)}</span>`;
  }
  if (footerRight) {
    footerRight.innerHTML = `<img src="${ROOT}images/logo.png" alt="${SITE.name}" class="footer-logo">`;
  }
}

function bindLangSwitch(onChange){
  const el = document.getElementById("langSwitch");
  if (!el) return;
  el.addEventListener("click", (e)=>{
    const target = e.target;
    const btn = target && target.closest ? target.closest(".lang-btn") : null;
    if (!btn) return;
    currentLang = btn.getAttribute("data-lang");
    try {
      const url = new URL(location.href);
      url.searchParams.set("lang", currentLang);
      history.replaceState(null, "", url);
    } catch(err) {}
    onChange(currentLang);
  });
}


// ---- Live multi-source news engine --------------------------------------
const LIVE_NEWS_TEXT = {
  ar: { loading: "جاري جلب الأخبار...", noImage: "لا توجد أخبار متاحة حالياً.", next: "التالي ←", prev: "→ السابق", pageOf: "صفحة {a} من {b}", songsLoading: "جاري جلب أحدث الأغاني...", songsError: "لا توجد أغانٍ متاحة حالياً، جرّب التحديث بعد قليل." },
  en: { loading: "Loading news...", noImage: "No news is available right now.", next: "Next →", prev: "← Previous", pageOf: "Page {a} of {b}", songsLoading: "Loading the latest songs...", songsError: "No songs are available right now, please try again shortly." },
  sv: { loading: "Laddar nyheter...", noImage: "Inga nyheter är tillgängliga just nu.", next: "Nästa →", prev: "← Föregående", pageOf: "Sida {a} av {b}", songsLoading: "Laddar de senaste låtarna...", songsError: "Inga låtar är tillgängliga just nu, försök igen om en liten stund." }
};

// FIX (news never loaded): البوابات القديمة صارت معطّلة فعلياً —
// rss2json يرجّع 429، وcorsproxy.io يرجّع 403. البوابات المجانية التي
// اختُبرت وعملت هي: allorigins/get (يعيد النص داخل JSON.contents)
// وfeed2json.org (يعيد عناصر جاهزة) ثم allorigins/raw كاحتياط أخير.
const AO_GET_ENDPOINT   = "https://api.allorigins.win/get?url=";
const FEED2JSON_ENDPOINT = "https://feed2json.org/convert?url=";
const AO_RAW_ENDPOINT   = "https://api.allorigins.win/raw?url=";
// FIX (وسطاء إضافيون): لا يجوز أن يتوقّف الموقع كلّه لأن وسيطاً مجانياً
// واحداً سقط. أُضيفت خمس بوابات احتياطية بأشكال ردّ مختلفة، فإن فشلت
// الثلاث الأولى تنتقل السلسلة إلى التالية تلقائياً حتى تصل الأخبار.
const RSS2JSON_ENDPOINT  = "https://api.rss2json.com/v1/api.json?rss_url=";
const CORSPROXY_ENDPOINT = "https://corsproxy.io/?url=";
const CODETABS_ENDPOINT  = "https://api.codetabs.com/v1/proxy?quest=";
const CORSFIX_ENDPOINT   = "https://proxy.corsfix.com/?";
const CORSWORKER_ENDPOINT = "https://test.cors.workers.dev/?";
// FIX: ترتيب المحاولات لكل تغذية RSS — المُختبرة أولاً ثم الاحتياطيات،
// وأخيراً محاولة مباشرة بلا وسيط (تنجح مع التغذيات التي تسمح بـ CORS).
// FIX٨ (تسريع القسم السويدي): وسيط خاص على Cloudflare Workers.
// ضع رابط الوركر هنا (بصيغة .../?url=) فيصبح أول ما يُجرَّب لكل تغذية،
// وهو أسرع بكثير لأنه يجلب من السيرفر ويخزّن النتيجة عشر دقائق.
// إن بقي فارغاً يعمل الموقع كالسابق بالوسطاء المجانية بلا أي خلل.
const SWP_PROXY_ENDPOINT = "https://shirwani-news-api.robinrogin.workers.dev/?url=";
function swpProxyEndpoint(){
  if (SWP_PROXY_ENDPOINT) return SWP_PROXY_ENDPOINT;
  // بديل للتجربة السريعة بلا تعديل الملف: localStorage.setItem("swp-proxy-endpoint", "https://...workers.dev/?url=")
  try { return localStorage.getItem("swp-proxy-endpoint") || ""; } catch(e){ return ""; }
}
const RSS_GATEWAYS_BASE = [
  "ao-get", "feed2json", "ao-raw",
  "rss2json", "corsproxy", "codetabs", "corsfix", "corsworker",
  "direct"
];
const RSS_GATEWAYS = swpProxyEndpoint()
  ? ["swp-proxy", ...RSS_GATEWAYS_BASE]
  : RSS_GATEWAYS_BASE.slice();
// FIX (تسريع): أُلغيت المحاولة المزدوجة لكل بوابة — محاولة واحدة فقط،
// لأن التكرار كان يضاعف زمن الانتظار بلا فائدة تقريباً.
// FIX (تسريع): البوابات تُجرّب على شكل مجموعات متسابقة (٣ في كل مجموعة)
// بدل التسلسل الكامل، فأول بوابة تُرجع أخباراً هي الفائزة.
const GATEWAY_TIER_SIZE = 5;
// FIX (تسريع): مهلة الطلب الواحد ٩ ثوانٍ → ٦ ثوانٍ.
const GATEWAY_REQ_TIMEOUT = 4000;
// FIX (تسريع): بوابة تفشل مرّتين في هذه الجلسة تُستبعد فوراً (كانت ٥)،
// والبوابة الناجحة تُحفظ لتُجرّب أولاً في الزيارة القادمة.
const GATEWAY_MAX_FAILS = 2;
const _gatewayFails = new Map();
const GATEWAY_PREF_KEY = "swp-rss-gateway";
function _preferredGateway(){
  try { return localStorage.getItem(GATEWAY_PREF_KEY) || ""; } catch(e){ return ""; }
}
function _rememberGateway(name){
  try { localStorage.setItem(GATEWAY_PREF_KEY, name); } catch(e){}
}
function gatewayOrder(){
  const pref = _preferredGateway();
  const list = RSS_GATEWAYS.filter(g => (_gatewayFails.get(g) || 0) < GATEWAY_MAX_FAILS);
  const usable = list.length ? list : RSS_GATEWAYS.slice();
  if (pref && usable.includes(pref)) return [pref, ...usable.filter(g => g !== pref)];
  return usable;
}
const newsCache = new Map();
// FIX: shorter cache lifetime → news refreshes much faster (90s instead of 5min)
const LIVE_CACHE_TTL = 90 * 1000;
// FIX: bumped v10 → v11 مع توسيع سلسلة الوسطاء، ليسقط كل زائر ما خزّنه
// من نتائج ناقصة أيام كانت البوابات معطّلة ويعيد الجلب من جديد.
// FIX: bumped v11 → v12 مع تسريع الجلب، ليسقط ما خُزّن أثناء الجلب البطيء
// من نتائج ناقصة (مثل قسم واحد بأربعة أخبار) ويُعاد بناؤه بالسرعة الجديدة.
const LIVE_CACHE_PREFIX = "swp-live-news-v14|";

// FIX (سعة القسم): كان كل قسم يحفظ أربع صفحات فقط (٤×٢١=٨٤ خبراً)
// ويُرمى ما زاد. صارت السعة ثماني صفحات (٨×٢١=١٦٨ خبراً)
// لكل قسم، وزيد معها ما يُحفظ في ذاكرة المتصفّح لتغطية الصفحات الجديدة.
const NEWS_PAGES_PER_SECTION = 8;
const LIVE_CACHE_MAX_ITEMS = 170;

const memCache = new Map();

// FIX (persistent cache): keep the last good result in localStorage too, so a
// page reload / re-visit shows news instantly instead of an empty grid while
// the RSS gateways are being contacted. Memory cache stays the fast path.
function _lsGet(key){
  try { return window.localStorage ? window.localStorage.getItem(key) : null; }
  catch(e){ return null; }
}
function _lsSet(key, value){
  try { if (window.localStorage) window.localStorage.setItem(key, value); }
  catch(e){}
}
function _purgeOldLiveCache(){
  try{
    if (!window.localStorage) return;
    const kill = [];
    for (let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if (k && /^swp-live-news-v\d+\|/.test(k) && k.indexOf(LIVE_CACHE_PREFIX) !== 0) kill.push(k);
    }
    kill.forEach(k => { try { localStorage.removeItem(k); } catch(e){} });
  }catch(e){}
}
_purgeOldLiveCache();

function readLiveCache(catId, lang){
  const key = LIVE_CACHE_PREFIX + lang + "|" + catId;
  try{
    const obj = memCache.get(key);
    if (obj && obj.time && Array.isArray(obj.items) && Date.now() - obj.time <= LIVE_CACHE_TTL) {
      return obj.items;
    }
  }catch(e){}
  // Fall back to the persisted copy
  try{
    const raw = _lsGet(key);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    if (!stored || !Array.isArray(stored.items) || !stored.time) return null;
    if (Date.now() - stored.time > LIVE_CACHE_TTL) return null;
    memCache.set(key, stored);
    return stored.items;
  }catch(e){ return null; }
}
// Returns the persisted items even if expired — used only as an instant
// placeholder while fresh news is loading.
function readStaleLiveCache(catId, lang){
  try{
    const raw = _lsGet(LIVE_CACHE_PREFIX + lang + "|" + catId);
    if (!raw) return [];
    const stored = JSON.parse(raw);
    return (stored && Array.isArray(stored.items)) ? stored.items : [];
  }catch(e){ return []; }
}
function writeLiveCache(catId, lang, items){
  const key = LIVE_CACHE_PREFIX + lang + "|" + catId;
  const payload = {time:Date.now(), items};
  try{ memCache.set(key, payload); }catch(e){}
  try{
    // Store a slim copy (drop bulky HTML) to stay inside the storage quota
    // FIX (سعة القسم): وصف أقصر لأن عدد المحفوظ صار أكبر، ومع ذلك
    // إن رفض المتصفّح الحجم يُعاد الحفظ بعدد أقل تدريجياً بدل فقد الكاش كلّياً.
    const toSlim = list => list.map(it => ({
      title: it.title, link: it.link,
      description: String(it.description || "").slice(0, 180),
      pubDate: it.pubDate || "",
      image: it.image || it.thumbnail || "",
      thumbnail: it.thumbnail || it.image || "",
      _feedTitle: it._feedTitle || "", _sourceCat: it._sourceCat || "", _sourceUrl: it._sourceUrl || ""
    }));
    const sizes = [LIVE_CACHE_MAX_ITEMS, 120, 84, 40];
    for (const n of sizes){
      const slim = toSlim(items.slice(0, n));
      try {
        if (window.localStorage) window.localStorage.setItem(key, JSON.stringify({time:payload.time, items:slim}));
        break;
      } catch(err){ /* الحجم ممتلئ ← جرّب عدداً أقل */ }
    }
  }catch(e){}
}

function stripHtml(value){
  const box = document.createElement("div");
  box.innerHTML = value || "";
  return (box.textContent || box.innerText || "").replace(/\s+/g, " ").trim();
}
function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}

function sourceNameFromUrl(url){
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SOURCE_NAMES[host] || SOURCE_NAMES["www." + host] || host;
  } catch(e) { return "News"; }
}

function absoluteUrl(value, baseUrl){
  if (!value) return "";
  try { return new URL(value, baseUrl).href; } catch(e) { return value; }
}
function safeUrl(value){
  if (!value) return "";
  try { const u = new URL(value); if (u.protocol === "http:" || u.protocol === "https:") return u.href; } catch(e) {}
  return "";
}

function hasRealImage(item){
  const img = pickImage(item);
  if (!img) return false;
  // Data URIs (tiny placeholder images)
  if (/^data:image/i.test(img)) return false;
  // Placeholder images from icons/ are NOT "real" images
  if (/\/icons\//i.test(img)) return false;
  // FIX: favicon/logo services are not real article pictures either.
  if (/s2\/favicons|favicon\.ico/i.test(img)) return false;
  return true;
}

// FIX (بديل الصورة = أيقونة المصدر الحقيقية): عندما لا ترفق التغذية صورة
// للخبر نعرض أيقونة الموقع الناشر نفسه (favicon من نطاق الناشر مباشرة)،
// ولا نستخدم أي خدمة خارجية ولا أيقونة القسم أبداً. إن لم تتوفّر أيقونة
// المصدر يُحذف الخبر كليّاً.
function sourceIconFor(item){
  const url = safeUrl(item && (item.link || item._sourceUrl)) || "";
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (!host) return "";
    return u.protocol + "//" + u.hostname + "/favicon.ico";
  } catch(e){ return ""; }
}

// FIX (أيقونة الناشر البديلة): كثير من مواقع الموسيقى لا توفر /favicon.ico
// مباشرة، فيُستخدم مزوّد أيقونات النطاق الرسمي للموقع نفسه كبديل وحيد
// (لا صور افتراضية ولا أيقونات أقسام).
function publisherIconAlt(link){
  const url = safeUrl(link) || "";
  if (!url) return "";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (!host) return "";
    return "https://icons.duckduckgo.com/ip3/" + host + ".ico";
  } catch(e){ return ""; }
}

// ─────────────────────────────────────────────────────────────────────────
// Language validation: prevents cross-language contamination in RSS results
// ─────────────────────────────────────────────────────────────────────────
function matchesLanguage(title, lang){
  if (!title) return false;
  const text = stripHtml(title);
  if (lang === "ar") {
    // Arabic: must contain Arabic Unicode characters
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
  }
  if (lang === "sv") {
    // Swedish: accept if contains Swedish-specific chars or common SV words
    if (/[åäöÅÄÖ]/.test(text)) return true;
    const svWords = ["och","att","det","den","som","är","var","har","med","till","för","ett","kan","ska","vid","över","under","utan","efter","mellan","här","där","alla","andra","hellre","igen","redan","mycket","inom","utom","ännu","dock","sedan","dessutom","alltså","vilken","vilka","aldrig","ändå","nog","ju","visst","nyhet","nyheter","svensk","sverige"];
    const lower = text.toLowerCase();
    for (const w of svWords) {
      if (new RegExp("\\b" + w + "\\b").test(lower)) return true;
    }
    // Reject Vietnamese: Vietnamese-specific characters not found in Swedish
    if (/[ăâđêôơưĂÂĐÊÔƠƯằẳẵặấầẩẫậếềểễệốồổỗộứừửữự]/i.test(text)) return false;
    // Reject Arabic characters
    if (/[\u0600-\u06FF]/.test(text)) return false;
    // If no Swedish markers and no foreign script, default accept for sv
    // (many Swedish articles use only Latin chars)
    return true;
  }
  // English: Latin script, no Arabic
  if (/[\u0600-\u06FF]/.test(text)) return false;
  return true;
}

function normalizeRssItems(xmlText, sourceUrl, catId, gateway){
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const items = [];
  const isAtom = !!doc.querySelector("feed > entry");
  const nodes = doc.querySelectorAll(isAtom ? "entry" : "item");
  nodes.forEach(node => {
    const getByTag = (tag) => {
      const els = node.getElementsByTagName(tag);
      return els.length ? els[0].textContent.trim() : "";
    };
    const getAttrByTag = (tag, attr) => {
      const els = node.getElementsByTagName(tag);
      return els.length ? (els[0].getAttribute(attr) || els[0].textContent.trim()) : "";
    };
    let title = getByTag("title");
    let link = isAtom ? getAttrByTag("link", "href") : getByTag("link");
    let description = getByTag("description") || getByTag("summary") || getByTag("content") || "";
    let content = getByTag("content:encoded") || description;
    let pubDate = getByTag("pubDate") || getByTag("published") || getByTag("updated") || "";
    let guid = getByTag("guid");
    let feedTitle = doc.querySelector("channel > title, feed > title");
    feedTitle = feedTitle ? feedTitle.textContent.trim() : sourceNameFromUrl(sourceUrl);
    let image = "";
    const mediaContentEls = node.getElementsByTagName("media:content");
    if (mediaContentEls.length) image = mediaContentEls[0].getAttribute("url") || "";
    if (!image) { const mediaThumbEls = node.getElementsByTagName("media:thumbnail"); if (mediaThumbEls.length) image = mediaThumbEls[0].getAttribute("url") || ""; }
    if (!image) { const encEls = node.getElementsByTagName("enclosure"); if (encEls.length && encEls[0].getAttribute("type") && encEls[0].getAttribute("type").startsWith("image")) image = encEls[0].getAttribute("url") || ""; }
    if (!image) {
      const html = content || description;
      const m = html.match(/<img[^>]+(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["']/i);
      if (m) image = m[1];
    }
    if (title && link) {
      items.push({
        title, link, description, content,
        pubDate, guid, thumbnail: image, image: image,
        _feedTitle: feedTitle, _sourceCat: catId, _sourceUrl: sourceUrl
      });
    }
  });
  return items;
}

// FIX (صور medical xpress المشوّهة): تغذيات scx (medicalxpress / phys.org /
// techxplore) ترسل مصغّرات بعرض ١٥٠پكسل (مسار /tmb/) فتُمطّ في مربع
// البطاقة وتبدو مشوّهة. نرقّي الرابط إلى النسخة العريضة قبل العرض.
function upgradeImageUrl(url){
  let out = String(url || "");
  if (!out) return out;
  if (/\/csz\/news\/tmb\//i.test(out)) out = out.replace(/\/csz\/news\/tmb\//i, "/csz/news/800a/");
  else if (/\/csz\/news\/tmb(\d+)\//i.test(out)) out = out.replace(/\/csz\/news\/tmb(\d+)\//i, "/csz/news/800a/");
  return out;
}

function pickImage(item){
  const pick = (v) => upgradeImageUrl(absoluteUrl(v, item.link || item._sourceUrl));
  if (item.thumbnail) return pick(item.thumbnail);
  if (item.image) return pick(item.image);
  if (item.image_url) return pick(item.image_url);
  if (item.imageUrl) return pick(item.imageUrl);
  if (item.urlToImage) return pick(item.urlToImage);
  if (item.media && item.media.url) return pick(item.media.url);
  if (item.media && item.media.content) return pick(item.media.content);
  if (item.enclosure && item.enclosure.url) return pick(item.enclosure.url);
  const html = item.content || item.description || "";
  const patterns = [
    /<img[^>]+(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["']/i,
    /<media:content[^>]+url=["']([^"']+)["']/i
  ];
  for (const re of patterns){
    const m = html.match(re);
    if (m && m[1]) return pick(m[1]);
  }
  return "";
}

function dedupeNews(items){
  const seen = new Set();
  return items.filter(item => {
    const raw = item.link || item.original_url || item.guid || item.title || "";
    const key = String(raw).toLowerCase().replace(/[#?].*$/, "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

// FIX: المهلة الافتراضية رُفعت من ٣ إلى ٨ ثوانٍ: البوابات المجانية
// تحتاج وقتاً لتحميل التغذية للمرة الأولى، و٣ ثوانٍ كانت تُلغي كل الطلبات.
async function fetchWithTimeout(url, options={}, timeout=8000){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, {...options, signal:controller.signal}); }
  finally { clearTimeout(timer); }
}

// FIX: feed2json يعطي JSON جاهزاً (JSON-Feed) فنحوّله لشكل عناصرنا.
function normalizeJsonFeedItems(data, rssUrl, catId){
  if (!data || !Array.isArray(data.items)) return [];
  const feedTitle = (data.title || sourceNameFromUrl(rssUrl));
  return data.items.map(it => {
    const html = it.content_html || it.content_text || it.summary || "";
    let image = it.image || it.banner_image || "";
    if (!image && it.attachments && it.attachments.length){
      const att = it.attachments.find(a => a && /^image/i.test(a.mime_type || ""));
      if (att) image = att.url || "";
    }
    if (!image){
      const m = String(html).match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
      if (m) image = m[1];
    }
    return {
      title: (it.title || "").trim(),
      link: it.url || it.external_url || it.id || "",
      description: it.summary || it.content_text || html || "",
      content: html,
      pubDate: it.date_published || it.date_modified || "",
      guid: it.id || "",
      thumbnail: image, image: image,
      _feedTitle: feedTitle, _sourceCat: catId, _sourceUrl: rssUrl
    };
  }).filter(x => x.title && x.link);
}

// FIX (وسطاء إضافيون): rss2json يردّ بشكل JSON خاص به فيحتاج تطبيعاً مستقلاً.
function normalizeRss2JsonItems(data, rssUrl, catId){
  if (!data || !Array.isArray(data.items)) return [];
  const feedTitle = (data.feed && data.feed.title) || sourceNameFromUrl(rssUrl);
  return data.items.map(it => {
    const html = it.content || it.description || "";
    let image = it.thumbnail || "";
    if (!image && it.enclosure && /^image/i.test(it.enclosure.type || "")) image = it.enclosure.link || "";
    if (!image){
      const m = String(html).match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i);
      if (m) image = m[1];
    }
    return {
      title: (it.title || "").trim(),
      link: it.link || it.guid || "",
      description: it.description || html || "",
      content: html,
      pubDate: it.pubDate || "",
      guid: it.guid || "",
      thumbnail: image, image: image,
      _feedTitle: feedTitle, _sourceCat: catId, _sourceUrl: rssUrl
    };
  }).filter(x => x.title && x.link);
}

async function fetchRssViaGateway(rssUrl, catId, gateway){
  // FIX: بوابة allorigins/get تغلّف النص داخل JSON في الحقل contents.
  if (gateway === "ao-get"){
    const r = await fetchWithTimeout(AO_GET_ENDPOINT + encodeURIComponent(rssUrl), {}, GATEWAY_REQ_TIMEOUT);
    if (!r.ok) throw new Error("ao-get HTTP " + r.status);
    const data = await r.json();
    const xml = data && data.contents;
    if (!xml) throw new Error("ao-get empty");
    return normalizeRssItems(xml, rssUrl, catId, gateway);
  }
  if (gateway === "feed2json"){
    const r = await fetchWithTimeout(FEED2JSON_ENDPOINT + encodeURIComponent(rssUrl), {headers:{Accept:"application/json"}}, GATEWAY_REQ_TIMEOUT);
    if (!r.ok) throw new Error("feed2json HTTP " + r.status);
    const data = await r.json();
    const items = normalizeJsonFeedItems(data, rssUrl, catId);
    if (!items.length) throw new Error("feed2json empty");
    return items;
  }
  // FIX (وسيط احتياطي ١): rss2json — يحوّل التغذية إلى JSON جاهز.
  if (gateway === "rss2json"){
    const r = await fetchWithTimeout(RSS2JSON_ENDPOINT + encodeURIComponent(rssUrl), {headers:{Accept:"application/json"}}, GATEWAY_REQ_TIMEOUT);
    if (!r.ok) throw new Error("rss2json HTTP " + r.status);
    const data = await r.json();
    const items = normalizeRss2JsonItems(data, rssUrl, catId);
    if (!items.length) throw new Error("rss2json empty");
    return items;
  }
  // FIX (وسطاء احتياطيون ٢-٥): وكلاء يرجّعون نص XML كما هو،
  // وكلّهم يُعالجون بنفس محلل RSS مع اختلاف طريقة تركيب الرابط.
  const XML_HEADERS = {Accept:"application/rss+xml, application/xml, text/xml, text/plain"};
  let endpoint;
  // FIX٨: الوسيط الخاص يعيد XML كما هو، فيُعالَج بنفس المحلل.
  if      (gateway === "swp-proxy") endpoint = swpProxyEndpoint() + encodeURIComponent(rssUrl);
  else if (gateway === "corsproxy")  endpoint = CORSPROXY_ENDPOINT + encodeURIComponent(rssUrl);
  else if (gateway === "codetabs")   endpoint = CODETABS_ENDPOINT + encodeURIComponent(rssUrl);
  else if (gateway === "corsfix")    endpoint = CORSFIX_ENDPOINT + rssUrl;
  else if (gateway === "corsworker") endpoint = CORSWORKER_ENDPOINT + rssUrl;
  // FIX (محاولة مباشرة): بعض الناشرين يسمحون بـ CORS، فإن سقطت
  // كل الوسائط لا يزال القسم يعمل مع هذه التغذيات.
  else if (gateway === "direct")     endpoint = rssUrl;
  else endpoint = AO_RAW_ENDPOINT + encodeURIComponent(rssUrl);   // ao-raw
  const r = await fetchWithTimeout(endpoint, {headers:XML_HEADERS}, GATEWAY_REQ_TIMEOUT);
  if (!r.ok) throw new Error(gateway + " HTTP " + r.status);
  const items = normalizeRssItems(await r.text(), rssUrl, catId, gateway);
  if (!items.length) throw new Error(gateway + " empty");
  return items;
}

// FIX (صور مفقودة): بعض البوابات (مثل feed2json) تُرجع العناوين صحيحة
// لكنها تُسقط حقول الصور كلياً من التغذية (وهذا سبب اختفاء صور Wired:
// التغذية تضع الصورة في media:thumbnail وتلك البوابة لا تنقلها).
// نقيس هنا نسبة العناصر التي تحمل صورة فعلية في النتيجة.
function _imageCoverage(items){
  if (!items || !items.length) return 0;
  let withImg = 0;
  for (const it of items){ if (pickImage(it)) withImg++; }
  return withImg / items.length;
}

// FIX (تسريع): سباق بين عدّة بوابات في الوقت نفسه — أول بوابة تُرجع
// أخباراً تفوز وتُلغى بقية الانتظار، بدل تجربتها واحدة بعد واحدة.
// FIX (صور مفقودة): النتيجة الخالية من الصور لا تفوز فوراً؛ تُحفظ جانباً
// ويُنتظر باقي بوابات المجموعة، فإن جاءت واحدة بصور فازت هي. وإن لم
// تأتِ أيّ نتيجة بصور (تغذية بلا صور أصلاً) نُعيد المحفوظة كما هي.
function _raceGateways(rssUrl, catId, tier){
  return new Promise((resolve, reject) => {
    let pending = tier.length;
    let lastErr = null;
    let settled = false;
    let best = null;          // أفضل نتيجة بلا صور (احتياط)
    let bestGateway = "";
    const finish = () => {
      if (settled) return;
      settled = true;
      if (best){
        if (bestGateway) _rememberGateway(bestGateway);
        resolve(best);
      } else {
        reject(lastErr || new Error("RSS unavailable"));
      }
    };
    tier.forEach(gateway => {
      fetchRssViaGateway(rssUrl, catId, gateway).then(items => {
        if (settled) return;
        if (items && items.length){
          if (_imageCoverage(items) > 0){
            settled = true;
            _rememberGateway(gateway);
            resolve(items);
            return;
          }
          // نتيجة بلا صور: احتفظ بالأطول كاحتياط ولا تُنهِ السباق.
          if (!best || items.length > best.length){ best = items; bestGateway = gateway; }
          lastErr = new Error(gateway + " imageless");
          if (--pending === 0) finish();
          return;
        }
        lastErr = new Error(gateway + " empty");
        if (--pending === 0) finish();
      }).catch(err => {
        lastErr = err;
        _gatewayFails.set(gateway, (_gatewayFails.get(gateway) || 0) + 1);
        if (--pending === 0) finish();
      });
    });
    if (!tier.length) reject(new Error("RSS unavailable"));
  });
}

async function fetchRSS(rssUrl, catId){
  // FIX: مفتاح جديد (v9) مع تشغيل السباق المتوازي، حتى لا تُستخدم
  // وعود الفشل المخزّنة من المحاولات القديمة.
  // FIX (الكاش القديم): رُفع رقم الإصدار لإبطال النسخ المخزّنة لدى الزوّار
  // حتّى تُعاد قراءة التغذيات بعد الإصلاحات بدل إعادة عرض النتائج الخاطئة.
  const key = "rss-v15|" + rssUrl;
  if (newsCache.has(key)) return newsCache.get(key);
  const promise = (async()=>{
    let lastErr;
    // FIX (تسريع): البوابات تُقسَّم مجموعات من ٣، وكل مجموعة تُجرّب
    // متوازية؛ فبدل انتظار ٩ بوابات تسلسلياً صار الانتظار في أسوأ
    // الحالات ٣ دورات فقط (≈١٨ ثانية بدل ١٠٠).
    const order = gatewayOrder();
    for (let i = 0; i < order.length; i += GATEWAY_TIER_SIZE){
      const tier = order.slice(i, i + GATEWAY_TIER_SIZE);
      try {
        const items = await _raceGateways(rssUrl, catId, tier);
        if (items && items.length) return items;
      } catch(err){ lastErr = err; }
    }
    newsCache.delete(key);
    throw lastErr || new Error("RSS unavailable");
  })();
  newsCache.set(key,promise);
  return promise;
}

// FIX (stronger section isolation): an item belongs to a section ONLY if
//   1. it was tagged with that section while fetching, AND
//   2. its feed URL is actually registered for that section in the CURRENT language.
// This prevents any cross-section (and cross-language) mixing of articles.
// FIX٣ (تشديد الانتماء للقسم): جداول دلائل الموضوع. كل قسم له بصمات
// في مسار رابط الخبر (مثل /sport/ أو /اقتصاد/) وفي عنوانه؛ فإن حمل
// الخبر بصمة قسم آخر يُرفض من القسم الحالي حتى لو جاء من تغذية عامة
// (مثل تغذية «كل الأخبار») — وهذا ما كان يسمح بتسرّب خبر أو خبرين.
const SECTION_URL_TOKENS = {
  sport:     /(^|[\/\-_.])(sport|sports|sporten|sportbladet|football|futbol|soccer|cricket|tennis|nba|nfl|golf|hockey|olympics?|matcher|رياضة|رياضه|كرة|مباريات)([\/\-_.?]|$)/i,
  economy:   /(^|[\/\-_.])(economy|economics|economie|ekonomi|business|naringsliv|markets?|finance|financial|money|bourse|stocks?|اقتصاد|أعمال|بورصة|مال)([\/\-_.?]|$)/i,
  tech:      /(^|[\/\-_.])(tech|technology|technologie|teknik|gadgets?|smartphones?|science|sciences|vetenskap|تكنولوجيا|تقنية|علوم)([\/\-_.?]|$)/i,
  health:    /(^|[\/\-_.])(health|healthcare|medicine|medical|wellness|halsa|صحة|طب|طبية)([\/\-_.?]|$)/i,
  cars:      /(^|[\/\-_.])(cars?|auto|autos|automotive|motoring|bilar|bil|سيارات|سيارة)([\/\-_.?]|$)/i,
  tourism:   /(^|[\/\-_.])(travel|tourism|tourist|destinations?|resor|resa|سفر|سياحة|سياحه)([\/\-_.?]|$)/i,
  music:     /(^|[\/\-_.])(music|musik|musique|songs?|albums?|موسيقى|أغاني|اغاني|ألبوم)([\/\-_.?]|$)/i,
  horoscope: /(^|[\/\-_.])(horoscope|horoskop|zodiac|astrology|astro|أبراج|ابراج|حظك)([\/\-_.?]|$)/i
};
// بصمات العنوان: تُستخدم فقط حيث لاحظ المستخدم التسرّب («الأخبار
// العالمية» و«الرياضة») وبكلمات قاطعة لا تُسقط أخباراً صحيحة.
const OFF_TOPIC_TITLE = {
  world:     /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|هاتريك|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|الميركاتو|وصفة|طريقة تحضير|برجك|حظك اليوم|توقعات الأبراج|درجات الحرارة|\bpremier league\b|\bchampions league\b|\beuropa league\b|\btransfer window\b|\bfull[- ]time\b|\bkick[- ]?off\b|\bhat[- ]trick\b|\brecipe\b|\bhoroscope\b|\ballsvenskan\b|\bfotboll\b|\bmatchen\b|\bishockey\b|\bshl\b|\brecept\b|\bhoroskop\b)/i,
  sport:     /(البورصة|أسعار النفط|سعر الدولار|التضخم|الأسهم|العملات الرقمية|وصفة|طريقة تحضير|برجك|حظك اليوم|توقعات الأبراج|درجات الحرارة|حالة الطقس|لقاح|آيفون|سامسونج|\bstock market\b|\binflation\b|\boil prices?\b|\bcryptocurrenc|\bbitcoin\b|\biphone\b|\bsmartphone\b|\brecipe\b|\bhoroscope\b|\bweather forecast\b|\bvaccine\b|\bbörsen\b|\baktier\b|\binflationen\b|\bvaccin\b|\brecept\b|\bhoroskop\b|\bväderprognos\b)/i,
  economy:   /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|هاتريك|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|الميركاتو|برجك|حظك اليوم|توقعات الأبراج|وصفة|طريقة تحضير|أغنية|ألبوم جديد|حفلة موسيقية|\bpremier league\b|\bchampions league\b|\bhat[- ]trick\b|\bkick[- ]?off\b|\bfull[- ]time\b|\bhoroscope\b|\brecipe\b|\bnew album\b|\bnew single\b|\bconcert\b|\ballsvenskan\b|\bfotboll\b|\bmatchen\b|\bhoroskop\b|\brecept\b|\bkonsert\b)/i,
  tech:      /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|برجك|حظك اليوم|توقعات الأبراج|وصفة|طريقة تحضير|أغنية|ألبوم جديد|حفلة موسيقية|\bpremier league\b|\bchampions league\b|\bhat[- ]trick\b|\bkick[- ]?off\b|\bhoroscope\b|\brecipe\b|\bnew album\b|\bnew single\b|\bconcert\b|\ballsvenskan\b|\bfotboll\b|\bmatchen\b|\bhoroskop\b|\brecept\b|\bkonsert\b)/i,
  health:    /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|البورصة|أسعار النفط|سعر الدولار|الأسهم|العملات الرقمية|برجك|حظك اليوم|توقعات الأبراج|أغنية|ألبوم جديد|حفلة موسيقية|\bpremier league\b|\bchampions league\b|\bhat[- ]trick\b|\bstock market\b|\bbitcoin\b|\bcryptocurrenc|\bhoroscope\b|\bnew album\b|\bconcert\b|\bfotboll\b|\bmatchen\b|\bbörsen\b|\baktier\b|\bhoroskop\b|\bkonsert\b)/i,
  cars:      /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|برجك|حظك اليوم|توقعات الأبراج|وصفة|طريقة تحضير|أغنية|ألبوم جديد|حفلة موسيقية|لقاح|\bpremier league\b|\bchampions league\b|\bhat[- ]trick\b|\bhoroscope\b|\brecipe\b|\bnew album\b|\bconcert\b|\bvaccine\b|\bfotboll\b|\bmatchen\b|\bhoroskop\b|\brecept\b|\bkonsert\b|\bvaccin\b)/i,
  tourism:   /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|البورصة|أسعار النفط|سعر الدولار|الأسهم|العملات الرقمية|برجك|حظك اليوم|توقعات الأبراج|أغنية|ألبوم جديد|لقاح|آيفون|سامسونج|\bpremier league\b|\bchampions league\b|\bhat[- ]trick\b|\bstock market\b|\bbitcoin\b|\bcryptocurrenc|\bhoroscope\b|\bnew album\b|\bvaccine\b|\biphone\b|\bsmartphone\b|\bfotboll\b|\bmatchen\b|\bbörsen\b|\baktier\b|\bhoroskop\b|\bvaccin\b)/i,
  music:     /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|البورصة|أسعار النفط|سعر الدولار|الأسهم|العملات الرقمية|برجك|حظك اليوم|توقعات الأبراج|وصفة|طريقة تحضير|لقاح|آيفون|سامسونج|\bpremier league\b|\bchampions league\b|\bhat[- ]trick\b|\bstock market\b|\bbitcoin\b|\bcryptocurrenc|\bhoroscope\b|\brecipe\b|\bvaccine\b|\biphone\b|\bsmartphone\b|\bfotboll\b|\bmatchen\b|\bbörsen\b|\baktier\b|\bhoroskop\b|\brecept\b|\bvaccin\b)/i,
  horoscope: /(مباراة|مباريات|الدوري|دوري أبطال|كأس العالم|المنتخب|ريال مدريد|برشلونة|ميسي|رونالدو|البورصة|أسعار النفط|سعر الدولار|الأسهم|العملات الرقمية|وصفة|طريقة تحضير|لقاح|آيفون|سامسونج|\bpremier league\b|\bchampions league\b|\bhat[- ]trick\b|\bstock market\b|\bbitcoin\b|\bcryptocurrenc|\brecipe\b|\bvaccine\b|\biphone\b|\bsmartphone\b|\bfotboll\b|\bmatchen\b|\bbörsen\b|\baktier\b|\brecept\b|\bvaccin\b)/i
};
// FIX٥ (محرّك فلترة أقوى): بصمات موضوع لكل قسم تُقرأ من عنوان الخبر
// ووصفه. إن حمل الخبر بصمة قسم آخر ولم يحمل أي بصمة للقسم الحالي
// (لا في العنوان ولا في الرابط) فهو دخيل ويُستبعد فوراً.
const SECTION_TOPIC_TOKENS = {
  sport:     /(مباراة|مباريات|الدوري|دوري أبطال|كأس|هاتريك|المنتخب|لاعب|مدرب|هدف|أهداف|ملعب|الميركاتو|رياضة|كرة القدم|\bmatch(?:es)?\b|\bleague\b|\bcup\b|\bgoals?\b|\bplayer\b|\bcoach\b|\btransfer\b|\bfootball\b|\bsoccer\b|\btennis\b|\bnba\b|\bnfl\b|\bolympics?\b|\bfotboll\b|\bmatchen\b|\bligan\b|\bmål\b|\btränare\b|\bishockey\b)/i,
  economy:   /(اقتصاد|اقتصادي|البورصة|بورصة|الأسهم|سهم|التضخم|أسعار النفط|سعر الدولار|اليورو|العملات|الفائدة|الناتج المحلي|استثمار|أرباح|ميزانية|تجارة|\beconom(?:y|ic|ics)\b|\bstocks?\b|\bshares\b|\bmarkets?\b|\binflation\b|\boil prices?\b|\bdollar\b|\beuro\b|\binterest rates?\b|\bgdp\b|\binvestments?\b|\bprofits?\b|\bbudget\b|\btrade\b|\bbitcoin\b|\bcryptocurrenc|\bekonomi\b|\bbörsen\b|\baktier\b|\binflationen\b|\bräntan\b|\bhandel\b)/i,
  tech:      /(تكنولوجيا|تقنية|تقني|هاتف|هواتف|آيفون|أندرويد|سامسونج|ذكاء اصطناعي|تطبيق|حاسوب|شرائح|إنترنت|روبوت|برمجيات|علوم|فضاء|\btech(?:nology)?\b|\bai\b|\bartificial intelligence\b|\biphone\b|\bandroid\b|\bsamsung\b|\bsmartphones?\b|\bapps?\b|\bsoftware\b|\bchips?\b|\bsemiconductors?\b|\brobots?\b|\bspacex?\b|\bteknik\b|\bmobil\b|\bdator\b|\bprogramvara\b)/i,
  health:    /(صحة|صحي|طب|طبي|مرض|أمراض|لقاح|فيروس|علاج|دواء|أدوية|مستشفى|أطباء|تغذية|سرطان|مناعة|\bhealth\b|\bmedical\b|\bmedicine\b|\bdiseases?\b|\bvaccines?\b|\bvirus\b|\btreatments?\b|\bdrugs?\b|\bhospitals?\b|\bdoctors?\b|\bnutrition\b|\bcancer\b|\bhälsa\b|\bvaccin\b|\bsjukdom\b|\bläkare\b|\bsjukhus\b)/i,
  cars:      /(سيارة|سيارات|مركبة|مركبات|كهربائية|محرّك|محرك|قيادة ذاتية|تويوتا|مرسيدس|بي إم دبليو|تسلا|هيونداي|\bcars?\b|\bvehicles?\b|\bev\b|\belectric car\b|\bengine\b|\bself[- ]driving\b|\btoyota\b|\bmercedes\b|\bbmw\b|\btesla\b|\bhyundai\b|\bmotoring\b|\bbilar?\b|\belbil\b|\bmotor\b)/i,
  tourism:   /(سفر|سياحة|سياحي|رحلة|رحلات|فندق|فنادق|مطار|طيران|تأشيرة|وجهة|وجهات|شاطئ|منتجع|\btravel\b|\btourism\b|\btourists?\b|\bflights?\b|\bairlines?\b|\bairports?\b|\bhotels?\b|\bvisas?\b|\bdestinations?\b|\bbeach\b|\bresort\b|\bresa\b|\bresor\b|\bflyg\b|\bhotell\b|\bsemester\b)/i,
  music:     /(موسيقى|موسيقي|أغنية|أغاني|ألبوم|مطرب|مطربة|فنان|حفلة|حفل موسيقي|كليب|جوائز الموسيقى|\bmusic\b|\bsongs?\b|\balbums?\b|\bsingles?\b|\bsinger\b|\bband\b|\bconcerts?\b|\btours?\b|\bgrammy\b|\bbillboard\b|\bspotify\b|\bmusik\b|\blåt\b|\balbum\b|\bkonsert\b|\bartist\b)/i,
  horoscope: /(برج|أبراج|برجك|حظك|توقعات|فلك|طالع|الحمل|الثور|الجوزاء|السرطان|الأسد|العذراء|الميزان|العقرب|القوس|الجدي|الدلو|الحوت|\bhoroscope\b|\bzodiac\b|\bastrolog|\bhoroskop\b|\bstjärntecken\b)/i
};
// FIX٤ (منع تسرّب أخبار العالم لبقية الأقسام): كلمات قاطعة تدلّ على
// خبر سياسي/حربي/عام باللغات الثلاث؛ تُطبّق على كل الأقسام ما عدا
// قسم أخبار العالم، فلا يظهر خبر عالمي داخل الرياضة أو غيرها.
const WORLD_TOPIC_TITLE = /(انتخابات|الانتخابات|الحرب|حرب |قصف|غارة|صواريخ|الاحتلال|وقف النار|هدنة|مجلس الأمن|الأمم المتحدة|عقوبات|الرئيس |رئيس الوزراء|وزير الخارجية|البرلمان|مفاوضات|مظاهرات|زلزال|اللاجئين|قتلى|جرحى|\belection\b|\belections\b|\bairstrikes?\b|\bceasefire\b|\bmissiles?\b|\bunited nations\b|\bsecurity council\b|\bsanctions\b|\bpresident\b|\bprime minister\b|\bforeign minister\b|\bparliament\b|\bprotests?\b|\bearthquake\b|\brefugees?\b|\btroops\b|\bcasualties\b|\bval(?:et)?\b|\bkriget\b|\bkrig\b|\bvapenvila\b|\bsanktioner\b|\bpresidenten\b|\bstatsminister\b|\butrikesminister\b|\briksdagen\b|\bregeringen\b|\bdemonstrationer\b|\bjordbävning\b|\bflyktingar\b|\bmilitären\b)/i;
function _linkPath(url){
  const raw = String(url || "");
  let p = raw.replace(/^[a-z]+:\/\/[^\/]*/i, "");
  try { p = decodeURIComponent(p); } catch(e){}
  return p;
}
// يرفض الخبر إذا كان مسار رابطه يحمل بصمة قسم آخر من أقسام الموقع.
function hasForeignSectionSignal(item, catId){
  const path = _linkPath(item && item.link);
  if (!path) return false;
  for (const sec in SECTION_URL_TOKENS){
    if (sec === catId) continue;
    // كرة القدم جزء من الرياضة، والصفحات الرياضية مقبولة داخل الرياضة.
    if (SECTION_URL_TOKENS[sec].test(path)){
      // لا نرفض إن كان المسار يحمل أيضاً بصمة القسم الحالي (صفحة مشتركة).
      const own = SECTION_URL_TOKENS[catId];
      if (own && own.test(path)) return false;
      return true;
    }
  }
  return false;
}
// FIX٦ (بطاقات الصحة السويدية الفارغة): نصّ الموضوع كان يُقرأ من الوصف
// الخام بصيغة HTML، فتُحسب أجزاء من روابط الصور بصمةَ موضوع خاطئة
// (مثال: مسار صور forskning.se يحتوي «/app/uploads/» فيُقرأ «app» كبصمة
// تقنية ⇒ تُرفض كل أخبار التغذية الصحية). الآن نُزيل الوسوم والروابط قبل
// مطابقة البصمات، فلا تُحسب إلا الكلمات الظاهرة للقارئ.
function topicText(item){
  let raw = String((item && item.title) || "") + " " +
            String((item && item.desc) || (item && item.description) || "");
  raw = raw.replace(/<[^>]*>/g, " ");            // حذف وسوم HTML
  raw = raw.replace(/&[a-z#0-9]+;/gi, " ");      // حذف كيانات HTML
  raw = raw.replace(/\b(?:https?:\/\/|www\.)\S+/gi, " ");  // حذف الروابط
  raw = raw.replace(/\S+\.(?:jpe?g|png|webp|gif|svg|avif)\b/gi, " "); // أسماء الصور
  return raw.replace(/\s+/g, " ").trim();
}
// FIX٥: هل يحمل الخبر بصمة موضوع قسم آخر دون أي بصمة للقسم الحالي؟
function hasForeignTopicSignal(item, catId){
  const own = SECTION_TOPIC_TOKENS[catId];
  const text = topicText(item);
  if (!text.trim()) return false;
  if (own && own.test(text)) return false;                 // ينتمي للقسم فعلاً
  const ownUrl = SECTION_URL_TOKENS[catId];
  const path = _linkPath(item && item.link);
  if (ownUrl && path && ownUrl.test(path)) return false;   // الرابط يؤكّد القسم
  for (const sec in SECTION_TOPIC_TOKENS){
    if (sec === catId) continue;
    if (SECTION_TOPIC_TOKENS[sec].test(text)) return true;
  }
  return false;
}
// FIX (تسرّب أخبار الفن والمنوعات إلى «الأخبار العالمية»):
// arabic.cnn.com/entertainment و /miscellaneous ومقالات BBC الفنية كانت تظهر
// في قسم العالم. المسارات الفنية تُرفض مباشرة، أما مسار BBC العام
// (/arabic/articles/) فلا يُحظر كلّه — وإلا ضاعت أخبار BBC العالمية كلها —
// بل يُرفض منه ما كان عنوانه فنّياً أو منوّعاً.
const ENTERTAINMENT_URL_RE = /(^|[\/\-_.])(entertainment|entertainments|celebrity|celebrities|showbiz|gossip|miscellaneous|nojesbladet|noje|style|fashion|beauty|makeup|movie|movies|film|films|cinema|series|drama|منوعات|منوعه|فن|الفن|فنون|مشاهير|مسلسلات|أزياء|موضة)([\/\-_.?]|$)/i;
const ENTERTAINMENT_TOPIC_RE = /(مطرب|مطربة|فنان|فنانة|ممثل|ممثلة|مسلسل|مسلسلات|فيلم|أفلام|السجادة الحمراء|إطلالة|أغنية|ألبوم|حفل فني|حفلة غنائية|الدراما|مشاهير|ملكة جمال)/i;
// FIX (تسرّب التلاوات والأذان إلى قسم الموسيقى): بصمة في الرابط نفسه.
const QURAN_URL_RE = /(quran|qoran|koran|tilawa|telawa|tajweed|recitation|reciter|adhan|athan|azan|nasheed|anasheed|ruqyah|islamic|قران|قرآن|تلاوة|تلاوه|أذان|اذان|سورة|سوره|رقية|أدعية|ادعية|أناشيد)/i;
// FIX (wired تغزو قسم التكنولوجيا): مصادر تنشر مواد عامة واقتصادية وسياسية
// في تغذية واحدة؛ يُقبل منها في التقنية ما حمل بصمة تقنية واضحة فقط.
const MIXED_TECH_SOURCE_RE = /(wired\.com|wired\.co\.uk)/i;

function sectionMatches(item, catId, lang){
  if (!item || !item.title || !item.link) return false;
  if (item._sourceCat !== catId) return false;
  const _path = _linkPath(item.link);
  const _title = String(item.title || "");
  // قسم الأخبار العالمية: لا فن، ولا منوعات، ولا مشاهير.
  if (catId === "world" || catId === "news"){
    if (ENTERTAINMENT_URL_RE.test(_path)) return false;
    if (ENTERTAINMENT_TOPIC_RE.test(_title)) return false;
  }
  // قسم الموسيقى: لا تلاوة ولا أذان ولا أدعية — لا في الرابط ولا في النص.
  if (catId === "music"){
    if (QURAN_URL_RE.test(_path)) return false;
    if (_isQuranLike(_title, item.artist || "", item.genre || "", item.album || "")) return false;
    if (_QURAN_TEXT_RE.test(topicText(item))) return false;
  }
  // قسم التكنولوجيا: المصادر المختلطة (wired) تحتاج دليلاً تقنياً صريحاً.
  if (catId === "tech" && MIXED_TECH_SOURCE_RE.test(String(item.link || "") + " " + String(item._sourceUrl || ""))){
    const techTopic = SECTION_TOPIC_TOKENS.tech;
    const techUrl = SECTION_URL_TOKENS.tech;
    const ok = (techTopic && techTopic.test(topicText(item))) || (techUrl && techUrl.test(_path));
    if (!ok) return false;
  }
  if (lang){
    const feeds = (typeof RSS_FEEDS !== "undefined" && RSS_FEEDS[lang] && RSS_FEEDS[lang][catId]) || [];
    if (feeds.length && item._sourceUrl && !feeds.includes(item._sourceUrl)) return false;
    // FIX٣: رفض العنصر إن كانت تغذيته مسجّلة لقسم آخر في اللغة نفسها.
    if (item._sourceUrl && typeof RSS_FEEDS !== "undefined" && RSS_FEEDS[lang]){
      for (const other in RSS_FEEDS[lang]){
        if (other === catId) continue;
        const list = RSS_FEEDS[lang][other] || [];
        if (list.includes(item._sourceUrl)) return false;
      }
    }
  }
  // FIX٣: حراسة الموضوع — رابط يشير إلى قسم آخر، أو عنوان يحمل كلمات
  // قاطعة تنتمي لقسم آخر (مطبَّقة على العالمية والرياضة).
  if (hasForeignSectionSignal(item, catId)) return false;
  const t = String(item.title || "");
  const titleGuard = OFF_TOPIC_TITLE[catId];
  if (titleGuard && titleGuard.test(t)) return false;
  // FIX٤: أي قسم غير «أخبار العالم» يرفض العناوين السياسية/الحربية
  // والأحداث العامة، إلا إن حمل الرابط بصمة القسم نفسه.
  if (catId !== "world" && WORLD_TOPIC_TITLE.test(t)){
    const own = SECTION_URL_TOKENS[catId];
    const path = _linkPath(item.link);
    // FIX٦ (فقدان أخبار القسم): كلمة عامة مثل «demonstrationer/valet» كانت
    // تُسقط خبراً صحياً واضحاً (مستشفى/رعاية صحية) لأن رابط الناشر لا
    // يحمل كلمة القسم. الآن يُقبل الخبر أيضاً إن حمل نصّه بصمة القسم نفسه.
    const ownTopic = SECTION_TOPIC_TOKENS[catId];
    const ownTopicHit = ownTopic && ownTopic.test(topicText(item));
    if (!ownTopicHit && !(own && path && own.test(path))) return false;
  }
  // FIX٥: الحراسة الأخيرة — خبر يتحدّث بوضوح عن قسم آخر ولا يحمل أي
  // دليل انتماء للقسم الحالي يُستبعد (يمنع تسرّب الاقتصاد/التكنولوجيا).
  if (catId !== "world" && hasForeignTopicSignal(item, catId)) return false;
  return true;
}

// FIX (freshness): only keep articles published within the last N days so the
// sections never show months-old headlines. Items with no parsable date are
// kept (many feeds omit pubDate) but they sort last.
const NEWS_MAX_AGE_DAYS = 3;
function newsTimestamp(item){
  return Date.parse(item.pubDate || item.published_at || item.published || item.updated || "") || 0;
}
function isFreshNews(item, maxDays){
  const days = maxDays || NEWS_MAX_AGE_DAYS;
  const t = newsTimestamp(item);
  if (!t) return true;                       // unknown date → don't discard
  if (t - Date.now() > 36 * 3600 * 1000) return false;  // bogus future date
  return (Date.now() - t) <= days * 24 * 3600 * 1000;
}

function sortNews(items){
  return [...items].sort((a,b)=>{
    const da=Date.parse(a.pubDate||a.published_at||"")||0;
    const db=Date.parse(b.pubDate||b.published_at||"")||0;
    return db-da;
  });
}

// FIX (مصدر واحد يغزو القسم — ملاحزة wired في التكنولوجيا):
// الترتيب بالتاريخ وحده كان يجعل المصدر الأكثر نشراً يحتل الصفحة الأولى
// فيحجب بقية المصادر. الأن توزيع دوّار: خبر من كل مصدر بالترتيب ثم دورة
// جديدة، مع الحفاظ على ترتيب التاريخ داخل كل مصدر — فلا خبر يُحذف، فقط يتغير الترتيب.
function newsSourceKey(item){
  const raw = String((item && (item._sourceUrl || item.link)) || "");
  const m = raw.match(/^[a-z]+:\/\/([^\/]+)/i);
  return (m ? m[1] : raw).toLowerCase().replace(/^www\./, "");
}
function interleaveBySource(items){
  const list = items || [];
  if (list.length < 4) return list;
  const buckets = new Map();
  for (const it of list){
    const k = newsSourceKey(it);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(it);
  }
  if (buckets.size < 2) return list;
  const queues = [...buckets.values()];
  const out = [];
  let moved = true;
  while (moved){
    moved = false;
    for (const q of queues){
      if (q.length){ out.push(q.shift()); moved = true; }
    }
  }
  return out;
}

// FIX (تسريع + رسم تدريجي): نفس مرشّحات الجودة (القسم، اللغة، الحداثة،
// الصورة) استُخرجت في دالة واحدة حتى تُطبَّق على النتائج الجزئية أثناء
// وصولها وعلى النتيجة النهائية بالطريقة ذاتها — فلا تُفقد أي موثوقية.
// FIX (إخفاء خبر برقم سري): الأخبار المخفيّة تُحفظ محلياً بمفتاح الرابط
// (أو العنوان إن غاب الرابط)، وتُستثنى من كل قسم عند التشكيل، وتبقى مخفيّة
// بعد إعادة التحميل حتى يُستعيدها المستخدم بالرقم السري نفسه.
const HIDDEN_NEWS_KEY = "swp-hidden-news-v1";

function newsHideKey(item){
  const link = (item && (item.link || "")).trim();
  if (link && link !== "#") return link;
  return stripHtml((item && item.title) || "").replace(/\s+/g, " ").trim().slice(0, 160);
}

function getHiddenNews(){
  try{
    const raw = localStorage.getItem(HIDDEN_NEWS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(k => typeof k === "string" && k) : [];
  }catch(e){ return []; }
}

function saveHiddenNews(list){
  try{ localStorage.setItem(HIDDEN_NEWS_KEY, JSON.stringify(list.slice(-500))); }catch(e){}
}

function isNewsHidden(item){
  const key = newsHideKey(item);
  if (!key) return false;
  return getHiddenNews().indexOf(key) !== -1;
}

// ═══════════════════════════════════════════════════════════════════════════
// FIX (منع كلمة أو رابط): قائمة كلمات/روابط ممنوعة يكتبها المستخدم بنفسه.
// ═══════════════════════════════════════════════════════════════════════════
// الفرق عن «إخفاء هذا الخبر»: الإخفاء يخصّ رابطاً واحداً بعينه، أما المنع
// فيمنع كل عنصر يحتوي الكلمة (اسم مطرب، «تلاوة»، «أذان»، أو رابط/نطاق)
// في كل الأقسام واللغات، دون حظر المصدر كلّه (music.apple / youtube ...).
const BLOCKED_TERMS_KEY = "swp-blocked-terms-v1";

// تطبيع عربي/لاتيني: توحيد الألف والهاء/التاء وحذف التشكيل حتى تُطابق
// «تلاوه» و«تلاوة»، و«اذان» و«أذان».
function normalizeBlockText(str){
  let s = String(str || "").toLowerCase();
  try { s = s.normalize("NFKC"); } catch(e){}
  s = s.replace(/[\u064B-\u0652\u0670\u0640]/g, "");   // تشكيل وتطويل
  s = s.replace(/[\u0622\u0623\u0625\u0627]/g, "ا");
  s = s.replace(/\u0649/g, "ي").replace(/\u0629/g, "ه");
  return s.replace(/\s+/g, " ").trim();
}

function getBlockedTerms(){
  try{
    const raw = localStorage.getItem(BLOCKED_TERMS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter(t => typeof t === "string" && t.trim()) : [];
  }catch(e){ return []; }
}

function saveBlockedTerms(list){
  const clean = [];
  (list || []).forEach(t => {
    const v = String(t || "").trim();
    if (v && clean.indexOf(v) === -1) clean.push(v);
  });
  try { localStorage.setItem(BLOCKED_TERMS_KEY, JSON.stringify(clean.slice(0, 200))); } catch(e){}
  return clean;
}

// نصّ العنصر الذي تُطبَّق عليه الكلمات الممنوعة: العنوان + الوصف + الفنان
// + الألبوم + التصنيف + الرابط الكامل (فيُمنع رابط بعينه أو نطاق أو مسار).
function blockMatchText(item){
  if (!item) return "";
  const parts = [
    item.title, item.description, item.desc, item.artist, item.album, item.genre,
    item.name, item._feedTitle, item.link, item._sourceUrl
  ];
  let raw = parts.filter(Boolean).map(String).join(" ");
  raw = raw.replace(/<[^>]*>/g, " ");
  try { raw += " " + decodeURIComponent(String(item.link || "")); } catch(e){}
  return normalizeBlockText(raw);
}

function isTermBlocked(item, terms){
  const list = terms || getBlockedTerms();
  if (!list.length) return false;
  const text = blockMatchText(item);
  if (!text) return false;
  for (const t of list){
    const needle = normalizeBlockText(t);
    if (needle && text.indexOf(needle) !== -1) return true;
  }
  return false;
}

// مرشّح موحّد يُستدعى من كل مكان يعرض بطاقات (أخبار أو أغانٍ).
function dropBlockedItems(items){
  const terms = getBlockedTerms();
  if (!terms.length) return items || [];
  return (items || []).filter(it => !isTermBlocked(it, terms));
}

function shapeNewsPool(rawItems, catId, lang, limit){
  let results = rawItems.filter(item => sectionMatches(item, catId, lang));
  results = results.filter(item => matchesLanguage(item.title, lang));
  // FIX (إخفاء خبر برقم سري): استثناء ما أخفاه المستخدم قبل أي ترتيب أو تقطيع.
  const hidden = getHiddenNews();
  if (hidden.length) results = results.filter(item => hidden.indexOf(newsHideKey(item)) === -1);
  // FIX (منع كلمة أو رابط): استبعاد كل عنصر يحتوي كلمة ممنوعة كتبها المستخدم.
  results = dropBlockedItems(results);
  let fresh = results.filter(item => isFreshNews(item));
  if (fresh.length < 6) {
    const wider = results.filter(item => isFreshNews(item, 10));
    if (wider.length > fresh.length) fresh = wider;
  }
  results = fresh;
  const withImg = results.filter(item => hasRealImage(item));
  if (withImg.length >= 6) results = withImg;
  // FIX (توازن المصادر): توزيع دوّار حتى لا يسدّ مصدر واحد كل القسم.
  return interleaveBySource(sortNews(dedupeNews(results))).slice(0, limit || 21);
}

// FIX (رسم تدريجي): `onPartial` تُنادى كلّما وصلت تغذية جديدة، فيظهر
// أول خبر بعد ثانية أو ثانيتين بدل انتظار كل التغذيات (Promise.all).
async function getLiveNews(catId, lang, limit=21, onPartial=null, feedTimeout=0){
  const cached=readLiveCache(catId,lang);
  if (cached && cached.length){
    // FIX (إخفاء خبر برقم سري): المخفيّات تُستبعد من الكاش أيضاً،
    // وإلا عادت الأخبار المخفية بعد إعادة تحميل الصفحة.
    const hiddenKeys = getHiddenNews();
    const visible = dropBlockedItems(hiddenKeys.length
      ? cached.filter(item => hiddenKeys.indexOf(newsHideKey(item)) === -1)
      : cached);
    const slice = visible.slice(0,limit);
    if (onPartial) { try { onPartial(slice); } catch(e){} }
    return slice;
  }
  const feeds=(typeof RSS_FEEDS!=="undefined"&&RSS_FEEDS[lang]&&RSS_FEEDS[lang][catId])||[];
  // FIX (تسريع): المهلة الكلّية للتغذية الواحدة ٢٨ث ← ١٤ث، لأن سلسلة
  // البوابات صارت متسابقة (٣ دورات × ٦ث) فلا حاجة لانتظار أطول.
  const FEED_TIMEOUT = feedTimeout || 5000;   // FIX٤: يمكن للقسم تمرير مهلة أقصر
  const collected = [];
  let announced = 0;
  const runFeed = (feed) => {
    return Promise.race([
      fetchRSS(feed, catId).catch(() => []),
      new Promise(resolve => setTimeout(() => resolve([]), FEED_TIMEOUT))
    ]).then(r => {
      if (Array.isArray(r) && r.length){
        collected.push(...r);
        // FIX (رسم تدريجي): بثّ النتائج الواصلة فوراً بدل انتظار الجميع.
        if (onPartial){
          const partial = shapeNewsPool(collected, catId, lang, limit);
          if (partial.length > announced){
            announced = partial.length;
            try { onPartial(partial); } catch(e){}
          }
        }
      }
      return r;
    });
  };

  // FIX٧ (بطء القسم السويدي — دقائق قبل وصول الأخبار):
  // الأقسام السويدية فيها عشر تغذيات، وكانت تُطلق دفعة واحدة معاً × عدة بوابات،
  // فيتجاوز الطلب حدّ المتصفّح (٥–٦ اتصالات للنطاق الواحد) فتقف الطلبات في
  // طابور المتصفّح وتصل متأخرة جداً (دقائق) بعد انتهاء مهلتها. الأن التغذيات
  // تُجلب بدفعات محدودة (أربع متوازية) مع مهلة كلية للقسم، فلا يتكدّس الطابور
  // وتظهر الأخبار تدريجياً خلال ثوانٍ.
  const MAX_PARALLEL_FEEDS = 3;
  const TOTAL_BUDGET = Math.max(FEED_TIMEOUT * 3, 11000);
  let cursor = 0;
  const worker = async () => {
    while (cursor < feeds.length){
      const feed = feeds[cursor++];
      try { await runFeed(feed); } catch(e){}
    }
  };
  const workers = [];
  for (let i = 0; i < Math.min(MAX_PARALLEL_FEEDS, feeds.length); i++) workers.push(worker());
  await Promise.race([
    Promise.all(workers),
    new Promise(resolve => setTimeout(resolve, TOTAL_BUDGET))
  ]);
  const finalItems = shapeNewsPool(collected, catId, lang, limit);
  if (finalItems.length) writeLiveCache(catId, lang, finalItems);
  return finalItems;
}

function renderNewsCard(item, lang, accent, index, catId){
  // FIX (بديل الصورة): لم نعد نضع أيقونة القسم أبداً؛ الخبر بلا
  // صورة يعرض أيقونة الموقع الناشر، وإن لم تتوفّر يُعرض نصّاً بلا مربع صورة.
  const hasImg = hasRealImage(item);
  // FIX٦ (مربع شعار فارغ): كثير من الناشرين (ومنهم مواقع الصحة
  // السويدية) لا يوفّرون /favicon.ico فيظهر المربع فارغاً لحطةً قبل البديل؛
  // لذا نبدأ بأيقونة الناشر الموثوقة ونترك favicon بديلاً في السلسلة.
  const srcIcon = hasImg ? "" : (publisherIconAlt(item.link || item._sourceUrl || "") || sourceIconFor(item));
  // FIX (اختفاء الأخبار): الخبر بلا صورة ولا أيقونة مصدر يُعرض نصّاً بدل أن يُحذف.
  const noMedia = !hasImg && !srcIcon;
  const title=escapeHtml(stripHtml(item.title||""));
  // FIX: never repeat the headline as the description — if the summary is the
  // same text (or contained in the title), drop it instead of duplicating.
  const rawTitle = stripHtml(item.title||"").replace(/\s+/g," ").trim();
  let rawDesc = stripHtml(item.description||item.content||"").replace(/\s+/g," ").trim();
  const normT = rawTitle.toLowerCase();
  const normD = rawDesc.toLowerCase();
  if (!normD || normD === normT || normT.indexOf(normD) !== -1 || (normD.indexOf(normT) === 0 && normD.length - normT.length < 12)) {
    rawDesc = "";
  }
  const desc=escapeHtml(rawDesc.slice(0,220));
  const source=escapeHtml(item._feedTitle||sourceNameFromUrl(item.link||""));
  const srcIcon2 = srcIcon;
  const img = hasImg ? pickImage(item) : srcIcon2;
  const safeImg = escapeHtml(img);
  const imageHtml = hasImg
    ? `<img src="${safeImg}" alt="" loading="lazy">`
    : `<img src="${safeImg}" alt="" loading="lazy" class="source-logo">`;
  const date=item.pubDate?new Date(item.pubDate).toLocaleDateString(T[lang].htmlLang||lang,{year:"numeric",month:"short",day:"numeric"}):"";
  const articleUrl = safeUrl(item.link) || "";
  const linkAttrs = articleUrl
    ? `href="${escapeHtml(articleUrl)}" target="_blank" rel="noopener noreferrer"`
    : "";
  const tag = articleUrl ? "a" : "div";
  // FIX (إخفاء خبر برقم سري): مفتاح الخبر يُكتب على البطاقة لتتعرف عليه
  // قائمة الزر الأيمن / اللمسة الطويلة دون الاعتماد على ترتيب البطاقات.
  const hideKeyAttr = ` data-hkey="${escapeHtml(newsHideKey(item))}"`;

  const d = T[lang];
  const sourceLabel = d.sourceLabel || "Source";
  const dateLabel = d.dateLabel || "Date";
  // Add "From us" label for catNews placeholder items (link="#")
  const isFromUs = (item.link === "#");
  const fromUsLabel = isFromUs ? `<span class="from-us-label">${escapeHtml(d.fromUs || "From us")}</span>` : "";

  const mediaHtml = noMedia
    ? ""
    : `<div class="news-img${!hasImg ? " news-img-logo" : ""}">${imageHtml}${!hasImg ? `<span class="logo-source-name">${source}</span>` : ""}${fromUsLabel}</div>`;
  return `<${tag} class="news-card${noMedia ? " noimg-card" : (!hasImg ? " logo-card" : "")}"${hideKeyAttr} ${linkAttrs}>${mediaHtml}<div class="news-body"><div class="news-title" title="${title}">${title}</div>${desc ? `<div class="news-desc">${desc}</div>` : ""}<div class="news-meta"><span class="news-source"><span class="meta-label">${escapeHtml(sourceLabel)}:</span> ${source}</span><span class="news-date"><span class="meta-label">${escapeHtml(dateLabel)}:</span> ${escapeHtml(date)}</span></div></div></${tag}>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// *** FIX: 3-SECOND REVERT BUG ***
//
// OLD BEHAVIOR (BUG): cached news displayed instantly → live RSS fetched →
//   live results REPLACED cached display → if live results were poor or
//   france24-heavy, the good cached content vanished.
//
// NEW BEHAVIOR: cached news shows instantly. Live RSS results are MERGED
//   with cache. Live items supplement/supersede cached items by link match,
//   but the total displayed set always prefers items with real images and
//   deduplicates. If live fetch fails or returns poor results, cached
//   content remains visible.
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// PAGINATION (Next / Previous) for section news grids
// ═══════════════════════════════════════════════════════════════════════════
const _pageState = {};   // {catId: pageIndex}

function renderNewsPager(container, catId, lang, pageIndex, pageCount){
  if (!container || pageCount <= 1) return;
  const text = LIVE_NEWS_TEXT[lang] || LIVE_NEWS_TEXT.en;
  const label = (text.pageOf || "Page {a} of {b}")
    .replace("{a}", String(pageIndex + 1)).replace("{b}", String(pageCount));
  const pager = document.createElement("div");
  pager.className = "news-pager";
  pager.innerHTML =
    `<button type="button" class="news-pager-btn" data-dir="prev"${pageIndex === 0 ? " disabled" : ""}>${escapeHtml(text.prev || "Prev")}</button>` +
    `<span class="news-pager-info">${escapeHtml(label)}</span>` +
    `<button type="button" class="news-pager-btn" data-dir="next"${pageIndex >= pageCount - 1 ? " disabled" : ""}>${escapeHtml(text.next || "Next")}</button>`;
  pager.querySelectorAll(".news-pager-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.dir === "next" ? 1 : -1;
      const next = Math.min(Math.max(pageIndex + dir, 0), pageCount - 1);
      if (next === pageIndex) return;
      _pageState[catId] = next;
      paintNewsPage(container, catId, lang);
      const top = container.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({top: top < 0 ? 0 : top, behavior: "smooth"});
    });
  });
  container.parentNode.insertBefore(pager, container.nextSibling);
}

function paintNewsPage(container, catId, lang){
  const items = (container._allItems || []);
  const perPage = container._perPage || 21;
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  let page = _pageState[catId] || 0;
  if (page > pageCount - 1) page = pageCount - 1;
  if (page < 0) page = 0;
  _pageState[catId] = page;
  const slice = items.slice(page * perPage, page * perPage + perPage);
  const accent = container._accent;
  // FIX: a section can supply its own card renderer.
  const cardOf = container._cardRenderer || renderNewsCard;
  const offset = page * perPage;
  container.innerHTML = slice.map((item, i) => cardOf(item, lang, accent, offset + i, catId)).join("");
  // Remove any previous pager, then rebuild it
  let sib = container.nextSibling;
  while (sib) {
    const next = sib.nextSibling;
    if (sib.nodeType === 1 && sib.classList.contains("news-pager")) sib.remove();
    sib = next;
  }
  renderNewsPager(container, catId, lang, page, pageCount);
  attachImageFallback(container, catId);
}

function showNewsItems(container, catId, lang, accent, items, perPage){
  container._allItems = items;
  container._perPage = perPage || 21;
  container._accent = accent;
  paintNewsPage(container, catId, lang);
}

// FIX (خلط الأقسام + اختفاء الأخبار): كل طلب رسم يأخذ رقماً خاصاً؛ فإن فُتح
// قسم أحدث (أو تغيرت اللغة) تُلغى نتائج الطلب القديم ولا تُرسم أبداً،
// فلا تتسرّب أخبار قسم إلى قسم آخر ولا تُمحى البطاقات المعروضة.
let _renderSeq = 0;
function beginRender(container, catId, lang){
  const token = ++_renderSeq;
  container._renderToken = token;
  container._renderCat = catId;
  container._renderLang = lang;
  return token;
}
function renderStillValid(container, token){
  return !!container && container._renderToken === token;
}

// FIX (بقايا القسم السابق): عند تبديل القسم أو التبويب تُفرَّغ الحاوية
// ويُزال المُرقّم القديم وتُلغى كل طلبات الرسم السابقة، فلا تظهر بطاقات
// قسم قديم لحظةً قبل وصول أخبار القسم الجديد.
function resetNewsGrid(container){
  if (!container) return;
  _renderSeq++;
  container._renderToken = _renderSeq;
  container._allItems = [];
  container._cardRenderer = null;
  container.innerHTML = "";
  let sib = container.nextSibling;
  while (sib) {
    const next = sib.nextSibling;
    if (sib.nodeType === 1 && sib.classList && sib.classList.contains("news-pager")) sib.remove();
    sib = next;
  }
}

// FIX (بطء الأقسام): أقسام معينة كانت تنتطر كل تغذياتها ٥ث كاملة
// (السياحة الإنكليزية ٧ تغذيات، الصحة والأخبار السويدية تغذيات بطيئة)،
// فتطول رسالة «جارٍ جلب الأخبار». الآن مهلة أقصر لهذه الأقسام مع بقاء
// الرسم التدريجي، فيرى الزائر المتوفر فوراً ولا تتعلق الصفحة.
function feedTimeoutFor(catId, lang){
  const slow = {
    sv: ["health", "world", "news"],
    en: ["tourism", "travel"]
  };
  const list = slow[lang] || [];
  return list.indexOf(catId) !== -1 ? 3200 : 0;
}

async function renderLiveNews(container,catId,lang,accent,limit=21,fallbackList=[],cardRenderer=null){
  if(!container) return;
  // FIX: رقم طلب خاص بهذا الرسم لمنع تسرّب نتائج قسم سابق.
  const token = beginRender(container, catId, lang);
  // FIX: remember which card layout this section wants before anything paints.
  container._cardRenderer = cardRenderer || null;
  const text = LIVE_NEWS_TEXT[lang]||LIVE_NEWS_TEXT.en;
  _pageState[catId] = 0;

  // STEP 1: Show something INSTANTLY — last saved live result first, then the
  // bundled cache (news-cache.js) as a last resort.
  const cached = (typeof NEWS_CACHE !== "undefined" && NEWS_CACHE[lang] && NEWS_CACHE[lang][catId]) || [];
  const stale = readStaleLiveCache(catId, lang);
  // FIX (خلط الأقسام): كل خبر يُقارن بمصادر القسم قبل عرضه ولو جاء من المخزن.
  // FIX٢ (التكنولوجيا كانت تعرض أخبار العالم): أُلغي الاستثناء الذي كان يقبل
  // أي عنصر بلا وسم قسم (_sourceCat)، فكان يسمح بتسرّب أخبار قسم آخر.
  const belongsHere = it => ((it && it.link === "#") || sectionMatches(it, catId, lang))
    // FIX (إخفاء/منع): ما أخفاه المستخدم أو منع كلمته لا يعود من المخزن أبداً.
    && !isNewsHidden(it) && !isTermBlocked(it);
  const instantPool = dedupeNews([...stale, ...cached].filter(belongsHere));
  const cachedWithImg = instantPool.filter(item => hasRealImage(item));
  const cachedNoImg = instantPool.filter(item => !hasRealImage(item));
  const cachedOrdered = cachedWithImg.length >= 6 ? sortNews(cachedWithImg) : [...sortNews(cachedWithImg), ...sortNews(cachedNoImg)];
  if (cachedOrdered.length) {
    showNewsItems(container, catId, lang, accent, cachedOrdered, limit);
  } else {
    container.innerHTML = `<div class="news-sub">${escapeHtml(text.loading)}</div>`;
  }
  if (!renderStillValid(container, token)) return;

  // STEP 2: Fetch live RSS in background — then MERGE, don't blindly replace
  try {
    // FIX (رسم تدريجي): تُبنى الشبكة من المتوفّر حالياً كلّما وصلت تغذية،
    // فيرى الزائر الأخبار تتراكم بدل شاشة «جاري جلب الأخبار» الطويلة.
    const mergeAndPaint = (liveItems) => {
      let pool = [...liveItems].filter(belongsHere);
      const liveLinks = new Set(liveItems.map(i => safeUrl(i.link)));
      for (const c of cachedOrdered) { if (!liveLinks.has(safeUrl(c.link))) pool.push(c); }
      pool = dedupeNews(pool);
      pool = pool.filter(item => matchesLanguage(item.title, lang));
      let freshPool = pool.filter(item => isFreshNews(item));
      if (freshPool.length < 6) {
        const wider = pool.filter(item => isFreshNews(item, 10));
        if (wider.length > freshPool.length) freshPool = wider;
      }
      if (freshPool.length) pool = freshPool;
      const poolWithImg = sortNews(pool.filter(i => hasRealImage(i)));
      const poolNoImg = sortNews(pool.filter(i => !hasRealImage(i)));
      let items = poolWithImg.length >= 6 ? poolWithImg : [...poolWithImg, ...poolNoImg];
      // FIX (توازن المصادر): نفس التوزيع الدوّار عند الدمج مع المخزن.
      items = interleaveBySource(items);
      return items.slice(0, limit * NEWS_PAGES_PER_SECTION);
    };

    let painted = 0;
    const live = await getLiveNews(catId, lang, limit * NEWS_PAGES_PER_SECTION, (partial) => {
      // FIX: لا تُرسم نتائج طلب قديم بعد الانتقال لقسم آخر.
      if (!renderStillValid(container, token)) return;
      const items = mergeAndPaint(partial);
      // لا نُعيد الرسم إلا إذا زاد المحتوى فعلياً، ولا نُصفّر الصفحة الحالية عبثاً.
      if (items.length > painted){
        painted = items.length;
        showNewsItems(container, catId, lang, accent, items, limit);
        attachImageFallback(container, catId);
      }
    }, feedTimeoutFor(catId, lang)); // fetch more for paging

    if (!renderStillValid(container, token)) return;

    const displayItemsBase = mergeAndPaint(live);
    let displayItems = displayItemsBase;

    // Only fall back to the static "from us" links when nothing else exists
    if (!displayItems.length && fallbackList.length) displayItems = fallbackList.slice();

    if (displayItems.length) {
      if (displayItems.length !== painted) _pageState[catId] = 0;
      showNewsItems(container, catId, lang, accent, displayItems, limit);
    } else if (!cachedOrdered.length) {
      container.innerHTML = `<div class="news-sub">${escapeHtml(text.noImage)}</div>`;
    }
  } catch(e) {
    // Live fetch failed — cached content stays visible (no revert!)
    if (renderStillValid(container, token) && !cachedOrdered.length) {
      container.innerHTML = `<div class="news-sub">${escapeHtml(text.noImage)}</div>`;
    }
  }

  if (!renderStillValid(container, token)) return;
  // STEP 3: Fallback for broken images — replace with the publisher logo.
  attachImageFallback(container, catId);
}

// FIX (بديل الصورة): إذا فشل تحميل صورة الخبر نستبدلها بأيقونة الموقع
// الناشر الحقيقية (مأخوذة من نطاق الرابط) مع اسم المصدر، ولا تُستخدم
// أيقونة القسم أبداً. وإن فشلت أيقونة المصدر يبقى الخبر نصّاً بلا صورة.
function attachImageFallback(container, catId){
  if (!container) return;
  // FIX (اختفاء الأخبار): لم نعد نحذف الخبر عند فشل الصورة وأيقونة المصدر،
  // بل نُخفي مربع الصورة ونُبقي العنوان والمصدر والرابط قابلاً للقراءة.
  const dropCard = function(img){
    const card = img.closest(".news-card");
    const box = img.closest(".news-img");
    if (box && box.parentNode) box.parentNode.removeChild(box);
    if (card) { card.classList.remove("logo-card"); card.classList.add("noimg-card"); }
  };
  container.querySelectorAll(".news-img img").forEach(img => {
    const useFallback = function(){
      const card = img.closest(".news-card");
      const href = card && card.getAttribute ? (card.getAttribute("href") || "") : "";
      // FIX (فراغ البطاقات بلا صورة): كانت المحاولة البديلة تضع نفس رابط
      // الأيقونة الفاشل، فلا يُطلق المتصفح حدث خطأ جديداً ويبقى مربع صورة
      // فارغ بارتفاع ١١٠px أسفل/أعلى النص. الآن نجرب سلسلة بدائل مختلفة
      // فعلياً، وعند نفادها يُحذف مربع الصورة نهائياً فلا يبقى أي فراغ.
      const current = img.getAttribute("src") || "";
      const chain = [publisherIconAlt(href), sourceIconFor({link: href})]
        .filter(u => u && u !== current);
      const tried = (img.dataset.triedIcons || "").split("|");
      const logo = chain.find(u => tried.indexOf(u) === -1) || "";
      if (!logo) { dropCard(img); return; }
      img.dataset.triedIcons = tried.concat(logo).filter(Boolean).join("|");
      img.src = logo;
      img.classList.remove("placeholder-icon");
      img.classList.add("source-logo");
      if (card) {
        card.classList.add("logo-card");
        const box = img.closest(".news-img");
        if (box) {
          box.classList.add("news-img-logo");
          if (!box.querySelector(".logo-source-name")) {
            const srcEl = card.querySelector(".news-source");
            const name = srcEl ? srcEl.textContent.replace(/^[^:]*:\s*/, "").trim() : "";
            if (name) {
              const span = document.createElement("span");
              span.className = "logo-source-name";
              span.textContent = name;
              box.appendChild(span);
            }
          }
        }
      }
    };
    img.addEventListener("error", useFallback);
    if (img.complete && img.naturalWidth === 0) useFallback();
  });
}

// ─────────────────────────────────────────────────────────────────────────
// SPORTS LIVE SCORES SECTION — Redesigned with date carousel, filters, match cards
// ─────────────────────────────────────────────────────────────────────────

let _selectedDate = new Date();
let _allMatches = {};      // {leagueId: [events]}
let _isFetching = false;

// FIX: كل بطولة صارت تُجلب بمعرّفها الرسمي من قاعدة البيانات المجانية.
// القيمة قد تكون معرّفاً واحداً أو مصفوفة معرّفات (مثل تصفيات كأس العالم
// التي تنقسم إلى ٦ اتحادات قارية + ملحق عالمي).
// FIX: الدوري العراقي أصبح له معرّف حقيقي (5056 = Iraqi Premier League)
// بدل التصفية النصية غير الموثوقة.
const _LEAGUE_ID_MAP = {
  iraq_stars: "5056",
  premier_league: "4328",
  la_liga: "4335",
  serie_a: "4332",
  bundesliga: "4331",
  liga_portugal: "4344",
  champions_league: "4480",
  europa_league: "4481",
  world_cup: "4429",
  world_cup_qual: ["5518", "5513", "5514", "5515", "5516", "5517", "5850"],
  euro: "4502",
  euro_qual: "5519",
  copa_america: "4499",
  afcon: "4496",
  afcon_qual: "5520",
  asian_cup: "4866",
  asian_cup_qual: "5521",
  club_world_cup: "4503",
  confederations_cup: "4498"
};

const _LEAGUE_FLAGS = {
  premier_league: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  la_liga: "🇪🇸",
  serie_a: "🇮🇹",
  bundesliga: "🇩🇪",
  liga_portugal: "🇵🇹",
  champions_league: "🏆",
  europa_league: "🏆",
  // FIX: أعلام/رموز البطولات المضافة
  world_cup: "🌍",
  world_cup_qual: "🎫",
  euro: "🇪🇺",
  euro_qual: "🎫",
  copa_america: "🌎",
  afcon: "🌍",
  afcon_qual: "🎫",
  asian_cup: "🌏",
  asian_cup_qual: "🎫",
  club_world_cup: "🏅",
  confederations_cup: "🏆",
  international: "🌍",
  iraq_stars: "🇮🇶"
};

function _formatDateKey(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

function _dayName(d, lang){
  const days = {
    ar: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
    en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    sv: ["Sön","Mån","Tis","Ons","Tor","Fre","Lör"]
  };
  return (days[lang]||days.en)[d.getDay()];
}

function _monthName(d, lang){
  const months = {
    ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    sv: ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"]
  };
  return (months[lang]||months.en)[d.getMonth()];
}

function renderLiveScoresSection(lang){
  const page = document.getElementById("sportMatchesPage");
  if (!page) return;
  const d = T[lang] || T.en;

  // Render date carousel (±7 days)
  const carousel = document.getElementById("dateCarousel");
  if (carousel) {
    const today = new Date();
    today.setHours(0,0,0,0);
    let html = "";
    for (let i = -7; i <= 7; i++){
      const dt = new Date(today);
      dt.setDate(dt.getDate() + i);
      const key = _formatDateKey(dt);
      const isToday = i === 0;
      const isActive = _formatDateKey(_selectedDate) === key;
      const dayLabel = isToday ? (d.dateToday || "Today") : _dayName(dt, lang);
      html += `<button class="date-btn${isActive?' active':''}" data-date="${key}" onclick="_selectDate('${key}',this,'${lang}')">
        <div class="d-day">${escapeHtml(dayLabel)}</div>
        <div class="d-num">${dt.getDate()}</div>
        <div class="d-month">${_monthName(dt,lang)}</div>
      </button>`;
    }
    carousel.innerHTML = html;
  }

  // Render search + league filter
  const search = document.getElementById("sportSearch");
  if (search) {
    search.placeholder = d.matchSearchPlaceholder || "Search team or match...";
    search.oninput = () => _renderMatches(lang);
  }
  const filter = document.getElementById("leagueFilter");
  if (filter) {
    const leagues = SPORTS_LEAGUES[lang] || SPORTS_LEAGUES.en;
    let opts = `<option value="all">${escapeHtml(d.leagueFilterAll || "All Leagues")}</option>`;
    leagues.forEach(l => {
      opts += `<option value="${l.id}">${escapeHtml(l.name)}</option>`;
    });
    filter.innerHTML = opts;
    filter.onchange = () => _renderMatches(lang);
  }

  // Fetch matches for selected date
  _fetchAndRender(lang);

  // FIX: جدول ترتيب الفرق أسفل المباريات
  _renderStandingsBlock(lang);
}

function _selectDate(dateKey, btn, lang){
  _selectedDate = new Date(dateKey + "T00:00:00");
  // Update active state
  document.querySelectorAll(".date-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  _fetchAndRender(lang);
}

async function _fetchAndRender(lang){
  const container = document.getElementById("matchesContainer");
  if (!container) return;
  const d = T[lang] || T.en;

  container.innerHTML = `<div class="matches-loading"><span class="spinner"></span> ${lang==="ar"?"جاري التحميل...":(lang==="sv"?"Laddar...":"Loading...")}</div>`;

  const dateKey = _formatDateKey(_selectedDate);
  _allMatches = {};
  _isFetching = true;

  // FIX: مع إضافة البطولات الكبرى صار عدد الطلبات كبيراً، والخدمة المجانية
  // ترفض الطلبات إن أُرسلت كلّها دفعة واحدة (429)، لذلك تُنفّذ على دفعات محدودة.
  const tasks = [];
  Object.entries(_LEAGUE_ID_MAP).forEach(([lid, tsdbId]) => {
    const ids = Array.isArray(tsdbId) ? tsdbId : [tsdbId];
    ids.forEach(one => tasks.push({ key: lid, id: one }));
  });
  // FIX: المباريات الدولية الودية (4562) ضمن نفس الطابور، ولم تعد هناك
  // تصفية نصية للدوري العراقي لأنه أصبح يُجلب بمعرّفه الرسمي.
  tasks.push({ key: "international", id: "4562" });

  const seenIds = {};
  const CONCURRENCY = 5;
  let cursor = 0;

  async function runOne(task){
    try {
      const resp = await fetchWithTimeout(
        `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${dateKey}&l=${task.id}`,
        {}, 6000
      );
      if (!resp.ok) return;
      const data = await resp.json();
      const events = (data && data.events) || [];
      if (!events.length) return;
      if (!_allMatches[task.key]) _allMatches[task.key] = [];
      events.forEach(ev => {
        const uid = ev.idEvent || `${ev.strEvent}|${ev.strTimestamp}`;
        if (seenIds[uid]) return;   // FIX: منع تكرار المباراة نفسها بين المعرّفات
        seenIds[uid] = true;
        _allMatches[task.key].push(ev);
      });
      if (!_allMatches[task.key].length) delete _allMatches[task.key];
    } catch(e) { /* ignore per-request */ }
  }

  async function worker(){
    while (cursor < tasks.length){
      const task = tasks[cursor++];
      await runOne(task);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, () => worker())
  );
  _isFetching = false;
  _renderMatches(lang);
}

function _renderMatches(lang){
  const container = document.getElementById("matchesContainer");
  if (!container) return;
  const d = T[lang] || T.en;
  const leagues = SPORTS_LEAGUES[lang] || SPORTS_LEAGUES.en;

  // Filter by league dropdown
  const filterEl = document.getElementById("leagueFilter");
  const filterLeague = filterEl ? filterEl.value : "all";

  // Filter by search
  const searchEl = document.getElementById("sportSearch");
  const searchTerm = searchEl ? searchEl.value.trim().toLowerCase() : "";

  let html = "";
  let totalShown = 0;

  leagues.forEach(league => {
    if (filterLeague !== "all" && filterLeague !== league.id) return;
    const events = _allMatches[league.id];
    if (!events || !events.length) return;

    // Search filter
    let filtered = events;
    if (searchTerm) {
      filtered = events.filter(ev =>
        (ev.strHomeTeam||"").toLowerCase().includes(searchTerm) ||
        (ev.strAwayTeam||"").toLowerCase().includes(searchTerm) ||
        (ev.strEvent||"").toLowerCase().includes(searchTerm)
      );
    }
    if (!filtered.length) return;

    totalShown += filtered.length;

    // League section header
    const flag = _LEAGUE_FLAGS[league.id] || "";
    html += `<div class="league-section">
      <div class="league-section-header">
        <span class="ls-flag">${flag}</span>
        <span class="ls-name">${escapeHtml(league.name)}</span>
      </div>`;

    filtered.forEach(ev => {
      const homeBadge = ev.strHomeTeamBadge || "";
      const awayBadge = ev.strAwayTeamBadge || "";
      const homeTeam = ev.strHomeTeam || "";
      const awayTeam = ev.strAwayTeam || "";
      const homeScore = ev.intHomeScore;
      const awayScore = ev.intAwayScore;
      const strTime = ev.strTime || "";
      const strStatus = ev.strStatus || "";
      const strVenue = ev.strVenue || "";

      // Determine match status
      let statusClass = "upcoming";
      let statusLabel = d.statusUpcoming || "Upcoming";
      if (strStatus) {
        const s = strStatus.toLowerCase();
        if (s.includes("live") || s.includes("1") || s.includes("2") || s.includes("ht") || s.includes("half")) {
          statusClass = "live";
          statusLabel = d.statusLive || "LIVE";
        } else if (s.includes("fin") || s.includes("ft") || s.includes("ended") || s.includes("complete") || s.includes("full")) {
          statusClass = "finished";
          statusLabel = d.statusFinished || "FT";
        } else if (s.includes("post") || s.includes("delay") || s.includes("cancel") || s.includes("abando")) {
          statusClass = "postponed";
          statusLabel = d.statusPostponed || "PPD";
        }
      }
      // If score exists and status not detected — check if scores are numbers
      if (statusClass === "upcoming" && homeScore !== null && awayScore !== null && homeScore !== undefined && awayScore !== undefined) {
        // Has scores means likely finished or in progress
        // Default to finished if strStatus is empty but scores exist
        if (!strStatus) {
          statusClass = "finished";
          statusLabel = d.statusFinished || "FT";
        }
      }

      const scoreDisplay = (homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined)
        ? `${homeScore} - ${awayScore}`
        : (lang==="ar" ? "قادمة" : (lang==="sv" ? "Kommande" : "VS"));

      // Format time
      let timeDisplay = "";
      if (strTime) {
        try {
          const [h, m] = strTime.split(":");
          const hr = parseInt(h);
          const mn = m;
          if (lang === "ar") {
            const ampm = hr >= 12 ? "م" : "ص";
            const h12 = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
            timeDisplay = `${h12}:${mn} ${ampm}`;
          } else {
            timeDisplay = `${hr.toString().padStart(2,"0")}:${mn}`;
          }
        } catch(e) {
          timeDisplay = strTime;
        }
      }

      html += `<div class="match-card">
        <div class="match-team home">
          ${homeBadge ? `<img class="match-team-logo" src="${escapeHtml(homeBadge)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}
          <span class="match-team-name">${escapeHtml(homeTeam)}</span>
        </div>
        <div class="match-center">
          <div class="match-score-box">${escapeHtml(scoreDisplay)}</div>
          <span class="match-status ${statusClass}">${escapeHtml(statusLabel)}</span>
          ${timeDisplay ? `<span class="match-time">${escapeHtml(timeDisplay)}</span>` : ""}
        </div>
        <div class="match-team away">
          <span class="match-team-name">${escapeHtml(awayTeam)}</span>
          ${awayBadge ? `<img class="match-team-logo" src="${escapeHtml(awayBadge)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}
        </div>
      </div>`;
    });

    html += `</div>`;
  });

  // FIX: الدوري العراقي يُرسم الآن ببطاقات المباريات العادية مثل بقية البطولات.
  // الرسالة البديلة لم تعد تطهر في عرض "الكل" حتى لا تزحم القائمة،
  // وتقتصر على حالة اختيار الدوري العراقي وحده مع رابط الموقع الرسمي.
  if (filterLeague === "iraq_stars" && !(_allMatches["iraq_stars"] || []).length && !_isFetching) {
    const flag = _LEAGUE_FLAGS.iraq_stars || "🇮🇶";
    const leagueName = leagues.find(l=>l.id==="iraq_stars");
    const noneMsg = lang==="ar" ? "لا مباريات عراقية في هذا التاريخ"
                  : (lang==="sv" ? "Inga irakiska matcher detta datum" : "No Iraqi matches on this date");
    const moreMsg = lang==="ar" ? "الموقع الرسمي للدوري"
                  : (lang==="sv" ? "Ligans officiella webbplats" : "Official league website");
    html += `<div class="league-section">
      <div class="league-section-header">
        <span class="ls-flag">${flag}</span>
        <span class="ls-name">${leagueName ? escapeHtml(leagueName.name) : "Iraq Stars League"}</span>
      </div>
      <div class="matches-empty">${escapeHtml(noneMsg)} — <a href="https://www.iraqstarsleague.com" target="_blank" rel="noopener noreferrer">${escapeHtml(moreMsg)}</a></div>
    </div>`;
    totalShown++;
  }

  if (!totalShown && !_isFetching) {
    const dateKey = _formatDateKey(_selectedDate);
    const today = _formatDateKey(new Date());
    const msg = dateKey === today
      ? (d.noMatchesDate || "No matches on this date")
      : (d.noMatchesDate || "No matches on this date");
    html = `<div class="matches-empty">${escapeHtml(msg)}</div>`;
  }

  if (searchTerm && !totalShown && !_isFetching) {
    html = `<div class="matches-empty">${escapeHtml(d.searchNoResults || "No search results")}</div>`;
  }

  container.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────────────────
// FIX: جدول ترتيب الفرق — يعتمد على lookuptable.php من قاعدة البيانات المجانية
// ─────────────────────────────────────────────────────────────────────────
const _STANDINGS_LEAGUES = [
  "iraq_stars","premier_league","la_liga","serie_a","bundesliga",
  "liga_portugal","champions_league","europa_league"
];
const _standingsCache = {};   // { "leagueId|season": rows }
let _standingsLeague = "premier_league";

// FIX: الموسم الرياضي يبدأ في أغسطس، فإن كنا قبل يوليو نستخدم الموسم السابق.
function _currentSeason(){
  const now = new Date();
  const y = now.getFullYear();
  return (now.getMonth() >= 6) ? `${y}-${y+1}` : `${y-1}-${y}`;
}

function _renderStandingsBlock(lang){
  const box = document.getElementById("standingsBlock");
  if (!box) return;
  const d = T[lang] || T.en;
  const leagues = SPORTS_LEAGUES[lang] || SPORTS_LEAGUES.en;
  let opts = "";
  _STANDINGS_LEAGUES.forEach(id => {
    const L = leagues.find(x => x.id === id);
    if (!L) return;
    opts += `<option value="${id}"${id===_standingsLeague?' selected':''}>${escapeHtml(L.name)}</option>`;
  });
  box.innerHTML = `
    <div class="standings-head">
      <h3 class="standings-title">🏆 ${escapeHtml(d.standingsTitle || "League Standings")}</h3>
      <select class="standings-select" id="standingsSelect" aria-label="${escapeHtml(d.standingsPick || "Choose a league")}">${opts}</select>
    </div>
    <div id="standingsBody"></div>`;
  const sel = document.getElementById("standingsSelect");
  if (sel) sel.onchange = () => { _standingsLeague = sel.value; _loadStandings(lang); };
  _loadStandings(lang);
}

async function _loadStandings(lang){
  const body = document.getElementById("standingsBody");
  if (!body) return;
  const d = T[lang] || T.en;
  const season = _currentSeason();
  const tsdb = _LEAGUE_ID_MAP[_standingsLeague];
  const id = Array.isArray(tsdb) ? tsdb[0] : tsdb;
  if (!id){ body.innerHTML = `<div class="matches-empty">${escapeHtml(d.standingsUnavailable || "Standings are not available")}</div>`; return; }

  const ck = `${id}|${season}`;
  if (_standingsCache[ck]){ _paintStandings(_standingsCache[ck], lang); return; }

  body.innerHTML = `<div class="matches-loading"><span class="spinner"></span> ${escapeHtml(d.standingsLoading || "Loading...")}</div>`;
  let rows = [];
  try {
    const resp = await fetchWithTimeout(
      `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${id}&s=${season}`, {}, 7000);
    if (resp.ok){
      const data = await resp.json();
      rows = (data && (data.table || data.lookuptable)) || [];
    }
  } catch(e){ /* تجاهل */ }
  // FIX: بعض البطولات لا تنشر ترتيب الموسم الحالي مبكراً — نجرّب الموسم السابق.
  if (!rows.length){
    const py = parseInt(season.split("-")[0]) - 1;
    try {
      const r2 = await fetchWithTimeout(
        `https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=${id}&s=${py}-${py+1}`, {}, 7000);
      if (r2.ok){
        const d2 = await r2.json();
        rows = (d2 && (d2.table || d2.lookuptable)) || [];
      }
    } catch(e){ /* تجاهل */ }
  }
  _standingsCache[ck] = rows;
  _paintStandings(rows, lang);
}

function _paintStandings(rows, lang){
  const body = document.getElementById("standingsBody");
  if (!body) return;
  const d = T[lang] || T.en;
  const c = d.stCol || { rank:"#", team:"Team", played:"P", win:"W", draw:"D", loss:"L", gf:"GF", ga:"GA", gd:"GD", pts:"Pts" };
  if (!rows || !rows.length){
    body.innerHTML = `<div class="matches-empty">${escapeHtml(d.standingsUnavailable || "Standings are not available")}</div>`;
    return;
  }
  let html = `<div class="standings-scroll"><table class="standings-table"><thead><tr>
    <th class="st-rank">${escapeHtml(c.rank)}</th>
    <th class="st-team">${escapeHtml(c.team)}</th>
    <th>${escapeHtml(c.played)}</th>
    <th>${escapeHtml(c.win)}</th>
    <th>${escapeHtml(c.draw)}</th>
    <th>${escapeHtml(c.loss)}</th>
    <th class="st-hide-sm">${escapeHtml(c.gf)}</th>
    <th class="st-hide-sm">${escapeHtml(c.ga)}</th>
    <th>${escapeHtml(c.gd)}</th>
    <th class="st-pts">${escapeHtml(c.pts)}</th>
  </tr></thead><tbody>`;
  rows.forEach((r, i) => {
    const rank = r.intRank || String(i+1);
    const badge = r.strBadge || r.strTeamBadge || "";
    const gd = (r.intGoalDifference !== undefined && r.intGoalDifference !== null)
      ? r.intGoalDifference
      : (parseInt(r.intGoalsFor||0) - parseInt(r.intGoalsAgainst||0));
    html += `<tr>
      <td class="st-rank">${escapeHtml(String(rank))}</td>
      <td class="st-team">
        ${badge ? `<img class="st-logo" src="${escapeHtml(badge)}" alt="" loading="lazy" onerror="this.style.display='none'">` : ""}
        <span>${escapeHtml(r.strTeam || "")}</span>
      </td>
      <td>${escapeHtml(String(r.intPlayed ?? "-"))}</td>
      <td>${escapeHtml(String(r.intWin ?? "-"))}</td>
      <td>${escapeHtml(String(r.intDraw ?? "-"))}</td>
      <td>${escapeHtml(String(r.intLoss ?? "-"))}</td>
      <td class="st-hide-sm">${escapeHtml(String(r.intGoalsFor ?? "-"))}</td>
      <td class="st-hide-sm">${escapeHtml(String(r.intGoalsAgainst ?? "-"))}</td>
      <td>${escapeHtml(String(gd))}</td>
      <td class="st-pts">${escapeHtml(String(r.intPoints ?? "-"))}</td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  body.innerHTML = html;
}

// ─────────────────────────────────────────────────────────────────────────
// NEWS TICKER BAR
// ─────────────────────────────────────────────────────────────────────────
let newsTickerInterval = null;
let newsTickerIndex = 0;
let newsTickerItems = [];

function renderNewsTicker(lang){
  const ticker = document.getElementById("newsTicker");
  if (!ticker) return;
  const d = T[lang];
  ticker.innerHTML = `<div class="wrap"><span class="ticker-label">${escapeHtml(d.newsTicker)}</span><span class="ticker-content" id="newsTickerContent">...</span></div>`;

  // Refresh every 60 seconds
  if (newsTickerInterval) clearInterval(newsTickerInterval);
  newsTickerIndex = 0;
  fetchNewsTickerItems(lang);
  newsTickerInterval = setInterval(() => {
    advanceNewsTicker(lang);
  }, 7000);
}

function advanceNewsTicker(lang){
  if (!newsTickerItems.length) return;
  newsTickerIndex = (newsTickerIndex + 1) % newsTickerItems.length;
  const el = document.getElementById("newsTickerContent");
  if (!el) return;
  const item = newsTickerItems[newsTickerIndex];
  el.textContent = item;
}

async function fetchNewsTickerItems(lang){
  const el = document.getElementById("newsTickerContent");
  if (!el) return;
  const d = T[lang];
  const isCategoryPage = typeof currentCat !== "undefined" && currentCat;

  try {
    if (isCategoryPage && currentCat === "sport" && window.currentSportSub === "matches") {
      // Sport matches sub-page: show live goals/scores ticker
      const goalsLabel = d.goalsTickerLabel || "⚽ الأهداف";
      // FIX: `ticker` was not in scope here (ReferenceError swallowed by catch),
      // so the goals label never appeared. Look the bar up by id instead.
      const tickerBar = document.getElementById("newsTicker");
      const tickerLabel = tickerBar && tickerBar.querySelector(".ticker-label");
      if (tickerLabel) tickerLabel.textContent = goalsLabel;
      await fetchGoalsTicker(lang, el);
    } else if (isCategoryPage) {
      // Category page: show latest headlines from THAT category only
      await fetchCategoryTicker(lang, el, d, currentCat);
    } else {
      // Homepage: cycle latest headline from each category
      await fetchHomepageTicker(lang, el, d);
    }
  } catch(e) {
    el.textContent = lang==="ar" ? "جاري التحميل..." : (lang==="sv" ? "Laddar..." : "Loading...");
  }
}

async function fetchHomepageTicker(lang, el, d){
  newsTickerItems = [];
  const cats = CAT_ORDER.slice();
  const labelOf = (cat) => (d.tickerCategories && d.tickerCategories[cat]) || (d.cats[cat] && d.cats[cat].title) || cat;

  // FIX (تسريع): الشريط لم يعد ينتظر الشبكة — يملأ نفسه فوراً من
  // المحتوى المحفوظ (المخزّن محلياً أو المدمج في الموقع).
  const instant = [];
  for (const cat of cats){
    const saved = readStaleLiveCache(cat, lang);
    const bundled = (typeof NEWS_CACHE !== "undefined" && NEWS_CACHE[lang] && NEWS_CACHE[lang][cat]) || [];
    const first = (saved && saved.length ? saved[0] : (bundled.length ? bundled[0] : null));
    if (first && first.title) instant.push(`[${labelOf(cat)}] ${first.title}`);
  }
  if (instant.length){
    newsTickerItems = instant;
    el.textContent = newsTickerItems[0];
  } else {
    el.textContent = lang==="ar" ? "جاري التحميل..." : (lang==="sv" ? "Laddar..." : "Loading...");
  }

  // FIX (تسريع): التحديث المباشر لكل الأقسام صار متوازياً وغير مُعطّل،
  // ومتأخّراً قليلاً حتّى تأخذ شبكات الأقسام أولويّة الشبكة.
  setTimeout(() => {
    Promise.all(cats.map(async cat => {
      try {
        const items = await getLiveNews(cat, lang, 1);
        return (items.length && items[0].title) ? `[${labelOf(cat)}] ${items[0].title}` : null;
      } catch(e){ return null; }
    })).then(lines => {
      const fresh = lines.filter(Boolean);
      if (!fresh.length) return;
      newsTickerItems = fresh;
      if (newsTickerIndex >= newsTickerItems.length) newsTickerIndex = 0;
      el.textContent = newsTickerItems[newsTickerIndex] || newsTickerItems[0];
    }).catch(() => {});
  }, 2500);

  if (!newsTickerItems.length) {
    el.textContent = lang==="ar" ? "جاري التحميل..." : (lang==="sv" ? "Laddar..." : "Loading...");
  }
}

async function fetchCategoryTicker(lang, el, d, catId){
  newsTickerItems = [];
  const cached = (typeof NEWS_CACHE !== "undefined" && NEWS_CACHE[lang] && NEWS_CACHE[lang][catId]) || [];
  if (cached.length > 0) {
    newsTickerItems = cached.slice(0, 5).map(n => n.title);
  } else {
    try {
      const items = await getLiveNews(catId, lang, 5);
      newsTickerItems = items.slice(0, 5).map(n => n.title);
    } catch(e) { /* skip */ }
  }
  const catLabel = (d.tickerCategories && d.tickerCategories[catId]) || (d.cats[catId] && d.cats[catId].title) || catId;
  if (newsTickerItems.length) {
    newsTickerItems = newsTickerItems.map(h => `[${catLabel}] ${h}`);
    el.textContent = newsTickerItems[0];
  } else {
    el.textContent = lang==="ar" ? "لا أخبار متاحة حالياً" : (lang==="sv" ? "Inga nyheter tillgängliga" : "No news available at the moment");
  }
}

// ─────────────────────────────────────────────────────────────────────────
// GOALS TICKER (sport matches sub-page)
// ─────────────────────────────────────────────────────────────────────────
async function fetchGoalsTicker(lang, el){
  newsTickerItems = [];
  const today = new Date().toISOString().split("T")[0];
  // FIX: single source of truth — reuse the shared league map instead of a
  // second, duplicated copy that could drift out of sync.
  const leagueIdMap = _LEAGUE_ID_MAP;
  const d = T[lang];
  const noMatchMsg = d.noMatchesToday || (lang==="ar" ? "لا توجد مباريات اليوم" : (lang==="sv" ? "Inga matcher idag" : "No matches today"));
  const scoreNA = d.scoreUnavailable || (lang==="ar" ? "النتيجة غير متاحة" : (lang==="sv" ? "Resultat inte tillgängligt" : "Score unavailable"));

  for (const [id, theSportsDbId] of Object.entries(leagueIdMap)) {
    try {
      const resp = await fetchWithTimeout(
        `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&l=${theSportsDbId}`,
        {}, 4000
      );
      if (resp.ok) {
        const data = await resp.json();
        const events = (data && data.events) || [];
        events.forEach(ev => {
          const home = ev.strHomeTeam || "";
          const away = ev.strAwayTeam || "";
          const hScore = (ev.intHomeScore !== null && ev.intHomeScore !== undefined) ? ev.intHomeScore : "?";
          const aScore = (ev.intAwayScore !== null && ev.intAwayScore !== undefined) ? ev.intAwayScore : "?";
          if (home && away) {
            newsTickerItems.push(`⚽ ${home} ${hScore}:${aScore} ${away}`);
          }
        });
      }
    } catch(e) { /* skip league */ }
  }

  // Also try international matches
  try {
    const resp = await fetchWithTimeout(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`,
      {}, 4000
    );
    if (resp.ok) {
      const data = await resp.json();
      const events = (data && data.events) || [];
      const intl = events.filter(ev => /friendly|qualifier|international|world cup/i.test(ev.strEvent || ""));
      intl.forEach(ev => {
        const home = ev.strHomeTeam || "";
        const away = ev.strAwayTeam || "";
        const hScore = (ev.intHomeScore !== null && ev.intHomeScore !== undefined) ? ev.intHomeScore : "?";
        const aScore = (ev.intAwayScore !== null && ev.intAwayScore !== undefined) ? ev.intAwayScore : "?";
        if (home && away) {
          newsTickerItems.push(`⚽ ${home} ${hScore}:${aScore} ${away}`);
        }
      });
    }
  } catch(e) { /* skip */ }

  if (newsTickerItems.length) {
    el.textContent = newsTickerItems[0];
  } else {
    el.textContent = noMatchMsg;
  }
}

// ─────────────────────────────────────────────────────────────────────────
// HOROSCOPE ZODIAC GRID
// ─────────────────────────────────────────────────────────────────────────
// FIX: the zodiac grid used to be decorative only (12 emoji tiles, no reading).
// Now each tile is a real button: clicking it fetches the daily reading from a
// free key-less horoscope API and shows it in a panel under the grid.
let _zodiacActiveSign = -1;               // currently open sign index (-1 = none)
const _zodiacCache = {};                  // { "aries-2026-08-26": "text..." }

function zodiacTodayKey(){
  const n = new Date();
  const p = v => String(v).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth()+1)}-${p(n.getDate())}`;
}

// FIX (بطاقات الأبراج الـ١٢ كانت عاطلة): رقم ثابت يُشتقّ من النص، يُستخدم
// لانتقاء مقاطع القراءة المحلية فيكون نص اليوم واحداً طوال اليوم ثم يتغيّر غداً.
function _zodiacSeed(str){
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

// FIX: قراءة محلية مضمونة لكل برج — تعمل من دون إنترنت ومن دون أي خدمة
// خارجية، فلا تبقى أي بطاقة برج بلا محتوى.
function localZodiacReading(signIndex, lang){
  const packs = (typeof ZODIAC_TEXT !== "undefined" && ZODIAC_TEXT) || null;
  if (!packs) return null;
  const p = packs[lang] || packs.ar;
  if (!p) return null;
  const slug = (typeof ZODIAC_SLUGS !== "undefined" && ZODIAC_SLUGS[signIndex]) || String(signIndex);
  const day  = zodiacTodayKey();
  const seed = _zodiacSeed(slug + "|" + day);
  const pick = (arr, off) => (arr && arr.length) ? arr[(seed + off * 7) % arr.length] : "";
  const text = [
    pick(p.general, 1),
    pick(p.work, 2),
    pick(p.love, 3),
    pick(p.health, 4),
    pick(p.advice, 5)
  ].filter(Boolean).join(" ");
  return {
    text,
    date: day,
    mood:   pick(p.moods, 6),
    color:  pick(p.colors, 7),
    number: String((seed % 9) + 1),
    labels: { mood: p.moodLabel || "", color: p.colorLabel || "", number: p.numberLabel || "" },
    local: true
  };
}

// Fetch one sign's daily reading. Tries several key-less endpoints, each one
// directly first and then through the CORS gateways. Result is cached per sign
// per day. FIX: لم يعد يُرمى خطأ — إن فشلت كل المحاولات تُرجع القراءة المحلية.
async function fetchZodiacReading(signIndex, lang){
  const slug = (typeof ZODIAC_SLUGS !== "undefined" && ZODIAC_SLUGS[signIndex]) || "";
  if (!slug) throw new Error("unknown sign");
  const cacheKey = slug + "-" + (lang || "ar") + "-" + zodiacTodayKey();
  if (_zodiacCache[cacheKey]) return _zodiacCache[cacheKey];

  const apis = (typeof HOROSCOPE_APIS !== "undefined" && HOROSCOPE_APIS.length)
    ? HOROSCOPE_APIS
    : [{ url: (typeof HOROSCOPE_API !== "undefined" ? HOROSCOPE_API : "") +
              "?sign={slug}&day=today", kind: "json" }];

  const attempts = [];
  apis.forEach(a => {
    const api = String(a.url || "").replace("{slug}", encodeURIComponent(slug));
    if (!api) return;
    attempts.push(api);
    attempts.push(CORSPROXY_ENDPOINT + encodeURIComponent(api));
    attempts.push(CODETABS_ENDPOINT + encodeURIComponent(api));
  });

  // FIX (بطء الأبراج): كانت تسعُ محاولات متتالية بمهلة ٤٫٥ ثانية لكلٍّ منها
  // فتصل مدة الانتظار إلى ٤٠ ثانية. الآن أربع محاولات فقط بمهلة ٢٫٢ ثانية،
  // فالسقف نحو ٩ ثوانٍ والقراءة المحلية معروضة أصلاً قبلها.
  const shortList = attempts.slice(0, 4);
  for (const url of shortList){
    try {
      const r = await fetchWithTimeout(url, {headers:{Accept:"application/json"}}, 2200);
      if (!r.ok) continue;
      const data = await r.json();
      const body = (data && data.data) || data || {};
      const text = body.horoscope_data || body.horoscope || body.description || "";
      if (text) {
        const out = { text: String(text), date: String(body.date || zodiacTodayKey()) };
        _zodiacCache[cacheKey] = out;
        return out;
      }
    } catch(e) { /* try next endpoint / gateway */ }
  }

  // FIX: لا فشل نهائي — نرجع للقراءة المحلية بلغة الواجهة.
  const local = localZodiacReading(signIndex, lang);
  if (local) { _zodiacCache[cacheKey] = local; return local; }
  throw new Error("horoscope unavailable");
}

// Render (or refresh) the reading panel for one sign.
async function showZodiacReading(signIndex, lang){
  const panel = document.getElementById("zodiacReading");
  if (!panel) return;
  const d = T[lang] || T.ar;
  const names  = d.zodiacNames || [];
  const emojis = (typeof ZODIAC_EMOJIS !== "undefined" && ZODIAC_EMOJIS) || [];
  const ranges = (typeof ZODIAC_RANGES !== "undefined" && ZODIAC_RANGES) || [];

  // Clicking the open sign again closes the panel.
  if (_zodiacActiveSign === signIndex) {
    _zodiacActiveSign = -1;
    panel.style.display = "none";
    panel.innerHTML = "";
    markActiveZodiacTile();
    return;
  }
  _zodiacActiveSign = signIndex;
  markActiveZodiacTile();

  const head = `
    <div class="zodiac-reading-head">
      <span class="zodiac-reading-emoji" aria-hidden="true">${emojis[signIndex] || "✨"}</span>
      <span class="zodiac-reading-name">${escapeHtml(names[signIndex] || "")}</span>
      <span class="zodiac-reading-range">${escapeHtml(ranges[signIndex] || "")}</span>
      <button type="button" class="zodiac-reading-close" id="zodiacReadingClose"
              aria-label="${escapeHtml(d.zodiacClose || "Close")}">✕</button>
    </div>`;

  panel.style.display = "";
  // FIX (بطء الأبراج): تُعرض القراءة المحلية فوراً بلا انتطار، ثم إن وصلت
  // قراءة الإنترنت تحل محلّها بهدوء؛ فلا تبقى رسالة «جارٍ التحميل» طويلاً.
  const quick = localZodiacReading(signIndex, lang);
  const paint = (res) => {
    const meta = res.date
      ? `<div class="zodiac-reading-meta">${escapeHtml(d.zodiacDateLabel || "Date")}: ${escapeHtml(res.date)}</div>`
      : "";
    const facts = (res.mood || res.color || res.number)
      ? `<div class="zodiac-reading-facts">` +
        [ res.mood   ? `<span>${escapeHtml((res.labels&&res.labels.mood)   || "")}: ${escapeHtml(res.mood)}</span>`   : "",
          res.color  ? `<span>${escapeHtml((res.labels&&res.labels.color)  || "")}: ${escapeHtml(res.color)}</span>`  : "",
          res.number ? `<span>${escapeHtml((res.labels&&res.labels.number) || "")}: ${escapeHtml(res.number)}</span>` : ""
        ].filter(Boolean).join("") + `</div>`
      : "";
    panel.innerHTML = head +
      `<p class="zodiac-reading-text">${escapeHtml(res.text)}</p>` + facts + meta +
      zodiacSourceLinks(lang);
    bindZodiacClose(lang);
  };

  if (quick && quick.text) {
    paint(quick);
  } else {
    panel.innerHTML = head +
      `<p class="zodiac-reading-text is-loading">${escapeHtml(d.zodiacLoading || "Loading...")}</p>`;
    bindZodiacClose(lang);
  }

  try {
    const res = await fetchZodiacReading(signIndex, lang);
    // A newer click may have happened while we were waiting.
    if (_zodiacActiveSign !== signIndex) return;
    // FIX: لا نستبدل نصّاً معروضاً بمثله المحلي، ولا نُفرّع اللوحة إن لم يأتِ جديد.
    if (res && res.text && !(quick && res.local)) paint(res);
  } catch(e) {
    if (_zodiacActiveSign !== signIndex) return;
    if (quick && quick.text) return;   // FIX: القراءة المحلية معروضة بالفعل.
    panel.innerHTML = head +
      `<p class="zodiac-reading-text is-error">${escapeHtml(d.zodiacError || "Unavailable")}</p>` +
      zodiacSourceLinks(lang);
  }
  bindZodiacClose(lang);
}

// FIX (بطاقات الأبراج): كان يُعرض رابط واحد فقط عند الفشل؛ الآن تُعرض كل
// روابط مواقع الأبراج داخل اللوحة كمصادر إضافية للقراءة الموسّعة.
function zodiacSourceLinks(lang){
  const d = T[lang] || T.ar;
  const list = (d.catNews && d.catNews.horoscope) || [];
  if (!list.length) return "";
  const label = d.zodiacMoreLabel || "";
  const links = list.map(s =>
    `<a class="zodiac-reading-link" href="${escapeHtml(s.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title)}</a>`
  ).join("");
  return `<div class="zodiac-reading-sources">` +
         (label ? `<span class="zodiac-reading-sources-label">${escapeHtml(label)}</span>` : "") +
         links + `</div>`;
}

function bindZodiacClose(lang){
  const btn = document.getElementById("zodiacReadingClose");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const open = _zodiacActiveSign;
    _zodiacActiveSign = open; // showZodiacReading toggles it closed
    showZodiacReading(open, lang);
  });
}

function markActiveZodiacTile(){
  document.querySelectorAll(".zodiac-item").forEach(el => {
    const idx = Number(el.getAttribute("data-sign"));
    const on = idx === _zodiacActiveSign;
    el.classList.toggle("active", on);
    el.setAttribute("aria-expanded", on ? "true" : "false");
  });
}

function renderZodiacGrid(lang){
  // FIX: fill the existing markup instead of rewriting the whole section —
  // this avoids a duplicated id="zodiacTitle" in the page.
  const inner = document.getElementById("zodiacGridInner");
  if (!inner) return;
  const d = T[lang] || T.ar;
  const names  = d.zodiacNames || [];
  const emojis = (typeof ZODIAC_EMOJIS !== "undefined" && ZODIAC_EMOJIS) || [];
  const ranges = (typeof ZODIAC_RANGES !== "undefined" && ZODIAC_RANGES) || [];

  const titleEl = document.getElementById("zodiacTitle");
  if (titleEl) titleEl.textContent = d.zodiacTitle ||
    ((d.cats && d.cats.horoscope && d.cats.horoscope.title) || "");
  const hintEl = document.getElementById("zodiacPickHint");
  if (hintEl) hintEl.textContent = d.zodiacPickHint || "";

  // FIX: tiles are real buttons (keyboard + screen-reader accessible).
  inner.innerHTML = names.map((name, i) => `
    <button type="button" class="zodiac-item" data-sign="${i}" aria-expanded="false"
            title="${escapeHtml(ranges[i] || name)}">
      <span class="zodiac-emoji" aria-hidden="true">${emojis[i] || "✨"}</span>
      <span class="zodiac-name">${escapeHtml(name)}</span>
      <span class="zodiac-range">${escapeHtml(ranges[i] || "")}</span>
    </button>`).join("");

  const panel = document.getElementById("zodiacReading");
  if (panel) { panel.style.display = "none"; panel.innerHTML = ""; }
  _zodiacActiveSign = -1;

  inner.querySelectorAll(".zodiac-item").forEach(el => {
    el.addEventListener("click", () => {
      showZodiacReading(Number(el.getAttribute("data-sign")), lang);
    });
  });
}

// ---- Music Favorites Section -------------------------------------------
const MUSIC_FAVS_KEY = "swp-music-favs";

function getMusicFavs(){
  try { return JSON.parse(localStorage.getItem(MUSIC_FAVS_KEY)) || []; }
  catch(e) { return []; }
}
function saveMusicFavs(list){
  try { localStorage.setItem(MUSIC_FAVS_KEY, JSON.stringify(list)); }
  catch(e) {}
}

// FIX (no Google/YouTube services): work out how a saved link can be played
// inside the site without any Google-owned player.
// Returns null when the link cannot be played in place (the card title still
// opens it in a new tab), otherwise:
//   { type: "audio" | "video" | "iframe", srcFor(autoplay) -> url }
// معرّف فيديو يوتيوب من أي شكل رابط (watch?v= / youtu.be / embed / shorts / live).
function ytIdFromUrl(url){
  if (!url) return "";
  const m = String(url).match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : "";
}

function musicMediaFromUrl(url){
  const raw = String(url || "").trim();
  if (!/^https?:\/\//i.test(raw)) return null;
  let u;
  try { u = new URL(raw); } catch (e) { return null; }
  const path = (u.pathname || "").toLowerCase();
  const fixed = src => ({ srcFor: () => src });

  // FIX (الموسيقى المفضلة): إرجاع تشغيل يوتيوب داخل البطاقة مع صورة الغلاف،
  // لأن معظم الروابط المحفوظة لدى المستخدم من يوتيوب. المشغّلات البديلة
  // (ملفات مباشرة / ساوندكلاود / ميكسكلاود / فيميو ...) تبقى كما هي.
  // FIX6 (الأغنية تكمل بين الأقسام): srcFor أصبح يقبل موقع البداية بالثواني
  // حتى تستأنف الأغنية من موضعها بعد الانتقال لقسم أخر.
  const ytId = ytIdFromUrl(raw);
  if (ytId) return {
    type: "iframe",
    thumb: "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg",
    thumbAlt: "https://img.youtube.com/vi/" + ytId + "/mqdefault.jpg",
    srcFor: (auto, start) => "https://www.youtube-nocookie.com/embed/" + ytId
      + "?autoplay=" + (auto ? "1" : "0") + "&rel=0&modestbranding=1&playsinline=1"
      + (start > 1 ? "&start=" + Math.floor(start) : "")
  };

  // Direct media files → native HTML5 player, nothing external.
  if (/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)$/.test(path))
    return Object.assign({ type: "audio" }, fixed(raw));
  if (/\.(mp4|m4v|webm|ogv)$/.test(path))
    return Object.assign({ type: "video" }, fixed(raw));

  // SoundCloud widget
  if (/(^|\.)soundcloud\.com$/i.test(u.hostname))
    return { type: "iframe", srcFor: auto =>
      "https://w.soundcloud.com/player/?url=" + encodeURIComponent(raw)
      + "&visual=true&show_comments=false&hide_related=true&auto_play=" + (auto ? "true" : "false") };

  // Mixcloud widget
  if (/(^|\.)mixcloud\.com$/i.test(u.hostname))
    return { type: "iframe", srcFor: auto =>
      "https://player-widget.mixcloud.com/widget/iframe/?feed=" + encodeURIComponent(raw)
      + "&hide_cover=1&autoplay=" + (auto ? "1" : "0") };

  // Vimeo
  const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { type: "iframe", srcFor: (auto, start) =>
    "https://player.vimeo.com/video/" + vimeo[1] + "?autoplay=" + (auto ? "1" : "0")
    + (start > 1 ? "#t=" + Math.floor(start) + "s" : "") };

  // Dailymotion
  const dm = raw.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([A-Za-z0-9]+)/i);
  if (dm) return { type: "iframe", srcFor: (auto, start) =>
    "https://www.dailymotion.com/embed/video/" + dm[1] + "?autoplay=" + (auto ? "1" : "0")
    + (start > 1 ? "&start=" + Math.floor(start) : "") };

  // Internet Archive audio / video items
  const ia = raw.match(/archive\.org\/(?:details|embed)\/([^\/?#]+)/i);
  if (ia) return { type: "iframe", srcFor: auto =>
    "https://archive.org/embed/" + ia[1] + (auto ? "?autoplay=1" : "") };

  return null;
}

// Cover art + play badge for one saved song (used on first render and whenever a
// playing card is closed).
function musicFavThumbHtml(fav, lang){
  const media = musicMediaFromUrl(fav && fav.url);
  const playLabel = lang === "ar" ? "تشغيل الأغنية داخل الموقع"
    : (lang === "sv" ? "Spela låten på sajten" : "Play the song on this site");
  // FIX (حذف أيقونات الموسيقى الكبيرة + لا خدمات Google): رمز موسيقى صغير محلي
  // بدل الصور المستضافة خارجياً.
  // FIX (المفضلة المعطّلة): رابط غير قابل للتشغيل داخلياً (مثل روابط البحث)
  // لم يعد يترك بطاقة ميتة؛ بل يعرض زر فتح الأغنية في نافذة جديدة.
  if (!media) {
    const openLabel = lang === "ar" ? "فتح الأغنية"
      : (lang === "sv" ? "Öppna låten" : "Open the song");
    const href = safeUrl(fav && fav.url) || "";
    return `<div class="music-fav-thumb-fallback"><span class="music-fav-note" aria-hidden="true">&#9835;</span></div>`
      + (href ? `<a class="music-fav-play music-fav-open" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(openLabel)}" title="${escapeHtml(openLabel)}">
      <span class="music-fav-play-icon" aria-hidden="true">&#9654;</span>
    </a>` : "");
  }
  // FIX (الصور): إن توفّرت صورة غلاف للأغنية تُعرض، وإلا رمز موسيقى صغير محلي.
  const cover = media.thumb
    ? `<img class="music-fav-cover" src="${escapeHtml(media.thumb)}" data-fallback="${escapeHtml(media.thumbAlt || media.thumb)}" alt="" loading="lazy">`
    : `<div class="music-fav-thumb-fallback"><span class="music-fav-note" aria-hidden="true">&#9835;</span></div>`;
  return `${cover}
    <button type="button" class="music-fav-play" aria-label="${escapeHtml(playLabel)}" title="${escapeHtml(playLabel)}">
      <span class="music-fav-play-icon" aria-hidden="true">&#9654;</span>
    </button>`;
}

// Stop every embedded player and restore the cover art.
// FIX (in-card playback): the floating bottom bar was removed — each song now
// plays inside its own card again, so stopping means killing the iframe and
// putting the cover art back.
// Index of the song currently playing in a card (-1 = nothing playing).
var _playingFavIdx = -1;
function stopAllMusicFavPlayers(container, lang){
  lang = lang || currentLang;
  if (!container) container = document.getElementById("musicFavsList");
  if (!container) return;
  container.querySelectorAll(".music-fav-item.playing").forEach(item => {
    const thumb = item.querySelector(".music-fav-thumb");
    const fr = thumb && thumb.querySelector("iframe");
    if (fr) { try { fr.src = "about:blank"; } catch(e){} }
    // FIX: native players must be paused before the cover art comes back.
    const av = thumb && thumb.querySelector("audio, video");
    if (av) { try { av.pause(); av.removeAttribute("src"); av.load(); } catch(e){} }
    if (thumb) {
      let fav = null;
      try { fav = getMusicFavs()[parseInt(item.getAttribute("data-idx"), 10)] || null; } catch(e){}
      thumb.innerHTML = musicFavThumbHtml(fav || {url: item.getAttribute("data-url") || ""}, lang);
      wireMusicFavCover(thumb);
    }
    item.classList.remove("playing");
  });
  // FIX: forget which card was playing so prev/next starts fresh next time.
  _playingFavIdx = -1;
}

// Kept for compatibility: covers are local now, so nothing remote to retry.
function wireMusicFavCover(scope){
  if (!scope) return;
  scope.querySelectorAll("img.music-fav-cover[data-fallback]").forEach(img => {
    img.addEventListener("error", function(){
      const fb = this.getAttribute("data-fallback");
      if (fb && this.src !== fb) this.src = fb;
    }, {once:true});
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// FIX (in-card music playback): the fixed bottom player bar was REMOVED at the
// user's request. A song now plays inside its own card again — the cover art is
// swapped for a neutral in-card player (native audio/video or a non-Google
// embed), and a ✕ badge stops it and brings the cover back. Only one card plays
// at a time.
// ═══════════════════════════════════════════════════════════════════════════

// Indexes of saved songs that can actually be played in place.
function playableMusicFavIdxs(){
  const favs = getMusicFavs();
  const out = [];
  favs.forEach((f, i) => { if (musicMediaFromUrl(f && f.url)) out.push(i); });
  return out;
}

// Highlight the card that is currently playing.
function markMusicFavActive(idx){
  const list = document.getElementById("musicFavsList");
  if (!list) return;
  list.querySelectorAll(".music-fav-item").forEach(el => {
    el.classList.toggle("playing", parseInt(el.getAttribute("data-idx"), 10) === idx);
  });
}

// Neighbour of `idx` among playable songs, wrapping around at both ends.
// FIX (favourites): powers the in-card previous/next song buttons.
function siblingMusicFavIdx(idx, step){
  const idxs = playableMusicFavIdxs();
  if (!idxs.length) return -1;
  const pos = idxs.indexOf(idx);
  if (pos === -1) return idxs[0];
  const next = (pos + step + idxs.length) % idxs.length;
  return idxs[next];
}

// Jump to the previous / next saved song and play it inside its own card.
function playAdjacentMusicFav(step, lang){
  const cur = _playingFavIdx;
  const idxs = playableMusicFavIdxs();
  if (!idxs.length) return false;
  const from = (cur >= 0) ? cur : idxs[0];
  const target = siblingMusicFavIdx(from, step);
  if (target < 0) return false;
  return playMusicFavIndex(target, lang || currentLang, true);
}

// Play song #idx inside its own card.
// FIX6: startAt = موقع البداية بالثواني لكي تكمل الأغنية من نفس اللحظة
// بعد العودة من قسم آخر (0 = من البداية).
function playMusicFavIndex(idx, lang, autoplay, startAt){
  lang = lang || currentLang;
  const d = T[lang] || T.en;
  const container = document.getElementById("musicFavsList");
  if (!container) return false;
  const favs = getMusicFavs();
  const fav = favs[idx];
  const media = musicMediaFromUrl(fav && fav.url);
  if (!media) return false;
  const item = container.querySelector('.music-fav-item[data-idx="' + idx + '"]');
  if (!item) return false;
  const thumb = item.querySelector(".music-fav-thumb");
  if (!thumb) return false;

  // stop anything else that is playing first
  stopAllMusicFavPlayers(container, lang);

  const name = escapeHtml(fav.name || fav.url || "");
  const auto = autoplay === false ? 0 : 1;
  const closeLabel = d.mpClose || (lang === "ar" ? "إيقاف التشغيل"
    : (lang === "sv" ? "Stäng spelaren" : "Close player"));
  // FIX (favourites): previous / next song controls live inside the card.
  const prevLabel = d.mpPrev || (lang === "ar" ? "الأغنية السابقة"
    : (lang === "sv" ? "Föregående låt" : "Previous song"));
  const nextLabel = d.mpNext || (lang === "ar" ? "الأغنية التالية"
    : (lang === "sv" ? "Nästa låt" : "Next song"));
  const hasSiblings = playableMusicFavIdxs().length > 1;
  const navHtml = hasSiblings
    ? `<div class="music-fav-nav">
         <button type="button" class="music-fav-nav-btn" data-step="-1" aria-label="${escapeHtml(prevLabel)}" title="${escapeHtml(prevLabel)}">&#10094;</button>
         <button type="button" class="music-fav-nav-btn" data-step="1" aria-label="${escapeHtml(nextLabel)}" title="${escapeHtml(nextLabel)}">&#10095;</button>
       </div>`
    : "";

  // FIX (no Google/YouTube services): native <audio>/<video> for direct files,
  // otherwise a neutral (non-Google) embed player — still inside the card.
  const startSec = Math.max(0, Number(startAt) || 0);
  const src = escapeHtml(media.srcFor(!!auto, startSec));
  const autoAttr = auto ? " autoplay" : "";
  let playerHtml;
  if (media.type === "audio") {
    playerHtml = `<div class="music-fav-thumb-fallback"><span class="music-fav-note" aria-hidden="true">&#9835;</span></div>
      <audio class="music-fav-audio" src="${src}" title="${name}" controls preload="none"${autoAttr}></audio>`;
  } else if (media.type === "video") {
    playerHtml = `<video class="music-fav-frame" src="${src}" title="${name}" controls playsinline preload="none"${autoAttr}></video>`;
  } else {
    playerHtml = `<iframe class="music-fav-frame" src="${src}"
      title="${name}" referrerpolicy="strict-origin-when-cross-origin"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen loading="lazy"></iframe>`;
  }
  thumb.innerHTML = `${playerHtml}
    <button type="button" class="music-fav-close" aria-label="${escapeHtml(closeLabel)}" title="${escapeHtml(closeLabel)}">&#10005;</button>${navHtml}`;

  _playingFavIdx = idx;
  item.classList.add("playing");
  markMusicFavActive(idx);

  // FIX6: نتابع موضع الأغنية ونحفظه حتى تكمل في القسم التالي.
  const av = thumb.querySelector("audio, video");
  if (av) {
    if (startSec > 1) av.addEventListener("loadedmetadata", () => {
      if (startSec < (av.duration || Infinity)) { try { av.currentTime = startSec; } catch(e){} }
    }, {once:true});
    trackMusicMediaProgress(av, fav, idx);
    if (auto) { const p = av.play && av.play(); if (p && p.catch) p.catch(() => {}); }
  }
  rememberMusicPlay(fav, idx, startSec, auto !== 0);
  return true;
}

// Kept as a thin alias so older call sites keep working.
function closeMusicPlayer(){
  stopAllMusicFavPlayers(document.getElementById("musicFavsList"), currentLang);
}

// Swap the cover for an in-card player → the song plays inside the site,
// nothing is downloaded or stored locally, and no Google/YouTube player is used.
function playMusicFav(item, lang){
  if (!item) return;
  const idx = parseInt(item.getAttribute("data-idx"), 10);
  if (isNaN(idx)) return;
  // FIX: play inside this very card (no floating bar any more).
  playMusicFavIndex(idx, lang || currentLang, true);
}

function renderMusicFavs(lang){
  const container = document.getElementById("musicFavsList");
  if (!container) return;
  const d = T[lang];
  const favs = getMusicFavs();
  // FIX (انقطاع الموسيقى عند تبديل اللغة): تبديل اللغة يعيد رسم كل شيء،
  // وإعادة بناء البطاقات تقتل مشغّل الأغنية الجارية فيتوقف الصوت. الأن إن كانت
  // أغنية تُشغّل داخل بطاقتها ولم تتغير قائمة المفضلة فعلاً، نترك البطاقات كما هي
  // وتكمل الأغنية بلا انقطاع.
  if (_playingFavIdx !== -1 && container.querySelector(".music-fav-item.playing")){
    const shown = [...container.querySelectorAll(".music-fav-item")].map(el => el.getAttribute("data-url") || "");
    const same = shown.length === favs.length &&
      shown.every((u, i) => u === ((favs[i] && favs[i].url) || ""));
    if (same) return;
  }
  if (!favs.length) {
    container.innerHTML = `<div class="music-fav-empty" style="color:var(--muted);font-size:13px;text-align:center;padding:12px;">${lang==="ar" ? "لم يتم إضافة أغاني بعد" : (lang==="sv" ? "Inga låtar tillagda ännu" : "No songs added yet")}</div>`;
    return;
  }
  const dragHint = lang === "ar" ? "اسحب لتغيير الترتيب"
    : (lang === "sv" ? "Dra för att ändra ordning" : "Drag to re-order");
  container.innerHTML = favs.map((fav, idx) => {
    const name = escapeHtml(fav.name || fav.url);
    // FIX: draggable cards → the user can re-order saved songs by drag & drop.
    // FIX: clicking the cover starts the in-card player (no Google/YouTube).
    return `<div class="music-fav-item" data-idx="${idx}" data-url="${escapeHtml(fav.url || "")}" draggable="true">
      <div class="music-fav-thumb">${musicFavThumbHtml(fav, lang)}</div>
      <div class="music-fav-info">
        <span class="music-fav-grip" title="${escapeHtml(dragHint)}" aria-hidden="true">&#8942;&#8942;</span>
        <a href="${escapeHtml(fav.url)}" target="_blank" rel="noopener noreferrer" class="music-fav-name">${name}</a>
      </div>
    </div>`;
  }).join("");
  wireMusicFavCover(container);
  initMusicFavsPlayback(container, lang);
  initMusicFavsDragDrop(container, lang);
}

// Click the cover / play badge → play in place. Click ✕ → stop.
function initMusicFavsPlayback(container, lang){
  if (!container || container.__playbackWired) return;
  container.__playbackWired = true;
  container.addEventListener("click", e => {
    if (e.target.closest(".music-fav-name")) return;      // the title still opens the original link
    // FIX: زر فتح الروابط غير القابلة للتشغيل يعمل طبيعياً دون اعتراض.
    if (e.target.closest(".music-fav-open")) return;
    if (e.target.closest(".music-fav-close")) {
      e.preventDefault(); e.stopPropagation();
      // FIX: ✕ stops the in-card player and restores the cover art.
      // FIX6: والإيقاف اليدوي يعني أن الأغنية لن تكمل في الأقسام الأخرى.
      clearMusicPlayState();
      stopAllMusicFavPlayers(container, lang || currentLang);
      return;
    }
    // FIX (favourites): ‹ / › switch to the previous / next saved song.
    const navBtn = e.target.closest(".music-fav-nav-btn");
    if (navBtn) {
      e.preventDefault(); e.stopPropagation();
      playAdjacentMusicFav(parseInt(navBtn.getAttribute("data-step"), 10) || 1, lang || currentLang);
      return;
    }
    const thumb = e.target.closest(".music-fav-thumb");
    if (!thumb) return;
    const item = thumb.closest(".music-fav-item");
    if (!item || item.classList.contains("playing")) return;
    e.preventDefault();
    playMusicFav(item, lang || currentLang);
  });
}

// ---- Drag & drop re-ordering for the saved-songs grid --------------------
function initMusicFavsDragDrop(container, lang){
  if (!container) return;
  let dragIdx = null;
  container.querySelectorAll(".music-fav-item").forEach(el => {
    el.addEventListener("dragstart", e => {
      dragIdx = parseInt(el.getAttribute("data-idx"), 10);
      el.classList.add("dragging");
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        try { e.dataTransfer.setData("text/plain", String(dragIdx)); } catch(err){}
      }
    });
    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      container.querySelectorAll(".drag-over").forEach(n => n.classList.remove("drag-over"));
    });
    el.addEventListener("dragover", e => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      el.classList.add("drag-over");
    });
    el.addEventListener("dragleave", () => el.classList.remove("drag-over"));
    el.addEventListener("drop", e => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove("drag-over");
      let from = dragIdx;
      if (from === null && e.dataTransfer) from = parseInt(e.dataTransfer.getData("text/plain"), 10);
      const to = parseInt(el.getAttribute("data-idx"), 10);
      if (isNaN(from) || isNaN(to) || from === to) return;
      const list = getMusicFavs();
      if (from < 0 || from >= list.length || to < 0 || to >= list.length) return;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      saveMusicFavs(list);
      dragIdx = null;
      renderMusicFavs(lang || currentLang);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// FIX6 (الأغنية المفضلة تستمر عند الانتقال إلى قسم آخر)
// صفحات الموقع مستقلة (تحميل كامل عند كل انتقال)، فلا يمكن للصوت أن يبقى
// حياً في نفس العنصر. الحل: نحفظ الأغنية الجارية وموضعها بالثواني، وعند فتح
// أي قسم آخر يظهر مشغّل صغير في الزاوية يكمل الأغنية من نفس اللحظة، وعند
// العودة إلى قسم الموسيقى تكمل الأغنية داخل بطاقتها كما كانت.
// كل ميزات المفضلة (إضافة/حذف/ترتيب بالسحب/السابق والتالي/فتح الرابط) كما هي.
// ═══════════════════════════════════════════════════════════════════════════
const MUSIC_STATE_KEY = "swp-music-playing";

function getMusicPlayState(){
  try {
    const st = JSON.parse(localStorage.getItem(MUSIC_STATE_KEY));
    return (st && st.url) ? st : null;
  } catch(e) { return null; }
}
function setMusicPlayState(st){
  try { localStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(st)); } catch(e) {}
}
function clearMusicPlayState(){
  try { localStorage.removeItem(MUSIC_STATE_KEY); } catch(e) {}
}
// الموضع الحالي للأغنية بالثواني (مع حساب الوقت المنقضي أثناء الانتقال).
function musicPlayPosition(st){
  if (!st) return 0;
  let pos = Number(st.pos) || 0;
  if (st.playing && st.at) {
    const gap = (Date.now() - Number(st.at)) / 1000;
    if (gap > 0 && gap < 60 * 60 * 6) pos += gap;
  }
  return pos > 1 ? pos : 0;
}
function rememberMusicPlay(fav, idx, pos, playing){
  if (!fav || !fav.url) return;
  setMusicPlayState({
    url: fav.url, name: fav.name || fav.url, idx: idx,
    pos: Math.max(0, Number(pos) || 0), at: Date.now(), playing: playing !== false
  });
}
// مؤشر الأغنية المحفوظة داخل قائمة المفضلة (بالرابط أولاً ثم بالترتيب).
function musicFavIdxFromState(st){
  if (!st) return -1;
  const favs = getMusicFavs();
  let i = favs.findIndex(f => f && f.url === st.url);
  if (i === -1 && typeof st.idx === "number" && favs[st.idx] && favs[st.idx].url === st.url) i = st.idx;
  return i;
}
// مشغّل الصوت/الفيديو المحلي: نحدّث الموضع المحفوظ أثناء التشغيل.
function trackMusicMediaProgress(el, fav, idx){
  if (!el) return;
  let last = 0;
  el.addEventListener("timeupdate", () => {
    const now = Date.now();
    if (now - last < 1000) return;
    last = now;
    rememberMusicPlay(fav, idx, el.currentTime, !el.paused);
  });
  el.addEventListener("pause", () => rememberMusicPlay(fav, idx, el.currentTime, false));
  el.addEventListener("play",  () => rememberMusicPlay(fav, idx, el.currentTime, true));
  el.addEventListener("ended", () => clearMusicPlayState());
}
// هل نحن في قسم الموسيقى نفسه؟ (هناك تكمل الأغنية داخل بطاقتها لا في الزاوية)
function isMusicFavsPage(){
  return !!document.getElementById("musicFavsList") && getParam("cat", "") === "music";
}

// المشغّل المصغّر في الزاوية — يظهر فقط عندما تكون هناك أغنية جارية
// ونحن في قسم آخر غير الموسيقى.
function initMusicMiniPlayer(lang){
  lang = lang || currentLang;
  const existing = document.getElementById("swpMiniPlayer");
  const st0 = getMusicPlayState();
  // FIX (انقطاع الموسيقى عند تبديل اللغة): لو كان المشغّل المصغّر يعمل
  // أصلاً وبنفس الأغنية، لا نعيد بنائه (إعادة البناء تقطع الصوت)؛ نحدّث
  // التسميات ورابط «فتح قسم الموسيقى» بلغة القسم الجديدة فقط.
  if (existing && st0 && st0.playing !== false && existing.dataset.url === st0.url && !isMusicFavsPage()){
    const isAr0 = lang === "ar", isSv0 = lang === "sv";
    const contLabel0 = isAr0 ? "يكمل التشغيل" : (isSv0 ? "Fortsätter spela" : "Still playing");
    const closeLabel0 = isAr0 ? "إيقاف التشغيل" : (isSv0 ? "Stäng spelaren" : "Close player");
    const backLabel0  = isAr0 ? "فتح قسم الموسيقى" : (isSv0 ? "Öppna musiksektionen" : "Open the music section");
    const note0 = existing.querySelector(".swp-mini-note");
    const titleA = existing.querySelector(".swp-mini-title");
    const closeB = existing.querySelector(".swp-mini-close");
    if (note0) note0.textContent = contLabel0;
    if (titleA) { titleA.setAttribute("href", catLink("music", lang)); titleA.setAttribute("title", backLabel0); }
    if (closeB) { closeB.setAttribute("aria-label", closeLabel0); closeB.setAttribute("title", closeLabel0); }
    return;
  }
  if (existing) existing.remove();
  if (isMusicFavsPage()) return;

  const st = getMusicPlayState();
  if (!st || st.playing === false) return;
  const media = musicMediaFromUrl(st.url);
  if (!media) return;

  const pos = musicPlayPosition(st);
  const isAr = lang === "ar", isSv = lang === "sv";
  const contLabel = isAr ? "يكمل التشغيل" : (isSv ? "Fortsätter spela" : "Still playing");
  const closeLabel = isAr ? "إيقاف التشغيل" : (isSv ? "Stäng spelaren" : "Close player");
  const backLabel  = isAr ? "فتح قسم الموسيقى" : (isSv ? "Öppna musiksektionen" : "Open the music section");
  const name = escapeHtml(st.name || st.url);
  const src = escapeHtml(media.srcFor(true, pos));

  let playerHtml;
  if (media.type === "audio") {
    playerHtml = `<audio class="swp-mini-audio" src="${src}" title="${name}" controls autoplay preload="auto"></audio>`;
  } else if (media.type === "video") {
    playerHtml = `<video class="swp-mini-frame" src="${src}" title="${name}" controls playsinline autoplay preload="auto"></video>`;
  } else {
    playerHtml = `<iframe class="swp-mini-frame" src="${src}" title="${name}"
      referrerpolicy="strict-origin-when-cross-origin"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowfullscreen></iframe>`;
  }

  const box = document.createElement("div");
  box.id = "swpMiniPlayer";
  // FIX (استمرار التشغيل): رابط الأغنية يُكتب على الصندوق ليُعرف لاحقاً
  // أنّ المشغّل يعمل بنفس الأغنية فلا يُعاد بناءه عند تبديل اللغة.
  box.dataset.url = st.url || "";
  box.className = "swp-mini-player" + (media.type === "audio" ? " is-audio" : "");
  box.setAttribute("dir", "ltr");
  box.innerHTML = `
    <div class="swp-mini-head">
      <span class="swp-mini-dot" aria-hidden="true">&#9835;</span>
      <a class="swp-mini-title" href="${escapeHtml(catLink("music", lang))}" title="${escapeHtml(backLabel)}">${name}</a>
      <button type="button" class="swp-mini-close" aria-label="${escapeHtml(closeLabel)}" title="${escapeHtml(closeLabel)}">&#10005;</button>
    </div>
    <div class="swp-mini-media">${playerHtml}</div>
    <div class="swp-mini-note">${escapeHtml(contLabel)}</div>`;
  document.body.appendChild(box);

  const favIdx = musicFavIdxFromState(st);
  const favRef = { url: st.url, name: st.name };
  const av = box.querySelector("audio, video");
  if (av) {
    av.addEventListener("loadedmetadata", () => {
      if (pos > 1 && pos < (av.duration || Infinity)) { try { av.currentTime = pos; } catch(e){} }
    }, {once:true});
    trackMusicMediaProgress(av, favRef, favIdx);
    const tryPlay = av.play && av.play();
    if (tryPlay && tryPlay.catch) tryPlay.catch(() => {});
  } else {
    // مشغّل مدمج: نحدّث لحظة البداية حتى يبقى الموضع صحيحاً عند أي انتقال لاحق.
    rememberMusicPlay(favRef, favIdx, pos, true);
  }

  box.querySelector(".swp-mini-close").addEventListener("click", () => {
    const a = box.querySelector("audio, video");
    if (a) { try { a.pause(); } catch(e){} }
    clearMusicPlayState();
    box.remove();
  });
}

// عند فتح قسم الموسيقى: تكمل الأغنية المحفوظة داخل بطاقتها من نفس اللحظة.
function resumeMusicFavFromState(lang){
  if (_playingFavIdx !== -1) return;
  const st = getMusicPlayState();
  if (!st || st.playing === false) return;
  const idx = musicFavIdxFromState(st);
  if (idx < 0) return;
  playMusicFavIndex(idx, lang || currentLang, true, musicPlayPosition(st));
}

// ═══════════════════════════════════════════════════════════════════════════
// MUSIC CONTEXT MENU (right-click on golden-framed title) + PASSWORD MODAL
// ═══════════════════════════════════════════════════════════════════════════
const MUSIC_PWD = "Azad012758Aziz";

// FIX (إخفاء خبر برقم سري): قائمة واحدة تخدم وضعين: وضع الموسيقى
// (إضافة/حذف أغنية) ووضع الأخبار (إخفاء/استعادة)، فلا تطول القائمة
// ولا تظهر أوامر لا تناسب موقع النقر.
function setCtxMode(menu, mode){
  if (!menu) return;
  const musicItems = menu.querySelectorAll(".music-ctx-add, .music-ctx-remove");
  const newsItems = menu.querySelectorAll(".news-ctx-item");
  musicItems.forEach(el => { el.style.display = (mode === "music") ? "" : "none"; });
  newsItems.forEach(el => { el.style.display = (mode === "news") ? "" : "none"; });
  menu.dataset.mode = mode;
}

// FIX (طول القائمة وخروجها عن الشاشة): القائمة تُزاح داخل حدود
// النافذة بعد العرض، وتقبل إحداثيات اللمس كما تقبل الماوس.
function ctxEventPoint(event){
  if (event && typeof event.clientX === "number" && (event.clientX || event.clientY)) {
    return { x: event.clientX, y: event.clientY };
  }
  const t = event && (event.touches && event.touches[0] || event.changedTouches && event.changedTouches[0]);
  if (t) return { x: t.clientX, y: t.clientY };
  return { x: 20, y: 20 };
}

function placeCtxMenu(menu, x, y){
  if (!menu) return;
  menu.style.left = "0px";
  menu.style.top = "0px";
  menu.style.display = "block";
  const pad = 8;
  const rect = menu.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - pad;
  const maxY = window.innerHeight - rect.height - pad;
  const left = Math.max(pad, Math.min(x, maxX < pad ? pad : maxX));
  const top = Math.max(pad, Math.min(y, maxY < pad ? pad : maxY));
  menu.style.left = left + "px";
  menu.style.top = top + "px";
}

function showMusicContextMenu(event, songIndex) {
  event.preventDefault();
  event.stopPropagation();
  const menu = document.getElementById("musicContextMenu");
  if (!menu) return false;
  const lang = currentLang;
  const d = T[lang];
  // FIX (إخفاء خبر برقم سري): القائمة واحدة للموسيقى والأخبار،
  // فنعرض عناصر الموسيقى ونخفي عناصر الأخبار في هذا الوضع.
  setCtxMode(menu, "music");
  // Set menu item labels
  const addItem = document.getElementById("musicCtxAdd");
  const removeItem = document.getElementById("musicCtxRemove");
  const addLabel = addItem ? addItem.querySelector("span") : null;
  const removeLabel = removeItem ? removeItem.querySelector("span") : null;
  if (addLabel) addLabel.textContent = d.musicCtxAdd || "Add Song";
  if (removeLabel) removeLabel.textContent = d.musicCtxRemove || "Remove This Song";
  // Store the right-clicked song index for remove action
  if (typeof songIndex === "number" && songIndex >= 0) {
    menu.dataset.songIndex = songIndex;
  } else {
    delete menu.dataset.songIndex;
  }
  // Position context menu at click point
  const pt = ctxEventPoint(event);
  placeCtxMenu(menu, pt.x, pt.y);
  // Animate in
  menu.classList.remove("ctx-animate-in");
  void menu.offsetWidth; // force reflow
  menu.classList.add("ctx-animate-in");
  return false;
}

function closeMusicContextMenu() {
  const menu = document.getElementById("musicContextMenu");
  if (menu) menu.style.display = "none";
}

let _musicCtxInitialized = false;

function initMusicContextMenu(lang) {
  // Only bind once – re‑calling just updates labels
  if (!_musicCtxInitialized) {
    _musicCtxInitialized = true;

    // Close context menu on outside click
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("musicContextMenu");
      if (menu && !menu.contains(e.target)) closeMusicContextMenu();
    });

    // Close context menu on scroll
    document.addEventListener("scroll", closeMusicContextMenu, true);

    // Context menu: Add song  – use getElementById for reliability
    const addItem = document.getElementById("musicCtxAdd");
    if (addItem) {
      addItem.addEventListener("click", (e) => {
        e.stopPropagation();
        closeMusicContextMenu();
        showMusicPasswordModal("add");
      });
    }

    // Context menu: Remove specific song
    const removeItem = document.getElementById("musicCtxRemove");
    if (removeItem) {
      removeItem.addEventListener("click", (e) => {
        e.stopPropagation();
        const menu = document.getElementById("musicContextMenu");
        const songIdx = menu && menu.dataset.songIndex !== undefined ? parseInt(menu.dataset.songIndex, 10) : -1;
        closeMusicContextMenu();
        showMusicPasswordModal("remove", songIdx);
      });
    }

    // Music favorites list — right-click context menu for removal (X button removed)
    const listEl = document.getElementById("musicFavsList");
    if (listEl) {
      // Right-click on individual favorite items (allowed zone) → context menu with song index
      listEl.addEventListener("contextmenu", (e) => {
        const item = e.target.closest(".music-fav-item");
        if (!item) return;
        const idx = parseInt(item.getAttribute("data-idx"), 10);
        if (!isNaN(idx) && idx >= 0) {
          showMusicContextMenu(e, idx);
        }
      });
    }
    
    // Also enable right-click on the entire music favorites section (allowed zone)
    const favsSection = document.getElementById("musicFavsSection");
    if (favsSection) {
      favsSection.addEventListener("contextmenu", (e) => {
        // If right-clicked directly on a fav item, let the list handler manage it
        const item = e.target.closest(".music-fav-item");
        if (item) return; // handled by list handler above
        // Otherwise, right-click on the allowed zone (section background, title, etc.)
        // Show context menu without a specific song index (for Add action)
        showMusicContextMenu(e, -1);
      });
    }

    // FIX (لمسة طويلة للموسيقى): الهاتف لا يرسل contextmenu، فأُضيف تفويض
    // لمسي على المستند: ضغطة طويلة (ٰ٥٥٠مس) داخل قسم المفضلة تفتح القائمة.
    initLongPressContextMenus();
  }

  // Always update context menu labels when language changes
  const addItem = document.getElementById("musicCtxAdd");
  const removeItem = document.getElementById("musicCtxRemove");
  const addLabel = addItem ? addItem.querySelector("span") : null;
  const removeLabel = removeItem ? removeItem.querySelector("span") : null;
  const d = T[lang];
  if (addLabel) addLabel.textContent = d.musicCtxAdd || "Add Song";
  if (removeLabel) removeLabel.textContent = d.musicCtxRemove || "Remove This Song";
  // FIX (إخفاء خبر برقم سري): تسميات عناصر الأخبار تتغير مع اللغة أيضاً.
  const hideItem = document.getElementById("newsCtxHide");
  const restoreItem = document.getElementById("newsCtxRestore");
  const hideLabel = hideItem ? hideItem.querySelector("span") : null;
  const restoreLabel = restoreItem ? restoreItem.querySelector("span") : null;
  if (hideLabel) hideLabel.textContent = d.newsCtxHide || "Hide this news";
  if (restoreLabel) restoreLabel.textContent = d.newsCtxRestore || "Restore hidden news";
  // FIX (منع كلمة أو رابط): تسمية الأمر الثالث تتغير مع اللغة أيضاً.
  const blockItem = document.getElementById("newsCtxBlock");
  const blockLabel = blockItem ? blockItem.querySelector("span") : null;
  if (blockLabel) blockLabel.textContent = d.newsCtxBlock || "Block a word or link";
}

// ═══════════════════════════════════════════════════════════════════════════
// FIX (إخفاء خبر برقم سري): قائمة الأخبار بالزر الأيمن / اللمسة الطويلة
// ═══════════════════════════════════════════════════════════════════════════
// بطاقة الخبر رابط، فلا بد من منع فتح الرابط عند الزر الأيمن واللمسة الطويلة.
// paintNewsPage يعيد بناء الشبكة، لذا الربط بالتفويض على المستند لا على البطاقة.
let _newsCtxHKey = "";

function showNewsContextMenu(event, hkey) {
  const menu = document.getElementById("musicContextMenu");
  if (!menu) return false;
  if (event && event.preventDefault) event.preventDefault();
  if (event && event.stopPropagation) event.stopPropagation();
  _newsCtxHKey = hkey || "";
  const d = T[currentLang];
  const hideItem = document.getElementById("newsCtxHide");
  const restoreItem = document.getElementById("newsCtxRestore");
  const hideLabel = hideItem ? hideItem.querySelector("span") : null;
  const restoreLabel = restoreItem ? restoreItem.querySelector("span") : null;
  if (hideLabel) hideLabel.textContent = d.newsCtxHide || "Hide this news";
  if (restoreLabel) restoreLabel.textContent = d.newsCtxRestore || "Restore hidden news";
  // FIX (منع كلمة أو رابط): الأمر الثالث يظهر دائماً في وضع الأخبار.
  const blockItem = document.getElementById("newsCtxBlock");
  const blockLabel = blockItem ? blockItem.querySelector("span") : null;
  if (blockLabel) blockLabel.textContent = d.newsCtxBlock || "Block a word or link";
  setCtxMode(menu, "news");
  // بلا مفتاح خبر (نقر على فراغ الشبكة) يبقى أمر الاستعادة وحده مفيداً
  if (hideItem) hideItem.style.display = _newsCtxHKey ? "" : "none";
  const pt = ctxEventPoint(event);
  placeCtxMenu(menu, pt.x, pt.y);
  menu.classList.remove("ctx-animate-in");
  void menu.offsetWidth;
  menu.classList.add("ctx-animate-in");
  return false;
}

function hideNewsFlow(lang, _unused) {
  const key = _newsCtxHKey;
  if (!key) return;
  const list = getHiddenNews();
  if (list.indexOf(key) === -1) {
    list.push(key);
    saveHiddenNews(list);
  }
  _newsCtxHKey = "";
  // إخفاء فوري للبطاقة ثم إعادة رسم القسم حتى تُسدّ الفجوة
  document.querySelectorAll('[data-hkey]').forEach(el => {
    if (el.getAttribute("data-hkey") === key) el.remove();
  });
  repaintAfterHiddenChange(lang);
}

// FIX (منع كلمة أو رابط): نافذة واحدة تُعرض فيها الكلمات الممنوعة الحالية
// مفصولة بفواصل؛ يزيد المستخدم أو يحذف كما يريد، والحقل الفارغ يلغي المنع كلّه.
function blockTermFlow(lang) {
  const d = T[lang] || T.en;
  const current = getBlockedTerms().join(", ");
  const answer = prompt(d.newsBlockPrompt || "Words or links to block (comma separated):", current);
  if (answer === null) return;                       // إلغاء
  const terms = String(answer).split(/[,\u060c\n]/).map(s => s.trim()).filter(Boolean);
  const saved = saveBlockedTerms(terms);
  alert(saved.length ? (d.newsBlockSaved || "Saved.") : (d.newsBlockCleared || "Cleared."));
  // الممنوعات تُرشّح قبل التخزين، فلا بد من مسح الكاش وجلب جديد.
  clearLiveNewsCache();
  try { location.reload(); } catch (e) {}
}

function restoreHiddenNewsFlow(lang) {
  const d = T[lang];
  const list = getHiddenNews();
  if (!list.length) {
    alert(d.newsRestoreEmpty || "There is no hidden news.");
    return;
  }
  if (!confirm(d.newsRestoreConfirm || "Restore all hidden news?")) return;
  saveHiddenNews([]);
  try { localStorage.removeItem(HIDDEN_NEWS_KEY); } catch (e) {}
  // المخفيّات كانت تُستبعد قبل التخزين، فلا بد من مسح الكاش وجلب جديد
  clearLiveNewsCache();
  try { location.reload(); } catch (e) {}
}

// مسح كاش الأخبار (الذاكرة + التخزين المحلي) لإعادة جلب كاملة
function clearLiveNewsCache(){
  try { memCache.clear(); } catch (e) {}
  try { newsCache.clear(); } catch (e) {}
  try {
    if (!window.localStorage) return;
    const kill = [];
    for (let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if (k && /^swp-live-news-v\d+\|/.test(k)) kill.push(k);
    }
    kill.forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
  } catch (e) {}
}

// FIX (زر التحديث): تحديث يدوي كامل — يُسقط الكاش ويُصفّر عدّاد
// فشل البوابات ثم يعيد تحميل الصفحة بنفس القسم واللغة، فتأتي الأخبار من المصادر مباشرة.
function doManualRefresh(lang){
  const btn = document.getElementById("footerRefreshBtn");
  if (btn) { btn.classList.add("refreshing"); btn.disabled = true; }
  clearLiveNewsCache();
  try { _gatewayFails.clear(); } catch (e) {}
  try {
    const url = new URL(location.href);
    url.searchParams.set("lang", lang || currentLang);
    url.searchParams.set("_r", String(Date.now()));
    location.replace(url.toString());
  } catch (e) {
    try { location.reload(); } catch (e2) {}
  }
}

// إعادة رسم ما يظهر حالياً بعد إخفاء خبر، دون إعادة تحميل الصفحة
function repaintAfterHiddenChange(lang) {
  const l = lang || currentLang;
  const hidden = getHiddenNews();
  let painted = false;
  document.querySelectorAll(".news-grid").forEach(container => {
    if (!container._allItems || !container._allItems.length) return;
    container._allItems = container._allItems.filter(it => hidden.indexOf(newsHideKey(it)) === -1);
    const cat = container._renderCat || getParam("cat", "") || "news";
    try { paintNewsPage(container, cat, l); painted = true; } catch (e) {}
  });
  return painted;
}

// FIX (لمسة طويلة): الهواتف لا ترسل حدث الزر الأيمن، فأُضيف مستمع لمسي
// موحّد بالتفويض: ضغطة طويلة دون تحريك تفتح قائمة الموسيقى أو الأخبار
// حسب موقع اللمس، وتمنع فتح رابط البطاقة.
let _longPressInitialized = false;

function initLongPressContextMenus(){
  if (_longPressInitialized) return;
  _longPressInitialized = true;

  const LONG_MS = 550;
  const MOVE_TOL = 12;
  let timer = null, startX = 0, startY = 0, fired = false, target = null;

  const clear = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    target = null;
  };

  document.addEventListener("touchstart", (e) => {
    if (!e.touches || e.touches.length !== 1) { clear(); return; }
    const t = e.touches[0];
    const el = e.target;
    if (!el || !el.closest) return;
    const favItem = el.closest(".music-fav-item");
    const favSection = el.closest("#musicFavsSection, #musicFavsList");
    const card = el.closest("[data-hkey]");
    const grid = el.closest(".news-grid");
    if (!favItem && !favSection && !card && !grid) return;
    startX = t.clientX; startY = t.clientY; fired = false;
    target = { favItem, favSection, card, grid, x: t.clientX, y: t.clientY };
    timer = setTimeout(() => {
      if (!target) return;
      fired = true;
      const fake = { clientX: target.x, clientY: target.y, preventDefault(){}, stopPropagation(){} };
      if (target.favItem) {
        const idx = parseInt(target.favItem.getAttribute("data-idx"), 10);
        showMusicContextMenu(fake, isNaN(idx) ? -1 : idx);
      } else if (target.favSection) {
        showMusicContextMenu(fake, -1);
      } else {
        showNewsContextMenu(fake, target.card ? target.card.getAttribute("data-hkey") : "");
      }
      try { if (navigator.vibrate) navigator.vibrate(18); } catch(err){}
    }, LONG_MS);
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!timer || !e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    if (Math.abs(t.clientX - startX) > MOVE_TOL || Math.abs(t.clientY - startY) > MOVE_TOL) clear();
  }, { passive: true });

  // بعد فتح القائمة بلمسة طويلة يُمنع فتح رابط البطاقة
  document.addEventListener("touchend", (e) => {
    clear();
    if (fired) { if (e.cancelable) e.preventDefault(); fired = false; }
  }, { passive: false });

  document.addEventListener("touchcancel", () => { clear(); fired = false; }, { passive: true });
}

let _newsCtxInitialized = false;

function initNewsContextMenu(lang) {
  if (_newsCtxInitialized) return;
  _newsCtxInitialized = true;

  const hideItem = document.getElementById("newsCtxHide");
  if (hideItem) {
    hideItem.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMusicContextMenu();
      showMusicPasswordModal("hideNews");
    });
  }
  const restoreItem = document.getElementById("newsCtxRestore");
  if (restoreItem) {
    restoreItem.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMusicContextMenu();
      showMusicPasswordModal("restoreNews");
    });
  }
  // FIX (منع كلمة أو رابط): الأمر الثالث محميّ بنفس الرقم السري.
  const blockItem = document.getElementById("newsCtxBlock");
  if (blockItem) {
    blockItem.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMusicContextMenu();
      showMusicPasswordModal("blockTerm");
    });
  }

  // تفويض على المستند: يبقى فعّالاً بعد كل إعادة رسم للشبكة
  document.addEventListener("contextmenu", (e) => {
    const card = e.target.closest ? e.target.closest("[data-hkey]") : null;
    const grid = e.target.closest ? e.target.closest(".news-grid") : null;
    if (!card && !grid) return;
    if (e.target.closest && e.target.closest(".music-fav-item, #musicFavsSection")) return;
    showNewsContextMenu(e, card ? card.getAttribute("data-hkey") : "");
  });
}

function showMusicPasswordModal(action, songIndex) {
  const modal = document.getElementById("musicPasswordModal");
  if (!modal) return;
  const lang = currentLang;
  const d = T[lang];
  const titleEl = modal.querySelector(".music-password-title");
  const input = modal.querySelector(".music-pwd-input");
  const submitBtn = modal.querySelector(".music-pwd-submit");
  const cancelBtn = modal.querySelector(".music-pwd-cancel");
  const errorDiv = modal.querySelector(".music-password-error");
  const hintEl = modal.querySelector(".music-pwd-hint");

  if (titleEl) titleEl.textContent = d.musicPwdTitle || "Enter Password";
  if (input) { input.value = ""; input.type = "password"; input.placeholder = d.musicPwdHint || ""; }
  if (submitBtn) submitBtn.textContent = d.musicPwdSubmit || "Submit";
  if (cancelBtn) cancelBtn.textContent = d.musicPwdCancel || "Cancel";
  if (errorDiv) { errorDiv.textContent = ""; errorDiv.style.display = "none"; }
  if (hintEl) hintEl.textContent = d.musicPwdHint || "";

  modal.style.display = "flex";
  modal.dataset.action = action;
  // Force focus on input after display change
  if (input) {
    requestAnimationFrame(() => {
      input.focus();
      input.click(); // some mobile browsers need this
    });
  }

  // One-time handlers
  const handleSubmit = () => {
    const pwd = input ? input.value.trim() : "";
    if (pwd !== MUSIC_PWD) {
      if (errorDiv) {
        errorDiv.textContent = d.musicPwdError || "Wrong password";
        errorDiv.style.display = "block";
        errorDiv.classList.remove("shake-anim");
        void errorDiv.offsetWidth;
        errorDiv.classList.add("shake-anim");
      }
      if (input) { input.value = ""; input.focus(); }
      return;
    }
    modal.style.display = "none";
    cleanup();
    if (action === "add") {
      musicAddSongFlow(lang);
    } else if (action === "remove") {
      musicRemoveSingleFlow(lang, songIndex);
    } else if (action === "hideNews") {
      // FIX (إخفاء خبر برقم سري): نفس نافذة الرقم السري تخدم إخفاء الأخبار
      hideNewsFlow(lang, songIndex);
    } else if (action === "restoreNews") {
      restoreHiddenNewsFlow(lang);
    } else if (action === "blockTerm") {
      // FIX (منع كلمة أو رابط)
      blockTermFlow(lang);
    } else if (action === "refreshNews") {
      // FIX (رقم سري لزر التحديث): التحديث اليدوي يتطلب الرقم السري
      doManualRefresh(lang);
    }
  };

  const handleCancel = () => {
    modal.style.display = "none";
    cleanup();
  };

  const handleKeydown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") handleCancel();
  };

  const handleBackdrop = (e) => {
    if (e.target === modal) handleCancel();
  };

  function cleanup() {
    if (submitBtn) submitBtn.removeEventListener("click", handleSubmit);
    if (cancelBtn) cancelBtn.removeEventListener("click", handleCancel);
    if (input) input.removeEventListener("keydown", handleKeydown);
    modal.removeEventListener("click", handleBackdrop);
  }

  if (submitBtn) submitBtn.addEventListener("click", handleSubmit);
  if (cancelBtn) cancelBtn.addEventListener("click", handleCancel);
  if (input) input.addEventListener("keydown", handleKeydown);
  modal.addEventListener("click", handleBackdrop);
}

function musicAddSongFlow(lang) {
  const d = T[lang];
  const songName = prompt(d.musicFavPlaceholder || "Enter a song link or name...");
  if (!songName || !songName.trim()) return;
  const val = songName.trim();
  const favs = getMusicFavs();
  // FIX (no Google/YouTube services): plain-name entries search a neutral engine.
  favs.push({ name: val, url: /^https?:\/\//.test(val) ? val : "https://www.youtube.com/results?search_query=" + encodeURIComponent(val) });
  saveMusicFavs(favs);
  renderMusicFavs(currentLang);
}

function musicRemoveSingleFlow(lang, songIndex) {
  const favs = getMusicFavs();
  const d = T[lang];
  if (typeof songIndex === "number" && songIndex >= 0 && songIndex < favs.length) {
    const songName = favs[songIndex].name || "";
    const confirmed = confirm((d.musicRemoveConfirm || "Remove this favorite song?") + (songName ? " \"" + songName + "\"" : ""));
    if (!confirmed) return;
    favs.splice(songIndex, 1);
    saveMusicFavs(favs);
    // FIX: renderMusicFavs rebuilds the cards, so any in-card player of the
    // removed song disappears with it.
    renderMusicFavs(currentLang);
  } else {
    // Fallback: no specific index (e.g. right-clicked on title not a song)
    const confirmed = confirm(d.musicRemoveConfirm || "Remove this favorite song?");
    if (!confirmed) return;
    // Remove last added song as fallback
    if (favs.length > 0) {
      favs.pop();
      saveMusicFavs(favs);
      renderMusicFavs(currentLang);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOP SONGS PROVIDER (مصدر أغانٍ حقيقي: أغلفة أغانٍ + روابط أغانٍ)
// ═══════════════════════════════════════════════════════════════════════════
// FIX (قسم «استمع لأحدث الأغاني» كان يعرض أخباراً):
// القسم لم يعد يقرأ تغذيات أخبار أبداً. صار يقرأ قائمة الأغاني الأكثر رواجاً
// من متجر الموسيقى (العربية ← متجر السعودية، السويدية ← متجر السويد،
// الإنجليزية ← المتجر الأميركي)، فكل بطاقة = أغنية حقيقية: غلاف الأغنية
// نفسه + اسم الأغنية + الفنان + رابط يفتح الأغنية (لا مقالاً).
const TOP_SONGS_STORE = { ar: "sa", sv: "se", en: "us" };
const _topSongsCache = {};

function upgradeCoverSize(url){
  const raw = String(url || "");
  if (!raw) return "";
  // أغلفة المتجر تُسلّم بمقاس صغير (55/60/170)؛ نطلب مقاساً أوضح للبطاقة.
  return raw.replace(/\/\d+x\d+bb\.(png|jpe?g)$/i, "/400x400bb.jpg");
}

function _asArray(value){
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// FIX (تسرّب الآيات القرأنية إلى «استمع لأحدث الأغاني»):
// قوائم الرواج في المتاجر العربية تضمّ تلاوات وسوراً وأدعية ورقى؋
// وهي ليست أغاني؋ فتُستبعد بالتصنيف وبكلمات العنوان/الفنان.
const _QURAN_GENRE_RE = /(qur|quran|islam|religio|devotional|spiritual|worship|inspirational|gospel|spoken\s*word|قرآن|قران|إسلام|اسلام|دين|روحاني)/i;
const _QURAN_TEXT_RE = new RegExp(
  "(قرآن|قران|سورة|سوره|آية|اية|آيات|تلاوة|تلاوه|مرتل|مقرئ|رتيل|مجود|جزء\\s|رقية|دعاء|أدعية|ادعية|أذكار|اذكار|تسبيح|خطبة|محاضرة|الشيخ|القارى|القارئ|بسم الله|صلى الله|أذان|اذان|مؤذن|مولد|مديح|أناشيد|اناشيد|نشيد ديني|رمضان كريم)"
  + "|\\b(quran|qur'an|qoran|koran|surah|surat|ayah|ayat|tilawah|tilawa|telawa|tajweed|recitation|reciter|ruqyah|dua|adhan|athan|azan|adhkar|dhikr|khutbah|sheikh|nasheed|anasheed|devotional)\\b",
  "i"
);
function _isQuranLike(name, artist, genre, album){
  const g = String(genre || "");
  if (_QURAN_GENRE_RE.test(g)) return true;
  const txt = [name, artist, album].filter(Boolean).join(" ");
  return _QURAN_TEXT_RE.test(txt);
}

// FIX (بطاقات الأغاني بلا مصدر ولا تاريخ): اسم المنصة الناشرة من الرابط.
function songSourceName(url){
  const raw = String(url || "");
  if (/music\.apple\.com/i.test(raw)) return "Apple Music";
  if (/itunes\.apple\.com/i.test(raw)) return "iTunes";
  if (/open\.spotify\.com|spotify\.com/i.test(raw)) return "Spotify";
  if (/anghami\.com/i.test(raw)) return "Anghami";
  if (/soundcloud\.com/i.test(raw)) return "SoundCloud";
  if (/youtube\.com|youtu\.be/i.test(raw)) return "YouTube";
  if (/deezer\.com/i.test(raw)) return "Deezer";
  return sourceNameFromUrl(raw);
}

// FIX: تاريخ الصدور يُعرض بلغة القسم نفسه.
function songReleaseDate(item, lang){
  const raw = (item && (item.releaseDate || item.pubDate)) || "";
  if (!raw) return "";
  const ts = Date.parse(raw);
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString(
      (T[lang] && T[lang].htmlLang) || lang,
      { year: "numeric", month: "short", day: "numeric" }
    );
  } catch(e){ return ""; }
}

async function fetchTopSongs(lang, limit = 25){
  const store = TOP_SONGS_STORE[lang] || "us";
  const count = Math.max(10, Math.min(100, limit));
  const key = store + ":" + count;
  const hit = _topSongsCache[key];
  if (hit && (Date.now() - hit.time) < 30 * 60 * 1000) return hit.items;

  let data = null;
  try {
    const resp = await fetchWithTimeout(
      "https://itunes.apple.com/" + store + "/rss/topsongs/limit=" + count + "/json",
      {}, 6000
    );
    if (!resp || !resp.ok) return [];
    data = await resp.json();
  } catch(e){ return []; }

  const entries = _asArray(data && data.feed && data.feed.entry);
  const items = [];
  for (const e of entries){
    if (!e) continue;
    const name   = (e["im:name"] && e["im:name"].label) || "";
    const artist = (e["im:artist"] && e["im:artist"].label) || "";
    const covers = _asArray(e["im:image"]);
    const cover  = upgradeCoverSize(covers.length ? (covers[covers.length - 1].label || "") : "");
    let songUrl = "", preview = "";
    for (const l of _asArray(e.link)){
      const a = (l && l.attributes) || {};
      const href = safeUrl(a.href || "");
      if (!href) continue;
      if (/audio/i.test(a.type || "") || /preview/i.test(a["im:assetType"] || "")) { if (!preview) preview = href; }
      else if (!songUrl) songUrl = href;
    }
    const album = (e["im:collection"] && e["im:collection"]["im:name"] && e["im:collection"]["im:name"].label) || "";
    const genre = (e.category && e.category.attributes && e.category.attributes.label) || "";
    // لا بطاقة بلا غلاف أغنية حقيقي ولا بلا رابط أغنية.
    if (!name || !cover || !songUrl) continue;
    // FIX: استبعاد التلاوات القرآنية والأدعية من قائمة الأغاني.
    if (_isQuranLike(name, artist, genre, album)) continue;
    // FIX (ملاحزة المستخدم): روابط لا يكشفها العنوان ولا التصنيف، فيُفحص
    // الرابط نفسه (مسار فيه quran / telawa / adhan ...) قبل قبول البطاقة.
    let _decodedSongUrl = songUrl;
    try { _decodedSongUrl = decodeURIComponent(songUrl); } catch(e){}
    if (QURAN_URL_RE.test(_decodedSongUrl)) continue;
    // FIX: تاريخ الصدور من التغذية ليظهر أسفل بطاقة الأغنية.
    const released = (e["im:releaseDate"] && (e["im:releaseDate"].label ||
      (e["im:releaseDate"].attributes && e["im:releaseDate"].attributes.label))) || "";
    items.push({
      title: name,
      artist: artist,
      image: cover,
      link: songUrl,
      preview: preview,
      releaseDate: released,
      genre: genre,
      album: album,
      description: [album && album !== name ? album : "", genre].filter(Boolean).join(" · "),
      isSong: true,
      _isTopSong: true,
      _sourceCat: "music"
    });
  }
  if (items.length) _topSongsCache[key] = { time: Date.now(), items: items };
  return items;
}

// ═══════════════════════════════════════════════════════════════════════════
// SONG CARD RENDERER (for music category — shows cover images + song links)
// ═══════════════════════════════════════════════════════════════════════════
// FIX (قسم الموسيقى كان يعرض أخباراً لا أغاني):
// looksLikeSong يميز بطاقة الأغنية/الألبوم من الخبر العام،
// و splitArtistTitle يفصل «الفنان – الأغنية» ليظهر اسم الفنان داخل البطاقة.
// FIX٥ (تسرّب الأخبار): حُذفت قاعدة «الشرطة وحدها» لأن عناوين الأخبار
// عموماً تحتوي شرطة («فلان – تصريح ...»)، فكانت تمرّر أخباراً كأغانٍ.
// صار لا بد من كلمة دالة على أغنية/ألبوم صريحة.
const SONG_HINTS = [
  /(^|\s)(feat\.?|ft\.?|remix|official\s+(video|audio)|lyric|lyrics|single|album|EP|mixtape|tracklist|song|acoustic|أغنية|أغاني|كلمات|ألبوم|البوم|ديو|منفرد|نسخة)(\s|$)/i
];
const NEWS_HINTS = [
  /(وفاة|توفي|رحيل|تصريح|محكمة|قضية|دعوى|اعتقال|حادث|تحقيق|انتخاب|رئيس|وزير|حرب|احتجاج|مقابلة|تقرير|جدل|أزمة)/,
  /\b(dies|died|dead|death|lawsuit|court|arrested|police|charged|trial|interview|apologi[sz]|controversy|slams|responds|denies|accus|election|war|festival\s+cancel)\b/i
];
function looksLikeSong(item){
  if (!item || !item.title) return false;
  // FIX٥: وسم isSong وحده لم يبقَ كافياً — لا بد من رابط أغنية حقيقي أيضاً،
  // ورابط "#" لم يعد مقبولاً إطلاقاً (كان يمرّر عناصر بلا هدف).
  if (item.isSong === true && safeUrl(item.link)) return true;
  const t = stripHtml(String(item.title));
  if (NEWS_HINTS.some(re => re.test(t))) return false;
  return SONG_HINTS.some(re => re.test(t));
}
function splitArtistTitle(item){
  const raw = stripHtml(String((item && item.title) || "")).trim();
  if (item && item.artist) return {artist: String(item.artist), title: raw};
  const m = raw.match(/^(.{2,40}?)\s[-\u2013\u2014|]\s(.{2,})$/);
  if (m) return {artist: m[1].trim(), title: m[2].trim()};
  return {artist: "", title: raw};
}

function renderSongCard(item, lang, accent) {
  const parts = splitArtistTitle(item);
  const title = escapeHtml(parts.title);
  const desc = escapeHtml(stripHtml(item.description || "").slice(0, 160));
  const artist = escapeHtml(item.artist || parts.artist || "");
  // FIX (music images): use a real cover when the item has one, otherwise fetch
  // the platform logo (Spotify / Anghami / SoundCloud ...) instead of a broken path.
  const songUrl = safeUrl(item.link) || "";
  // FIX (صور قسم الموسيقى): كانت البطاقة تقرأ item.image/thumbnail فقط، فتفوّت
  // صور التغذيات الحقيقية (media:content, enclosure, صورة داخل الوصف) فتظهر
  // البطاقة بدائرة فارغة. الآن نستخرج الصورة بنفس منطق بطاقات الأخبار.
  let imgUrl = hasRealImage(item) ? pickImage(item) : "";
  // لا صورة افتراضية أبداً: البديل الوحيد هو أيقونة الموقع الناشر.
  let isLogo = false;
  if (!imgUrl) {
    const logo = sourceIconFor(item) || sourceIconFor({link: songUrl});
    if (logo) { imgUrl = logo; isLogo = true; }
  }
  const safeImg = escapeHtml(imgUrl);
  const logoAlt = escapeHtml(publisherIconAlt(item.link || songUrl || item._sourceUrl || ""));
  const linkAttrs = songUrl ? `href="${escapeHtml(songUrl)}" target="_blank" rel="noopener noreferrer"` : "";
  const tag = songUrl ? "a" : "div";
  const d = T[lang];
  const listenLabel = d.songListenNow || "Listen Now";
  // FIX: أسفل بطاقة الأغنية يظهر المصدر (المنصة) وتاريخ الصدور.
  const srcName = escapeHtml(songSourceName(songUrl || item._sourceUrl || ""));
  const relDate = escapeHtml(songReleaseDate(item, lang));
  const srcLabel = escapeHtml(d.sourceLabel || "Source");
  const dateLabel = escapeHtml(d.songReleaseLabel || d.dateLabel || "Date");
  const footHtml = (srcName || relDate)
    ? `<div class="song-foot">
        ${srcName ? `<span class="song-src"><span class="meta-label">${srcLabel}:</span> ${srcName}</span>` : ""}
        ${relDate ? `<span class="song-date"><span class="meta-label">${dateLabel}:</span> ${relDate}</span>` : ""}
      </div>`
    : "";

  // بطاقة بلا صورة ولا أيقونة ناشر: تُعرض نصّاً بلا مربع صورة (لا صورة افتراضية).
  const coverHtml = imgUrl
    ? `<div class="song-cover${isLogo ? " song-cover-logo" : ""}">
      <img src="${safeImg}" alt="${title}" loading="lazy"${isLogo ? ` class="source-logo" data-logo-alt="${logoAlt}"` : ""}>
    </div>`
    : "";

  return `<${tag} class="song-card" draggable="true" data-song-url="${escapeHtml(songUrl)}" ${linkAttrs}>
    ${coverHtml}
    <div class="song-body">
      <div class="song-title" title="${title}">${title}</div>
      ${artist ? `<div class="song-artist">${artist}</div>` : ""}
      ${desc ? `<div class="song-meta">${desc}</div>` : ""}
      ${footHtml}
    </div>
  </${tag}>`;
}

async function renderSongCards(container, catId, lang, accent, limit, fallbackList) {
  if (!container) return;
  // FIX (عزل قسم الموسيقى): رقم طلب خاص يمنع أي رسم متأخر من قسم
  // أخبار أخر من الكتابة فوق بطاقات الأغاني أو مسحها.
  const token = beginRender(container, catId, lang);
  container._cardRenderer = null;
  container._allItems = [];
  // أزل أي مُرقّم صفحات تركه قسم أخبار سابق.
  let sib0 = container.nextSibling;
  while (sib0) {
    const nx = sib0.nextSibling;
    if (sib0.nodeType === 1 && sib0.classList.contains("news-pager")) sib0.remove();
    sib0 = nx;
  }
  const d = T[lang];
  const text = LIVE_NEWS_TEXT[lang] || LIVE_NEWS_TEXT.en;

  // FIX٥ («استمع لأحدث الأغاني» = أغانٍ فقط):
  // لم يعد القسم يقرأ تغذيات الأخبار ولا الذاكرة المخزّنة ولا الروابط
  // الثابتة (صفحات منصّات/قوائم ليست أغانٍ). المصدر الوحيد هو قائمة
  // الأغاني الأكثر رواجاً في متجر الموسيقى، فكل بطاقة تحمل غلاف الأغنية
  // ورابطاً يفتح الأغنية نفسها.
  const isRealSong = it => !!it && !!it.title && it.isSong === true &&
    !!safeUrl(it.link) && !!safeUrl(it.image);

  container.innerHTML = `<div class="news-sub">${escapeHtml(text.songsLoading || text.loading)}</div>`;
  let songs = [];
  try { songs = await fetchTopSongs(lang, Math.max(limit, 25)); } catch(e) { songs = []; }
  // محاولة احتياطية واحدة من المتجر العالمي لو تعطّل متجر اللغة.
  if (!songs.length && (TOP_SONGS_STORE[lang] || "us") !== "us") {
    try { songs = await fetchTopSongs("en", Math.max(limit, 25)); } catch(e) { songs = []; }
  }
  if (!renderStillValid(container, token)) return;

  const seen = new Set();
  const unique = [];
  // FIX (منع كلمة أو رابط): الأغاني تمرّ بنفس مرشّح الكلمات الممنوعة،
  // فيمكن منع اسم مطرب أو تلاوة أو رابط معيّن دون منع المنصّة كلّها.
  for (const item of dropBlockedItems(songs.filter(isRealSong))) {
    const key = safeUrl(item.link);
    if (!seen.has(key)) { seen.add(key); unique.push(item); }
  }
  const displayItems = unique.slice(0, limit);

  if (displayItems.length) {
    container.innerHTML = displayItems.map(item => renderSongCard(item, lang, accent)).join("");
  } else {
    container.innerHTML = `<div class="news-sub">${escapeHtml(text.songsError || text.noImage)}</div>`;
  }

  // FIX (صور الموسيقى): أي صورة تفشل تُستبدل بأيقونة الناشر (favicon الموقع
  // ثم مزوّد أيقونات النطاق)، وإن فشل الاثنان يُحذف مربع الصورة تماماً
  // (لا صورة افتراضية ولا أيقونة قسم).
  setTimeout(() => {
    if (!renderStillValid(container, token)) return;
    container.querySelectorAll(".song-cover img").forEach(img => {
      img.onerror = function () {
        const card = this.closest(".song-card");
        const url = card ? (card.getAttribute("data-song-url") || "") : "";
        const box = this.closest(".song-cover");
        const isLogoNow = this.classList.contains("source-logo");
        const alt = this.getAttribute("data-logo-alt") || publisherIconAlt(url);
        if (!isLogoNow) {
          // المحاولة الأولى: أيقونة الموقع الناشر.
          const logo = sourceIconFor({link: url});
          if (logo) {
            this.classList.add("source-logo");
            if (alt) this.setAttribute("data-logo-alt", alt);
            if (box) box.classList.add("song-cover-logo");
            this.src = logo;
            return;
          }
        }
        if (alt && this.src !== alt) {
          // المحاولة الثانية: مزوّد أيقونات النطاق للموقع نفسه.
          this.removeAttribute("data-logo-alt");
          this.classList.add("source-logo");
          if (box) box.classList.add("song-cover-logo");
          this.src = alt;
          return;
        }
        this.onerror = null;
        if (box) box.remove();
      };
      // أعد تشغيل التحقق للصور التي فشلت قبل ربط المُعالج.
      if (img.complete && img.naturalWidth === 0) img.onerror();
    });
  }, 100);
}

// ---- Homepage-only rendering -------------------------------------------
function renderHome(lang){
  window.currentCat = null;  // homepage — no specific category
  const d = T[lang];
  const heroBadge = document.getElementById("heroBadge");
  if (!heroBadge) return;

  heroBadge.parentElement.style.display = "none";
  document.getElementById("heroTitle").textContent = SITE.name;
  document.getElementById("heroDesc").textContent = d.heroDesc;
  // (hero call-to-action button removed)

  // Homepage = section icons only. The news list was removed from the
  // homepage on purpose: every item already lives in its own section
  // (World News, Sport, ...). This keeps room for the icons + footer.
  const catEl = document.getElementById("categories");
  if (catEl) {
    catEl.innerHTML = CAT_ORDER.map(id => {
      const c = d.cats[id];
      const meta = CAT_META[id];
      if (!c || !meta) return "";
      const extraIconCls = id === "horoscope" ? " horoscope-icon" : "";
      return `<a class="cat-card ${meta.style}" href="${catLink(id, lang)}">
  <div class="cat-icon">
    <img class="icon-image${extraIconCls}" src="${iconSrc(meta.icon)}" alt="">
  </div>
  <div class="cat-title">${escapeHtml(c.title)}</div>
  <div class="cat-desc">${escapeHtml(c.desc)}</div>
</a>`;
    }).join("");
  }

  // Goals ticker on homepage
  renderNewsTicker(lang);
}

// ---- Category-page-only rendering --------------------------------------
function renderCategoryPage(lang){
  const titleEl = document.getElementById("catTitle");
  if (!titleEl) return;

  const catId = getParam("cat", "world");
  window.currentCat = catId;  // make available to news ticker
  const d = T[lang];
  const c = d.cats[catId] || d.cats.world;
  const meta = CAT_META[catId] || CAT_META.world;


  // FIX5 (مكان أيقونة القسم): الأيقونة الحقيقية للقسم توضع بجانب اسم القسم
  // مباشرة (لا في الشريط العلوي، ولا كقناع صغير باهت).
  const catIconEl = document.getElementById("catIconImg");
  if (catIconEl) {
    const iconHtml = `<img class="cat-head-icon-img" id="catIconImg" src="${iconSrc(meta.icon)}" alt="">`;
    if (catIconEl.tagName === "IMG") {
      catIconEl.className = "cat-head-icon-img";
      catIconEl.src = iconSrc(meta.icon);
      catIconEl.alt = "";
    } else {
      catIconEl.outerHTML = iconHtml;
    }
  }

  // FIX5 (مكان أيقونة القسم): أيقونة الشريط العلوي أُزيلت — إن وُجدت في نسخة
  // قديمة من الصفحة تبقى مخفية حتى لا تظهر مرتين.
  const topbarCatIcon = document.getElementById("topbarCatIcon");
  if (topbarCatIcon) topbarCatIcon.style.display = "none";

  let title = c.title;
  document.getElementById("catTitle").textContent = title;
  document.getElementById("catDesc").textContent =
    (catId === "world") ? "" : c.desc;

  const iconBadge = document.getElementById("catIconBadge");
  const accent = accentVar(meta.style);
  iconBadge.style.background = `color-mix(in srgb, var(--${accent}) 18%, transparent)`;
  iconBadge.style.color = `var(--${accent})`;
  document.getElementById("catTitle").style.color = `var(--${accent})`;

  // Region sub-nav removed (Middle East category deleted per user request)

  // Sport sub-page toggle buttons
  const sportSubNav = document.getElementById("sportSubNav");
  if (catId === "sport") {
    sportSubNav.style.display = "";
    const sportSubNewsBtn    = document.getElementById("sportSubNewsBtn");
    const sportSubMatchesBtn = document.getElementById("sportSubMatchesBtn");
    const sportSubNewsLabel    = document.getElementById("sportSubNewsLabel");
    const sportSubMatchesLabel = document.getElementById("sportSubMatchesLabel");
    // FIX (دمج): قسم الرياضة صار تبويبين فقط — أخبار الرياضة (كرة القدم
    // والرياضة العالمية معاً) ومباريات اليوم.
    if (sportSubNewsLabel)    sportSubNewsLabel.textContent    = d.sportSubNews    || "أخبار الرياضة";
    if (sportSubMatchesLabel) sportSubMatchesLabel.textContent = d.sportSubMatches || "مباريات اليوم";
    // Restore active state from window.currentSportSub
    window.currentSportSub = (window.currentSportSub === "matches") ? "matches" : "news";
    sportSubNewsBtn.classList.toggle("active", window.currentSportSub === "news");
    sportSubMatchesBtn.classList.toggle("active", window.currentSportSub === "matches");
  } else {
    if (sportSubNav) sportSubNav.style.display = "none";
    window.currentSportSub = "news";
  }

  const grid = document.getElementById("catNewsGrid");
  // FIX (الخلط/الاختفاء): تُفرَّغ الشبكة ويُحذف المُرقّم قبل رسم أي قسم جديد.
  resetNewsGrid(grid);
  _pageState[catId] = 0;
  const list = (d.catNews[catId] || []);
  // FIX (الأبراج): أخبار قسم الأبراج تأخذ تنسيقاً أصغر بعرض ٰ٧٠٪ تحت الخط الذهبي.
  grid.classList.toggle("horoscope-news", catId === "horoscope");
  // When sport sub is "matches", hide the news grid
  if (catId === "sport" && window.currentSportSub === "matches") {
    grid.style.display = "none";
  } else if (catId === "music") {
    // Music category: render song cards with cover images instead of news cards
    grid.style.display = "";
    renderSongCards(grid, catId, lang, accent, 21, list);
  } else {
    grid.style.display = "";
    renderLiveNews(grid, catId, lang, accent, 21, list);
  }

  // Zodiac grid for horoscope section
  // FIX: the grid section used to stay hidden (nothing ever unset display:none);
  // now it is shown only on the horoscope category and cleared elsewhere.
  const zGrid = document.getElementById("zodiacGrid");
  if (zGrid) {
    if (catId === "horoscope") {
      zGrid.style.display = "";
      renderZodiacGrid(lang);
    } else {
      zGrid.style.display = "none";
      const zi = document.getElementById("zodiacGridInner");
      if (zi) zi.innerHTML = "";
      const zr = document.getElementById("zodiacReading");
      if (zr) { zr.innerHTML = ""; zr.style.display = "none"; }
      _zodiacActiveSign = -1;
    }
  }

  // Live scores section for sport category
  if (catId === "sport") {
    const lss = document.getElementById("liveScoresSection");
    if (window.currentSportSub === "matches") {
      lss.style.display = "";
      renderLiveScoresSection(lang);
    } else {
      lss.style.display = "none";
    }
  } else {
    const lss = document.getElementById("liveScoresSection");
    if (lss) { lss.innerHTML = ""; lss.style.display = "none"; }
  }

  // Show/hide music favorites section on category page
  const mfSection = document.getElementById("musicFavsSection");
  if (mfSection) mfSection.style.display = (catId === "music") ? "" : "none";

  if (catId === "music") {
    const mfTitle = document.getElementById("musicFavsTitle");
    if (mfTitle) mfTitle.textContent = d.musicTitle || "Favorite Music";
    renderMusicFavs(lang);
    initMusicContextMenu(lang);
    // FIX6: عند فتح قسم الموسيقى تكمل الأغنية الجارية داخل بطاقتها من موضعها.
    resumeMusicFavFromState(lang);
  }

  // Goals ticker on category page
  renderNewsTicker(lang);
}

// ─────────────────────────────────────────────────────────────────────────
// SPORT SUB-PAGE TOGGLE
// ─────────────────────────────────────────────────────────────────────────
function switchSportSub(sub){
  const lang = currentLang;
  window.currentSportSub = sub;
  const sportSubNewsBtn    = document.getElementById("sportSubNewsBtn");
  const sportSubMatchesBtn = document.getElementById("sportSubMatchesBtn");
  if (sportSubNewsBtn) sportSubNewsBtn.classList.toggle("active", sub === "news");
  if (sportSubMatchesBtn) sportSubMatchesBtn.classList.toggle("active", sub === "matches");

  const grid = document.getElementById("catNewsGrid");
  const lss  = document.getElementById("liveScoresSection");
  // FIX: تفريغ الشبكة عند تبديل تبويب الرياضة حتى لا تبقى بطاقات التبويب السابق.
  resetNewsGrid(grid);

  if (sub !== "matches") {
    // FIX (دمج): تبويب واحد للأخبار يجمع كرة القدم والرياضة العالمية.
    if (grid) {
      grid.style.display = "";
        const d2 = T[lang];
      const accent2 = accentVar((CAT_META.sport || CAT_META.world).style);
      renderLiveNews(grid, "sport", lang, accent2, 21, (d2.catNews.sport || []));
      const descEl = document.getElementById("catDesc");
      if (descEl) descEl.textContent = (d2.cats.sport && d2.cats.sport.desc) || "";
    }
    if (lss)  lss.style.display = "none";
  } else {
    if (grid) grid.style.display = "none";
    if (lss)  {
      lss.style.display = "";
      // Reset selected date to today on each switch
      _selectedDate = new Date();
      renderLiveScoresSection(lang);
    }
  }

  renderNewsTicker(lang);
}

// regionKey removed — Middle East / regional sub-nav deleted
function accentVar(style){
  const known = ["sport-green","econ-orange","world-blue","travel-purple","music-red","health-cyan","cars-brown","tech-purple","horoscope-gold","news-brown"];
  return known.includes(style) ? style : "world-blue";
}

// ---- Boot ---------------------------------------------------------------
function renderAll(lang){
  renderChrome(lang);
  renderHome(lang);
  renderCategoryPage(lang);
  // FIX6: مشغّل مصغّر في الزاوية يكمل الأغنية المفضلة في بقية الأقسام.
  // FIX (إخفاء خبر برقم سري): قائمة الأخبار تعمل في كل الصفحات والأقسام
  // لا في قسم الموسيقى وحده، لذا يُربط التفويض مع كل رسم.
  try { initNewsContextMenu(lang); } catch(e) {}
  try { initMusicContextMenu(lang); } catch(e) {}
  try { initLongPressContextMenus(); } catch(e) {}
  try { initMusicMiniPlayer(lang); } catch(e) {}
}
bindLangSwitch(renderAll);

// Expose music‑menu functions globally so inline HTML handlers (oncontextmenu)
// can always reach them, regardless of script load order or scope quirks.
window.showMusicContextMenu = showMusicContextMenu;
window.closeMusicContextMenu = closeMusicContextMenu;
window.showMusicPasswordModal = showMusicPasswordModal;
// FIX (in-card playback): no floating bar any more — songs play inside cards.
window.closeMusicPlayer = closeMusicPlayer;

renderAll(currentLang);
