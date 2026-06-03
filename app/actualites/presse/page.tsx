import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Articles sur Terra Numerica",
  description:
    "Publications consacrées à Terra Numerica dans les médias depuis 2022.",
  alternates: { canonical: "/actualites/presse" },
};

export default function PressePage() {
  return (
    <div>
      <PageHeader
        title="Articles sur Terra Numerica"
        breadcrumb={[{ label: "Actualités", href: "/actualites" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Découvrez les publications consacrées à Terra Numerica.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2026</h2>
        <ul className="space-y-1 text-white/85">
          <li>Meetic du CNRS à Sophia : un nouveau format pour stimuler les partenariats (Sophianet, avril 2026).</li>
          <li>Semaine du Numérique à Valbonne : des activités ludiques proposées par Terra Numerica (Nice-Matin, avril 2026).</li>
          <li>Lancement du partenariat EducAzur, PrimaSTEM et Terra Numerica (EducAzur, mars 2026).</li>
          <li>Retour sur la semaine du numérique et des sciences informatiques (NSI) à Marseille (Académie d&apos;Aix-Marseille, janvier 2026).</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2025</h2>
        <ul className="space-y-1 text-white/85">
          <li>Interview sur le développement de Terra Numerica (Underscore, 26 octobre 2025).</li>
          <li>Village des sciences à Antibes : la science vulgarisée pour les plus jeunes (BFM, 11 octobre 2025).</li>
          <li>« L&apos;IA n&apos;est pas magique, l&apos;Homme garde la main » (Nice-Matin, 15 octobre 2025).</li>
          <li>Fête de la Science à Terra Numerica (BFM, octobre 2025).</li>
          <li>Rencontre avec Marie Pelleau, maîtresse de conférence et animatrice chez Terra Numerica (NeoTech, octobre 2025).</li>
          <li>Journées Européennes du Patrimoine 2025 : Numérique et Informatique (Université Côte d&apos;Azur, août 2025).</li>
          <li>Programme d&apos;été de Terra Numerica Sophia (Région Sud, juillet 2025).</li>
          <li>Rapport d&apos;activités 2024 du CNRS (CNRS, juillet 2025).</li>
          <li>Stage de seconde mutualisé à Sophia Antipolis (CNRS, juillet 2025).</li>
          <li>Ce samedi, découvrez les sciences numériques en vous amusant à Valbonne (Nice-Matin, mai 2025).</li>
          <li>Terra Numerica – Semaine du numérique VSA (CNRS, mai 2025).</li>
          <li>Semaine du numérique Valbonne Sophia Antipolis (EUR DS4H, mai 2025).</li>
          <li>Semaine du numérique éducatif de Nouvelle-Calédonie (vice-rectorat, avril 2025).</li>
          <li>Championnat international de jeux mathématiques et logiques (CIV, mars 2025).</li>
          <li>Le mot du mois : les Digraphes (Université Côte d&apos;Azur, janvier 2025).</li>
          <li>Portrait de Frédéric Havet, directeur scientifique de Terra Numerica (Université Côte d&apos;Azur, 2025).</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2024</h2>
        <ul className="space-y-1 text-white/85">
          <li>Fête de la science 2024 : cap sur les sciences du numérique avec Inria et Terra Numerica ! (Inria, octobre 2024).</li>
          <li>Au cœur de la technopole de Sophia Antipolis, un « musée de la culture scientifique » ludique (Nice-Matin, septembre 2024).</li>
          <li>Terra Numerica / Visite de Madame la rectrice de l&apos;Académie de Nice (CNRS, septembre 2024).</li>
          <li>Terra Numerica : un consortium académique pour diffuser les sciences informatiques (CNRS, juillet 2024).</li>
          <li>Terra Numerica Sophia : deux ans déjà ! (Université Côte d&apos;Azur, juin 2024).</li>
          <li>Robots, jeux vidéo et IA : Terra Numerica et ses ateliers samedi 4 mai 2024 (France Bleu, mai 2024).</li>
          <li>Manosque : le « Science Terra Numerica Tour » (Haute-Provence Info, février 2024).</li>
          <li>Quand l&apos;art rencontre les sciences ! Partenariat entre Terra Numerica et l&apos;eac (eac, février 2024).</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2023</h2>
        <ul className="space-y-1 text-white/85">
          <li>Rapport annuel 2022 Inria (Inria, novembre 2023).</li>
          <li>Fête de la Science : les pouvoirs insoupçonnés du ballon rond (WebtimeMedias, octobre 2023).</li>
          <li>Inauguration de la Semaine du numérique Valbonne Sophia Antipolis (Université Côte d&apos;Azur, mai 2023).</li>
          <li>Semaine du numérique Valbonne Sophia Antipolis (kidiklik.fr, mai 2023).</li>
          <li>Le Science Tour Terra Numerica (Vivre à La Seyne, avril 2023).</li>
          <li>Terra Numerica, les sciences du numérique à portée de main ! (Primàbord, éducation nationale, février 2023).</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2022</h2>
        <ul className="space-y-1 text-white/85">
          <li>Robotination pour apprendre en faisant (blog binaire du Monde.fr, octobre 2022).</li>
          <li>Sophia : Terra Numerica, un village de la science ouvert à l&apos;année (WebtimeMedias, octobre 2022).</li>
          <li>Un Palais de la Découverte des Sciences du numérique (blog binaire du Monde.fr, septembre 2022).</li>
          <li>Terra Numerica : la Fête de la science toute l&apos;année (DRANE PACA, septembre 2022).</li>
          <li>Actualités Terra Numerica Sophia (L&apos;info de Valbonne Sophia Antipolis, été 2022).</li>
          <li>Success Story : Robotination – Découvrir l&apos;informatique en construisant son robot ! (Fondation Blaise Pascal, 2022).</li>
        </ul>
      </div>
    </div>
  );
}
