import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import { getVideos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Vidéothèque Terra Numerica",
  description:
    "Revivez des temps forts de Terra Numerica : événements, ateliers et conférences en vidéo.",
  alternates: { canonical: "/actualites/videos" },
};

export default function VideosPage() {
  const videos = getVideos(); // synchrone → page statique

  return (
    <div>
      <PageHeader
        title="Vidéothèque"
        breadcrumb={[{ label: "Actualités", href: "/actualites" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Revivez des temps forts de Terra Numerica !
        </p>

        {videos.length === 0 ? (
          <p className="text-white/85 leading-relaxed">
            Retrouvez toutes les vidéos Terra Numerica sur notre chaîne YouTube :{" "}
            <a
              href="https://www.youtube.com/@TerraNumericaOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tn-blue hover:underline"
            >
              youtube.com/@TerraNumericaOfficial
            </a>
            .
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {videos.map((video) => (
              <article
                key={video.id}
                className="rounded-xl border border-white/10 bg-white/3 overflow-hidden"
              >
                {video.youtubeId && (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
                <div className="px-4 py-3">
                  <h2 className="text-sm font-semibold text-white leading-snug">{video.title}</h2>
                  {video.description && (
                    <p className="text-white/60 text-xs mt-1 leading-relaxed">{video.description}</p>
                  )}
                  <p className="text-white/35 text-xs mt-1">{video.date.slice(0, 4)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
