import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Terra Numerica en chiffres et en carte",
  description:
    "Découvrez l'impact de Terra Numerica : 250 lieux d'actions, 150 ateliers pédagogiques, 26 Espaces Partenaires.",
  alternates: { canonical: "/decouvrir/chiffres-et-carte" },
};

const stats = [
  { value: "150+", label: "ateliers pédagogiques en ligne" },
  { value: "250", label: "lieux d'actions" },
  { value: "36 000+", label: "personnes touchées en 2025" },
  { value: "26", label: "Espaces Partenaires" },
];

export default function ChiffresEtCartePage() {
  return (
    <div>
      <PageHeader
        title="Terra Numerica en chiffres et en carte"
        breadcrumb={[{ label: "Découvrir", href: "/decouvrir" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-white/85 leading-relaxed">
          Les dispositifs Terra Numerica permettent de sensibiliser et de former aux sciences du
          numérique.
        </p>
        <p className="text-white/85 leading-relaxed mt-4">
          Le{" "}
          <a
            href="https://portail.terra-numerica.org"
            target="_blank"
            rel="noopener"
            className="text-tn-blue hover:underline"
          >
            portail de ressources Terra Numerica
          </a>{" "}
          en ligne contient plus de 150 ateliers pédagogiques, une dizaine de parcours thématiques et
          mallettes pédagogiques pour le prêt.
        </p>
        <p className="text-white/85 leading-relaxed mt-4">
          Terra Numerica participe à des événements en Région Sud et sur l&apos;ensemble du territoire :
          250 lieux d&apos;actions comptabilisés dont notre lieu-totem Terra Numerica Sophia.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-white/20 rounded-lg p-6 text-center"
            >
              <p className="text-3xl font-bold text-tn-blue">{stat.value}</p>
              <p className="text-sm text-white/70 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
