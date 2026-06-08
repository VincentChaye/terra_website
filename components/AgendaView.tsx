"use client";

import { useEffect, useState } from "react";
import type { WimiEvent } from "@/lib/wimi";
import { apiUrl } from "@/lib/api";

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const DAYS_FR = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    day:   DAYS_FR[d.getDay()],
    date:  d.getDate(),
    month: MONTHS_FR[d.getMonth()],
    year:  d.getFullYear(),
    time:  d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function isSameDay(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10);
}

function groupByMonth(events: WimiEvent[]) {
  const groups: Map<string, WimiEvent[]> = new Map();
  for (const ev of events) {
    const d = new Date(ev.start);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ev);
  }
  return groups;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${MONTHS_FR[Number(month) - 1]} ${year}`;
}

/* ── Carte événement ───────────────────────────────────────── */
function EventCard({ ev }: { ev: WimiEvent }) {
  const s = formatDate(ev.start);
  const e = formatDate(ev.end);
  const multiDay = !isSameDay(ev.start, ev.end);

  return (
    <article className="group flex gap-4 rounded-xl border border-white/10 bg-white/3 hover:border-tn-blue/50 hover:bg-white/5 transition-colors px-5 py-4">
      {/* Bloc date */}
      <div className="shrink-0 w-14 text-center">
        <p className="text-white/40 text-xs uppercase tracking-wide">{s.day}</p>
        <p className="text-tn-blue text-2xl font-bold leading-none">{s.date}</p>
        <p className="text-white/55 text-xs">{s.month}</p>
        {multiDay && (
          <p className="text-white/30 text-[10px] mt-1">→ {e.date} {e.month}</p>
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-sm leading-snug truncate group-hover:text-tn-blue transition-colors">
          {ev.title}
        </h3>

        {/* Horaires */}
        {!ev.allDay && (
          <p className="text-white/45 text-xs mt-0.5">
            {s.time}{!multiDay && ` – ${e.time}`}
          </p>
        )}
        {ev.allDay && (
          <p className="text-white/45 text-xs mt-0.5">Journée entière</p>
        )}

        {/* Lieu */}
        {ev.location && (
          <div className="flex items-center gap-1 mt-1.5">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white/30 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM2 6a6 6 0 1 1 10.68 3.77l-3.98 4.37a1 1 0 0 1-1.4 0L3.32 9.77A5.97 5.97 0 0 1 2 6zm6-.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V6a.5.5 0 0 0-.5-.5z" clipRule="evenodd"/>
            </svg>
            <span className="text-white/45 text-xs truncate">{ev.location}</span>
          </div>
        )}

        {/* Description (tronquée) */}
        {ev.description && (
          <p className="text-white/55 text-xs mt-2 leading-relaxed line-clamp-2">
            {ev.description}
          </p>
        )}

        {/* Tags + lien */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {ev.tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-tn-blue/15 text-tn-blue border border-tn-blue/20">
              {t}
            </span>
          ))}
          {ev.url && (
            <a
              href={ev.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tn-blue text-xs hover:underline ml-auto"
            >
              S&apos;inscrire →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Vue principale ────────────────────────────────────────── */
export default function AgendaView() {
  const [events, setEvents] = useState<WimiEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(apiUrl("/api/agenda"));
        const data = (await res.json().catch(() => ({}))) as {
          events?: WimiEvent[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || data.error) {
          setError(data.error ?? `Erreur ${res.status}`);
          setStatus("error");
          return;
        }
        setEvents(data.events ?? []);
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Chargement */
  if (status === "loading") {
    return (
      <div className="rounded-xl border border-white/10 bg-white/3 px-6 py-10 text-center">
        <div
          className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-tn-blue"
          aria-hidden="true"
        />
        <p className="text-white/45 text-sm mt-3">Chargement de l&apos;agenda…</p>
      </div>
    );
  }

  /* Erreur API */
  if (status === "error") {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-900/10 px-6 py-5">
        <p className="text-white/70 text-sm">Impossible de charger l&apos;agenda Wimi.</p>
        <p className="text-white/35 text-xs mt-1 font-mono">{error}</p>
      </div>
    );
  }

  /* Aucun événement */
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/3 px-6 py-8 text-center">
        <p className="text-white/50 text-sm">Aucun événement à venir pour le moment.</p>
        <p className="text-white/30 text-xs mt-1">Revenez bientôt ou consultez nos réseaux sociaux.</p>
      </div>
    );
  }

  /* Liste groupée par mois */
  const groups = groupByMonth(events);

  return (
    <div className="space-y-10">
      {Array.from(groups.entries()).map(([key, evs]) => (
        <section key={key}>
          <h2 className="text-tn-blue text-xs font-semibold uppercase tracking-widest mb-4">
            {monthLabel(key)}
          </h2>
          <div className="space-y-3">
            {evs.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
