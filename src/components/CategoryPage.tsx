import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listArticles } from "@/lib/articles.functions";
import { CATEGORIES, type CategoryKey } from "@/lib/categories";
import { ArticleCard } from "@/components/ArticleCard";
import { RefreshButton } from "@/components/RefreshButton";
import { useI18n, type Lang } from "@/lib/i18n";

export function categoryQuery(key: CategoryKey, language: Lang = "ar") {
  return queryOptions({
    queryKey: ["articles", key, language],
    queryFn: () => listArticles({ data: { category: key, language, limit: 60 } }),
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
}

export function categoryHead(key: CategoryKey) {
  const c = CATEGORIES[key];
  return {
    meta: [
      { title: `${c.label.en} — World Spectrum` },
      { name: "description", content: c.description.en },
      { property: "og:title", content: `${c.label.en} on World Spectrum — ${c.tagline.en}` },
      { property: "og:description", content: c.description.en },
    ],
  };
}

export function CategoryPage({ categoryKey }: { categoryKey: CategoryKey }) {
  const c = CATEGORIES[categoryKey];
  const { lang, t } = useI18n();
  const { data } = useSuspenseQuery(categoryQuery(categoryKey, lang));
  const articles = data.articles;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${c.badgeClass}`}>
            <span>{c.icon}</span>
            <span>{t("section")}</span>
          </div>
          <h1 className={`mt-3 text-4xl md:text-5xl font-black ${c.accentClass}`}>{c.label[lang]}</h1>
          <p className="mt-2 text-muted-foreground max-w-xl">{c.description[lang]}</p>
        </div>
        <RefreshButton />
      </header>

      {articles.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="text-4xl mb-3">{c.icon}</div>
          <p className="text-muted-foreground">{t("noItems")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a, idx) => (
            <ArticleCard key={a.id} article={a} featured={idx === 0} />
          ))}
        </div>
      )}
    </main>
  );
}
