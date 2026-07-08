import type { Lang } from "./i18n";

export type CategoryKey =
  | "sports"
  | "politics"
  | "shopping"
  | "music"
  | "medicine"
  | "tourism"
  | "economy"
  | "weather"
  | "onthisday"
  | "cars";

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
    label: { ar: "الرياضة", en: "Sports", sv: "Sport" },
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
    label: { ar: "الموسيقى", en: "Music", sv: "Musik" },
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
    slug: "health",
    label: { ar: "الصحة", en: "Health", sv: "Hälsa" },
    tagline: { ar: "نصائح صحية", en: "Health & wellness tips", sv: "Hälso- & välmåendetips" },
    description: {
      ar: "نصائح صحية وأخبار طبية موثوقة لحياة أكثر صحة وعافية.",
      en: "Trusted health and medical tips for a healthier, well-balanced life.",
      sv: "Pålitliga hälso- och medicinska tips för ett hälsosammare liv.",
    },
    accentClass: "text-[color:var(--color-medicine,#22c55e)]",
    badgeClass: "bg-[color:var(--color-medicine,#22c55e)]/15 text-[color:var(--color-medicine,#22c55e)]",
    icon: "🩺",
  },
  economy: {
    key: "economy",
    slug: "economy",
    label: { ar: "الأقتصاد", en: "Economy", sv: "Ekonomi" },
    tagline: {
      ar: "أخبار الأسواق والعملات العالمية",
      en: "Global markets & currency exchange",
      sv: "Globala marknader & valutaväxling",
    },
    description: {
      ar: "أحدث الأخبار الاقتصادية العالمية وأسعار البورصة والعملات (بيع وشراء).",
      en: "Latest global economic news, stock markets and currency exchange rates (buy & sell).",
      sv: "Senaste globala ekonominyheter, aktiemarknader och valutakurser (köp & sälj).",
    },
    accentClass: "text-[color:var(--color-economy,#f59e0b)]",
    badgeClass: "bg-[color:var(--color-economy,#f59e0b)]/15 text-[color:var(--color-economy,#f59e0b)]",
    icon: "💹",
  },
  tourism: {
    key: "tourism",
    slug: "tourism",
    label: { ar: "السياحة", en: "Tourism", sv: "Turism" },
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
  weather: {
    key: "weather",
    slug: "weather",
    label: { ar: "الطقس", en: "Weather", sv: "Väder" },
    tagline: {
      ar: "توقعات السويد والعراق ومدن كبرى",
      en: "Sweden, Iraq & major cities forecasts",
      sv: "Prognoser för Sverige, Irak & storstäder",
    },
    description: {
      ar: "توقعات الطقس اليومية للسويد والعراق، ودرجات الحرارة في المدن الكبرى في أوروبا والشرق الأوسط.",
      en: "Daily weather forecasts for Sweden and Iraq, plus temperatures for major European and Middle Eastern cities.",
      sv: "Dagliga väderprognoser för Sverige och Irak, samt temperaturer för storstäder i Europa och Mellanöstern.",
    },
    accentClass: "text-[color:var(--color-weather,#38bdf8)]",
    badgeClass: "bg-[color:var(--color-weather,#38bdf8)]/15 text-[color:var(--color-weather,#38bdf8)]",
    icon: "⛅",
  },
  onthisday: {
    key: "onthisday",
    slug: "onthisday",
    label: { ar: "حدث في مثل هذا اليوم", en: "On This Day", sv: "Denna dag i historien" },
    tagline: {
      ar: "أحداث تاريخية مؤثرة",
      en: "Impactful historical events",
      sv: "Betydelsefulla historiska händelser",
    },
    description: {
      ar: "أبرز الأحداث المؤثرة تاريخياً وعالمياً: سياسة، حروب، علوم، رياضة، أديان، طب وكوارث طبيعية.",
      en: "Notable historical world events: politics, wars, science, sports, religion, medicine and natural disasters.",
      sv: "Viktiga historiska världshändelser: politik, krig, vetenskap, sport, religion, medicin och naturkatastrofer.",
    },
    accentClass: "text-[color:var(--color-onthisday,#a78bfa)]",
    badgeClass: "bg-[color:var(--color-onthisday,#a78bfa)]/15 text-[color:var(--color-onthisday,#a78bfa)]",
    icon: "📜",
  },
  cars: {
    key: "cars",
    slug: "cars",
    label: { ar: "عالم السيارات", en: "Cars", sv: "Bilvärlden" },
    tagline: {
      ar: "أكثر السيارات مرغوبة عالمياً",
      en: "Most desired cars worldwide",
      sv: "Världens mest eftertraktade bilar",
    },
    description: {
      ar: "تعريف بأكثر السيارات مرغوباً في شرائها حول العالم، مع مواصفاتها وميزاتها التي تميّزها.",
      en: "The world's most desired cars — specs and standout features that set them apart.",
      sv: "Världens mest eftertraktade bilar — specifikationer och egenskaper som utmärker dem.",
    },
    accentClass: "text-[color:var(--color-cars,#ef4444)]",
    badgeClass: "bg-[color:var(--color-cars,#ef4444)]/15 text-[color:var(--color-cars,#ef4444)]",
    icon: "🚗",
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "politics",
  "economy",
  "sports",
  "medicine",
  "music",
  "tourism",
];

export const CATEGORY_LIST = CATEGORY_ORDER.map((k) => CATEGORIES[k]);



