/* =====================================================================
   data.js — ShirwaniWorldPulse  (v2 — fully repaired)
   ===================================================================== */

// ─────────────────────────────────────────────────────────────────────────
// Site identity
// ─────────────────────────────────────────────────────────────────────────
const SITE = {
  name: "ShirwaniWorldPulse",
  defaultLang: "ar",
  logoWidth: 120,
  logoHeight: 36,
  // FIX (أزرار التواصل الاجتماعي بدل زر التحديث): عدّل الروابط أدناه
  // إلى حسابات الموقع الحقيقية. الزر الذي رابطه فارغ لا يظهر إطلاقاً.
  social: {
    // روابط حسابات المالك؛ أي رابط يُترك فارغاً يُخفي زرّه تماماً.
    instagram: "https://www.instagram.com/adel_shirwani/",
    tiktok:    "https://www.tiktok.com/@adelshirwani4",
    x:         "https://x.com/ShirwaniAdel"
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Category metadata (icon, color style)
// Bazaar, Middle East, Kids/Toys REMOVED per user request
// ─────────────────────────────────────────────────────────────────────────
const CAT_META = {
  world:      { icon: "world",      style: "world-blue"    },
  sport:      { icon: "sport",      style: "sport-green"   },
  economy:    { icon: "econ",       style: "econ-orange"   },
  tech:       { icon: "technology", style: "tech-purple"   },
  health:     { icon: "health",     style: "health-cyan"   },
  tourism:    { icon: "travel",     style: "travel-purple" },
  music:      { icon: "music",      style: "music-red"     },
  cars:       { icon: "cars",       style: "cars-brown"    },
  horoscope:  { icon: "horoscope",  style: "horoscope-gold" }
};

// ─────────────────────────────────────────────────────────────────────────
// Display order on the homepage grid
// ─────────────────────────────────────────────────────────────────────────
const CAT_ORDER = [
  "world","sport","economy",
  "tech","health","tourism",
  "music","cars","horoscope"
];

// ─────────────────────────────────────────────────────────────────────────
// Navigation structure (used by renderChrome to build nav dynamically)
// ─────────────────────────────────────────────────────────────────────────
const NAV_STRUCTURE = [
  { type: "link",  id: "home"    },
  { type: "link",  id: "world"   },
  { type: "link",  id: "sport"   },
  { type: "link",  id: "economy" },
  { type: "link",  id: "tech"    },
  { type: "link",  id: "health"  },
  { type: "link",  id: "tourism" },
  { type: "link",  id: "music"   },
  { type: "link",  id: "cars"    },
  { type: "link",  id: "horoscope" }
];

// ─────────────────────────────────────────────────────────────────────────
// Source display names (domain → human-readable name)
// ─────────────────────────────────────────────────────────────────────────
const SOURCE_NAMES = {
  // Arabic sources
  "alarabiya.net": "العربية",
  "aljazeera.net": "الجزيرة",
  "bbc.com": "BBC Arabic",
  "bbc.co.uk": "BBC",
  "france24.com": "فرانس 24",
  "skynewsarabia.com": "سكاى نيوز عربية",
  "alhadath.net": "الحادث",
  "alaraby.co.uk": "العربي",
  "dw.com": "DW Arabic",
  "alsharqalawsat.com": "الشرق الأوسط",
  "alarab.com": "العرب",
  // Arabic sports
  "kooora.com": "كوورة",
  "yallakora.com": "يلاكورة",
  // FIX: names for the replacement sources added after the dead-link cleanup
  "sport360.com": "سبورت 360",
  "cbssports.com": "CBS Sports",
  "cnbcarabia.com": "CNBC عربية",
  "winwin.com": "وينوين",
  "filgoal.com": "فيلجول",
  // Arabic economy
  "mubasher.info": "مباشر",
  "albawaba.com": "البوابة",
  "alqabas.com": "القبس",
  // Arabic tech
  "aitnews.com": "أي تي نيوز",
  "unlimit-tech.com": "أنليميتد تك",
  "technologyreview.com": "MIT Technology Review Arabic",
  // Arabic health
  "cnn.com": "CNN Arabic",
  "france24.com": "فرانس 24",
  "webteb.com": "ويب طب",
  "aljazeera.net": "الجزيرة",
  // Arabic cars
  "assayyarat.com": "السيارات",
  // Arabic tourism
  "saudia.com": "السعودية",
  "emirates.com": "الإمارات",
  // Arabic music
  "mawaly.com": "موالى",
  "maqam.me": "مقام",
  // Arabic horoscope
  "xabraj.com": "إبراج",
  "abrajnow.com": "أبراج ناو",
  // English sources
  "reuters.com": "Reuters",
  "apnews.com": "AP News",
  "alarabiyaenglish.com": "Al Arabiya English",
  "aljazeera.com": "Al Jazeera English",
  "theguardian.com": "The Guardian",
  // English sports
  "espn.com": "ESPN",
  "beinsports.com": "beIN SPORTS",
  "bbc.com": "BBC Sport",
  "skysports.com": "Sky Sports",
  "goal.com": "Goal.com",
  // English economy
  "investing.com": "Investing.com",
  "cnbc.com": "CNBC",
  "ft.com": "Financial Times",
  // English tech
  "bbc.co.uk": "BBC Tech",
  "arstechnica.com": "Ars Technica",
  "techcrunch.com": "TechCrunch",
  "wired.com": "Wired",
  // English health
  "healthline.com": "Healthline",
  "webmd.com": "WebMD",
  "medicalnewstoday.com": "Medical News Today",
  "who.int": "WHO",
  // English cars
  "caranddriver.com": "Car and Driver",
  "motortrend.com": "Motor Trend",
  "autoblog.com": "Autoblog", 
  // English tourism
  "lonelyplanet.com": "Lonely Planet",
  // English music
  "rollingstone.com": "Rolling Stone",
  "billboard.com": "Billboard",
  "nme.com": "NME",
  // English horoscope
  "astrologyzone.com": "Astrology Zone",
  "astrosage.com": "AstroSage",
  // Swedish sources
  "svd.se": "Svenska Dagbladet",
  "dn.se": "Dagens Nyheter",
  "svt.se": "SVT Nyheter",
  "svtplay.se": "SVT Play",
  "aftonbladet.se": "Aftonbladet",
  "expressen.se": "Expressen",
  "sr.se": "Sveriges Radio",
  // Swedish sports
  "svenskafans.com": "SvenskaFans",
  "svt.se": "SVT Sport",
  "aftonbladet.se": "Aftonbladet Sport",
  "fotbollskanalen.se": "Fotbollskanalen",
  "hockeynews.se": "HockeyNews",
  // Swedish economy
  "di.se": "Dagens Industri",
  "se.investing.com": "Investing.com Sverige",
  // Swedish tech
  "computersweden.se": "Computer Sweden",
  "nyteknik.se": "Ny Teknik",
  "idg.se": "IDG",
  // Swedish health
  "doktorn.com": "Doktorn",
  "dn.se": "DN Hälsa",
  "svt.se": "SVT Hälsa",
  "1177.se": "1177 Vårdguiden",
  // Swedish cars
  "auto motor sport se": "Auto Motor & Sport",
  "automotorochsport.se": "Auto Motor & Sport",
  // Swedish tourism
  "vikingline.se": "Viking Line",
  "aawsat.com": "الشرق الأوسط",
  // Iraq Stars League
  "iraqstarsleague.com": "Iraq Stars League",
  // FIX: labels for the newly added sources
  "omni.se": "Omni",
  "tv4.se": "TV4 Nyheter",
  "sydsvenskan.se": "Sydsvenskan",
  "alkompis.se": "Alkompis",
  "aktarr.se": "Aktarr",
  "centersweden.se": "Center Sweden",
  "informationsverige.se": "Information Sverige",
  "omnihotels.com": "Omni Hotels",
  "carscoops.com": "Carscoops",
  "jalopnik.com": "Jalopnik",
  "insideevs.com": "InsideEVs",
  "autoevolution.com": "autoevolution",
  "motor1.com": "Motor1",
  "teknikensvarld.se": "Teknikens Värld",
  "vibilagare.se": "Vi Bilägare",
  "arabsauto.com": "عرب أوتو",
  "motory.com": "موطوري",
  "drivearabia.com": "Drive Arabia",
  "anghami.com": "أنغامي"
};
// ──────────────────────────────────────────────────────────────────────
// RSS Feed URLs — SINGLE SOURCE OF TRUTH
// FIX: كل رابط أدناه تمّ التحقق منه فعلياً (HTTP 200 + عناصر حديثة).
//   - لا يوجد أي مصدر خارج قائمة المصادر المُتحقّقة.
//   - لا أي خدمة من Google (لا news.google ولا خوادم أيقونات).
//   - قسم الرياضة موحّد: كرة القدم + الرياضة العالمية معاً.
//   - الأبراج والطقس بلا RSS: لهما مصادر بيانات خاصة داخل الموقع.
// ──────────────────────────────────────────────────────────────────────
const RSS_FEEDS = {

  ar: {
    world: [
      "https://www.independentarabia.com/rss.xml",
      "https://www.aljazeera.net/aljazeerarss",
      "https://feeds.bbci.co.uk/arabic/rss.xml",
      "https://www.france24.com/ar/rss",
      "https://rss.dw.com/rdf/rss-ar-all",
      "https://rss.dw.com/atom/rss-ar-all",
      "https://www.aa.com.tr/ar/rss/default?cat=guncel",
      "https://arabic.cnn.com/api/v1/rss/rss.xml",
      "https://www.almowaten.net/feed/",
      "https://www.tsa-algerie.com/feed/",
      "https://www.noonpost.com/feed/",
      "https://arabic.euronews.com/rss?level=theme&name=news",
      "https://arabic.euronews.com/rss"
    ],
    // FIX (تسرّب أخبار عالمية للرياضة): تغذية اليوم السابع رقم 88 ليست
    // رياضة بل قسم «أخبار عربية»، وهي من كانت تضخّ الأخبار العامة
    // داخل قسم الرياضة، فحُذفت وبقيت التغذيات الرياضية الخالصة.
    sport: [
      "https://www.france24.com/ar/%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9/rss",
      "https://www.youm7.com/rss/SectionRss?SectionID=298",
      "https://www.youm7.com/rss/SectionRss?SectionID=332",
      "https://arabic.sport360.com/feed",
      "https://www.filgoal.com/rss",
      "https://www.kooora.com/?rss=1"
    ],
    // FIX (تسرّب أخبار عالمية للاقتصاد): تغذية BBC العربية للأعمال
    // توقفت وأصبحت تُعيد العناوين الرئيسية العامة باسم «BBC Arabic»، فحُذفت.
    economy: [
      "https://arabic.euronews.com/rss?level=theme&name=business",
      "https://arabic.euronews.com/rss?level=vertical&name=business",
      "https://sa.investing.com/rss/news.rss",
      "https://sa.investing.com/rss/market_overview.rss",
      "https://www.alborsaanews.com/feed",
      "https://www.youm7.com/rss/SectionRss?SectionID=297",
      "https://www.france24.com/ar/%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF/rss"
    ],
    // FIX (التكنولوجيا كانت تعرض أخبار العالم): حُذفت تغذيتا BBC العربية
    // العامة (كانتا تعيدان العناوين الرئيسية لا أخبار التقنية)، وأُضيفت
    // مواقع تقنية خالصة فقط.
    tech: [
      "https://www.aitnews.com/feed",
      "https://www.unlimit-tech.com/feed",
      "https://www.tech-wd.com/wd/feed/",
      "https://www.arabhardware.net/feed",
      // FIX (التقنية العربية كانت تعرض سياسة/أخبار عالم): حُذفت تغذية
      // youm7/319 لأنها تُرجع عناوين سياسية عامة، وتغذية aletihad
      // لأنها صارت 404؛ المتبقّي مواقع تقنية عربية خالصة.
      "https://arabic.euronews.com/rss?level=vertical&name=next"
    ],
    health: [
      "https://arabic.euronews.com/rss?level=vertical&name=health",
      "https://www.youm7.com/rss/SectionRss?SectionID=245",
      "https://www.dailymedicalinfo.com/feed/",
      "https://www.thaqafnafsak.com/feed"
    ],
    cars: [
      "https://www.arabgt.com/feed/",
      "https://www.assayyarat.com/feed/",
      "https://alamalsayarat.com/feed/",
      "https://me.motor1.com/rss/news/all/",
      "https://www.dubicars.com/news/ar/feed"
    ],
    tourism: [
      "https://arabic.cnn.com/api/v1/rss/travel/rss.xml",
      // FIX (السياحة العربية كانت تعرض أخباراً عالمية): حُذفت تغذية
      // my-europe لأنها تغذية شؤون أوروبية سياسية لا سياحية.
      "https://arabic.euronews.com/rss?level=vertical&name=travel",
      // FIX (السياحة العربية): تغذية سفر عربية إضافية مُختبَرة، كل عنصر
      // فيها سياحي خالص ويرفق صورة حقيقية، لتعويض العناصر المحذوفة.
      "https://aawsat.com/feed/travel"
    ],
    // FIX (بطاقات الموسيقى العربية كانت تظهر بلا صور): تغذيات
    // arabsounds/albumaty توقّفت عن العمل (لا استجابة/لا صور)، فاستُبدلت
    // بمصادر عربية عاملة تُرفق صورة الفنان مع كل عنصر (media/enclosure)،
    // وتُمرّر عبر مرشّح الأغاني نفسه فلا تُعرض بطاقة بلا صورة حقيقية.
    music: [
      "https://arabic.cnn.com/api/v1/rss/entertainment/rss.xml",
      "https://www.france24.com/ar/%D8%AB%D9%82%D8%A7%D9%81%D8%A9/rss",
      "https://arabic.cnn.com/api/v1/rss/style/rss.xml"
    ],
    horoscope: []
  },

  en: {
    world: [
      "https://feeds.bbci.co.uk/news/world/rss.xml",
      "https://www.theguardian.com/world/rss",
      "https://www.aljazeera.com/xml/rss/all.xml",
      "https://feeds.skynews.com/feeds/rss/world.xml",
      "https://www.france24.com/en/rss",
      "https://www.cbsnews.com/latest/rss/world",
      "https://abcnews.go.com/abcnews/internationalheadlines"
    ],
    sport: [
      "https://feeds.bbci.co.uk/sport/rss.xml",
      "https://feeds.bbci.co.uk/sport/football/rss.xml",
      "https://www.theguardian.com/football/rss",
      "https://www.theguardian.com/sport/rss",
      "https://www.skysports.com/rss/12040",
      "https://www.skysports.com/rss/11095",
      "http://rss.cnn.com/rss/edition_sport.rss",
      "https://sport360.com/feed"
    ],
    economy: [
      "https://feeds.bbci.co.uk/news/business/rss.xml",
      "https://www.theguardian.com/business/rss",
      "https://www.cnbc.com/id/100003114/device/rss/rss.html",
      "https://www.cnbc.com/id/19854910/device/rss/rss.html",
      "https://www.cnbc.com/id/20910258/device/rss/rss.html",
      "https://feeds.nbcnews.com/nbcnews/public/business",
      "http://rss.cnn.com/rss/money_news_international.rss",
      // FIX (طلب المستخدم): إضافة Investing.com إلى الاقتصاد الإنكليزي.
      // ملاحظة: sa.investing.com عربية اللغة وهي مضافة في القسم العربي،
      // وهنا تُستخدم تغذيات Investing.com الإنكليزية ليتوافق المحتوى مع القسم.
      "https://www.investing.com/rss/news.rss",
      "https://www.investing.com/rss/market_overview.rss"
    ],
    tech: [
      "https://techcrunch.com/feed/",
      "https://arstechnica.com/feed/",
      "https://feeds.arstechnica.com/arstechnica/technology-lab",
      "https://www.wired.com/feed/rss",
      "https://www.engadget.com/rss.xml",
      "https://feeds.bbci.co.uk/news/technology/rss.xml",
      "https://www.theguardian.com/technology/rss",
      "https://feeds.skynews.com/feeds/rss/technology.xml"
    ],
    health: [
      "https://feeds.bbci.co.uk/news/health/rss.xml",
      "https://www.sciencedaily.com/rss/health_medicine.xml",
      "https://medicalxpress.com/rss-feed/",
      "https://www.statnews.com/feed/",
      "https://www.who.int/rss-feeds/news-english.xml",
      "https://feeds.nbcnews.com/nbcnews/public/health",
      "https://www.news-medical.net/syndication.axd?format=rss"
    ],
    cars: [
      "https://www.motor1.com/rss/news/all/",
      "https://www.carscoops.com/feed/",
      "https://www.autocar.co.uk/rss",
      "https://www.caranddriver.com/rss/all.xml/",
      "https://www.motorsport.com/rss/all/news/",
      "https://insideevs.com/rss/news/all/",
      "https://www.electrive.com/feed/"
    ],
    tourism: [
      "https://www.theguardian.com/travel/rss",
      "https://www.cntraveler.com/feed/rss",
      "https://skift.com/feed/",
      "https://tourismdailynews.com/feed/",
      "https://www.deliciousmagazine.co.uk/travel/feed/",
      "https://www.nomadicmatt.com/travel-blog/feed/",
      "https://theplanetd.com/feed/"
    ],
    music: [
      "https://www.theguardian.com/music/rss",
      "https://www.rollingstone.com/music/feed/",
      "https://www.rollingstone.com/music/music-news/feed/",
      "https://www.billboard.com/feed/",
      "https://www.nme.com/news/music/feed",
      "https://consequence.net/feed/",
      "https://pitchfork.com/rss/news/",
      "https://www.stereogum.com/feed/",
      "https://www.spin.com/feed/"
    ],
    horoscope: []
  },

  sv: {
    world: [
      "https://www.svt.se/nyheter/rss.xml",
      "https://www.dn.se/rss/",
      "https://www.svd.se/feed/articles.rss",
      "https://www.aftonbladet.se/rss.xml",
      "https://www.expressen.se/rss/nyheter/",
      "https://www.sydsvenskan.se/rss.xml",
      "https://www.tv4.se/rss",
      "https://api.sr.se/api/rss/program/83",
      "https://api.sr.se/api/rss/program/4540",
      "https://www.svt.se/nyheter/lokalt/stockholm/rss.xml"
    ],
    sport: [
      "https://www.sportbladet.se/rss.xml",
      "https://www.expressen.se/rss/sport/",
      "https://www.aftonbladet.se/sportbladet/rss.xml",
      "https://www.svt.se/sport/rss.xml",
      "https://www.hockeysverige.se/feed/"
    ],
    economy: [
      "https://www.di.se/rss",
      "https://www.dn.se/ekonomi/rss/",
      "https://www.expressen.se/rss/ekonomi/",
      "https://www.breakit.se/feed/artiklar",
      "https://www.svt.se/nyheter/ekonomi/rss.xml",
      "https://www.aftonbladet.se/minekonomi/rss.xml"
    ],
    tech: [
      "https://feber.se/rss/",
      "https://www.svt.se/nyheter/om/teknik/rss.xml",
      "https://www.expressen.se/rss/ekonomi/tech/",
      "https://computersweden.se/rss",
      "https://www.sweclockers.com/feeds/nyheter"
    ],
    // FIX (صور حقيقية + أخبار حديثة): استُبدلت التغذيات التي لا ترفق صوراً،
    // وأُزيلت التغذيات التي تنشر بتواريخ قديمة (تُستبعد من فلتر الحداثة).
    // المتبقّي: صور مع كل عنصر تقريباً + نشر يومي.
    health: [
      "https://www.vardfokus.se/feed/",
      "https://forskning.se/feed/",
      "https://lakartidningen.se/feed/"
    ],
    cars: [
      "https://www.dn.se/rss/motor/",
      "https://www.vibilagare.se/rss.xml"
      // FIX (طلب المستخدم): حُذفت تغذية mobil.se من قسم السيارات السويدي
      // لأن محتواها ليس مخصصاً للسيارات.
    ],
    tourism: [
      "https://www.travelnews.se/feed/",
      "https://www.vagabond.se/feed/"
    ],
    // FIX (صور حقيقية): تغذيات موسيقى سويدية مُختبَرة ترفق صورة مع كل عنصر (100%).
    music: [
      "https://feeds.expressen.se/noje/musik/",
      "https://rss.aftonbladet.se/rss2/small/pages/sections/nojesbladet/musik",
      "https://feeds.expressen.se/noje/"
    ],
    horoscope: []
  }

};

// ─────────────────────────────────────────────────────────────────────────
// Translations (T) — Arabic (ar), English (en), Swedish (sv)
// Bazaar/Middle East/Kids removed; footer restructured; About Us added
// Swedish kitchen catNews FIXED (was Arabic, now Swedish)
// ─────────────────────────────────────────────────────────────────────────
const T = {

  /* ====================== ARABIC ====================== */
  ar: {
    htmlLang: "ar",
    dir: "rtl",
    // FIX (Kitchen + floating music player) labels
    mpNowPlaying: "يُشغَّل الآن",
    mpPrev: "السابق",
    mpNext: "التالي",
    mpClose: "إغلاق المشغّل",
    heroDesc: "بوابتك لأحدث الأخبار من جميع أنحاء العالم — بث مباشر، مصادر متعددة، وتغطية شاملة.",
    secMore: "المزيد ←",
    backHome: "← الرئيسية",

    // FIX (إخفاء خبر برقم سري): نصوص قائمة الأخبار بالزر الأيمن / اللمسة الطويلة.
    newsCtxHide: "إخفاء هذا الخبر",
    newsCtxRestore: "استعادة الأخبار التي أخفيتها",
    newsRestoreEmpty: "لا توجد أخبار أخفيتها.",
    newsRestoreConfirm: "سيتم إعادة إظهار كل الأخبار التي أخفيتها أنت سابقاً. هل توافق؟",
    // FIX (منع كلمة أو رابط): الأمر الثالث في القائمة — قائمة كلمات ممنوعة.
    newsCtxBlock: "منع كلمة أو رابط",
    newsBlockPrompt: "اكتب كلمة أو اسماً أو رابطاً لا ترغب بظهوره (مثال: تلاوة، أذان، اسم مطرب، أو رابط كامل).\nالكلمات الممنوعة حالياً مكتوبة أدناه، ويمكنك تعديلها أو حذفها ثم الحفظ. اترك الحقل فارغاً لإلغاء المنع كلياً.",
    newsBlockSaved: "تم الحفظ. لن يظهر أي عنصر يحتوي هذه الكلمات في أي قسم.",
    newsBlockCleared: "تم إلغاء جميع الكلمات الممنوعة.",
    // FIX (أزرار التواصل الاجتماعي بدل زر التحديث)
    socialInstagram: "إنستغرام",
    socialTiktok: "تيك توك",
    socialX: "إكس (تويتر)",
    // FIX (زر التحديث): تسمية زر تحديث الأخبار في الفوتر.
    refreshTitle: "تحديث الأخبار",
    sourceLabel: "المصدر",
    dateLabel: "التاريخ",
    // FIX: تسمية تاريخ الصدور في بطاقات الأغاني
    songReleaseLabel: "تاريخ الصدور",
    fromUs: "منّا",
    footerNote: "كل المحتوى يُجلب من مصادره الأصلية",
    footerCopyright: "ShirwaniWorldPulse 2026",
    aboutUsTitle: "من نحن",
    aboutUsText: "نبذة عن موقع شيرواني وورلد بولسه: في شيرواني وورلد بولسه، نحتفي بثراء المعلومات من مختلف أنحاء العالم. هذه المنصة الشخصية غير تجارية وغر سياسية هي ثمرة شغف، مُكرسة لجمع الأخبار من مصادر متنوعة لإبقائكم على اطلاع دائم. مهمتنا هي توفير مساحة تُمكّنكم من استكشاف آخر المستجدات في مختلف المجالات، مما يسمح لكم بالتواصل مع العالم بطريقة هادفة.",
    searchPlaceholder: "ابحث في الأخبار...",
    musicTitle: "🎵 الموسيقى المفضلة",
    musicFavPlaceholder: "أدخل رابط أغنية أو اسمها...",
    musicFavAdd: "إضافة",
    musicCtxAdd: "إضافة أغنية مفضلة",
    musicCtxRemove: "إلغاء الأغاني المفضلة",
    musicPwdTitle: "أدخل كلمة المرور",
    musicPwdSubmit: "تأكيد",
    musicPwdCancel: "إلغاء",
    musicPwdError: "كلمة المرور غير صحيحة!",
    musicPwdHint: "أدخل كلمة المرور",
    musicRemoveConfirm: "سيتم حذف جميع الأغاني المفضلة. هل أنت متأكد؟",
    songListenNow: "استمع الآن ↗",
    liveScoresTitle: "النتائج المباشرة",
    // FIX (دمج): تبويب الأخبار يجمع كرة القدم والرياضة العالمية
    sportSubNews: "أخبار الرياضة",
    sportSubMatches: "مباريات اليوم",
    goalsTickerLabel: "⚽ الأهداف المباشرة",
    noMatchesToday: "لا توجد مباريات اليوم",
    scoreUnavailable: "غير متاح حالياً",
    matchSearchPlaceholder: "ابحث عن فريق أو مباراة...",
    leagueFilterAll: "جميع الدوريات",
    dateToday: "اليوم",
    matchTime: "الوقت",
    matchStatus: "الحالة",
    statusLive: "مباشر",
    statusFinished: "انتهت",
    statusUpcoming: "قادمة",
    statusPostponed: "مؤجلة",
    broadcastOn: "على",
    noMatchesDate: "لا توجد مباريات في هذا التاريخ",
    searchNoResults: "لا توجد نتائج للبحث",
    // FIX: جدول ترتيب الفرق
    standingsTitle: "جدول ترتيب الفرق",
    standingsPick: "اختر البطولة",
    standingsLoading: "جاري تحميل الترتيب...",
    standingsUnavailable: "جدول الترتيب غير متاح لهذه البطولة",
    standingsHint: "اختر بطولة من القائمة أعلاه لعرض ترتيب فرقها",
    stCol: { rank: "#", team: "الفريق", played: "لعب", win: "ف", draw: "ت", loss: "خ", gf: "له", ga: "عليه", gd: "+/-", pts: "نقاط" },
    newsTicker: "آخر الأخبار",
    tickerCategories: {
      world: "عالم", sport: "رياضة", economy: "اقتصاد", tech: "تكنولوجيا", health: "صحة", cars: "سيارات", tourism: "سياحة", music: "موسيقى", horoscope: "أبراج"
    },
    navGroup: {
      home: "الرئيسية",
      world: "أخبار العالم",
      sport: "رياضة",
      economy: "اقتصاد",
      tech: "تكنولوجيا",
      health: "صحة",
      cars: "عالم السيارات",
      tourism: "السياحة",
      music: "موسيقى",
      horoscope: "أبراج"
    },
    cats: {
      world:     { title: "أخبار العالم",         desc: "آخر المستجدات من كل القارات"           },
      sport:     { title: "الرياضة",            desc: "أخبار رياضية ونتائج مباشرة"           },
      economy:   { title: "الاقتصاد",           desc: "أسواق المال والأعمال"               },
      tech:      { title: "تكنولوجيا",            desc: "عالم التكنولوجيا والابتكار"          },
      health:    { title: "الصحة",              desc: "صحتك أولوية"                       },
      cars:      { title: "عالم السيارات",        desc: "أحدث الطرازات وأخبار القيادة"         },
      tourism:    { title: "السياحة",              desc: "وجهات سياحية ونصائح للرحلات"        },
      music:     { title: "الموسيقى",           desc: "استمع لأحدث الأغاني"                  },
      horoscope: { title: "الأبراج",            desc: "حظك اليوم"                         }
    },
    catNews: {
      world: [
        {title:"BBC Arabic: أخبار عالمية على مدار الساعة",link:"https://www.bbc.com/arabic",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"الجزيرة: مستجدات عالمية",link:"https://www.aljazeera.net",description:"تغطيات شاملة مع صور"},
        {title:"الشرق الأوسط: أخبار عالمية",link:"https://www.aawsat.com/",description:"أخبار عالمية مع صور مرفقة"},
        {title:"فرانس 24: مستجدات عالمية على مدار الساعة",link:"https://www.france24.com/ar/",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"العربية: أخبار عالمية",link:"https://www.alarabiya.net/",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"سكاي نيوز عربية: أخبار عالمية",link:"https://www.skynewsarabia.com/world",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"CNN بالعربية: أخبار عالمية",link:"https://arabic.cnn.com/",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"الشرق: أخبار عالمية",link:"https://asharq.com/",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"البوابة: أخبار عالمية",link:"https://www.albawaba.com/",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"الكومبس: أخبار عالمية",link:"https://alkompis.se/news",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"AP News: أخبار عالمية",link:"https://apnews.com/",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"يورونيوز عربي: أخبار عالمية",link:"https://arabic.euronews.com/",description:"تغطية شاملة لأهم الأحداث العالمية"},
        {title:"أكتر: أخبار عالمية",link:"https://aktarr.se/",description:"تغطية شاملة لأهم الأحداث العالمية"}
      ],
      sport: [
        {title:"اليوم السابع: رياضة",link:"https://www.youm7.com/",description:"أخبار كرة القدم والرياضة"},
        {title:"BBC الرياضية: تغطية شاملة",link:"https://www.bbc.com/sport",description:"أحدث الأخبار الرياضية"},
        {title:"فرانس 24: الرياضة",link:"https://www.france24.com/ar/%D8%B1%D9%8A%D8%A7%D8%B6%D8%A9/",description:"تقارير رياضية مصورة"},
        {title:"Reuters: رياضة",link:"https://www.reuters.com/ar/sports/",description:"أخبار الرياضة وكرة القدم"},
        {title:"beIN SPORTS: رياضة",link:"https://www.beinsports.com/ar-mena/other-sports",description:"أخبار الرياضة وكرة القدم"},
        {title:"Goal: رياضة",link:"https://www.goal.com/ar",description:"أخبار الرياضة وكرة القدم"},
        {title:"الجزيرة: رياضة",link:"https://www.aljazeera.net/sport/world-football",description:"أخبار الرياضة وكرة القدم"},
        {title:"هاي كورة: رياضة",link:"https://hihi2.com/",description:"أخبار الرياضة وكرة القدم"},
        {title:"الشرق الرياضية: رياضة",link:"https://sports.asharq.com/football/",description:"أخبار الرياضة وكرة القدم"},
        {title:"العربية: رياضة",link:"https://www.alarabiya.net/sport/",description:"أخبار الرياضة وكرة القدم"}
      ],
      horoscope: [
        {title:"أبراج ناو: حظك اليوم",link:"https://abrajnow.com/",description:"توقعات الأبراج اليومية"},
        {title:"ليالينا: أبراج",link:"https://www.layalina.com/daily-horoscopes/",description:"توقعات الأبراج اليومية"},
        {title:"برجك اليوم: أبراج",link:"https://bourjak-al-yawm.com/",description:"توقعات الأبراج اليومية"},
        {title:"عرب حاز: أبراج",link:"https://arabhaz.com/wp/zodiac/",description:"توقعات الأبراج اليومية"},
        {title:"أبراجك: أبراج",link:"https://abrajok.com/",description:"توقعات الأبراج اليومية"},
        {title:"السومرية: أبراج",link:"https://www.alsumaria.tv/Horoscopes",description:"توقعات الأبراج اليومية"},
        {title:"موسوعة الأبراج: أبراج",link:"https://mawso3a-abraj.net/free-daily-horoscope/",description:"توقعات الأبراج اليومية"}
      ],
      economy: [
        {title:"إنفستنج: أخبار الأسواق",link:"https://sa.investing.com/",description:"متابعة الأسواق والعملات"},
        {title:"الاقتصاد اليوم: أخبار الأسواق",link:"https://www.aa.com.tr/ar/economy",description:"تغطية شاملة لأسواق المال والأعمال"},
        {title:"يورونيوز عربي: اقتصاد",link:"https://arabic.euronews.com/business/economy",description:"متابعة الأسواق والأعمال"},
        {title:"BBC: اقتصاد",link:"https://www.bbc.com/arabic/topics/cqywj97d487t",description:"متابعة الأسواق والأعمال"},
        {title:"العربية: اقتصاد",link:"https://www.alarabiya.net/aswaq/economy",description:"متابعة الأسواق والأعمال"}
      ],
      tech: [
        {title:"عالم التقنية: آخر أخبار التكنولوجيا",link:"https://arabhardware.net/",description:"ابتكارات وتطورات تقنية"},
        {title:"سكاي نيوز عربية: تكنولوجيا",link:"https://www.skynewsarabia.com/technology/artificial_intelligence",description:"أحدث أخبار التقنية والابتكار"},
        {title:"العربية: تكنولوجيا",link:"https://www.alarabiya.net/technology",description:"أحدث أخبار التقنية والابتكار"},
        {title:"الجزيرة: تكنولوجيا",link:"https://www.aljazeera.net/tech/",description:"أحدث أخبار التقنية والابتكار"},
        {title:"الشرق: تكنولوجيا",link:"https://asharq.com/technology/",description:"أحدث أخبار التقنية والابتكار"},
        {title:"سكاي نيوز عربية: تكنولوجيا",link:"https://www.skynewsarabia.com/technology",description:"أحدث أخبار التقنية والابتكار"}
      ],
      health: [
        {title:"ويب طب: نصائح صحية موثوقة",link:"https://www.webteb.com/",description:"معلومات طبية وصحية"},
        {title:"يورونيوز عربي: صحة",link:"https://arabic.euronews.com/health/health-news",description:"معلومات ونصائح صحية موثوقة"},
        {title:"يورونيوز عربي: صحة",link:"https://arabic.euronews.com/health",description:"معلومات ونصائح صحية موثوقة"},
        {title:"العربية: صحة",link:"https://www.alarabiya.net/medicine-and-health",description:"معلومات ونصائح صحية موثوقة"},
        {title:"يورونيوز عربي: صحة",link:"https://arabic.euronews.com/tag/who",description:"معلومات ونصائح صحية موثوقة"},
        {title:"WHO: صحة",link:"https://www.who.int/ar",description:"معلومات ونصائح صحية موثوقة"}
      ],
      cars: [
        {title:"أوتو عرب: أخبار السيارات",link:"https://www.autoarab.com/",description:"أحدث الطرارات وتقييمات السيارات"},
        {title:"Motor Gate: أخبار السيارات العربية",link:"https://www.motorgate.com/",description:"تقارير وصور للسيارات"},
        {title:"السيارات: سيارات",link:"https://www.assayyarat.com/category/new-cars/",description:"أحدث الطرازات والتجارب"},
        {title:"عالم السيارات: سيارات",link:"https://alamalsayarat.com/",description:"أحدث الطرازات والتجارب"},
        {title:"DubiCars: سيارات",link:"https://www.dubicars.com/news/ar",description:"أحدث الطرازات والتجارب"},
        {title:"Motor1 الشرق الأوسط: سيارات",link:"https://me.motor1.com/",description:"أحدث الطرازات والتجارب"},
        {title:"السيارات: سيارات",link:"https://www.assayyarat.com/",description:"أحدث الطرازات والتجارب"},
        {title:"InsideEVs: سيارات",link:"https://insideevs.com/news/category/news/",description:"أحدث الطرازات والتجارب"},
        {title:"يوتيوب: سيارات",link:"https://www.youtube.com/playlist?list=PLg4R1G93vjNMYp8KNHHQingNi9PXtm29Z",description:"أحدث الطرازات والتجارب"}
      ],
      tourism: [
        {title:"سفراء: وجهات سياحية",link:"https://www.safaraat.com/",description:"أفضل الوجهات ونصائح السفر"},
        {title:"CNN بالعربية: سياحة",link:"https://arabic.cnn.com/travel",description:"وجهات سياحية ونصائح السفر"},
        {title:"Tourism Daily News: سياحة",link:"https://tourismdailynews.com/",description:"وجهات سياحية ونصائح السفر"},
        {title:"BBC: سياحة",link:"https://www.bbc.com/arabic/topics/cg7265kg6g4t",description:"وجهات سياحية ونصائح السفر"},
        {title:"يورونيوز عربي: سياحة",link:"https://arabic.euronews.com/tag/tourism",description:"وجهات سياحية ونصائح السفر"},
        {title:"الجزيرة: سياحة",link:"https://www.aljazeera.net/travel/",description:"وجهات سياحية ونصائح السفر"}
      ],
      music: [
        {title:"أنغامي: أحدث الأغاني العربية",link:"https://play.anghami.com",description:"استمع لأحدث الأغاني العربية على أنغامي",isSong:true},
        {title:"سبوتيفاي: قوائم أغاني عربية",link:"https://open.spotify.com/genre/arab",description:"أفضل قوائم الأغاني العربية",isSong:true},
        {title:"بيلبورد عربي: أفضل الأغاني",link:"https://www.billboard.com/articles/billboard-arab/",description:"أحدث أغاني بيلبورد العربية",isSong:true},
        {title:"ألبوماتي: موسيقى",link:"https://www.albumaty.com/lastalbums.html",description:"أحدث الأغاني والألبومات",isSong:true},
        {title:"Arab Sounds: موسيقى",link:"https://www.arabsounds.net/top20/",description:"أحدث الأغاني والألبومات",isSong:true},
        {title:"يوتيوب: أغاني عربية رائجة",link:"https://www.youtube.com/results?search_query=Popular+Arabic+songs",description:"أحدث الأغاني والألبومات",isSong:true},
        {title:"سبوتيفاي: أغاني عربية رائجة",link:"https://open.spotify.com/search/Arabic%20trending%20songs",description:"أحدث الأغاني والألبومات",isSong:true}
      ]
    },
    // FIX: strings for the interactive daily horoscope panel.
    zodiacTitle: "",
    zodiacPickHint: "",
    zodiacLoading: "جاري جلب توقّعات اليوم...",
    zodiacError: "تعذّر جلب التوقّعات الآن، جرّب مرة أخرى بعد قليل.",
    zodiacDateLabel: "تاريخ التوقّع",
    zodiacRangeLabel: "فترة البرج",
    zodiacClose: "إغلاق",
    zodiacMoreLabel: "مصادر إضافية:",
    zodiacNames: ["الحمل","الثور","الجوزاء","السرطان","الأسد","العذراء","الميزان","العقرب","القوس","الجدي","الدلو","الحوت"]
  },

  /* ====================== ENGLISH ====================== */
  en: {
    htmlLang: "en",
    // FIX (Kitchen + floating music player) labels
    mpNowPlaying: "Now playing",
    mpPrev: "Previous",
    mpNext: "Next",
    mpClose: "Close player",
    dir: "ltr",
    heroDesc: "Your gateway to the latest news from around the world — live updates, multiple sources, comprehensive coverage.",
    secMore: "More →",
    backHome: "← Home",

    // FIX (إخفاء خبر برقم سري): نصوص قائمة الأخبار بالزر الأيمن / اللمسة الطويلة.
    newsCtxHide: "Hide this news",
    newsCtxRestore: "Restore the news you hid",
    newsRestoreEmpty: "You have not hidden any news.",
    newsRestoreConfirm: "All the news you hid earlier will be shown again. Continue?",
    // FIX (منع كلمة أو رابط)
    newsCtxBlock: "Block a word or link",
    newsBlockPrompt: "Type a word, name or link you never want to see (e.g. quran, adhan, an artist name, or a full link).\nCurrently blocked terms are shown below — edit or delete them, then save. Leave the field empty to clear all blocks.",
    newsBlockSaved: "Saved. Nothing containing these terms will appear in any section.",
    newsBlockCleared: "All blocked terms have been cleared.",
    socialInstagram: "Instagram",
    socialTiktok: "TikTok",
    socialX: "X (Twitter)",
    // FIX (زر التحديث): تسمية زر تحديث الأخبار في الفوتر.
    refreshTitle: "Refresh news",
    sourceLabel: "Source",
    dateLabel: "Date",
    // FIX: release-date label on song cards
    songReleaseLabel: "Released",
    fromUs: "From us",
    footerNote: "All content is sourced from its original sources",
    footerCopyright: "ShirwaniWorldPulse 2026",
    aboutUsTitle: "About Us",
    aboutUsText: "About Sherwani World Pulse: At Sherwani World Pulse, we celebrate the wealth of information from around the world. This personal, non-commercial, non-political platform is the fruit of passion, dedicated to gathering news from diverse sources to keep you updated. Our mission is to provide a space that enables you to explore the latest developments in various fields, allowing you to connect with the world in a meaningful way.",
    searchPlaceholder: "Search news...",
    musicTitle: "🎵 Favorite Music",
    musicFavPlaceholder: "Enter a song link or name...",
    musicFavAdd: "Add",
    musicCtxAdd: "Add Favorite Song",
    musicCtxRemove: "Remove Favorite Songs",
    musicPwdTitle: "Enter Password",
    musicPwdSubmit: "Confirm",
    musicPwdCancel: "Cancel",
    musicPwdError: "Incorrect password!",
    musicPwdHint: "Enter the password",
    musicRemoveConfirm: "All favorite songs will be deleted. Are you sure?",
    songListenNow: "Listen now ↗",
    liveScoresTitle: "Live Scores",
    // FIX (label): first sport sub-page is now "Football News"
    sportSubNews: "Sport News",
    sportSubMatches: "Today's Matches",
    goalsTickerLabel: "⚽ Live Goals",
    noMatchesToday: "No matches today",
    scoreUnavailable: "Currently unavailable",
    matchSearchPlaceholder: "Search team or match...",
    leagueFilterAll: "All Leagues",
    dateToday: "Today",
    matchTime: "Time",
    matchStatus: "Status",
    statusLive: "Live",
    statusFinished: "Finished",
    statusUpcoming: "Upcoming",
    statusPostponed: "Postponed",
    broadcastOn: "On",
    noMatchesDate: "No matches on this date",
    searchNoResults: "No search results",
    // FIX: league standings table
    standingsTitle: "League Standings",
    standingsPick: "Choose a league",
    standingsLoading: "Loading standings...",
    standingsUnavailable: "Standings are not available for this league",
    standingsHint: "Pick a league from the list above to see its team standings",
    stCol: { rank: "#", team: "Team", played: "P", win: "W", draw: "D", loss: "L", gf: "GF", ga: "GA", gd: "GD", pts: "Pts" },
    newsTicker: "Latest News",
    tickerCategories: {
      world: "World", sport: "Sport", economy: "Economy", tech: "Tech", health: "Health", cars: "Cars", tourism: "Tourism", music: "Music", horoscope: "Horoscope"
    },
    navGroup: {
      home: "Home",
      world: "World",
      sport: "Sport",
      economy: "Economy",
      tech: "Tech",
      health: "Health",
      cars: "Cars World",
      tourism: "Tourism",
      music: "Music",
      horoscope: "Horoscope"
    },
    cats: {
      world:     { title: "World News",           desc: "Latest updates from every continent"      },
      sport:     { title: "Sport",                desc: "Sports news and live scores"             },
      economy:   { title: "Economy",               desc: "Markets, finance and business"         },
      tech:      { title: "Technology",            desc: "Tech innovation and digital trends"    },
      health:    { title: "Health",                desc: "Your health is our priority"           },
      cars:      { title: "Cars World",            desc: "Latest models and driving news"        },
      tourism:    { title: "Tourism",                 desc: "Destinations and tourism tips"          },
      music:     { title: "Music",                  desc: "Listen to latest songs"                },
      horoscope: { title: "Horoscope",              desc: "Your daily stars"                     }
    },
    catNews: {
      world: [
        {title:"BBC News: Global news around the clock",link:"https://www.bbc.com/news",description:"Comprehensive coverage of world events"},
        {title:"The Guardian World: Global news",link:"https://www.theguardian.com/world",description:"Global coverage with images"},
        {title:"Al Jazeera English: In-depth coverage",link:"https://www.aljazeera.com/",description:"Rich content with images"},
        {title:"Al Arabiya English: World news",link:"https://english.alarabiya.net/News",description:"Comprehensive coverage of global events"},
        {title:"Al Arabiya English: World news",link:"https://english.alarabiya.net/",description:"Comprehensive coverage of global events"},
        {title:"CNN: World news",link:"https://edition.cnn.com/",description:"Comprehensive coverage of global events"}
      ],
      sport: [
        {title:"Sky Sports: Latest sports headlines",link:"https://www.skysports.com/",description:"Comprehensive sports coverage"},
        {title:"BBC Sport: Full coverage",link:"https://www.bbc.com/sport",description:"Sports news with images"},
        {title:"The Guardian Football: Global coverage",link:"https://www.theguardian.com/football",description:"Football reports and images"},
        {title:"CNN: Sport",link:"https://edition.cnn.com/sport",description:"Football and sports coverage"},
        {title:"AP News: Sport",link:"https://apnews.com/sports",description:"Football and sports coverage"},
        {title:"ESPN: Sport",link:"https://www.espn.com/",description:"Football and sports coverage"},
        {title:"Al Jazeera: Sport",link:"https://www.aljazeera.com/sports",description:"Football and sports coverage"},
        {title:"Sky Sports: Sport",link:"https://www.skysports.com/more-sports",description:"Football and sports coverage"},
        {title:"Goal: Sport",link:"https://www.goal.com/en",description:"Football and sports coverage"}
      ],
      horoscope: [
        {title:"Astrology Zone: Your daily horoscope",link:"https://www.astrologyzone.com/",description:"Daily zodiac predictions"},
        {title:"Karma and Luck: Horoscope",link:"https://www.karmaandluck.com/pages/daily-horoscope",description:"Daily zodiac readings"},
        {title:"Astrotalk: Horoscope",link:"https://astrotalk.com/horoscope/daily-horoscope",description:"Daily zodiac readings"},
        {title:"Horoscope.com: Horoscope",link:"https://www.horoscope.com/us/horoscopes/general/index-horoscope-general-daily.aspx",description:"Daily zodiac readings"},
        {title:"Tarot.com: Horoscope",link:"https://www.tarot.com/daily-horoscope",description:"Daily zodiac readings"},
        {title:"Find Your Lucky: Horoscope",link:"https://numbers.findyourlucky.com/lucky-numbers-for-today.html",description:"Daily zodiac readings"},
        {title:"AstroStyle: Horoscope",link:"https://astrostyle.com/",description:"Daily zodiac readings"},
        {title:"YourTango: Horoscope",link:"https://www.yourtango.com/horoscope",description:"Daily zodiac readings"},
        {title:"Daily Horoscope",link:"https://www.dailyhoroscope.com/",description:"Daily zodiac readings"},
        {title:"Astro.com: Horoscopes",link:"https://www.astro.com/horoscopes",description:"Daily zodiac readings"}
      ],
      economy: [
        {title:"BBC Business: Market updates and financial news",link:"https://www.bbc.com/news/business",description:"Comprehensive coverage of global markets"},
        {title:"The Guardian Business: Financial coverage",link:"https://www.theguardian.com/business",description:"Market updates with images"},
        {title:"The Guardian Money: Economic news",link:"https://www.theguardian.com/business/economics",description:"Business coverage with images"},
        {title:"BBC: Economy",link:"https://www.bbc.com/business",description:"Markets and business updates"},
        {title:"CNBC: Economy",link:"https://www.cnbc.com/economy",description:"Markets and business updates"},
        {title:"Reuters: Economy",link:"https://www.reuters.com/business/",description:"Markets and business updates"},
        {title:"CNN: Economy",link:"https://edition.cnn.com/business/economy",description:"Markets and business updates"},
        {title:"NBC News: Economy",link:"https://www.nbcnews.com/business",description:"Markets and business updates"},
        {title:"Bloomberg: Economics",link:"https://www.bloomberg.com/economics",description:"Markets and business updates"}
      ],
      tech: [
        {title:"TechCrunch: Latest tech news",link:"https://techcrunch.com/",description:"Innovation and startup coverage"},
        {title:"Ars Technica: In-depth tech articles",link:"https://arstechnica.com/",description:"Detailed tech articles with images"},
        {title:"BBC: Technology",link:"https://www.bbc.com/technology/tech-now",description:"Latest tech and innovation news"},
        {title:"Reuters: Technology",link:"https://www.reuters.com/technology/",description:"Latest tech and innovation news"},
        {title:"CNBC: Technology",link:"https://www.cnbc.com/technology/",description:"Latest tech and innovation news"},
        {title:"CNN: Technology",link:"https://edition.cnn.com/business/tech",description:"Latest tech and innovation news"},
        {title:"Al Arabiya English: Technology",link:"https://english.alarabiya.net/business/technology",description:"Latest tech and innovation news"}
      ],
      health: [
        {title:"BBC Health: Trusted health information",link:"https://www.bbc.com/news/health",description:"Medical news and health tips"},
        {title:"STAT News: Health articles",link:"https://www.statnews.com/",description:"Health content with images"},
        {title:"Medical Xpress: Global health news",link:"https://medicalxpress.com/",description:"International health updates"},
        {title:"BBC: Health",link:"https://www.bbc.com/health",description:"Trusted medical and health news"},
        {title:"NBC News: Health",link:"https://www.nbcnews.com/health",description:"Trusted medical and health news"},
        {title:"Medical News Today: Health",link:"https://www.medicalnewstoday.com/news",description:"Trusted medical and health news"},
        {title:"News Medical: Health",link:"https://www.news-medical.net/",description:"Trusted medical and health news"},
        {title:"AP News: Health",link:"https://apnews.com/health",description:"Trusted medical and health news"}
      ],
      cars: [
        {title:"Car and Driver: Reviews and news",link:"https://www.caranddriver.com/",description:"Car reviews with images"},
        {title:"Motor1: Car news and reports",link:"https://www.motor1.com/",description:"Latest car news with images"},
        {title:"Autocar: Reviews and images",link:"https://www.autocar.co.uk/",description:"Car reviews and reports"},
        {title:"Top Gear: Car news and reviews",link:"https://www.topgear.com/",description:"Latest models and road tests"},
        {title:"DubiCars: Cars",link:"https://www.dubicars.com/news/",description:"New models and road tests"},
        {title:"Autoevolution: Cars",link:"https://www.autoevolution.com/cars/",description:"New models and road tests"},
        {title:"Cars.com: Cars",link:"https://www.cars.com/research/",description:"New models and road tests"},
        {title:"All Car Index: Cars",link:"https://www.allcarindex.com/",description:"New models and road tests"},
        {title:"MotorTrend: Cars",link:"https://www.motortrend.com",description:"New models and road tests"},
        {title:"Autoblog: Cars",link:"https://www.autoblog.com/news",description:"New models and road tests"},
        {title:"Carscoops: Cars",link:"https://www.carscoops.com/",description:"New models and road tests"},
        {title:"InsideEVs: Cars",link:"https://insideevs.com/news/category/news/",description:"New models and road tests"}
      ],
      tourism: [
        {title:"Condé Nast Traveler: Destinations",link:"https://www.cntraveler.com/",description:"Travel articles with stunning images"},
        {title:"The Guardian Travel: Travel destinations",link:"https://www.theguardian.com/travel",description:"Best places to visit and tips"},
        {title:"BBC: Travel",link:"https://www.bbc.com/travel",description:"Destinations and travel tips"},
        {title:"Al Arabiya English: Travel",link:"https://english.alarabiya.net/life-style/travel-and-tourism",description:"Destinations and travel tips"},
        {title:"Delicious Magazine: Travel",link:"https://www.deliciousmagazine.co.uk/travel/",description:"Destinations and travel tips"}
      ],
      music: [
        {title:"Spotify: New Releases",link:"https://open.spotify.com/genre/new-releases",description:"Discover the newest music releases",isSong:true},
        {title:"Billboard: Hot 100 Charts",link:"https://www.billboard.com/",description:"Top songs on the Billboard charts",isSong:true},
        {title:"Pitchfork: Music Reviews",link:"https://pitchfork.com/",description:"Best new music reviewed by Pitchfork",isSong:true},
        {title:"NME: Music news and reviews",link:"https://www.nme.com/",description:"Latest music reviews and news",isSong:true},
        {title:"NME: Music",link:"https://www.nme.com/news/music",description:"Latest songs, charts and reviews",isSong:true},
        {title:"Rolling Stone: Music",link:"https://www.rollingstone.com/music/",description:"Latest songs, charts and reviews",isSong:true},
        {title:"Stereogum: Music",link:"https://www.stereogum.com/",description:"Latest songs, charts and reviews",isSong:true},
        {title:"SPIN: Music",link:"https://www.spin.com/",description:"Latest songs, charts and reviews",isSong:true},
        {title:"YouTube Music: Playlist",link:"https://music.youtube.com/playlist?list=PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i",description:"Latest songs and playlists",isSong:true},
        {title:"SoundCloud: Music",link:"https://soundcloud.com/",description:"Latest songs and playlists",isSong:true},
        {title:"YouTube: Music playlist",link:"https://www.youtube.com/playlist?list=PLZn8-z-sajKbrxpAQIcm4V80HGJHj_yBv",description:"Latest songs and playlists",isSong:true},
        {title:"YouTube: Music mix",link:"https://www.youtube.com/playlist?list=PLME9drm1zCz-_g62r9u_Y8-S8n-sPxWyY",description:"Latest songs and playlists",isSong:true}
      ]
    },
    // FIX: strings for the interactive daily horoscope panel.
    zodiacTitle: "Today's horoscope",
    zodiacPickHint: "Pick your sign to read today's reading",
    zodiacLoading: "Loading today's reading...",
    zodiacError: "Could not load the reading right now. Please try again shortly.",
    zodiacDateLabel: "Reading date",
    zodiacRangeLabel: "Sign dates",
    zodiacClose: "Close",
    zodiacMoreLabel: "More sources:",
    zodiacNames: ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"]
  },

  /* ====================== SWEDISH ====================== */
  sv: {
    htmlLang: "sv",
    // FIX (Kitchen + floating music player) labels
    mpNowPlaying: "Spelas nu",
    mpPrev: "Föregående",
    mpNext: "Nästa",
    mpClose: "Stäng spelaren",
    dir: "ltr",
    heroDesc: "Din port till de senaste nyheterna från hela världen — liveuppdateringar, flera källor, komplett bevakning.",
    secMore: "Mer →",
    backHome: "← Hem",

    // FIX (إخفاء خبر برقم سري): نصوص قائمة الأخبار بالزر الأيمن / اللمسة الطويلة.
    newsCtxHide: "Dölj denna nyhet",
    newsCtxRestore: "Återställ nyheter du döljt",
    newsRestoreEmpty: "Du har inte döljt några nyheter.",
    newsRestoreConfirm: "Alla nyheter du döljt visas igen. Vill du fortsätta?",
    // FIX (منع كلمة أو رابط)
    newsCtxBlock: "Blockera ett ord eller en länk",
    newsBlockPrompt: "Skriv ett ord, namn eller en länk du inte vill se (t.ex. quran, adhan, ett artistnamn eller en fullständig länk).\nBlockerade ord visas nedan – redigera eller ta bort dem och spara. Lämna fältet tomt för att rensa allt.",
    newsBlockSaved: "Sparat. Inget som innehåller dessa ord visas i någon sektion.",
    newsBlockCleared: "Alla blockerade ord har rensats.",
    socialInstagram: "Instagram",
    socialTiktok: "TikTok",
    socialX: "X (Twitter)",
    // FIX (زر التحديث): تسمية زر تحديث الأخبار في الفوتر.
    refreshTitle: "Uppdatera nyheter",
    sourceLabel: "Källa",
    dateLabel: "Datum",
    // FIX: etikett för släppdatum på låtkort
    songReleaseLabel: "Släpptes",
    fromUs: "Från oss",
    footerNote: "Allt innehåll hämtas från sina ursprungliga källor",
    footerCopyright: "ShirwaniWorldPulse 2026",
    aboutUsTitle: "Om oss",
    aboutUsText: "Om Sherwani World Pulse: På Sherwani World Pulse hyllar vi mängden information från hela världen. Denna personliga, icke-kommersiella, icke-politiska plattform är frukten av passion, dedikerad till att samla nyheter från olika källor för att hålla dig uppdaterad. Vårt uppdrag är att tillhandahålla ett utrymme som gör att du kan utforska den senaste utvecklingen inom olika områden, så att du kan ansluta till världen på ett meningsfullt sätt.",
    searchPlaceholder: "Sök nyheter...",
    musicTitle: "🎵 Favoritmusik",
    musicFavPlaceholder: "Ange en låtlänk eller namn...",
    musicFavAdd: "Lägg till",
    musicCtxAdd: "Lägg till favoritlåt",
    musicCtxRemove: "Ta bort favoritlåtar",
    musicPwdTitle: "Ange lösenord",
    musicPwdSubmit: "Bekräfta",
    musicPwdCancel: "Avbryt",
    musicPwdError: "Fel lösenord!",
    musicPwdHint: "Ange lösenordet",
    musicRemoveConfirm: "Alla favoritlåtar kommer att raderas. Är du säker?",
    songListenNow: "Lyssna nu ↗",
    liveScoresTitle: "Live-resultat",
    // FIX (label): first sport sub-page is now "Football News"
    sportSubNews: "Sportnyheter",
    sportSubMatches: "Dagens matcher",
    goalsTickerLabel: "⚽ Live-mål",
    noMatchesToday: "Inga matcher idag",
    scoreUnavailable: "Inte tillgängligt för närvarande",
    matchSearchPlaceholder: "Sök lag eller match...",
    leagueFilterAll: "Alla ligor",
    dateToday: "Idag",
    matchTime: "Tid",
    matchStatus: "Status",
    statusLive: "LIVE",
    statusFinished: "Avslutad",
    statusUpcoming: "Kommande",
    statusPostponed: "Inställd",
    broadcastOn: "På",
    noMatchesDate: "Inga matcher på detta datum",
    searchNoResults: "Inga sökresultat",
    // FIX: tabell över lagens placering
    standingsTitle: "Ligatabell",
    standingsPick: "Välj liga",
    standingsLoading: "Laddar tabell...",
    standingsUnavailable: "Tabellen är inte tillgänglig för denna liga",
    standingsHint: "Välj en liga i listan ovan för att se lagens placering",
    stCol: { rank: "#", team: "Lag", played: "S", win: "V", draw: "O", loss: "F", gf: "GM", ga: "IM", gd: "MS", pts: "P" },
    newsTicker: "Senaste nytt",
    tickerCategories: {
      world: "Värld", sport: "Sport", economy: "Ekonomi", tech: "Teknik", health: "Hälsa", cars: "Bilvärlden", tourism: "Turism", music: "Musik", horoscope: "Horoskop"
    },
    navGroup: {
      home: "Hem",
      world: "Värld",
      sport: "Sport",
      economy: "Ekonomi",
      tech: "Teknik",
      health: "Hälsa",
      cars: "Bilvärlden",
      tourism: "Turism",
      music: "Musik",
      horoscope: "Horoskop"
    },
    cats: {
      world:     { title: "Världen",                desc: "Senaste uppdateringar från alla kontinenter"  },
      sport:     { title: "Sport",                 desc: "Sportnyheter och live-resultat"            },
      economy:   { title: "Ekonomi",               desc: "Marknader, finans och affärer"             },
      tech:      { title: "Teknik",                desc: "Teknikinnovation och digitala trender"     },
      health:    { title: "Hälsa",                 desc: "Din hälsa är vår prioritet"               },
      cars:      { title: "Bilvärlden",             desc: "Senaste modeller och bilnyheter"          },
      tourism:    { title: "Turism",                  desc: "Destinationer och turisttips"                },
      music:     { title: "Musik",                  desc: "Lyssna på senaste låtarna"              },
      horoscope: { title: "Horoskop",               desc: "Dina dagliga stjärntecken"                }
    },
    catNews: {
      world: [
        {title:"SVT Nyheter: Senaste nytt",link:"https://www.svt.se/nyheter",description:"Allmänna nyheter med bilder"},
        {title:"SVD: Senaste nytt dygnet runt",link:"https://www.svd.se/",description:"Omfattande bevakning av världshändelser"},
        {title:"Sveriges Radio: Världsnyheter",link:"https://www.sverigesradio.se/",description:"Omfattande bevakning av världshändelser"},
        {title:"SVT: Världsnyheter",link:"https://www.svt.se/",description:"Omfattande bevakning av världshändelser"},
        {title:"Expressen: Världsnyheter",link:"https://www.expressen.se/nyheter/senaste-nytt/",description:"Omfattande bevakning av världshändelser"}
      ],
      sport: [
        {title:"SVT Sport: Lokal och global sport",link:"https://www.svt.se/sport",description:"Lokal och global sportbevakning med bilder"},
        {title:"Sportbladet: Senaste sportnytt",link:"https://www.sportbladet.se/",description:"Omfattande sportbevakning"},
        {title:"Aftonbladet: Sport",link:"https://www.aftonbladet.se/sportbladet",description:"Fotboll och sportnyheter"},
        {title:"TV4: Sport",link:"https://www.tv4.se/fotboll",description:"Fotboll och sportnyheter"},
        {title:"Expressen: Sport",link:"https://www.expressen.se/sport/",description:"Fotboll och sportnyheter"},
        {title:"SVT: Sport",link:"https://www.svt.se/sport/fotboll/",description:"Fotboll och sportnyheter"},
        {title:"Fotbollskanalen: Sport",link:"https://www.fotbollskanalen.se/",description:"Fotboll och sportnyheter"},
        {title:"Svenska Fans: Sport",link:"https://www.svenskafans.com/",description:"Fotboll och sportnyheter"}
      ],
      horoscope: [
        {title:"ELLE: Horoskop",link:"https://www.elle.se/horoskop/",description:"Dagens stjärntecken"},
        {title:"Dagens Horoskop: Horoskop",link:"https://www.dagenshoroskop.nu/",description:"Dagens stjärntecken"},
        {title:"AstroGuide: Horoskop",link:"https://www.astroguide.se/",description:"Dagens stjärntecken"},
        {title:"Aftonbladet: Horoskop",link:"https://www.aftonbladet.se/horoskop",description:"Dagens stjärntecken"},
        {title:"Modette: Dagens horoskop",link:"https://modette.se/horoskop/dagens-horoskop",description:"Dagens stjärntecken"},
        {title:"ELLE: Dagens horoskop",link:"https://www.elle.se/horoskop/dagenshoroskop-2026-08-25/11573310",description:"Dagens stjärntecken"},
        {title:"Drömtydning: Dagens horoskop",link:"https://xn--drmtydning-fcb.nu/dagens-horoskop",description:"Dagens stjärntecken"},
        {title:"Expressen: Horoskop",link:"https://www.expressen.se/horoskop/",description:"Dagens stjärntecken"}
      ],
      economy: [
        {title:"Dagens Nyheter Ekonomi: Finansnyheter",link:"https://www.dn.se/ekonomi",description:"Ekonominyheter med bilder"},
        {title:"Dagens Industri: Ekonominyheter",link:"https://www.di.se/",description:"Marknadsuppdateringar och finansnyheter"},
        {title:"SVT: Ekonomi",link:"https://www.svt.se/nyheter/ekonomi/",description:"Marknader och affärsnyheter"},
        {title:"Expressen: Ekonomi",link:"https://www.expressen.se/ekonomi/",description:"Marknader och affärsnyheter"},
        {title:"Aftonbladet: Ekonomi",link:"https://www.aftonbladet.se/minekonomi",description:"Marknader och affärsnyheter"},
        {title:"Omni: Ekonomi",link:"https://omni.se/ekonomi",description:"Marknader och affärsnyheter"},
        {title:"Göteborgs-Posten: Ekonomi",link:"https://www.gp.se/ekonomi",description:"Marknader och affärsnyheter"},
        {title:"Börskollen: Ekonomi",link:"https://www.borskollen.se/",description:"Marknader och affärsnyheter"},
        {title:"Dagens Samhälle: Ekonomi",link:"https://www.dagenssamhalle.se/om/ekonomi/",description:"Marknader och affärsnyheter"}
      ],
      tech: [
        {title:"Teknikens Värld: Senaste tekniken",link:"https://www.teknikensvarld.se/",description:"Lokalt tekniskt innehåll med bilder"},
        {title:"Computer Sweden: Senaste tekniken",link:"https://computersweden.se/",description:"Innovation och digitala trender"},
        {title:"Expressen: Teknik",link:"https://www.expressen.se/ekonomi/tech/",description:"Senaste tekniknyheterna"},
        {title:"Ny Teknik: Teknik",link:"https://www.nyteknik.se/",description:"Senaste tekniknyheterna"},
        {title:"Dagens Teknik: Teknik",link:"https://www.dagensteknik.se/",description:"Senaste tekniknyheterna"},
        {title:"SVT: Teknik",link:"https://www.svt.se/nyheter/om/teknik",description:"Senaste tekniknyheterna"}
      ],
      health: [
        {title:"1177 Vårdguiden: Hälsoråd",link:"https://www.1177.se/",description:"Pålitlig medicinsk information"},
        {title:"SVT: Hälsa",link:"https://www.svt.se/nyheter/om/halsa",description:"Pålitliga hälso- och vårdnyheter"},
        {title:"Hälsouniversum: Hälsa",link:"https://halsouniversum.se/",description:"Pålitliga hälso- och vårdnyheter"},
        {title:"Hälsokosten: Hälsa",link:"https://halsokosten.se/",description:"Pålitliga hälso- och vårdnyheter"},
        {title:"Netdoktor: Hälsa",link:"https://www.netdoktor.se/",description:"Pålitliga hälso- och vårdnyheter"}
      ],
      cars: [
        {title:"AutoMotorSport: Bilnyheter",link:"https://www.alltommotor.se/",description:"Senaste modeller och biltester"},
        {title:"Allt om Bilar: Bilar",link:"https://alltombil.se/",description:"Nya modeller och biltester"},
        {title:"Teknikens Värld: Bilar",link:"https://teknikensvarld.expressen.se/",description:"Nya modeller och biltester"},
        {title:"Volvo Cars: Bilar",link:"https://www.volvocars.com/se/",description:"Nya modeller och biltester"},
        {title:"InsideEVs: Bilar",link:"https://insideevs.com/news/category/news/",description:"Nya modeller och biltester"},
        {title:"Car.info: Bilar",link:"https://www.car.info/sv-se/brands",description:"Nya modeller och biltester"}
      ],
      tourism: [
        {title:"Visit Sweden: Destinationer",link:"https://www.visitsweden.com/",description:"Turistinformation med bilder"},
        {title:"Sweden.se: Resor och kultur",link:"https://www.sweden.se/",description:"Artiklar och bilder om Sverige"},
        {title:"Vagabond: Resedestinationer",link:"https://www.vagabond.se/",description:"Bäst platser att besöka"},
        {title:"Nyheter24: Resor",link:"https://nyheter24.se/etikett/turism",description:"Resmål och restips"},
        {title:"Dagens Nyheter: Resor",link:"https://www.dn.se/om/turism/",description:"Resmål och restips"},
        {title:"Viking Line: Resor",link:"https://www.vikingline.se/",description:"Resmål och restips"}
      ],
      music: [
        {title:"Spotify: Svenska hits",link:"https://open.spotify.com/genre/sweden",description:"Senaste svenska musiksläppen",isSong:true},
        {title:"NME Sweden: Ny musik",link:"https://www.nme.com/reviews/",description:"Senaste musikrecensionerna",isSong:true},
        {title:"Radio Sveriges Topplistan: Musik",link:"https://www.radio-sveriges.se/topplistan",description:"Nya låtar, listor och recensioner",isSong:true},
        {title:"Spotify: Musik",link:"https://open.spotify.com/playlist/7paTn4suXMNikeBYAbET38",description:"Nya låtar, listor och recensioner",isSong:true},
        {title:"Gaffa: Musik",link:"https://www.gaffa.se/",description:"Nya låtar, listor och recensioner",isSong:true},
        {title:"SVT Play: Musik",link:"https://www.svtplay.se/kategori/musik",description:"Nya låtar, listor och recensioner",isSong:true},
        {title:"SoundCloud: Musik",link:"https://soundcloud.com/xaamoow-yare",description:"Nya låtar, listor och recensioner",isSong:true},
        {title:"YouTube: Musiklista",link:"https://www.youtube.com/playlist?list=PLinS5uF49IBrceyD-Sfl1cnaEv_XgsrcG",description:"Nya låtar, listor och recensioner",isSong:true},
        {title:"Spotify: Spellista",link:"https://open.spotify.com/playlist/47k0xn3H16AVv1VylS3lTp",description:"Nya låtar, listor och recensioner",isSong:true}
      ]
    },
    // FIX: strings for the interactive daily horoscope panel.
    zodiacTitle: "Dagens horoskop",
    zodiacPickHint: "Välj ditt tecken för att läsa dagens horoskop",
    zodiacLoading: "Hämtar dagens horoskop...",
    zodiacError: "Kunde inte hämta horoskopet just nu. Försök igen snart.",
    zodiacDateLabel: "Datum",
    zodiacRangeLabel: "Teckenperiod",
    zodiacClose: "Stäng",
    zodiacMoreLabel: "Fler källor:",
    zodiacNames: ["Vädur","Oxe","Tvilling","Kräfta","Lejon","Jungfru","Våg","Skorpion","Skytt","Stenbock","Vattuman","Fiskar"]
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Zodiac emoji mapping (used when zodiac images are absent)
// ─────────────────────────────────────────────────────────────────────────
const ZODIAC_EMOJIS = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

// FIX: slugs + date ranges for the 12 signs, so clicking a sign can fetch a real
// daily reading from the free horoscope API (no key required) and show the
// sign's date range even when the network call fails.
const ZODIAC_SLUGS = ["aries","taurus","gemini","cancer","leo","virgo",
                      "libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const ZODIAC_RANGES = ["03-21 → 04-19","04-20 → 05-20","05-21 → 06-20","06-21 → 07-22",
                       "07-23 → 08-22","08-23 → 09-22","09-23 → 10-22","10-23 → 11-21",
                       "11-22 → 12-21","12-22 → 01-19","01-20 → 02-18","02-19 → 03-20"];
// Free, key-less daily horoscope endpoint (CORS enabled).
const HOROSCOPE_API = "https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily";
// FIX (بطاقات الأبراج): أكثر من نقطة نهاية مجانية بلا مفتاح، تُجرّب واحدة
// بعد الأخرى، فإن سقطت الأولى لا تبقى البطاقة فارغة.
const HOROSCOPE_APIS = [
  { url: "https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign={slug}&day=today", kind: "json" },
  { url: "https://horoscope-api-nu.vercel.app/api/v1/get-horoscope/daily?sign={slug}&day=today", kind: "json" },
  { url: "https://ohmanda.com/api/horoscope/{slug}/", kind: "json" }
];

// FIX (بطاقات الأبراج): قراءة محلية جاهزة بثلاث لغات. تُبنى من مقاطع تُنتقى
// بحساب ثابت من (البرج + تاريخ اليوم)، فتتغيّر كل يوم وتبقى نفسها خلال اليوم،
// وتضمن أن كل بطاقة تعطي نصاً حتى لو انقطع الإنترنت أو سقطت الخدمة الخارجية.
const ZODIAC_TEXT = {
  ar: {
    general: [
      "يومك يبدأ بطاقة هادئة تساعدك على ترتيب أولوياتك من جديد.",
      "الأجواء اليوم مواتية لخطوة كنت تؤجّلها منذ فترة.",
      "تشعر بصفاء ذهني يجعل قراراتك أدقّ من المعتاد.",
      "يحمل اليوم خبراً أو رسالة تعيد ترتيب جدولك بشكل إيجابي.",
      "حدسك قويّ اليوم، وما تشعر به تجاه موقف معيّن قريب من الصواب.",
      "فرصة صغيرة تمرّ أمامك، ومن الحكمة أن تنتبه لها لا أن تتجاهلها.",
      "طاقتك متجدّدة، وقدرتك على الإقناع أعلى من الأيام الماضية.",
      "يومك يميل إلى الاستقرار بعد ساعات أولى مزدحمة قليلاً."
    ],
    work: [
      "في العمل: مهمة كنت تراها معقّدة تتّضح ملامحها ويسهل إنجازها.",
      "في العمل: تعاونك مع شخص خبير يوفّر عليك وقتاً وجهداً كبيرين.",
      "في العمل: لا تتسرّع في الموافقة على التزام جديد قبل قراءة تفاصيله.",
      "في العمل: جهدك الأخير يبدأ في الظهور، وقد يلاحظه من هو أعلى منك.",
      "في العمل: نظّم قائمة قصيرة بثلاث مهام فقط وستنجزها كلها.",
      "في العمل: أجواء الفريق أفضل اليوم، فاستثمرها في طرح فكرتك.",
      "في العمل: تفاصيل مالية أو إدارية تحتاج مراجعة دقيقة قبل الإرسال.",
      "في العمل: مرونتك في التعامل مع تغيير مفاجئ ستكون ورقتك الرابحة."
    ],
    love: [
      "عاطفياً: حوار صريح قصير يُذيب توتّراً بسيطاً تراكم في الأيام الماضية.",
      "عاطفياً: لفتة صغيرة منك تُترك أثراً أكبر ممّا تتوقّع.",
      "عاطفياً: أجواء دافئة مع من تحب، وربّما موعد أو لقاء غير مخطّط له.",
      "عاطفياً: تجنّب فتح موضوع حسّاس في ساعة متأخرة من اليوم.",
      "عاطفياً: الاستماع أكثر من الكلام هو مفتاح يومك مع المقرّبين.",
      "عاطفياً: أخبار سعيدة من داخل العائلة ترفع مزاجك.",
      "عاطفياً: من يهمّك أمره ينتظر منك مبادرة بسيطة، لا شرحاً طويلاً.",
      "عاطفياً: ثقتك بنفسك اليوم تجعلك أكثر جذباً في نظر الآخرين."
    ],
    health: [
      "صحياً: نوم منتظم وشرب ماء كافٍ يعيدان لك حيويتك سريعاً.",
      "صحياً: مشي قصير في الهواء الطلق أفضل من فنجان قهوة إضافي.",
      "صحياً: خفّف من الشاشات مساءً حتى ينتظم نومك.",
      "صحياً: عضلات الرقبة والظهر تحتاج تمدّداً بسيطاً بين ساعات الجلوس.",
      "صحياً: وجبة خفيفة متوازنة أفضل لك اليوم من وجبة دسمة واحدة.",
      "صحياً: تنفّس ببطء دقيقتين عند أول شعور بالضغط، وسيهدأ التوتّر.",
      "صحياً: طاقتك جيدة، ومناسبة لاستعادة روتين رياضي توقّف.",
      "صحياً: لا تهمل إشارة تعب صغيرة، الراحة اليوم توفّر عليك غداً."
    ],
    advice: [
      "نصيحة اليوم: أنجز الأصعب أولاً، وبقيّة اليوم ستمرّ أخفّ.",
      "نصيحة اليوم: لا تقارن مسارك بمسار غيرك، إيقاعك مختلف.",
      "نصيحة اليوم: قل «لا» مرّة واحدة اليوم لتحمي وقتك.",
      "نصيحة اليوم: اكتب ما يقلقك على ورقة، سيصغر حجمه فوراً.",
      "نصيحة اليوم: الصبر ساعة واحدة يوفّر عليك أسبوعاً من الندم.",
      "نصيحة اليوم: راجع خطوتك المالية القادمة قبل تنفيذها.",
      "نصيحة اليوم: امنح نفسك نصف ساعة بلا هاتف ولا مهام.",
      "نصيحة اليوم: ابدأ صغيراً، فالاستمرار أهم من الحجم."
    ],
    moods:  ["متفائل","هادئ","نشيط","حاسم","متأمّل","اجتماعي","صبور","طموح"],
    colors: ["الأزرق","الذهبي","الأخضر","الأبيض","الفيروزي","الأرجواني","الرمادي الفاتح","البني الفاتح"],
    moodLabel: "المزاج", colorLabel: "اللون", numberLabel: "الرقم"
  },
  en: {
    general: [
      "The day opens calmly and gives you room to reorder your priorities.",
      "Conditions favour a step you have been postponing for a while.",
      "Your head is unusually clear, so decisions come out sharper today.",
      "A message or piece of news reshuffles your schedule in a good way.",
      "Your instinct is strong today; what you sense about a situation is close to the truth.",
      "A small opportunity passes by — notice it instead of letting it go.",
      "Your energy is renewed and you sound more convincing than usual.",
      "After a slightly crowded morning, the day settles into a steady rhythm."
    ],
    work: [
      "Work: a task you thought was complicated turns out to be manageable.",
      "Work: teaming up with someone experienced saves you real time.",
      "Work: do not agree to a new commitment before reading the details.",
      "Work: recent effort starts to show, and the right people notice it.",
      "Work: keep a short list of three tasks and you will finish all of them.",
      "Work: the team mood is better today — use it to pitch your idea.",
      "Work: financial or administrative details need a careful second look.",
      "Work: flexibility with a sudden change will be your strongest card."
    ],
    love: [
      "Love: one short honest conversation clears tension built up over days.",
      "Love: a small gesture from you lands better than you expect.",
      "Love: warm hours with someone close, possibly an unplanned meeting.",
      "Love: avoid opening a sensitive topic late in the day.",
      "Love: listening more than talking is the key with the people close to you.",
      "Love: good family news lifts your mood.",
      "Love: someone is waiting for a simple move, not a long explanation.",
      "Love: your confidence today makes you noticeably more attractive."
    ],
    health: [
      "Health: regular sleep and enough water restore your energy quickly.",
      "Health: a short walk outdoors beats another cup of coffee.",
      "Health: cut screen time in the evening so your sleep settles.",
      "Health: your neck and back need light stretching between sitting hours.",
      "Health: light balanced meals suit you better than one heavy one.",
      "Health: two minutes of slow breathing at the first sign of pressure helps.",
      "Health: energy is good — a fine day to restart a paused workout routine.",
      "Health: do not ignore a small sign of fatigue; rest now saves tomorrow."
    ],
    advice: [
      "Tip of the day: do the hardest thing first and the rest feels lighter.",
      "Tip of the day: stop comparing your pace with someone else's.",
      "Tip of the day: say no once today to protect your own time.",
      "Tip of the day: write down what worries you and it shrinks immediately.",
      "Tip of the day: one hour of patience saves a week of regret.",
      "Tip of the day: review your next financial move before making it.",
      "Tip of the day: give yourself half an hour with no phone and no tasks.",
      "Tip of the day: start small — consistency matters more than size."
    ],
    moods:  ["Optimistic","Calm","Energetic","Decisive","Reflective","Sociable","Patient","Ambitious"],
    colors: ["Blue","Gold","Green","White","Turquoise","Purple","Light grey","Sand"],
    moodLabel: "Mood", colorLabel: "Colour", numberLabel: "Number"
  },
  sv: {
    general: [
      "Dagen börjar lugnt och ger dig plats att ordna om dina prioriteringar.",
      "Läget gynnar ett steg du har skjutit upp en tid.",
      "Tankarna är ovanligt klara, så dina beslut blir skarpare i dag.",
      "Ett meddelande eller en nyhet ändrar ditt schema på ett bra sätt.",
      "Din intuition är stark i dag och ligger nära sanningen.",
      "En liten möjlighet dyker upp — lägg märke till den.",
      "Energin är förnyad och du är mer övertygande än vanligt.",
      "Efter en full förmiddag hittar dagen ett stabilt tempo."
    ],
    work: [
      "Arbete: en uppgift du trodde var svår visar sig hanterbar.",
      "Arbete: samarbete med någon erfaren sparar mycket tid.",
      "Arbete: säg inte ja till ett nytt åtagande innan du läst detaljerna.",
      "Arbete: ditt senaste arbete börjar synas, och rätt personer märker det.",
      "Arbete: håll en kort lista på tre uppgifter och du blir klar med alla.",
      "Arbete: stämningen i teamet är bättre i dag — presentera din idé.",
      "Arbete: ekonomiska eller administrativa detaljer behöver en extra koll.",
      "Arbete: flexibilitet vid en plötslig förändring blir ditt starkaste kort."
    ],
    love: [
      "Kärlek: ett kort och ärligt samtal löser upp en spänning.",
      "Kärlek: en liten gest från dig betyder mer än du tror.",
      "Kärlek: varma timmar med någon nära, kanske ett oplanerat möte.",
      "Kärlek: undvik känsliga ämnen sent på dagen.",
      "Kärlek: lyssna mer än du talar med dem som står dig nära.",
      "Kärlek: goda familjenyheter lyfter ditt humör.",
      "Kärlek: någon väntar på ett enkelt initiativ, inte en lång förklaring.",
      "Kärlek: ditt självförtroende gör dig extra attraktiv i dag."
    ],
    health: [
      "Hälsa: regelbunden sömn och tillräckligt med vatten ger snabbt tillbaka energin.",
      "Hälsa: en kort promenad utomhus är bättre än en kopp kaffe till.",
      "Hälsa: minska skärmtiden på kvällen så att sömnen sätter sig.",
      "Hälsa: nacke och rygg behöver lätt stretch mellan sittpassen.",
      "Hälsa: lätta balanserade måltider passar dig bättre än en tung.",
      "Hälsa: två minuters långsam andning vid första stressen hjälper.",
      "Hälsa: energin är god — bra dag att återuppta träningen.",
      "Hälsa: ignorera inte små tecken på trötthet; vila i dag sparar i morgon."
    ],
    advice: [
      "Dagens tips: gör det svåraste först, resten känns lättare.",
      "Dagens tips: sluta jämföra ditt tempo med andras.",
      "Dagens tips: säg nej en gång i dag för att skydda din tid.",
      "Dagens tips: skriv ner det som oroar dig, det krymper direkt.",
      "Dagens tips: en timmes tålamod sparar en vecka av ånger.",
      "Dagens tips: se över ditt nästa ekonomiska steg innan du tar det.",
      "Dagens tips: ge dig själv en halvtimme utan telefon och uppgifter.",
      "Dagens tips: börja smått — uthållighet är viktigare än storlek."
    ],
    moods:  ["Optimistisk","Lugn","Energisk","Bestämd","Eftertänksam","Social","Tålmodig","Ambitiös"],
    colors: ["Blå","Guld","Grön","Vit","Turkos","Lila","Ljusgrå","Sand"],
    moodLabel: "Humör", colorLabel: "Färg", numberLabel: "Nummer"
  }
};

// ─────────────────────────────────────────────────────────────────────────
// Sports live scores configuration
// ─────────────────────────────────────────────────────────────────────────
const SPORTS_LEAGUES = {
  ar: [
    { id: "iraq_stars", name: "الدوري العراقي", source: "iraqstarsleague.com" },
    { id: "premier_league", name: "الدوري الإنجليزي" },
    { id: "la_liga", name: "الدوري الإسباني" },
    { id: "serie_a", name: "الدوري الإيطالي" },
    { id: "bundesliga", name: "الدوري الألماني" },
    { id: "liga_portugal", name: "الدوري البرتغالي" },
    { id: "champions_league", name: "دوري أبطال أوروبا" },
    { id: "europa_league", name: "الدوري الأوروبي" },
    // FIX: أُضيفت البطولات الكبرى (كأس العالم وتصفياتها، اليورو وتصفياته، كوبا أمريكا،
    // أمم أفريقيا وتصفياتها، أمم آسيا وتصفياتها، كأس أندية العالم، كأس القارات)
    // لأن المستخدم طلب تغطية البطولات لا الدوريات فقط. كلها من نفس المصدر المجاني.
    { id: "world_cup", name: "كأس العالم" },
    { id: "world_cup_qual", name: "تصفيات كأس العالم" },
    { id: "euro", name: "كأس أوروبا (يورو)" },
    { id: "euro_qual", name: "تصفيات كأس أوروبا" },
    { id: "copa_america", name: "كوبا أمريكا" },
    { id: "afcon", name: "كأس الأمم الأفريقية" },
    { id: "afcon_qual", name: "تصفيات كأس الأمم الأفريقية" },
    { id: "asian_cup", name: "كأس آسيا" },
    { id: "asian_cup_qual", name: "تصفيات كأس آسيا" },
    { id: "club_world_cup", name: "كأس العالم للأندية" },
    { id: "confederations_cup", name: "كأس القارات" },
    { id: "international", name: "مباريات دولية" }
  ],
  en: [
    { id: "iraq_stars", name: "Iraq Stars League", source: "iraqstarsleague.com" },
    { id: "premier_league", name: "Premier League" },
    { id: "la_liga", name: "La Liga" },
    { id: "serie_a", name: "Serie A" },
    { id: "bundesliga", name: "Bundesliga" },
    { id: "liga_portugal", name: "Liga Portugal" },
    { id: "champions_league", name: "Champions League" },
    { id: "europa_league", name: "Europa League" },
    // FIX: major tournaments added (same free data source).
    { id: "world_cup", name: "FIFA World Cup" },
    { id: "world_cup_qual", name: "World Cup Qualifiers" },
    { id: "euro", name: "UEFA Euro" },
    { id: "euro_qual", name: "Euro Qualifiers" },
    { id: "copa_america", name: "Copa América" },
    { id: "afcon", name: "Africa Cup of Nations" },
    { id: "afcon_qual", name: "AFCON Qualifiers" },
    { id: "asian_cup", name: "AFC Asian Cup" },
    { id: "asian_cup_qual", name: "Asian Cup Qualifiers" },
    { id: "club_world_cup", name: "FIFA Club World Cup" },
    { id: "confederations_cup", name: "Confederations Cup" },
    { id: "international", name: "International Matches" }
  ],
  sv: [
    { id: "iraq_stars", name: "Iraq Stars League", source: "iraqstarsleague.com" },
    { id: "premier_league", name: "Premier League" },
    { id: "la_liga", name: "La Liga" },
    { id: "serie_a", name: "Serie A" },
    { id: "bundesliga", name: "Bundesliga" },
    { id: "liga_portugal", name: "Liga Portugal" },
    { id: "champions_league", name: "Champions League" },
    { id: "europa_league", name: "Europa League" },
    // FIX: stora turneringar tillagda (samma gratiskälla).
    { id: "world_cup", name: "VM i fotboll" },
    { id: "world_cup_qual", name: "VM-kval" },
    { id: "euro", name: "EM i fotboll" },
    { id: "euro_qual", name: "EM-kval" },
    { id: "copa_america", name: "Copa América" },
    { id: "afcon", name: "Afrikanska mästerskapet" },
    { id: "afcon_qual", name: "Afrikanska mästerskapet – kval" },
    { id: "asian_cup", name: "Asiatiska mästerskapet" },
    { id: "asian_cup_qual", name: "Asiatiska mästerskapet – kval" },
    { id: "club_world_cup", name: "VM för klubblag" },
    { id: "confederations_cup", name: "Confederations Cup" },
    { id: "international", name: "Internationella matcher" }
  ]
};
