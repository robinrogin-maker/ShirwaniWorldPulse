import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

const YOUTUBE_PLAYLIST_URL = "https://www.youtube.com/embed/Mr5nvzJXaRA?list=RDMr5nvzJXaRA";

export const Route = createFileRoute("/music")({
  head: () => categoryHead("music"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("music")),
  component: () => (
    <div>
      <CategoryPage categoryKey="music" />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <h2 className="mb-4 text-2xl font-bold text-[color:var(--color-music)]">🎧 قائمة تشغيل مختارة</h2>
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              title="قائمة تشغيل موسيقى مزاج"
              src={YOUTUBE_PLAYLIST_URL}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            استمتع بقائمة تشغيل مختارة من يوتيوب مباشرة داخل الموقع.
          </p>
        </div>
      </section>
    </div>
  ),
  errorComponent: ArticlesError,
});
