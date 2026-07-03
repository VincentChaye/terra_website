"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WimiEvent } from "@/lib/wimi";
import { apiUrl } from "@/lib/api";
import {
  addDays,
  addMonths,
  AgendaViewMode,
  indexEventsByDay,
  MONTHS_FR,
  startOfWeek,
  toDayKey,
  weekLabel,
} from "@/components/agenda/date-utils";
import MonthGrid from "@/components/agenda/MonthGrid";
import WeekGrid from "@/components/agenda/WeekGrid";
import YearGrid from "@/components/agenda/YearGrid";
import EventPopover from "@/components/agenda/EventPopover";

type Popover = {
  event: WimiEvent;
  anchor: { top: number; left: number; bottom: number; right: number };
};

const VIEWS: { id: AgendaViewMode; label: string }[] = [
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
];

/** Plage de dates visible selon la vue courante */
function visibleRange(view: AgendaViewMode, cursor: Date): [Date, Date] {
  if (view === "week") {
    const s = startOfWeek(cursor);
    return [s, addDays(s, 7)];
  }
  if (view === "month") {
    return [
      new Date(cursor.getFullYear(), cursor.getMonth(), 1),
      new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
    ];
  }
  return [new Date(cursor.getFullYear(), 0, 1), new Date(cursor.getFullYear() + 1, 0, 1)];
}

export default function AgendaView() {
  const [view, setView] = useState<AgendaViewMode>("month");
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [events, setEvents] = useState<WimiEvent[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | undefined>(undefined);
  const [popover, setPopover] = useState<Popover | null>(null);

  // Fenêtre de données déjà chargée ; élargie au besoin quand on navigue.
  const loadedWindow = useRef<[Date, Date] | null>(null);

  useEffect(() => {
    const [visFrom, visTo] = visibleRange(view, cursor);
    const win = loadedWindow.current;
    if (win && visFrom >= win[0] && visTo <= win[1]) return; // déjà couvert

    // Fenêtre large : année civile du début visible → année suivante complète,
    // pour que la navigation semaine/mois/année reste instantanée.
    const from = new Date(Math.min(visFrom.getFullYear(), new Date().getFullYear()), 0, 1);
    const to = new Date(Math.max(visTo.getFullYear(), new Date().getFullYear() + 1) + 1, 0, 1);

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          apiUrl(`/api/agenda?from=${toDayKey(from)}&to=${toDayKey(addDays(to, -1))}`)
        );
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
        loadedWindow.current = [from, to];
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
  }, [view, cursor]);

  const eventsByDay = useMemo(() => indexEventsByDay(events), [events]);

  /* Navigation */
  const goToday = () => setCursor(new Date());
  const go = (dir: 1 | -1) => {
    setCursor((c) => {
      if (view === "week") return addDays(c, 7 * dir);
      if (view === "month") return addMonths(c, dir);
      return new Date(c.getFullYear() + dir, c.getMonth(), 1);
    });
  };

  /* Titre de la période */
  const title =
    view === "week"
      ? weekLabel(startOfWeek(cursor))
      : view === "month"
        ? `${MONTHS_FR[cursor.getMonth()]} ${cursor.getFullYear()}`
        : String(cursor.getFullYear());

  const openPopover = (event: WimiEvent, rect: DOMRect) => {
    setPopover({
      event,
      anchor: { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right },
    });
  };

  /* Chargement initial */
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

  return (
    <div>
      {/* Barre d'outils */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => go(-1)}
            aria-label="Période précédente"
            className="w-8 h-8 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-tn-blue/50 transition-colors flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={goToday}
            className="h-8 px-3 rounded-lg border border-white/10 text-white/70 text-sm hover:text-white hover:border-tn-blue/50 transition-colors"
          >
            Aujourd&apos;hui
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Période suivante"
            className="w-8 h-8 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-tn-blue/50 transition-colors flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <h2 className="text-white font-semibold text-base sm:text-lg flex-1 text-center capitalize">
          {title}
        </h2>

        {/* Sélecteur de vue */}
        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-3 h-8 text-sm transition-colors ${
                view === v.id
                  ? "bg-tn-blue text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vue courante */}
      {view === "month" && (
        <MonthGrid
          month={new Date(cursor.getFullYear(), cursor.getMonth(), 1)}
          eventsByDay={eventsByDay}
          onEventClick={openPopover}
        />
      )}
      {view === "week" && (
        <WeekGrid weekStart={startOfWeek(cursor)} events={events} onEventClick={openPopover} />
      )}
      {view === "year" && (
        <YearGrid
          year={cursor.getFullYear()}
          eventsByDay={eventsByDay}
          onMonthSelect={(month) => {
            setCursor(month);
            setView("month");
          }}
        />
      )}

      {/* Détail événement */}
      {popover && (
        <EventPopover
          event={popover.event}
          anchor={popover.anchor}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
