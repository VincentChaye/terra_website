import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Livret d'activités Science Tour Terra Numerica",
  description:
    "Livret d'activités publié dans le cadre du Science Tour Terra Numerica — 60 pages, 40 fiches, à destination des médiateurs, enseignants et citoyens.",
  alternates: { canonical: "/ressources/livret-science-tour" },
};

export default function LivretScienceTourPage() {
  return (
    <div>
      <PageHeader
        title="Livret d'activités Science Tour Terra Numerica"
        breadcrumb={[{ label: "Ressources", href: "/ressources" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Dans le cadre du Science Tour Terra Numerica, un livret d&apos;activités (60 pages, 40 fiches) a été publié
          le 1er juillet 2025 par les deux porteurs Les Petits Débrouillards PACA et Terra Numerica ainsi que par dix
          partenaires du projet. Ce livret est à destination des médiateurs, enseignants et citoyens à partir de
          quarante ateliers proposés lors des événements réalisés au sein de dix territoires de trois départements.
        </p>
      </div>
    </div>
  );
}
