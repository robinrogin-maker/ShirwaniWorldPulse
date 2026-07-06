import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en" | "sv";

export const LANGS: { code: Lang; label: string; dir: "rtl" | "ltr"; flag: string }[] = [
  { code: "ar", label: "العربية", dir: "rtl", flag: "🇸🇦" },
  { code: "en", label: "English", dir: "ltr", flag: "🇬🇧" },
  { code: "sv", label: "Svenska", dir: "ltr", flag: "🇸🇪" },
];

type Dict = Record<string, { ar: string; en: string; sv: string }>;

export const T: Dict = {
  tagline: {
    ar: "كل ما يهمّك في مكان واحد",
    en: "Everything that matters, in one place",
    sv: "Allt som betyder något, på ett ställe",
  },
  home: { ar: "الرئيسية", en: "Home", sv: "Hem" },
  sports: { ar: "رياضة", en: "Sports", sv: "Sport" },
  politics: { ar: "الأخبار العالمية", en: "World News", sv: "Världsnyheter" },
  shopping: { ar: "تسوّق", en: "Shopping", sv: "Shopping" },
  music: { ar: "موسيقى", en: "Music", sv: "Musik" },
  medicine: { ar: "الصحة", en: "Health", sv: "Hälsa" },
  tourism: { ar: "سياحة", en: "Tourism", sv: "Turism" },
  economy: { ar: "اقتصاد", en: "Economy", sv: "Ekonomi" },
  refresh: { ar: "تحديث الأخبار", en: "Refresh News", sv: "Uppdatera nyheter" },
  refreshing: { ar: "جاري التحديث...", en: "Refreshing...", sv: "Uppdaterar..." },
  fetching: { ar: "جاري جلب آخر الأخبار...", en: "Fetching latest news...", sv: "Hämtar senaste nyheterna..." },
  updated: { ar: "تم التحديث", en: "Updated", sv: "Uppdaterat" },
  items: { ar: "عنصر", en: "items", sv: "objekt" },
  fetchFailed: { ar: "فشل الجلب", en: "Fetch failed", sv: "Hämtning misslyckades" },
  retry: { ar: "إعادة المحاولة", en: "Retry", sv: "Försök igen" },
  offline: { ar: "انقطاع في الاتصال بالإنترنت", en: "Connection lost", sv: "Anslutningen bröts" },
  heroSub: {
    ar: "رياضة، سياسة، تسوّق، موسيقى، طب وسياحة — كل ما يصنع يومك في مكان واحد.",
    en: "Sports, world news, shopping, music, medicine and tourism — all in one place.",
    sv: "Sport, politik, shopping, musik, medicin och turism — allt på en plats.",
  },
  heroBadge: {
    ar: "بوابة محتوى متكاملة • تُحدَّث تلقائياً",
    en: "Integrated content hub • Auto-updated",
    sv: "Integrerad innehållsportal • Uppdateras automatiskt",
  },
  browseSections: { ar: "تصفّح الأقسام", en: "Browse sections", sv: "Bläddra i sektioner" },
  more: { ar: "المزيد", en: "More", sv: "Mer" },
  empty: { ar: "لا يوجد محتوى بعد", en: "No content yet", sv: "Inget innehåll ännu" },
  emptyHint: {
    ar: 'اضغط زر "تحديث الأخبار" أعلاه لجلب آخر الأخبار من المصادر العالمية تلقائياً.',
    en: 'Click "Refresh News" above to fetch the latest news from global sources.',
    sv: 'Klicka på "Uppdatera nyheter" ovan för att hämta de senaste nyheterna.',
  },
  errorTitle: { ar: "تعذّر تحميل الأخبار", en: "Could not load news", sv: "Kunde inte ladda nyheter" },
  errorBody: {
    ar: "حدث خطأ أثناء جلب الأخبار من المصدر أو قد يكون الاتصال بالإنترنت منقطعاً.",
    en: "An error occurred fetching news, or your internet connection is down.",
    sv: "Ett fel uppstod när nyheter hämtades, eller så är internetanslutningen nere.",
  },
  unknownError: { ar: "خطأ غير معروف", en: "Unknown error", sv: "Okänt fel" },
  retrying: { ar: "جارٍ المحاولة...", en: "Retrying...", sv: "Försöker igen..." },
  fetchFromSource: { ar: "جلب من المصدر", en: "Fetch from source", sv: "Hämta från källan" },
  fetchingSource: { ar: "جاري الجلب...", en: "Fetching...", sv: "Hämtar..." },
  notFound: { ar: "الصفحة غير موجودة", en: "Page not found", sv: "Sidan hittades inte" },
  notFoundBody: {
    ar: "الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.",
    en: "The page you're looking for doesn't exist or has been moved.",
    sv: "Sidan du letar efter finns inte eller har flyttats.",
  },
  backHome: { ar: "العودة للرئيسية", en: "Back to home", sv: "Tillbaka till start" },
  somethingWrong: { ar: "حدث خطأ ما", en: "Something went wrong", sv: "Något gick fel" },
  somethingWrongBody: {
    ar: "لم نستطع تحميل الصفحة. حاول مرة أخرى أو عُد للرئيسية.",
    en: "We couldn't load the page. Try again or return home.",
    sv: "Vi kunde inte ladda sidan. Försök igen eller gå tillbaka.",
  },
  source: { ar: "مصدر خارجي", en: "External source", sv: "Extern källa" },
  noItems: {
    ar: 'لا توجد عناصر بعد في هذا القسم. اضغط "تحديث الأخبار".',
    en: 'No items in this section yet. Click "Refresh News".',
    sv: 'Inga objekt i den här sektionen än. Klicka "Uppdatera nyheter".',
  },
  section: { ar: "قسم", en: "Section", sv: "Sektion" },
  copyrightTail: {
    ar: "كل المحتوى يُجلب من مصادره الأصلية.",
    en: "All content sourced from its original publishers.",
    sv: "Allt innehåll hämtas från sina ursprungliga källor.",
  },
  now: { ar: "الآن", en: "now", sv: "nu" },
  minAgo: { ar: "قبل # د", en: "# min ago", sv: "för # min sedan" },
  hrAgo: { ar: "قبل # س", en: "# h ago", sv: "för # h sedan" },
  dayAgo: { ar: "قبل # يوم", en: "# d ago", sv: "för # d sedan" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: keyof typeof T) => string };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved && LANGS.some((l) => l.code === saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const cfg = LANGS.find((l) => l.code === lang)!;
    document.documentElement.lang = lang;
    document.documentElement.dir = cfg.dir;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
  };

  const t = (key: keyof typeof T) => T[key]?.[lang] ?? String(key);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function timeAgo(iso: string, lang: Lang) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return T.now[lang];
  if (mins < 60) return T.minAgo[lang].replace("#", String(mins));
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return T.hrAgo[lang].replace("#", String(hrs));
  const days = Math.floor(hrs / 24);
  if (days < 7) return T.dayAgo[lang].replace("#", String(days));
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar" : lang === "sv" ? "sv-SE" : "en-US");
}
