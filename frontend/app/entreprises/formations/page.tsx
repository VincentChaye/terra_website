import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Modules Formation — Terra Numerica",
  description:
    "Terra Numerica propose des formations pour les enseignants, professionnels de la médiation scientifique et salariés d'entreprises.",
  alternates: { canonical: "/entreprises/formations" },
};

export default function FormationsPage() {
  return (
    <div>
      <PageHeader
        title="Modules Formation"
        description="Des formations pour les enseignants, les professionnels de la médiation scientifique et les salariés d'entreprises."
        breadcrumb={[{ label: "Entreprises", href: "/entreprises" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Terra Numerica propose des formations pour les enseignants et professionnels de la
          médiation scientifique (personnels de médiathèques, d&apos;associations et de structures et
          d&apos;organismes intéressés par la diffusion de la culture du numérique). Terra Numerica et ses
          partenaires proposent également des formations pour les salariés d&apos;entreprises et
          d&apos;organismes. Des formations internes à l&apos;animation d&apos;ateliers Terra Numerica sont
          régulièrement proposées. Une question ? Une demande ?{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Formation 2025-2026 – Primaire
        </h2>

        <ul className="space-y-2 text-white/85 list-disc list-inside">
          <li>
            <span className="font-medium">14456 – Algorithme : activités débranchées</span>{" "}
            (Alpes-Maritimes, Terra Numerica Sophia). Dans un bâtiment de plus de 500 mètres carrés
            dédié à la diffusion de la culture des sciences du numérique, Terra Numerica vous propose
            de découvrir le fonctionnement des algorithmes et des ordinateurs sans utiliser d&apos;écran
            grâce à des jeux grandeur nature ou de plateaux ludiques et interactifs.
          </li>
          <li>
            <span className="font-medium">32352 – Algorithme : activités débranchées</span> (Var,
            Toulon) (mode hybride).
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Formation 2025-2026 – Secondaire
        </h2>

        <ul className="space-y-2 text-white/85 list-disc list-inside">
          <li>
            <span className="font-medium">Découverte IA (quatre sessions) DRANE/DAAC/Terra Numerica</span>.
            S&apos;approprier les notions d&apos;algorithmes et d&apos;Intelligence Artificielle avec Terra Numerica.
          </li>
          <li>
            <span className="font-medium">
              61661 – Découverte des outils d&apos;Intelligence Artificielle Générative
            </span>
            . Formation ouverte aux Professeurs Economie – Gestion des Lycées Lycées Professionnels.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Formation initiale 2025-2026
        </h2>

        <ul className="space-y-2 text-white/85 list-disc list-inside">
          <li>
            <span className="font-medium">
              Inspé de Nice – Usages créatifs du numérique / IA (DIU Entrée dans le métiers, Bloc
              Innover)
            </span>
            . Cinq sessions à Terra Numerica Sophia en 2026.
          </li>
        </ul>
      </div>
    </div>
  );
}
