import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";

const PLAYLISTS = [
  {
    title: "🎵 أغانٍ عالمية متنوعة",
    src: "https://www.youtube.com/embed/z35DsBeFZ1E?list=RDz35DsBeFZ1E",
    description: "مزيج من الأغاني العالمية المشهورة.",
  },
  {
    title: "🎶 قائمة تشغيل أخرى",
    src: "https://www.youtube.com/embed/Av7bF4oEYj8?list=PLaKVUlkPwDym-ZYMPdNs2zwokM53pkhjK",
    description: "قائمة تشغيل يوتيوب إضافية مختارة لك.",
  },
  {
    title: "🎧 قائمة تشغيل مختارة",
    src: "https://www.youtube.com/embed/Mr5nvzJXaRA?list=RDMr5nvzJXaRA",
    description: "استمتع بقائمة تشغيل مختارة من يوتيوب مباشرة داخل الموقع.",
  },
];

export const Route = createFileRoute("/music")({
  head: () => categoryHead("music"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("music")),
  component: () => (
    <div>
      <CategoryPage categoryKey="music" />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="grid gap-6">
          {PLAYLISTS.map((playlist) => (
            <div
              key={playlist.src}
              className="rounded-2xl border border-border bg-card p-4 sm:p-6"
            >
              <h2 className="mb-4 text-2xl font-bold text-[color:var(--color-music)]">
                {playlist.title}
              </h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  title={playlist.title}
                  src={playlist.src}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{playlist.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
  errorComponent: ArticlesError,
});
