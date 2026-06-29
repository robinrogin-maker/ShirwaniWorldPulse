import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { refreshNewsFn } from "@/lib/refresh-news.functions";
import { useI18n } from "@/lib/i18n";

export function ArticlesError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const refresh = useServerFn(refreshNewsFn);
  const { t } = useI18n();
  const [retrying, setRetrying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function handleRetry() {
    setRetrying(true);
    try {
      await router.invalidate();
      reset();
    } finally {
      setRetrying(false);
    }
  }

  async function handleRefreshSource() {
    setRefreshing(true);
    const id = toast.loading(t("fetching"));
    try {
      const json = await refresh();
      if (json.ok) {
        toast.success(`${t("updated")} (${json.inserted ?? 0} ${t("items")})`, { id });
        await router.invalidate();
        reset();
      } else {
        const msg = json.errors?.join(" • ") || t("fetchFailed");
        toast.error(msg, { id, duration: 6000 });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("offline"), { id });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold text-foreground mb-2">{t("errorTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-1">{t("errorBody")}</p>
        <p className="text-xs text-muted-foreground/80 mb-5 break-words font-mono">
          {error.message || t("unknownError")}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={handleRetry}
            disabled={retrying || refreshing}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <span className={retrying ? "animate-spin" : ""}>↻</span>
            {retrying ? t("retrying") : t("retry")}
          </button>
          <button
            onClick={handleRefreshSource}
            disabled={retrying || refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold transition hover:bg-secondary disabled:opacity-50"
          >
            {refreshing ? t("fetchingSource") : t("fetchFromSource")}
          </button>
        </div>
      </div>
    </div>
  );
}
