import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Scolaires et enseignants",
  description:
    "Ateliers, conférences et visites guidées pour les classes du CP à la Terminale. Gratuit pour les établissements publics.",
  alternates: { canonical: "/scolaires" },
};

const pages = [
  {
    href: "/scolaires/offre",
    title: "Offre pédagogique",
    desc: "Catalogue complet par niveau : algorithmique, IA, cryptographie, robotique et plus.",
    cta: "Voir l'offre",
  },
  {
    href: "/scolaires/ateliers",
    title: "Ateliers",
    desc: "Descriptions détaillées de chaque atelier : objectifs, durée, prérequis, intervenants.",
    cta: "Explorer les ateliers",
  },
  {
    href: "/scolaires/stages-eleves",
    title: "Stages élèves",
    desc: "Stages de découverte et d'observation pour collégiens et lycéens.",
    cta: "En savoir plus",
  },
  {
    href: "/scolaires/reserver",
    title: "Réserver une visite",
    desc: "Formulaire de demande de créneau — réponse sous 48 h ouvrées.",
    cta: "Réserver",
    highlight: true,
  },
];

export default function ScorairesHubPage() {
  return (
    <div>
      <PageHeader
        title="Scolaires &amp; Enseignants"
        description="Terra Numerica propose des ateliers et conférences scientifiques pour toutes les classes, conçus par des chercheurs CNRS et Inria. Gratuits pour les établissements publics."
      />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 gap-6">
          {pages.map((p) => (
            <div
              key={p.href}
              className={`rounded-lg border p-6 flex flex-col gap-3 ${
                p.highlight ? "border-tn-blue bg-tn-blue/5" : "border-white/20"
              }`}
            >
              <h2 className="font-bold text-white text-lg">{p.title}</h2>
              <p className="text-sm text-white/70 flex-1">{p.desc}</p>
              <Link
                href={p.href}
                className={`text-sm font-semibold ${
                  p.highlight
                    ? "inline-block px-5 py-2 rounded bg-tn-blue text-tn-white hover:bg-[#1a8fd1] text-center transition-colors"
                    : "text-tn-blue hover:underline"
                }`}
              >
                {p.cta} {!p.highlight && "→"}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
