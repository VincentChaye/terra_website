import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Ateliers Terra Numerica",
  description:
    "Les ateliers Terra Numerica déployés au sein des Espaces de Culture Numérique pour aborder différents aspects des sciences du numérique.",
  alternates: { canonical: "/scolaires/ateliers" },
};

export default function AteliersPage() {
  return (
    <div>
      <PageHeader
        title="Ateliers Terra Numerica"
        description="Des ateliers pédagogiques déployés au sein des Espaces de Culture Numérique pour tous les publics."
        breadcrumb={[{ label: "Scolaires", href: "/scolaires" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Les ateliers Terra Numerica sont à découvrir sur le portail des ressources. Ils sont
          déployés au sein des Espaces de Culture Numérique afin de proposer une offre pédagogique
          permettant aux publics d&apos;aborder différents aspects d&apos;une même thématique.
        </p>

        <p className="text-white/85">
          Retrouvez l&apos;intégralité des ateliers sur le{" "}
          <a
            href="https://portail.terra-numerica.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tn-blue hover:underline"
          >
            portail Terra Numerica
          </a>
          .
        </p>
      </div>
    </div>
  );
}
