import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Visiter Terra Numerica",
  description:
    "Venez découvrir nos espaces, assistez à nos événements grand public ou planifiez votre visite.",
  alternates: { canonical: "/visiter" },
};

const cards = [
  {
    href: "/visiter/sophia",
    title: "Sophia Antipolis",
    desc: "Notre lieu-totem permanent de plus de 500 m² à Valbonne Sophia Antipolis. Adresse, horaires et accès.",
    cta: "Découvrir le lieu",
  },
  {
    href: "/visiter/agenda",
    title: "Agenda & Événements",
    desc: "Événements et médiations grand public tout au long de l'année : ateliers, conférences, fêtes de la science.",
    cta: "Voir l'agenda",
  },
  {
    href: "/visiter/espaces-partenaires",
    title: "Espaces partenaires",
    desc: "Un réseau de 26 Espaces Partenaires Terra Numerica répartis sur 4 départements en Région Sud.",
    cta: "Explorer le réseau",
  },
];

export default function VisiterHubPage() {
  return (
    <div>
      <PageHeader
        title="Visiter Terra Numerica"
        description="Venez découvrir nos espaces, assistez à nos événements grand public ou planifiez votre visite."
      />

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div key={c.href} className="rounded-lg border border-white/20 p-6 flex flex-col gap-3">
              <h2 className="font-bold text-white text-lg">{c.title}</h2>
              <p className="text-sm text-white/70 flex-1">{c.desc}</p>
              <Link href={c.href} className="text-sm font-semibold text-tn-blue hover:underline">
                {c.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
