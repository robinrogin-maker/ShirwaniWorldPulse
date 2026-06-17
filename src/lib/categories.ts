export type CategoryKey = "sports" | "politics" | "shopping" | "music";

export const CATEGORIES: Record<
  CategoryKey,
  {
    key: CategoryKey;
    label: string;
    tagline: string;
    description: string;
    accentClass: string;
    badgeClass: string;
    query: string;
    icon: string;
  }
> = {
  sports: {
    key: "sports",
    label: "رياضة",
    tagline: "كرة القدم الأوروبية والمنتخبات",
    description:
      "آخر أخبار الدوريات الأوروبية الكبرى والمنتخبات العالمية، مباريات وانتقالات وتحليلات.",
    accentClass: "text-[color:var(--color-sports)]",
    badgeClass: "bg-[color:var(--color-sports)]/15 text-[color:var(--color-sports)]",
    query:
      "أخبار كرة القدم الأوروبية الدوري الإنجليزي الإسباني الإيطالي والمنتخبات العالمية اليوم",
    icon: "⚽",
  },
  politics: {
    key: "politics",
    label: "سياسة",
    tagline: "الشرق الأوسط والعالم",
    description: "أحدث المستجدات السياسية في الشرق الأوسط والعالم، بتغطية متوازنة.",
    accentClass: "text-[color:var(--color-politics)]",
    badgeClass: "bg-[color:var(--color-politics)]/15 text-[color:var(--color-politics)]",
    query: "أخبار سياسية عاجلة الشرق الأوسط اليوم",
    icon: "🗞️",
  },
  shopping: {
    key: "shopping",
    label: "تسوّق",
    tagline: "مأكولات وأثاث للمنزل",
    description: "أفكار وعروض للتسوق المنزلي: مأكولات، أثاث، وأدوات تجعل بيتك أجمل.",
    accentClass: "text-[color:var(--color-shopping)]",
    badgeClass: "bg-[color:var(--color-shopping)]/15 text-[color:var(--color-shopping)]",
    query: "best home furniture and gourmet food shopping ideas 2025",
    icon: "🛍️",
  },
  music: {
    key: "music",
    label: "موسيقى",
    tagline: "أغانٍ عالمية متنوعة",
    description:
      "اختيارات من أبرز الأغاني العالمية المتنوعة على يوتيوب، استمع مباشرة بنقرة واحدة.",
    accentClass: "text-[color:var(--color-music)]",
    badgeClass: "bg-[color:var(--color-music)]/15 text-[color:var(--color-music)]",
    query: "popular international songs 2025 official music video",
    icon: "🎵",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
