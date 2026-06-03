import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Nous rejoindre — Terra Numerica",
  description:
    "Rejoignez le collectif Terra Numerica : participez aux groupes de travail, animez des ateliers, contribuez aux développements.",
  alternates: { canonical: "/decouvrir/nous-rejoindre" },
};

export default function NousRejoindre() {
  return (
    <div>
      <PageHeader
        title="Nous rejoindre"
        breadcrumb={[{ label: "Découvrir", href: "/decouvrir" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-white/85 leading-relaxed">
          Rejoignez le collectif Terra Numerica ! Terra Numerica est porté par une centaine de membres
          actifs en 2025. Vous avez une expertise scientifique, pédagogique, en médiation scientifique,
          création d&apos;ateliers, organisation d&apos;événements, communication ou formation ?
        </p>
        <p className="text-white/85 leading-relaxed mt-4">Vous pouvez :</p>
        <ul className="list-disc list-inside space-y-1 text-white/85 mt-2">
          <li>Participer aux groupes de travail pour la création de contenus</li>
          <li>Renforcer les équipes pour le déploiement des ateliers sur le territoire</li>
          <li>Animer des ateliers pédagogiques</li>
          <li>Contribuer aux développements de Terra Numerica</li>
        </ul>
        <p className="text-white/85 leading-relaxed mt-6">
          Pour nous rejoindre, écrivez-nous à{" "}
          <a
            href="mailto:contact@terra-numerica.org"
            className="text-tn-blue hover:underline"
          >
            contact@terra-numerica.org
          </a>
          .
        </p>
      </div>
    </div>
  );
}
