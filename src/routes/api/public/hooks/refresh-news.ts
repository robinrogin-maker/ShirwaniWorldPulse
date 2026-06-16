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
  };
};

type CategoryConfig = {
  key: "sports" | "politics" | "shopping" | "music";
  query: string;
  tbs: string;
  lang: string;
};

const CATEGORIES: CategoryConfig[] = [
  {
    key: "sports",
    query: "أخبار كرة القدم الأوروبية الدوري الإنجليزي والإسباني والإيطالي والمنتخبات",
    tbs: "qdr:d",
    lang: "ar",
  },
  {
    key: "politics",
    query: "أخبار سياسية الشرق الأوسط عاجل",
    tbs: "qdr:d",
    lang: "ar",
  },
  {
    key: "shopping",
    query: "best home furniture gourmet food shopping trends 2025",
    tbs: "qdr:w",
    lang: "en",
  },
  {
    key: "music",
    query: "world music news new album releases artists 2025",
    tbs: "qdr:w",
    lang: "en",
  },
];

async function firecrawlSearch(query: string, tbs: string, lang: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const res = await fetch("https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit: 8,
      lang,
      tbs,
      sources: ["news", "web"],
    }),
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
              const results = await firecrawlSearch(cat.query, cat.tbs, cat.lang);
              const rows = results
                .map((r) => {
                  const url = r.url || r.metadata?.sourceURL;
                  if (!url) return null;
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
                    image_url:
                      r.metadata?.ogImage || r.metadata?.["og:image"] || null,
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
                .upsert(rows, { onConflict: "source_url", count: "exact" });

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
