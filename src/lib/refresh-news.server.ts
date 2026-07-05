type FirecrawlResult = {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    ogImage?: string;
    "og:image"?: string;
    "twitter:image"?: string;
    image?: string;
  };
};

type CategoryKey = "sports" | "politics" | "shopping" | "music" | "medicine" | "tourism";
type Lang = "ar" | "en" | "sv";

type CategoryDef = {
  key: CategoryKey;
  tbs: string;
  scrape: boolean;
  limit: number;
  queries: Record<Lang, string>;
};

const CATEGORIES: CategoryDef[] = [
  {
    key: "sports",
    tbs: "qdr:d",
    scrape: true,
    limit: 8,
    queries: {
      ar: "أخبار كرة القدم الأوروبية الدوري الإنجليزي والإسباني والإيطالي والمنتخبات",
      en: "European football news Premier League La Liga Serie A national teams",
      sv: "europeisk fotboll nyheter Premier League La Liga Serie A landslag",
    },
  },
  {
    key: "politics",
    tbs: "qdr:d",
    scrape: true,
    limit: 8,
    queries: {
      ar: "أخبار سياسية الشرق الأوسط عاجل",
      en: "world news Middle East breaking news",
      sv: "världspolitik Mellanöstern senaste nyheterna",
    },
  },
  {
    key: "shopping",
    tbs: "qdr:w",
    scrape: true,
    limit: 8,
    queries: {
      ar: "أفضل أثاث منزلي ومأكولات فاخرة تسوق 2025",
      en: "best home furniture gourmet food shopping trends 2025",
      sv: "bästa hemmöbler gourmetmat shopping trender 2025",
    },
  },
  {
    key: "music",
    tbs: "qdr:m",
    scrape: false,
    limit: 12,
    queries: {
      ar: "أغاني عالمية مشهورة 2025 فيديو كليب رسمي site:youtube.com OR site:youtu.be",
      en: "popular international songs 2025 official music video site:youtube.com OR site:youtu.be",
      sv: "populära internationella låtar 2025 officiell musikvideo site:youtube.com OR site:youtu.be",
    },
  },
  {
    key: "medicine",
    tbs: "qdr:w",
    scrape: true,
    limit: 8,
    queries: {
      ar: "نصائح طبية صحية موثوقة 2025",
      en: "trusted medical health tips wellness news 2025",
      sv: "medicinska hälsotips välmående nyheter 2025",
    },
  },
  {
    key: "tourism",
    tbs: "qdr:m",
    scrape: true,
    limit: 8,
    queries: {
      ar: "أفضل وجهات سياحية في العالم 2025 دليل السفر",
      en: "best travel destinations world favorite places 2025 tourism guide",
      sv: "bästa resmål i världen favoritplatser 2025 turism guide",
    },
  },
];

const LANGS: Lang[] = ["ar", "en", "sv"];

async function firecrawlSearch(cat: CategoryDef, lang: Lang) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const body: Record<string, unknown> = {
    query: cat.queries[lang],
    limit: cat.limit,
    lang,
    tbs: cat.tbs,
    sources: cat.key === "music" ? ["web"] : ["news", "web"],
  };
  if (cat.scrape) {
    body.scrapeOptions = { formats: ["markdown"], onlyMainContent: true };
  }

  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl ${res.status}: ${txt.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    data?: { news?: FirecrawlResult[]; web?: FirecrawlResult[] } | FirecrawlResult[];
  };

  const out: FirecrawlResult[] = [];
  if (Array.isArray(json.data)) out.push(...json.data);
  else if (json.data) {
    if (json.data.news) out.push(...json.data.news);
    if (json.data.web) out.push(...json.data.web);
  }
  return out;
}

function hostname(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function youtubeThumb(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

function extractImage(r: FirecrawlResult, url: string): string | null {
  const yt = youtubeThumb(url);
  if (yt) return yt;
  const m = r.metadata ?? {};
  return (
    m.ogImage ||
    m["og:image"] ||
    m["twitter:image"] ||
    m.image ||
    null
  );
}

export type RefreshResult = {
  ok: boolean;
  inserted: number;
  errors?: string[];
};

export async function runRefreshNews(): Promise<RefreshResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let totalInserted = 0;
  const errors: string[] = [];

  for (const cat of CATEGORIES) {
    for (const lang of LANGS) {
      try {
        const results = await firecrawlSearch(cat, lang);
        const rows = results
          .map((r) => {
            const url = r.url || r.metadata?.sourceURL;
            if (!url) return null;
            if (cat.key === "music" && !youtubeId(url)) return null;
            const title = (r.title || r.metadata?.title || "").trim();
            if (!title) return null;
            return {
              category: cat.key,
              language: lang,
              title: title.slice(0, 300),
              summary: (r.description || r.metadata?.description || "")
                .toString()
                .slice(0, 600),
              source_url: url,
              source_name: hostname(url),
              image_url: extractImage(r, url),
              published_at: new Date().toISOString(),
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);

        const seen = new Set<string>();
        const unique = rows.filter((r) => {
          if (seen.has(r.source_url)) return false;
          seen.add(r.source_url);
          return true;
        });
        if (unique.length === 0) continue;

        const { error, count } = await supabaseAdmin
          .from("articles")
          .upsert(unique, { onConflict: "source_url,language", count: "exact" });

        if (error) {
          errors.push(`${cat.key}/${lang}: ${error.message}`);
        } else {
          totalInserted += count ?? rows.length;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${cat.key}/${lang}: ${msg}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    inserted: totalInserted,
    errors: errors.length ? errors : undefined,
  };
}
