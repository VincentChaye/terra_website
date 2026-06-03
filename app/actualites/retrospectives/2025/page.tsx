import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Rétrospective 2025 — Terra Numerica",
  description:
    "Bilan des actions et événements Terra Numerica pour l'année 2025 — 300 événements, 36 000 personnes.",
  alternates: { canonical: "/actualites/retrospectives/2025" },
};

export default function Retrospective2025Page() {
  return (
    <div>
      <PageHeader
        title="Rétrospective 2025"
        breadcrumb={[{ label: "Actualités", href: "/actualites" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          L&apos;engagement des membres de Terra Numerica a permis, cette année encore, l&apos;organisation de 300
          événements scientifiques à destination des scolaires et des jeunes (410 classes), de professionnels de
          l&apos;éducation, de personnels d&apos;entreprises et de collectivités, ainsi que du grand public. Plus de
          36 000 personnes ont expérimenté les dispositifs de Terra Numerica et de ses partenaires.
        </p>

        <p className="text-white/85 leading-relaxed">
          Des événements scientifiques variés tout au long de l&apos;année 2025 : mois Santé et Numérique, visite
          ministérielle, mois Intelligence Artificielle, WAICF 2025, mois spécial Robotique, mois spécial Cyber,
          dispositifs pour les scolaires (de la maternelle au supérieur), mois spécial géosciences, Science Tour Terra
          Numerica, Fête de la science en Nouvelle-Calédonie, Fête de la science à Terra Numerica, Fête de la science
          en Région Sud, mois de la créativité, Talent in Tech, nombreuses formations avec l&apos;éducation nationale,
          projets Cordée de la réussite, projet Maths-Vives, Semaine Numérique et Sciences Informatiques de Marseille,
          stages de 3e et de seconde, séminaires d&apos;entreprises et de collectivité, visites combinées avec Orange.
        </p>
      </div>
    </div>
  );
}
