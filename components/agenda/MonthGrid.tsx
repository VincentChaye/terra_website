"use client";

import type { WimiEvent } from "@/lib/wimi";
import { addDays, DAYS_FR, isToday, startOfWeek, toDayKey } from "./date-utils";

type Props = {
  /** 1er jour du mois affiché */
  month: Date;
  eventsByDay: Map<string, WimiEvent[]>;
  onEventClick: (ev: WimiEvent, anchor: DOMRect) => void;
};

const MAX_CHIPS = 3;

/** Vue Mois : grille 7 colonnes type Google Agenda */
export default function MonthGrid({ month, eventsByDay, onEventClick }: Props) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const weeks = Math.ceil(
    (new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() +
      ((first.getDay() + 6) % 7)) / 7
  );

  const cells: Date[] = [];
  for (let i = 0; i < weeks * 7; i++) cells.push(addDays(gridStart, i));

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {/* En-têtes des jours */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/3">
        {DAYS_FR.map((d) => (
          <div key={d} className="px-1 py-2 text-center text-[11px] uppercase tracking-wide text-white/45">
            {d}
          </div>
        ))}
      </div>

      {/* Cases */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const inMonth = day.getMonth() === month.getMonth();
          const dayEvents = eventsByDay.get(toDayKey(day)) ?? [];
          const today = isToday(day);

          return (
            <div
              key={i}
              className={`min-h-16 sm:min-h-24 border-white/8 px-1 py-1 sm:px-1.5 ${
                i % 7 !== 0 ? "border-l" : ""
              } ${i >= 7 ? "border-t" : ""} ${inMonth ? "" : "bg-white/2"}`}
            >
              <div className="flex justify-center sm:justify-start">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                    today
                      ? "bg-tn-blue text-white font-bold"
                      : inMonth
                        ? "text-white/75"
                        : "text-white/25"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>

              {/* Desktop : pastilles avec titre */}
              <div className="hidden sm:block mt-1 space-y-0.5">
                {dayEvents.slice(0, MAX_CHIPS).map((ev, j) => (
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
                {dayEvents.length > MAX_CHIPS && (
                  <p className="text-[10px] text-white/40 px-1.5">
                    +{dayEvents.length - MAX_CHIPS} autres
                  </p>
                )}
              </div>

              {/* Mobile : points */}
              {dayEvents.length > 0 && (
                <button
                  className="sm:hidden flex justify-center gap-0.5 w-full mt-1"
                  onClick={(e) =>
                    onEventClick(dayEvents[0], e.currentTarget.getBoundingClientRect())
                  }
                  aria-label={`${dayEvents.length} événement(s) le ${day.getDate()}`}
                >
                  {dayEvents.slice(0, 3).map((ev, j) => (
                    <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color }} />
                  ))}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
