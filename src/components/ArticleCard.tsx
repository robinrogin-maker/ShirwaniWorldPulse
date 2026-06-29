import type { Article } from "@/lib/articles.functions";
import { CATEGORIES } from "@/lib/categories";
import { useI18n, timeAgo } from "@/lib/i18n";

export function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const cat = CATEGORIES[article.category];
  const { lang, t } = useI18n();
  return (
    <a
      href={article.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`card-hover group flex flex-col overflow-hidden rounded-xl border border-border bg-card ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <div
        className={`relative w-full overflow-hidden bg-secondary ${
          featured ? "aspect-[16/10]" : "aspect-[16/9]"
        }`}
      >
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-6xl opacity-30">
            {cat.icon}
          </div>
        )}
        <span
          className={`absolute top-3 end-3 rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${cat.badgeClass}`}
        >
          {cat.label[lang]}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className={`font-bold leading-snug group-hover:text-primary transition-colors ${
            featured ? "text-xl md:text-2xl" : "text-base"
          }`}
        >
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
          <span>{article.source_name ?? t("source")}</span>
          <span>{timeAgo(article.published_at, lang)}</span>
        </div>
      </div>
    </a>
  );
}
