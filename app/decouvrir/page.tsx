import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Découvrir Terra Numerica",
  description:
    "Découvrez le projet, le collectif, les territoires et les partenaires de Terra Numerica.",
  alternates: { canonical: "/decouvrir" },
};

const cards = [
  {
    href: "/decouvrir/projet",
    title: "Le projet",
    description:
      "Objectifs, missions et présentation du consortium Terra Numerica.",
  },
  {
    href: "/decouvrir/chiffres-et-carte",
    title: "Chiffres & carte",
    description:
      "Impact, couverture territoriale et espaces partenaires en chiffres.",
  },
  {
    href: "/decouvrir/collectif",
    title: "Le collectif",
    description:
      "Une centaine de membres actifs aux expertises variées.",
  },
  {
    href: "/decouvrir/territoires",
    title: "Développement territorial",
    description:
      "Les territoires couverts par les Espaces de Culture Numérique.",
  },
  {
    href: "/decouvrir/partenaires-financeurs",
    title: "Partenaires & Financeurs",
    description:
      "Les institutions et partenaires qui soutiennent Terra Numerica.",
  },
  {
    href: "/decouvrir/nous-rejoindre",
    title: "Nous rejoindre",
    description:
      "Rejoignez le collectif et contribuez aux projets de Terra Numerica.",
  },
];

export default function DecouvriPage() {
  return (
    <div>
      <PageHeader
        title="Découvrir Terra Numerica"
        description="Découvrez le projet, le collectif, les territoires et les partenaires de Terra Numerica."
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="block rounded-lg border border-white/20 p-6 hover:border-tn-blue transition-colors"
            >
              <h2 className="text-lg font-bold text-white mb-2">{card.title}</h2>
              <p className="text-sm text-white/70">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
