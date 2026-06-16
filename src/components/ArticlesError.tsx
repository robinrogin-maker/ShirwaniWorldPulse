import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export function ArticlesError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
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
    const t = toast.loading("جاري إعادة جلب الأخبار من المصدر...");
    try {
      const res = await fetch("/api/public/hooks/refresh-news", { method: "POST" });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        inserted?: number;
        error?: string;
        errors?: string[];
      };
      if (json.ok) {
        toast.success(`تم الجلب (${json.inserted ?? 0} عنصر)`, { id: t });
        await router.invalidate();
        reset();
      } else {
        const msg = json.error || json.errors?.join(" • ") || "تعذّر الجلب من Firecrawl";
        toast.error(msg, { id: t, duration: 6000 });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "انقطاع في الاتصال", { id: t });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold text-foreground mb-2">تعذّر تحميل الأخبار</h2>
        <p className="text-sm text-muted-foreground mb-1">
          حدث خطأ أثناء جلب الأخبار من المصدر أو قد يكون الاتصال بالإنترنت منقطعاً.
        </p>
        <p className="text-xs text-muted-foreground/80 mb-5 break-words font-mono">
          {error.message || "خطأ غير معروف"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={handleRetry}
            disabled={retrying || refreshing}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <span className={retrying ? "animate-spin" : ""}>↻</span>
            {retrying ? "جارٍ المحاولة..." : "إعادة المحاولة"}
          </button>
          <button
            onClick={handleRefreshSource}
            disabled={retrying || refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm font-semibold transition hover:bg-secondary disabled:opacity-50"
          >
            {refreshing ? "جاري الجلب..." : "جلب من المصدر"}
          </button>
        </div>
      </div>
    </div>
  );
}
