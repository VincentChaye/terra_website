import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Entreprises et professionnels",
  description:
    "Team building, formations sur mesure et mécénat autour des sciences du numérique — Terra Numerica.",
  alternates: { canonical: "/entreprises" },
};

const offres = [
  {
    href: "/entreprises/team-building",
    title: "Team Building & Visite Découverte",
    desc: "Engagez vos équipes autour d'ateliers collaboratifs sur l'IA, la cryptographie et la robotique.",
    duree: "2 h – journée",
  },
  {
    href: "/entreprises/formations",
    title: "Formations sur mesure",
    desc: "Programmes pédagogiques adaptés à votre secteur : sensibilisation au numérique, IA appliquée, cybersécurité.",
    duree: "½ journée – 2 jours",
  },
  {
    href: "/entreprises/mecenat",
    title: "Mécénat & Partenariat",
    desc: "Soutenez la diffusion de la culture scientifique et associez votre marque à l'excellence de la recherche française.",
    duree: "Engagement annuel",
  },
];

export default function EntreprisesHubPage() {
  return (
    <div>
      <PageHeader
        title="Entreprises &amp; Professionnels"
        description="Terra Numerica conçoit des expériences sur mesure pour les entreprises : de la visite découverte au mécénat, en passant par des formations animées par des chercheurs."
      />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {offres.map((o) => (
            <div key={o.href} className="border border-white/20 rounded-lg p-6 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <h2 className="font-bold text-white text-lg mb-1">{o.title}</h2>
                <p className="text-sm text-white/70 mb-2">{o.desc}</p>
                <span className="text-xs text-tn-blue font-medium">{o.duree}</span>
              </div>
              <Link
                href={o.href}
                className="shrink-0 px-5 py-2 rounded border border-tn-blue text-tn-blue text-sm font-semibold hover:bg-tn-blue hover:text-tn-white transition-colors"
              >
                En savoir plus
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
