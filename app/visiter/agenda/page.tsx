import type { Metadata } from "next";
import PageHeader from "@/components/layout/PageHeader";
import AgendaView from "@/components/AgendaView";
import { getPublicEvents, type WimiEvent } from "@/lib/wimi";

export const metadata: Metadata = {
  title: "Agenda — Événements grand public",
  description:
    "Tous les événements Terra Numerica ouverts au grand public : samedis numériques, conférences, fêtes de la science, villages des sciences.",
  alternates: { canonical: "/visiter/agenda" },
};

// Re-génère toutes les 5 minutes (ISR)
export const revalidate = 300;

async function fetchEvents(): Promise<{ events: WimiEvent[]; error?: string }> {
  if (!process.env.WIMI_APP_TOKEN) {
    return { events: [], error: "Wimi non configuré" };
  }
  try {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setMonth(to.getMonth() + 4);
    const events = await getPublicEvents(from, to);
    return { events };
  } catch (err) {
    return { events: [], error: String(err instanceof Error ? err.message : err) };
  }
}

export default async function AgendaPage() {
  const { events, error } = await fetchEvents();

  return (
    <div>
      <PageHeader
        title="Agenda — Événements grand public"
        description="Terra Numerica organise des événements ouverts à tous tout au long de l'année."
        breadcrumb={[{ label: "Visiter", href: "/visiter" }]}
      />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Intro */}
        <p className="text-white/75 text-base mb-8 max-w-2xl">
          Ateliers numériques, conférences grand public, fêtes de la science — retrouvez tous nos
          prochains rendez-vous ci-dessous. Une question ?{" "}
          <a href="mailto:contact@terra-numerica.org" className="text-tn-blue hover:underline">
            contact@terra-numerica.org
          </a>
        </p>

        {/* Agenda connecté Wimi */}
        <AgendaView events={events} error={error} />

        {/* Section info récurrents */}
        <div className="mt-16 grid sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
            <h2 className="text-lg font-semibold text-white mb-2">Samedis numériques</h2>
            <p className="text-white/65 text-sm leading-relaxed">
              Chaque <strong className="text-white">1er samedi du mois</strong> de 14h à 18h à Terra Numerica
              Sophia (18 rue Frédéric Mistral, Valbonne). Gratuit sur inscription. Pour tous, dès 7 ans.
            </p>
          </div>
          <div className="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
            <h2 className="text-lg font-semibold text-white mb-2">Terra Numerica Connect</h2>
            <p className="text-white/65 text-sm leading-relaxed">
              Rencontres professionnels, chercheurs et citoyens. Formats interactifs et ludiques tout
              au long de l&apos;année pour co-construire le numérique de demain.
            </p>
          </div>
          <div className="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
            <h2 className="text-lg font-semibold text-white mb-2">Fête de la science (octobre)</h2>
            <p className="text-white/65 text-sm leading-relaxed">
              Aix-en-Provence, Antibes, Grasse, Mouans-Sartoux, Nice, Sophia Antipolis, Villeneuve-Loubet…
              Terra Numerica participe chaque année à de nombreux villages des sciences en Région Sud.
            </p>
          </div>
          <div className="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
            <h2 className="text-lg font-semibold text-white mb-2">Village des sciences (1er week-end d&apos;oct.)</h2>
            <p className="text-white/65 text-sm leading-relaxed">
              Un week-end entier à Terra Numerica Sophia pour expérimenter le numérique en famille.
              Cinq créneaux d&apos;ouverture, entrée gratuite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
