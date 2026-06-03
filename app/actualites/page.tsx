import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Actualités Terra Numerica",
  description:
    "Découvrir avec un autre regard les actions de Terra Numerica pour l'éducation au numérique : lettres d'information Terra Numerica, vidéos des actions marquantes, articles de presse.",
  alternates: { canonical: "/actualites" },
};

const cards = [
  {
    href: "/actualites/newsletter",
    title: "Lettre d'information",
    description:
      "La lettre mensuelle Terra Numerica — retrouvez toutes les parutions depuis décembre 2020.",
  },
  {
    href: "/actualites/videos",
    title: "Vidéothèque",
    description:
      "Revivez des temps forts de Terra Numerica : événements, ateliers et conférences en vidéo.",
  },
  {
    href: "/actualites/presse",
    title: "Articles de presse",
    description:
      "Publications consacrées à Terra Numerica dans les médias depuis 2022.",
  },
  {
    href: "/actualites/retrospectives/2025",
    title: "Rétrospective 2025",
    description:
      "Bilan des actions et événements Terra Numerica pour l'année 2025.",
  },
];

const reseauxSociaux = [
  { label: "Twitter X", href: "https://twitter.com/terraNumerica" },
  { label: "Mastodon", href: "https://mastodon.social/@terraNumerica" },
  { label: "Bluesky", href: "https://bsky.app/profile/terra-numerica.org" },
  { label: "Instagram", href: "https://www.instagram.com/terra_numerica/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/terra-numerica/" },
  { label: "YouTube", href: "https://www.youtube.com/@TerraNumericaOfficial" },
  { label: "Facebook", href: "https://www.facebook.com/TerraNumerica" },
];

export default function ActualitesPage() {
  return (
    <div>
      <PageHeader
        title="Actualités"
        description="Découvrir avec un autre regard les actions de Terra Numerica pour l'éducation au numérique : lettres d'information Terra Numerica, vidéos des actions marquantes, articles de presse."
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

        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">Suivez-nous sur les réseaux</h2>
          <div className="flex flex-wrap gap-3">
            {reseauxSociaux.map((reseau) => (
              <a
                key={reseau.label}
                href={reseau.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-tn-blue/10 text-tn-blue text-sm px-3 py-1.5 rounded hover:bg-tn-blue/20 transition-colors"
              >
                {reseau.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
