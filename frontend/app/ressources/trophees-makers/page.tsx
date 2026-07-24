import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Trophées des Makers du numérique — Terra Numerica",
  description:
    "Initiative portée par Telecom Valley et Terra Numerica pour construire collectivement les ateliers de médiation scientifique de demain.",
  alternates: { canonical: "/ressources/trophees-makers" },
};

const themesScientifiques = [
  "Intelligence Artificielle (dont IA générative), Véhicules autonomes",
  "Quantique",
  "Numérique et environnement",
  "Art et Science",
  "Santé et médecine",
  "Crypto (dont block chain)",
  "Réalité virtuelle",
  "Robotique",
  "Citoyenneté numérique",
  "Architecture des ordinateurs",
  "Géométrie",
];

export default function TropheesMakersPage() {
  return (
    <div>
      <PageHeader
        title="Trophées des Makers du numérique"
        breadcrumb={[{ label: "Ressources", href: "/ressources" }]}
      />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85 leading-relaxed">
          Le Trophée des Makers du numérique porté par Telecom Valley et Terra Numerica est une initiative ambitieuse
          pour nos territoires, visant à construire collectivement les ateliers de médiation scientifique de demain qui
          susciteront les envies d&apos;apprentissage et les vocations scientifiques chez les filles et les garçons. En
          participant à ce projet, vous contribuez à façonner l&apos;avenir de l&apos;éducation au numérique et à
          stimuler le développement de compétences numériques essentielles pour aujourd&apos;hui et demain !
        </p>

        <p className="text-white/85 leading-relaxed">
          Chaque année, les équipes ont pour mission de fabriquer un atelier de médiation en sciences du numérique.
          Pour cela, chaque équipe (de 3 à 5 personnes) peut profiter des compétences et des machines de SoFAB (ainsi
          que d&apos;un budget de matières premières) et de l&apos;expertise de Terra Numerica (sciences, pédagogie).
          Comme en 2024-2025, Orange est partenaire et sponsor de l&apos;édition 2025-2026.
        </p>

        <p className="text-white/85 leading-relaxed">
          La constitution des équipes de 3 à 5 personnes doit se faire au plus tard le 31 octobre 2025. Pour
          s&apos;inscrire, merci d&apos;écrire à{" "}
          <a href="mailto:contact@terra-numeria.org" className="text-tn-blue hover:underline">
            contact@terra-numeria.org
          </a>
          .
        </p>

        <p className="text-white/85 leading-relaxed">
          La remise des trophées sera organisée en juin 2026.
        </p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">
          Thèmes scientifiques (liste non exhaustive)
        </h2>
        <ul className="space-y-1 text-white/85">
          {themesScientifiques.map((theme) => (
            <li key={theme} className="flex items-start gap-2">
              <span className="text-tn-blue mt-1">–</span>
              <span>{theme}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
