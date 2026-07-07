import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const categorySchema = z.enum(["sports", "politics", "shopping", "music", "medicine", "tourism", "economy", "weather", "onthisday", "cars"]);
const languageSchema = z.enum(["ar", "en", "sv"]);

export const listArticles = createServerFn({ method: "GET" })
  .inputValidator((input: { category?: string; language?: string; limit?: number }) => ({
    category: input.category ? categorySchema.parse(input.category) : undefined,
    language: input.language ? languageSchema.parse(input.language) : undefined,
    limit: Math.min(Math.max(input.limit ?? 30, 1), 100),
  }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("articles")
      .select("id, category, title, summary, source_url, source_name, image_url, published_at, language")
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (data.category) q = q.eq("category", data.category);
    if (data.language) q = q.eq("language", data.language);
    const { data: rows, error } = await q;
    if (error) {
      console.error("listArticles error", error);
      throw new Error(error.message || "Failed to load articles");
    }
    return { articles: (rows ?? []) as Article[] };
  });

export type Article = {
  id: string;
  category: "sports" | "politics" | "shopping" | "music" | "medicine" | "tourism" | "economy";
  language: "ar" | "en" | "sv";
  title: string;
  summary: string | null;
  source_url: string;
  source_name: string | null;
  image_url: string | null;
  published_at: string;
};
