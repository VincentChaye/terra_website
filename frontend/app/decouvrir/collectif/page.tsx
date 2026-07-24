import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Le collectif Terra Numerica",
  description:
    "100 membres actifs en 2025, experts en médiation scientifique, pédagogie et numérique. Rejoignez le collectif.",
  alternates: { canonical: "/decouvrir/collectif" },
};

export default function CollectifPage() {
  return (
    <div>
      <PageHeader
        title="Le collectif Terra Numerica"
        breadcrumb={[{ label: "Découvrir", href: "/decouvrir" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-white/85 leading-relaxed">
          Terra Numerica est porté par une centaine de membres actifs en 2025 qui ont une expertise
          scientifique, pédagogique, en médiation scientifique, création d&apos;ateliers et dispositifs
          interactifs, recherche en sciences de l&apos;éducation, organisation d&apos;événements,
          communication, formation, etc. Vous souhaitez participer aux groupes de travail pour la
          création de contenus, renforcer les équipes pour le déploiement des ateliers sur le territoire,
          animer des ateliers pédagogiques, participer aux développements de Terra Numerica, nous vous
          invitons à rejoindre le collectif en nous écrivant :{" "}
          <a
            href="mailto:contact@terra-numerica.org"
            className="text-tn-blue hover:underline"
          >
            contact@terra-numerica.org
          </a>
          . Vous pouvez également vous inscrire à la liste de diffusion.
        </p>
      </div>
    </div>
  );
}
