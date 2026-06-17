import { createFileRoute } from "@tanstack/react-router";

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

type CategoryConfig = {
  key: "sports" | "politics" | "shopping" | "music";
  query: string;
  tbs: string;
  lang: string;
  scrape: boolean;
  limit: number;
};

const CATEGORIES: CategoryConfig[] = [
  {
    key: "sports",
    query: "أخبار كرة القدم الأوروبية الدوري الإنجليزي والإسباني والإيطالي والمنتخبات",
    tbs: "qdr:d",
    lang: "ar",
    scrape: true,
    limit: 8,
  },
  {
    key: "politics",
    query: "أخبار سياسية الشرق الأوسط عاجل",
    tbs: "qdr:d",
    lang: "ar",
    scrape: true,
    limit: 8,
  },
  {
    key: "shopping",
    query: "best home furniture gourmet food shopping trends 2025",
    tbs: "qdr:w",
    lang: "en",
    scrape: true,
    limit: 8,
  },
  {
    // Music: actual songs from YouTube, not music news
    key: "music",
    query:
      "popular international songs 2025 official music video site:youtube.com OR site:youtu.be",
    tbs: "qdr:m",
    lang: "en",
    scrape: false,
    limit: 12,
  },
];

async function firecrawlSearch(cat: CategoryConfig) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const body: Record<string, unknown> = {
    query: cat.query,
    limit: cat.limit,
    lang: cat.lang,
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

export const Route = createFileRoute("/api/public/hooks/refresh-news")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          let totalInserted = 0;
          const errors: string[] = [];

          for (const cat of CATEGORIES) {
            try {
              const results = await firecrawlSearch(cat);
              const rows = results
                .map((r) => {
                  const url = r.url || r.metadata?.sourceURL;
                  if (!url) return null;
                  // For music, keep only YouTube links
                  if (cat.key === "music" && !youtubeId(url)) return null;
                  const title = (r.title || r.metadata?.title || "").trim();
                  if (!title) return null;
                  return {
                    category: cat.key,
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

              // dedupe by source_url within batch
              const seen = new Set<string>();
              const unique = rows.filter((r) => {
                if (seen.has(r.source_url)) return false;
                seen.add(r.source_url);
                return true;
              });
              if (unique.length === 0) continue;

              const { error, count } = await supabaseAdmin
                .from("articles")
                .upsert(unique, { onConflict: "source_url", count: "exact" });

              if (error) {
                errors.push(`${cat.key}: ${error.message}`);
              } else {
                totalInserted += count ?? rows.length;
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              errors.push(`${cat.key}: ${msg}`);
            }
          }

          return Response.json({
            ok: errors.length === 0,
            inserted: totalInserted,
            errors: errors.length ? errors : undefined,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("refresh-news fatal", msg);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
      GET: async () =>
        Response.json({ hint: "POST to refresh news from Firecrawl" }),
    },
  },
});
