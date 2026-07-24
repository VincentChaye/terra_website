import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Terra Numerica Sophia – Région Sud",
  description:
    "Visitez l'espace permanent Terra Numerica à Valbonne Sophia Antipolis. Adresse, horaires et accès.",
  alternates: { canonical: "/visiter/sophia" },
};

const horaires = [
  { jour: "Lundi – Vendredi", heure: "Sur réservation (groupes scolaires & entreprises)" },
  { jour: "Samedi", heure: "Ouvertures grand public ponctuelles — voir l'agenda" },
  { jour: "Dimanche & jours fériés", heure: "Fermé" },
];

export default function SophiaPage() {
  return (
    <div>
      <PageHeader
        title="Terra Numerica Sophia – Région Sud"
        description="Notre lieu-totem permanent, au cœur de la technopole Sophia Antipolis, à Valbonne (06)."
        breadcrumb={[{ label: "Visiter", href: "/visiter" }]}
      />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <p className="text-white/85">
          Terra Numerica Sophia – Région Sud est un lieu unique de plus de 500 mètres carrés
          entièrement dédié à la diffusion de la culture des sciences du numérique : de la découverte
          à la formation. Mis à disposition par la ville de Valbonne Sophia Antipolis, l&apos;inauguration
          de ce lieu-totem s&apos;est déroulée le samedi 11 juin 2022. Des ateliers ludiques y sont déployés
          et l&apos;offre pédagogique permet de répondre aux besoins de tous les publics.
        </p>

        <p className="text-white/85">
          Terra Numerica Sophia est ouvert chaque premier samedi du mois au grand public avec des
          thématiques variées pour tous les petits et les grands.
        </p>

        {/* Adresse & horaires */}
        <div className="grid sm:grid-cols-2 gap-8 mt-8">
          <div>
            <h2 className="text-xl font-bold text-white mt-8 mb-3">Adresse</h2>
            <address className="not-italic text-white/85 space-y-1 text-sm">
              <p className="font-semibold">Terra Numerica</p>
              <p>18 rue Frédéric Mistral</p>
              <p>06560 Valbonne — Sophia Antipolis</p>
            </address>
            <a
              href="https://maps.google.com/?q=18+rue+Frédéric+Mistral+06560+Valbonne"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-tn-blue hover:underline"
            >
              Ouvrir dans Google Maps →
            </a>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mt-8 mb-3">Horaires</h2>
            <table className="w-full text-sm">
              <tbody>
                {horaires.map((h) => (
                  <tr key={h.jour} className="border-b border-white/10">
                    <td className="py-2 pr-4 font-medium text-white whitespace-nowrap">{h.jour}</td>
                    <td className="py-2 text-white/70">{h.heure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accès */}
        <div>
          <h2 className="text-xl font-bold text-white mt-8 mb-3">Accès</h2>
          <ul className="space-y-2 text-white/85">
            <li className="flex gap-2 text-sm">
              <span className="text-tn-blue font-bold">Bus</span>
              Lignes Envibus desservant Sophia Antipolis — arrêt Frédéric Mistral
            </li>
            <li className="flex gap-2 text-sm">
              <span className="text-tn-blue font-bold">Voiture</span>
              A8 sortie Antibes / Sophia Antipolis — parking gratuit à proximité
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/scolaires/reserver"
            className="px-6 py-3 rounded font-semibold bg-tn-blue text-white hover:bg-[#1a8fd1] transition-colors text-sm"
          >
            Réserver une visite scolaire
          </Link>
          <Link
            href="/visiter/agenda"
            className="px-6 py-3 rounded font-semibold border border-tn-dark text-white hover:bg-white/5 transition-colors text-sm"
          >
            Voir l&apos;agenda grand public
          </Link>
        </div>
      </div>
    </div>
  );
}
