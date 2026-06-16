import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const categorySchema = z.enum(["sports", "politics", "shopping", "music"]);

export const listArticles = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string; limit?: number }) => ({
    category: input.category ? categorySchema.parse(input.category) : undefined,
    limit: Math.min(Math.max(input.limit ?? 30, 1), 100),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("articles")
      .select("id, category, title, summary, source_url, source_name, image_url, published_at")
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) {
      console.error("listArticles error", error);
      return { articles: [] as Article[] };
    }
    return { articles: (rows ?? []) as Article[] };
  });

export const refreshNews = createServerFn({ method: "POST" }).handler(async () => {
  const res = await fetch("/api/public/hooks/refresh-news", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  return data as { ok: boolean; inserted?: number; error?: string };
});

export type Article = {
  id: string;
  category: "sports" | "politics" | "shopping" | "music";
  title: string;
  summary: string | null;
  source_url: string;
  source_name: string | null;
  image_url: string | null;
  published_at: string;
};
