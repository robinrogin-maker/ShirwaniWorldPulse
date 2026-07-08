import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { runRefreshNews, type RefreshResult } from "./refresh-news.server";

export const refreshNewsFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<RefreshResult> => {
    const adminIds = (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (adminIds.length === 0 || !adminIds.includes(context.userId)) {
      throw new Response("Forbidden", { status: 403 });
    }
    return runRefreshNews();
  });
