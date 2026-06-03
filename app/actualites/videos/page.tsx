import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Vidéothèque Terra Numerica",
  description:
    "Revivez des temps forts de Terra Numerica : événements, ateliers et conférences en vidéo.",
  alternates: { canonical: "/actualites/videos" },
};

export default function VideosPage() {
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
      </div>
    </div>
  );
}
