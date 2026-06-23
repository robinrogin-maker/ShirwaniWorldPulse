import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { refreshNewsFn } from "@/lib/refresh-news.functions";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const refresh = useServerFn(refreshNewsFn);

  async function handle() {
    setLoading(true);
    const t = toast.loading("جاري جلب آخر الأخبار...");
    try {
      const json = await refresh();
      if (json.ok) {
        toast.success(`تم التحديث (${json.inserted ?? 0} عنصر)`, { id: t });
        await router.invalidate();
      } else {
        const msg = json.errors?.join(" • ") || "فشل الجلب";
        toast.error(msg, {
          id: t,
          duration: 8000,
          action: { label: "إعادة المحاولة", onClick: () => handle() },
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "انقطاع في الاتصال بالإنترنت";
      toast.error(msg, {
        id: t,
        duration: 8000,
        action: { label: "إعادة المحاولة", onClick: () => handle() },
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
    >
      <span className={loading ? "animate-spin" : ""}>↻</span>
      {loading ? "جاري التحديث..." : "تحديث الأخبار"}
    </button>
  );
}
