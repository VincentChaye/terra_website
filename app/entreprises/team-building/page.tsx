import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Visite Découverte et Team Building — Terra Numerica",
  description:
    "Terra Numerica permet aux professionnels de sensibiliser leurs équipes aux sciences et horizons du numérique.",
  alternates: { canonical: "/entreprises/team-building" },
};

export default function TeamBuildingPage() {
  return (
    <div>
      <PageHeader
        title="Visite Découverte et Team Building"
        description="Sensibilisez vos équipes aux sciences et horizons du numérique dans un espace unique dédié à la culture scientifique."
        breadcrumb={[{ label: "Entreprises", href: "/entreprises" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Terra Numerica permet aux professionnels de sensibiliser leurs équipes aux sciences et
          horizons du numérique, d&apos;organiser des réunions et événements importants en privatisant des
          espaces Terra Numerica. Un dispositif analogue est proposé aux particuliers pour explorer le
          numérique de manière unique. Vous souhaitez organiser un événement, merci de nous écrire :{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
          .
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Dispositif pour une équipe de travail, de collaborateurs
        </h2>

        <p className="text-white/85">
          Terra Numerica propose des parcours d&apos;ateliers ludiques et/ou de conférences interactives
          personnalisés combinés à une programmation propre de l&apos;entreprise sur un format d&apos;une
          demi-journée ou d&apos;une journée d&apos;expérimentation et de connexion avec la recherche actuelle
          dans le domaine du numérique dont l&apos;intelligence artificielle. Les objectifs sont la
          démystification des notions techniques, l&apos;accompagnement au changement, la cohésion
          d&apos;équipe.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Dispositif pour les particuliers</h2>

        <p className="text-white/85">
          Terra Numerica propose des parcours d&apos;ateliers et/ou de conférences interactives
          personnalisés combinés à une programmation propre au groupe sur un format d&apos;une demi-journée
          ou d&apos;une journée de découvertes et de divertissement pour explorer en groupe le numérique
          dont l&apos;intelligence artificielle. Les objectifs sont une ouverture culturelle du champ du
          numérique, une expérience ludique et interactive, la cohésion du groupe.
        </p>

        {/* CTA */}
        <div className="pt-6">
          <Link
            href="/entreprises/contact"
            className="inline-block px-8 py-3 rounded font-semibold bg-tn-blue text-white hover:bg-[#1a8fd1] transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
