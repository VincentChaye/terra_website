import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Ressources ludiques — Terra Numerica",
  description:
    "Terra Numerica créé des ressources ludiques pour découvrir, explorer et expérimenter les sciences du numérique au sein du Lab Créativité : ateliers ludiques, conférences interactives, jeux en ligne.",
  alternates: { canonical: "/ressources" },
};

const cards = [
  {
    href: "/ressources/ateliers",
    title: "Ateliers ludiques",
    description:
      "Ateliers interactifs sur les sciences du numérique, déployés dans les Espaces de Culture Numérique et hors les murs.",
  },
  {
    href: "/ressources/conferences",
    title: "Conférences interactives",
    description:
      "Conférences grand public et scolaires sur la géométrie, les réseaux, l'IA, le football et bien plus.",
  },
  {
    href: "/ressources/manuel-galejade",
    title: "Manuel Galéjade",
    description:
      "Volume I de la Collection Terra Numerica — s'initier aux mathématiques et à l'informatique en jouant avec les graphes.",
  },
  {
    href: "/ressources/livret-science-tour",
    title: "Livret Science Tour",
    description:
      "Livret d'activités publié dans le cadre du Science Tour Terra Numerica — 60 pages, 40 fiches.",
  },
  {
    href: "/ressources/lab-creativite",
    title: "Lab Créativité",
    description:
      "Le cœur de Terra Numerica : groupes de travail, création de ressources et recherche participative.",
  },
  {
    href: "/ressources/trophees-makers",
    title: "Trophées des Makers",
    description:
      "Initiative portée par Telecom Valley et Terra Numerica pour construire collectivement les ateliers de demain.",
  },
];

export default function RessourcesPage() {
  return (
    <div>
      <PageHeader
        title="Ressources ludiques"
        description="Terra Numerica créé des ressources ludiques pour découvrir, explorer et expérimenter les sciences du numérique au sein du Lab Créativité : ateliers ludiques, conférences interactives, jeux en ligne. Le portail Terra Numerica permet de trouver la ressource adaptée à tous les besoins."
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="block rounded-lg border border-white/20 p-6 hover:border-tn-blue transition-colors"
            >
              <h2 className="text-lg font-bold text-white mb-2">{card.title}</h2>
              <p className="text-sm text-white/70">{card.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href="https://portail.terra-numerica.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-tn-blue hover:underline font-medium"
          >
            Accéder au portail des ressources Terra Numerica →
          </a>
        </div>
      </div>
    </div>
  );
}
