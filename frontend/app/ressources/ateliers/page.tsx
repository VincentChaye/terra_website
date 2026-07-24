import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Ateliers ludiques — Terra Numerica",
  description:
    "Les ateliers Terra Numerica sont déployés au sein des Espaces de Culture Numérique pour aborder différents aspects des sciences du numérique.",
  alternates: { canonical: "/ressources/ateliers" },
};

export default function AteliersPage() {
  return (
    <div>
      <PageHeader
        title="Ateliers ludiques"
        breadcrumb={[{ label: "Ressources", href: "/ressources" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Les ateliers Terra Numerica sont à découvrir sur le portail des ressources. Ils sont déployés au sein des
          Espaces de Culture Numérique afin de proposer une offre pédagogique permettant aux publics d&apos;aborder
          différents aspects d&apos;une même thématique. Les ateliers peuvent aussi être déployés hors les murs pour des
          événements ponctuels et aussi être prêtés pour des périodes plus ou moins longues (avec possible formation).
          Terra Numerica développe également des jeux en ligne et des mallettes pédagogiques mises à disposition des
          établissements scolaires.
        </p>
        <p>
          <a
            href="https://portail.terra-numerica.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tn-blue hover:underline"
          >
            Découvrir tous les ateliers sur le portail Terra Numerica →
          </a>
        </p>
      </div>
    </div>
  );
}
