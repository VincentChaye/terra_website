import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Bienvenue à Terra Numerica",
  description:
    "Terra Numerica est un consortium fédérateur émanant du CNRS, Inria et Université Côte d'Azur pour la culture scientifique et l'éducation au numérique.",
  alternates: { canonical: "/decouvrir/projet" },
};

export default function ProjetPage() {
  return (
    <div>
      <PageHeader
        title="Bienvenue à Terra Numerica"
        breadcrumb={[{ label: "Découvrir", href: "/decouvrir" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-white/85 leading-relaxed">
          L&apos;objectif de Terra Numerica est d&apos;innover et agir pour la culture scientifique
          et l&apos;éducation au numérique de manière ludique et participative pour relever les défis
          de demain. Terra Numerica est un consortium fédérateur émanant du CNRS, Inria et Université
          Côte d&apos;Azur, regroupant un large ensemble de partenaires comme l&apos;éducation
          nationale, et une centaine de membres actifs en 2025. Terra Numerica développe des réseaux
          interconnectés d&apos;Espaces animés de Culture Numérique et des ressources ludiques avec la
          volonté de favoriser la manipulation et l&apos;interactivité. Terra Numerica propose une offre
          pédagogique pour tous publics et tous niveaux, de la découverte à la formation, pour aborder
          fondements, applications, enjeux, patrimoine informatique et métiers du numérique. Plus de 350
          événements sont proposés chaque année et plus de 150 000 personnes ont été sensibilisées ou
          formées.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Objectifs</h2>
        <p className="text-white/85 leading-relaxed">
          L&apos;objectif de Terra Numerica est d&apos;innover et agir pour la culture scientifique et
          l&apos;éducation au numérique de manière ludique et participative pour relever les défis de
          demain. Accroître le capital de compétences numériques (dans son acceptation la plus large) de
          tous les citoyens (dont les scolaires), à travers une audience des plus vastes et diversifiées.
        </p>
        <ul className="list-disc list-inside space-y-1 text-white/85 mt-4">
          <li>
            Participer à la compréhension et l&apos;appropriation des sciences du numérique par les
            citoyens : éveiller la curiosité et promouvoir la démarche scientifique, partager notre
            enthousiasme et notre émerveillement pour les sciences du numérique et leurs défis,
            accompagner enseignants et médiateurs vers de nouveaux modes d&apos;apprentissage.
          </li>
          <li>
            Sensibiliser les citoyens aux enjeux scientifiques, environnementaux, éthiques et
            socio-économiques liés au numérique : présenter et expliquer les recherches et innovations
            (académiques et industrielles) les plus récentes des sciences du numérique ainsi que leurs
            impacts.
          </li>
          <li>
            Susciter des vocations scientifiques chez les filles et les garçons : balayer les idées
            reçues, réconcilier les élèves en difficulté avec la science, stimuler les élèves à fort
            potentiel.
          </li>
          <li>
            Associer le plus grand nombre aux évolutions du numérique : attirer le grand public vers les
            sciences participatives, permettre à tout un chacun de pouvoir influer sur la recherche et
            les innovations de demain.
          </li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Le collectif Terra Numerica</h2>
        <p className="text-white/85 leading-relaxed">
          Terra Numerica est porté par une centaine de membres actifs en 2025 qui ont une expertise
          scientifique, pédagogique, dans la médiation scientifique, la création d&apos;ateliers et
          dispositifs interactifs, la recherche en sciences de l&apos;éducation, l&apos;organisation
          d&apos;événements, la communication, la formation, etc. Rejoindre le collectif : participer aux
          groupes de travail pour la création de contenus, renforcer les équipes pour le déploiement des
          ateliers sur le territoire, animer des ateliers pédagogiques, et bien d&apos;autres
          possibilités.
        </p>
        <p className="text-white/85 leading-relaxed mt-3">
          Nos valeurs : Créativité — Engagement — Partage — Inclusion
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Ressources</h2>
        <p className="text-white/85 leading-relaxed">
          Terra Numerica créé des ressources ludiques pour découvrir, explorer et expérimenter les
          sciences du numérique : ateliers ludiques, conférences interactives, jeux en ligne. Le{" "}
          <a
            href="https://portail.terra-numerica.org"
            target="_blank"
            rel="noopener"
            className="text-tn-blue hover:underline"
          >
            portail Terra Numerica
          </a>{" "}
          permet de trouver la ressource adaptée à votre besoin. De plus, le manuel Galéjade permet de
          s&apos;initier aux sciences avec les graphes et un livret d&apos;activités recense toutes les
          ressources du Science Tour Terra Numerica.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">Espaces de Culture Numérique</h2>
        <p className="text-white/85 leading-relaxed">
          Terra Numerica développe un projet original, attractif et unique pour la diffusion, le
          partage, les rencontres, les moments de convivialité entre les acteurs du numérique. Animé par
          la conviction que la science doit aller à la rencontre de tous les citoyens, des dispositifs
          sont déployés au sein de Terra Numerica Sophia, du réseau d&apos;Espaces Partenaires Terra
          Numerica et de toute la Région Sud.
        </p>
      </div>
    </div>
  );
}
