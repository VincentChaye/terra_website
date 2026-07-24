import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Manuel Galéjade – Volume I de la Collection Terra Numerica",
  description:
    "S'initier aux mathématiques et à l'informatique en jouant avec les graphes — manuel pédagogique Terra Numerica.",
  alternates: { canonical: "/ressources/manuel-galejade" },
};

export default function ManuelGalejadePage() {
  return (
    <div>
      <PageHeader
        title="Manuel Galéjade – Volume I de la Collection Terra Numerica"
        breadcrumb={[{ label: "Ressources", href: "/ressources" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          S&apos;initier aux mathématiques et à l&apos;informatique en jouant avec les graphes
        </h2>

        <p className="text-white/85 leading-relaxed">
          Ce manuel recense les ateliers Galéjade (issus des groupes de travail Terra Numerica Algorithmes et Jeux),
          les résultats mathématiques et les algorithmes qui les sous-tendent. Différentes manières de présenter les
          ateliers, notamment en variant les supports, sont évoquées pour trouver des solutions ainsi que des manières
          de les présenter. Ce manuel s&apos;adresse donc à toutes les personnes (enseignants, médiateurs scientifiques,
          animateurs, parents, etc.) souhaitant proposer à leur public (aux enfants comme aux adultes) des activités
          ludiques permettant d&apos;acquérir des compétences essentielles en mathématiques et informatique.
        </p>

        <p className="text-white/85 leading-relaxed">
          Télécharger la nouvelle version du manuel Galéjade (version 2025) également disponible également sur
          Épi-revel.
        </p>

        <p className="text-white/85 leading-relaxed">
          Ce document a été réalisé par des membres du collectif Terra Numerica et est signé, comme pour les autres
          volumes à venir, Rose Desvents.
        </p>

        <p className="text-white/85 leading-relaxed">
          Les mathématiques étant malheureusement trop souvent réduites au calcul dans l&apos;imaginaire collectif,
          nous avons délibérément décidé de présenter des activités qui ne requièrent pas (ou très peu) de calculs.
          L&apos;idée est d&apos;insister sur le fait que les mathématiques ne sont pas le calcul et que les techniques
          calculatoires ne sont qu&apos;un outil, bien loin d&apos;être toujours nécessaire. Ainsi, les activités
          décrites dans ce document ont pour but de développer toutes les compétences mathématiques, telles que
          décrites au Bulletin Officiel de l&apos;éducation nationale du 30 juillet 2020, hormis Calculer. À savoir
          Chercher, Modéliser, Représenter, Raisonner et Communiquer.
        </p>

        <p className="text-white/85 leading-relaxed">
          D&apos;autre part, les activités de ce manuel permettent aussi de se familiariser avec les notions de graphes
          et d&apos;algorithmes qui sont au cœur de l&apos;informatique.
        </p>
      </div>
    </div>
  );
}
