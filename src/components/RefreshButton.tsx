import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { refreshNewsFn } from "@/lib/refresh-news.functions";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const refresh = useServerFn(refreshNewsFn);
  const { t } = useI18n();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handle() {
    setLoading(true);
    const id = toast.loading(t("fetching"));
    try {
      const json = await refresh();
      if (json.ok) {
        toast.success(`${t("updated")} (${json.inserted ?? 0} ${t("items")})`, { id });
        await router.invalidate();
      } else {
        const msg = json.errors?.join(" • ") || t("fetchFailed");
        toast.error(msg, {
          id,
          duration: 8000,
          action: { label: t("retry"), onClick: () => handle() },
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("offline");
      toast.error(msg, {
        id,
        duration: 8000,
        action: { label: t("retry"), onClick: () => handle() },
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
      {loading ? t("refreshing") : t("refresh")}
    </button>
  );
}
