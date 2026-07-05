import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listArticles } from "@/lib/articles.functions";
import { ArticleCard } from "@/components/ArticleCard";
import { RefreshButton } from "@/components/RefreshButton";
import { ArticlesError } from "@/components/ArticlesError";
import { CATEGORY_LIST, type CategoryKey } from "@/lib/categories";
import { useI18n, type Lang } from "@/lib/i18n";

function allArticlesQuery(language: Lang = "ar") {
  return queryOptions({
    queryKey: ["articles", "all", language],
    queryFn: () => listArticles({ data: { language, limit: 80 } }),
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "World Spectrum — everything that matters, in one place" },
      {
        name: "description",
        content:
          "World Spectrum: European football news, Middle East politics, home shopping, world music, medical tips and tourism.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allArticlesQuery("ar")),
  component: HomePage,
  errorComponent: ArticlesError,
});

function HomePage() {
  const { lang, t } = useI18n();
  const { data } = useSuspenseQuery(allArticlesQuery(lang));
  const articles = data.articles;

  const byCat = {} as Record<CategoryKey, typeof articles>;
  for (const c of CATEGORY_LIST) byCat[c.key] = [];
  for (const a of articles) {
    if (byCat[a.category]) byCat[a.category].push(a);
  }

  const isEmpty = articles.length === 0;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="py-12 md:py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {t("heroBadge")}
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          <span className="text-gradient-gold">World Spectrum</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("heroSub")}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <RefreshButton />
          <Link
            to="/sports"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            {t("browseSections")} →
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-12">
        {CATEGORY_LIST.map((c) => (
          <Link
            key={c.key}
            to={`/${c.slug}`}
            className="card-hover group rounded-xl border border-border bg-card p-5"
          >
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className={`text-lg font-bold ${c.accentClass}`}>{c.label[lang]}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.tagline[lang]}</div>
          </Link>
        ))}
      </section>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <>
          {CATEGORY_LIST.map((c) => {
            const items = byCat[c.key];
            if (!items || items.length === 0) return null;
            return (
              <section key={c.key} className="mb-14">
                <div className="flex items-end justify-between mb-5 border-b border-border pb-3">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2">
                      <span>{c.icon}</span>
                      <span className={c.accentClass}>{c.label[lang]}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{c.tagline[lang]}</p>
                  </div>
                  <Link
                    to={`/${c.slug}`}
                    className="text-sm font-semibold text-primary hover:underline whitespace-nowrap"
                  >
                    {t("more")} →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {items.slice(0, 6).map((a, idx) => (
                    <ArticleCard key={a.id} article={a} featured={idx === 0} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </main>
  );
}

function EmptyState() {
  const { lang, t } = useI18n();
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-10 text-center">
      <div className="text-5xl mb-4">📰</div>
      <h2 className="text-2xl font-bold mb-2">{t("empty")}</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">{t("emptyHint")}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {CATEGORY_LIST.map((c) => (
          <div key={c.key} className="rounded-lg border border-border bg-background/50 p-4">
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className={`font-bold ${c.accentClass}`}>{c.label[lang]}</div>
            <div className="text-xs text-muted-foreground">{c.tagline[lang]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
