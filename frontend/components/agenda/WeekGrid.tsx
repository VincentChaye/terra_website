"use client";

import type { WimiEvent } from "@/lib/agenda-types";
import { addDays, formatTime, isToday, DAYS_FR, toDayKey } from "./date-utils";

type Props = {
  /** Lundi de la semaine affichée */
  weekStart: Date;
  events: WimiEvent[];
  onEventClick: (ev: WimiEvent, anchor: DOMRect) => void;
};

const HOUR_START = 8;
const HOUR_END = 20;
const HOUR_PX = 48; // hauteur d'une heure

function hourOf(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

/** Vue Semaine : grille horaire 8h→20h type Google Agenda */
export default function WeekGrid({ weekStart, events, onEventClick }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = addDays(weekStart, 7);

  // Un événement "journée entière" ou multi-jours va dans la rangée du haut
  const isAllDayLike = (ev: WimiEvent) =>
    ev.allDay || ev.start.slice(0, 10) !== ev.end.slice(0, 10);

  const inWeek = events.filter(
    (ev) => new Date(ev.end) >= weekStart && new Date(ev.start) < weekEnd
  );
  const allDay = inWeek.filter(isAllDayLike);
  const timed = inWeek.filter((ev) => !isAllDayLike(ev));

  const timedByDay = new Map<string, WimiEvent[]>();
  for (const ev of timed) {
    const key = ev.start.slice(0, 10);
    if (!timedByDay.has(key)) timedByDay.set(key, []);
    timedByDay.get(key)!.push(ev);
  }

  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

  return (
    <div className="rounded-xl border border-white/10 overflow-x-auto">
      <div className="min-w-[640px]">
        {/* En-têtes des jours */}
        <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-white/10 bg-white/3">
          <div />
          {days.map((d, i) => (
            <div key={i} className="px-1 py-2 text-center border-l border-white/8">
              <p className="text-[11px] uppercase tracking-wide text-white/45">{DAYS_FR[i]}</p>
              <p
                className={`text-sm mt-0.5 ${
                  isToday(d)
                    ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-tn-blue text-white font-bold"
                    : "text-white/75"
                }`}
              >
                {d.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Rangée "journée entière" / multi-jours */}
        {allDay.length > 0 && (
          <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-white/10">
            <div className="py-1 pr-1 text-right text-[10px] text-white/35">Journée</div>
            {days.map((d, i) => {
              const key = toDayKey(d);
              const evs = allDay.filter((ev) => {
                const s = ev.start.slice(0, 10);
                const e = ev.end.slice(0, 10);
                return key >= s && key <= e;
              });
              return (
                <div key={i} className="border-l border-white/8 px-0.5 py-1 space-y-0.5">
                  {evs.map((ev, j) => (
                    <button
                      key={`${ev.id}-${j}`}
                      onClick={(e) => onEventClick(ev, e.currentTarget.getBoundingClientRect())}
                      className="block w-full truncate text-left text-[11px] leading-tight rounded px-1.5 py-0.5 hover:brightness-125 transition-[filter]"
                      style={{ backgroundColor: `${ev.color}33`, color: ev.color }}
                      title={ev.title}
                    >
                      {ev.title}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Grille horaire */}
        <div className="grid grid-cols-[3rem_repeat(7,1fr)]">
          {/* Colonne des heures */}
          <div className="relative" style={{ height: hours.length * HOUR_PX }}>
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[10px] text-white/35"
                style={{ top: (h - HOUR_START) * HOUR_PX }}
              >
                {h > HOUR_START ? `${h}h` : ""}
              </div>
            ))}
          </div>

          {/* Colonnes des jours */}
          {days.map((d, i) => {
            const dayEvents = timedByDay.get(toDayKey(d)) ?? [];
            return (
              <div
                key={i}
                className="relative border-l border-white/8"
                style={{ height: hours.length * HOUR_PX }}
              >
                {/* Lignes des heures */}
                {hours.slice(1).map((h) => (
                  <div
                    key={h}
                    className="absolute inset-x-0 border-t border-white/6"
                    style={{ top: (h - HOUR_START) * HOUR_PX }}
                  />
                ))}

                {/* Blocs événements */}
                {dayEvents.map((ev, j) => {
                  const start = Math.max(hourOf(ev.start), HOUR_START);
                  const end = Math.min(Math.max(hourOf(ev.end), start + 0.5), HOUR_END);
                  if (start >= HOUR_END) return null;
                  return (
                    <button
                      key={`${ev.id}-${j}`}
                      onClick={(e) => onEventClick(ev, e.currentTarget.getBoundingClientRect())}
                      className="absolute inset-x-0.5 overflow-hidden rounded border hover:brightness-125 transition-[filter] px-1.5 py-1 text-left"
                      style={{
                        top: (start - HOUR_START) * HOUR_PX,
                        height: (end - start) * HOUR_PX - 2,
                        backgroundColor: `${ev.color}40`,
                        borderColor: `${ev.color}66`,
                      }}
                      title={ev.title}
                    >
                      <p className="text-[11px] font-medium leading-tight truncate" style={{ color: ev.color }}>
                        {ev.title}
                      </p>
                      <p className="text-[10px] text-white/50 truncate">
                        {formatTime(ev.start)} – {formatTime(ev.end)}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}