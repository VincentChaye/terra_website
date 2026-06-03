import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Partenaires & Financeurs — Terra Numerica",
  description:
    "Terra Numerica est un consortium porté par le CNRS, Inria et Université Côte d'Azur, regroupant un large ensemble de partenaires dans le domaine du numérique.",
  alternates: { canonical: "/decouvrir/partenaires-financeurs" },
};

export default function PartenairesFinanceursPage() {
  return (
    <div>
      <PageHeader
        title="Partenaires & Financeurs"
        breadcrumb={[{ label: "Découvrir", href: "/decouvrir" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-white/85 leading-relaxed">
          Terra Numerica est un consortium fédérateur, porté par le CNRS, Inria et Université Côte
          d&apos;Azur, regroupant l&apos;éducation nationale et un large ensemble de partenaires dans le
          domaine du numérique (laboratoires de recherche, grands organismes publics d&apos;enseignement
          supérieur et de recherche, entreprises, collectivités territoriales, fondations, associations et
          projets de médiation scientifique, institut de formation des professeurs, etc.).
        </p>
        <p className="text-white/85 leading-relaxed mt-4">
          Terra Numerica propose des partenariats structurants afin notamment de nouer le dialogue avec
          le grand public autour de cas d&apos;usage et/ou de permettre de créer de nouvelles ressources
          ludiques autour des recherches et des innovations des territoires. Nous vous invitons à nous
          écrire :{" "}
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
