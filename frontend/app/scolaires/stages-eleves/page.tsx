import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Stages élèves — Terra Numerica",
  description:
    "Terra Numerica accueille des stagiaires (3e et seconde) pour des stages de découverte des métiers du numérique et de la recherche scientifique.",
  alternates: { canonical: "/scolaires/stages-eleves" },
};

export default function StagesElevesPage() {
  return (
    <div>
      <PageHeader
        title="Stages élèves"
        description="Des stages de découverte pour les collégiens et lycéens au sein de l'espace Terra Numerica Sophia."
        breadcrumb={[{ label: "Scolaires", href: "/scolaires" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Terra Numerica accueille des stagiaires (3e et seconde) au sein de l&apos;espace Terra Numerica
          Sophia. Ces stages de découverte permettent aux collégiens et lycéens de découvrir les
          métiers du numérique et de la recherche scientifique.
        </p>

        <p className="text-white/85">
          Pour toute demande de stage, merci de nous écrire :{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
