import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Conférences interactives — Terra Numerica",
  description:
    "Conférences grand public et scolaires sur la géométrie, les réseaux, l'IA, le football et bien plus — destinées à des publics variés.",
  alternates: { canonical: "/ressources/conferences" },
};

export default function ConferencesPage() {
  return (
    <div>
      <PageHeader
        title="Conférences interactives"
        breadcrumb={[{ label: "Ressources", href: "/ressources" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Que ce soit en géométrie, en histoire (oui oui), le football (mais oui aussi) ou encore les réseaux, les
          algorithmes, la théorie des graphes ou la biologie, les conférences proposées sont destinées à des publics
          variés et peuvent, pour certaines d&apos;entre elles, être adaptées en fonction du niveau de l&apos;auditoire.
          Découvrir toutes les conférences Terra Numerica sur notre portail.
        </p>
        <p>
          <a
            href="https://portail.terra-numerica.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tn-blue hover:underline"
          >
            Accéder au portail Terra Numerica →
          </a>
        </p>
      </div>
    </div>
  );
}
