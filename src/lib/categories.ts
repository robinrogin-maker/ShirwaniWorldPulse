import type { Lang } from "./i18n";

export type CategoryKey = "sports" | "politics" | "shopping" | "music" | "medicine" | "tourism" | "economy";

type TriString = Record<Lang, string>;

export const CATEGORIES: Record<
  CategoryKey,
  {
    key: CategoryKey;
    slug: string;
    label: TriString;
    tagline: TriString;
    description: TriString;
    accentClass: string;
    badgeClass: string;
    icon: string;
  }
> = {
  sports: {
    key: "sports",
    slug: "sports",
    label: { ar: "رياضة", en: "Sports", sv: "Sport" },
    tagline: {
      ar: "كرة القدم الأوروبية والمنتخبات",
      en: "European football & national teams",
      sv: "Europeisk fotboll & landslag",
    },
    description: {
      ar: "آخر أخبار الدوريات الأوروبية الكبرى والمنتخبات العالمية، مباريات وانتقالات وتحليلات.",
      en: "Latest news from top European leagues and national teams: matches, transfers and analysis.",
      sv: "Senaste nytt från Europas toppligor och landslag: matcher, övergångar och analyser.",
    },
    accentClass: "text-[color:var(--color-sports)]",
    badgeClass: "bg-[color:var(--color-sports)]/15 text-[color:var(--color-sports)]",
    icon: "⚽",
  },
  politics: {
    key: "politics",
    slug: "worldnews",
    label: { ar: "الأخبار العالمية", en: "World News", sv: "Världsnyheter" },
    tagline: { ar: "الشرق الأوسط والعالم", en: "Middle East & world", sv: "Mellanöstern & världen" },
    description: {
      ar: "أحدث المستجدات السياسية في الشرق الأوسط والعالم، بتغطية متوازنة.",
      en: "Latest political developments from the Middle East and the world, balanced coverage.",
      sv: "Senaste politiska händelserna från Mellanöstern och världen, balanserad bevakning.",
    },
    accentClass: "text-[color:var(--color-politics)]",
    badgeClass: "bg-[color:var(--color-politics)]/15 text-[color:var(--color-politics)]",
    icon: "🗞️",
  },
  shopping: {
    key: "shopping",
    slug: "shopping",
    label: { ar: "تسوّق", en: "Shopping", sv: "Shopping" },
    tagline: { ar: "مأكولات وأثاث للمنزل", en: "Food & home furniture", sv: "Mat & hemmöbler" },
    description: {
      ar: "أفكار وعروض للتسوق المنزلي: مأكولات، أثاث، وأدوات تجعل بيتك أجمل.",
      en: "Ideas and deals for home shopping: food, furniture and tools to beautify your home.",
      sv: "Idéer och erbjudanden för hemshopping: mat, möbler och verktyg för ett finare hem.",
    },
    accentClass: "text-[color:var(--color-shopping)]",
    badgeClass: "bg-[color:var(--color-shopping)]/15 text-[color:var(--color-shopping)]",
    icon: "🛍️",
  },
  music: {
    key: "music",
    slug: "music",
    label: { ar: "موسيقى", en: "Music", sv: "Musik" },
    tagline: { ar: "أغانٍ عالمية متنوعة", en: "Diverse global songs", sv: "Variera globala låtar" },
    description: {
      ar: "اختيارات من أبرز الأغاني العالمية المتنوعة على يوتيوب، استمع مباشرة بنقرة واحدة.",
      en: "A selection of top global songs on YouTube — listen instantly with one click.",
      sv: "Ett urval av globala låtar på YouTube — lyssna direkt med ett klick.",
    },
    accentClass: "text-[color:var(--color-music)]",
    badgeClass: "bg-[color:var(--color-music)]/15 text-[color:var(--color-music)]",
    icon: "🎵",
  },
  medicine: {
    key: "medicine",
    slug: "medicine",
    label: { ar: "طب", en: "Medicine", sv: "Medicin" },
    tagline: { ar: "نصائح طبية", en: "Health & medical tips", sv: "Hälso- & medicinska tips" },
    description: {
      ar: "نصائح طبية وأخبار صحية موثوقة لحياة أكثر صحة وعافية.",
      en: "Trusted medical tips and health news for a healthier, well-balanced life.",
      sv: "Pålitliga medicinska tips och hälsonyheter för ett hälsosammare liv.",
    },
    accentClass: "text-[color:var(--color-medicine,#22c55e)]",
    badgeClass: "bg-[color:var(--color-medicine,#22c55e)]/15 text-[color:var(--color-medicine,#22c55e)]",
    icon: "🩺",
  },
  tourism: {
    key: "tourism",
    slug: "tourism",
    label: { ar: "سياحة", en: "Tourism", sv: "Turism" },
    tagline: {
      ar: "أجمل الأماكن في العالم",
      en: "The world's favorite places",
      sv: "Världens favoritplatser",
    },
    description: {
      ar: "دليلك إلى أجمل الوجهات السياحية حول العالم، أفكار رحلات وأماكن لا تُنسى.",
      en: "Your guide to the world's best travel destinations — trip ideas and unforgettable places.",
      sv: "Din guide till världens bästa resmål — reseidéer och oförglömliga platser.",
    },
    accentClass: "text-[color:var(--color-tourism,#06b6d4)]",
    badgeClass: "bg-[color:var(--color-tourism,#06b6d4)]/15 text-[color:var(--color-tourism,#06b6d4)]",
    icon: "🏝️",
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "politics",
  "sports",
  "medicine",
  "music",
  "tourism",
  "shopping",
];

export const CATEGORY_LIST = CATEGORY_ORDER.map((k) => CATEGORIES[k]);

