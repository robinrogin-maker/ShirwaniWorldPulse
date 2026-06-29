import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage, categoryQuery, categoryHead } from "@/components/CategoryPage";
import { ArticlesError } from "@/components/ArticlesError";
import { useI18n } from "@/lib/i18n";

type Tri = { ar: string; en: string; sv: string };
const PLAYLISTS: { title: Tri; src: string; description: Tri }[] = [
  {
    title: {
      ar: "🎵 أغانٍ عالمية متنوعة",
      en: "🎵 Diverse global songs",
      sv: "🎵 Globala låtar i urval",
    },
    src: "https://www.youtube.com/embed/z35DsBeFZ1E?list=RDz35DsBeFZ1E",
    description: {
      ar: "مزيج من الأغاني العالمية المشهورة.",
      en: "A mix of popular international songs.",
      sv: "En blandning av populära internationella låtar.",
    },
  },
  {
    title: {
      ar: "🎶 قائمة تشغيل أخرى",
      en: "🎶 Another playlist",
      sv: "🎶 Ytterligare en spellista",
    },
    src: "https://www.youtube.com/embed/Av7bF4oEYj8?list=PLaKVUlkPwDym-ZYMPdNs2zwokM53pkhjK",
    description: {
      ar: "قائمة تشغيل يوتيوب إضافية مختارة لك.",
      en: "An extra YouTube playlist curated for you.",
      sv: "En extra YouTube-spellista, utvald åt dig.",
    },
  },
  {
    title: {
      ar: "🎧 قائمة تشغيل مختارة",
      en: "🎧 Featured playlist",
      sv: "🎧 Utvald spellista",
    },
    src: "https://www.youtube.com/embed/Mr5nvzJXaRA?list=RDMr5nvzJXaRA",
    description: {
      ar: "استمتع بقائمة تشغيل مختارة من يوتيوب مباشرة داخل الموقع.",
      en: "Enjoy a featured YouTube playlist directly inside the site.",
      sv: "Njut av en utvald YouTube-spellista direkt på sajten.",
    },
  },
];

export const Route = createFileRoute("/music")({
  head: () => categoryHead("music"),
  loader: ({ context }) => context.queryClient.ensureQueryData(categoryQuery("music")),
  component: MusicPage,
  errorComponent: ArticlesError,
});

function MusicPage() {
  const { lang } = useI18n();
  return (
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
                {playlist.title[lang]}
              </h2>
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  title={playlist.title[lang]}
                  src={playlist.src}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{playlist.description[lang]}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
