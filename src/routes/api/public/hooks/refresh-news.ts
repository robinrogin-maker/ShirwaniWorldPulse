import { createFileRoute } from "@tanstack/react-router";
import { runRefreshNews } from "@/lib/refresh-news.server";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export const Route = createFileRoute("/api/public/hooks/refresh-news")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.REFRESH_SECRET;
        if (!expected) {
          console.error("refresh-news: REFRESH_SECRET is not configured");
          return new Response("Not found", { status: 404 });
        }

        const provided =
          request.headers.get("x-refresh-secret") ??
          (request.headers.get("authorization")?.startsWith("Bearer ")
            ? request.headers.get("authorization")!.slice(7)
            : null);

        if (!provided || !timingSafeEqual(provided, expected)) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const result = await runRefreshNews();
          return Response.json(result);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error("refresh-news fatal", msg);
          return Response.json({ ok: false, error: "Refresh failed" }, { status: 500 });
        }
      },
    },
  },
});
