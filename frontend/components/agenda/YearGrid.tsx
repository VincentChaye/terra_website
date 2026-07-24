"use client";

import type { WimiEvent } from "@/lib/agenda-types";
import { addDays, isToday, MONTHS_FR, startOfWeek, toDayKey } from "./date-utils";

type Props = {
  year: number;
  eventsByDay: Map<string, WimiEvent[]>;
  /** Clic sur un mini-mois ou un jour → bascule en vue Mois */
  onMonthSelect: (month: Date) => void;
};

function MiniMonth({
  month,
  eventsByDay,
  onSelect,
}: {
  month: Date;
  eventsByDay: Map<string, WimiEvent[]>;
  onSelect: () => void;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <button
      onClick={onSelect}
      className="rounded-xl border border-white/10 bg-white/2 hover:border-tn-blue/50 hover:bg-white/4 transition-colors p-3 text-left"
    >
      <p className="text-tn-blue text-xs font-semibold uppercase tracking-widest mb-2">
        {MONTHS_FR[month.getMonth()]}
      </p>
      <div className="grid grid-cols-7 gap-y-0.5">
        {["L","M","M","J","V","S","D"].map((d, i) => (
          <span key={i} className="text-center text-[9px] text-white/30">{d}</span>
        ))}
        {cells.map((day, i) => {
          const inMonth = day.getMonth() === month.getMonth();
          if (!inMonth) return <span key={i} />;
          const dayEvents = eventsByDay.get(toDayKey(day)) ?? [];
          const today = isToday(day);
          return (
            <span key={i} className="flex flex-col items-center">
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] leading-none ${
                  today ? "bg-tn-blue text-white font-bold" : "text-white/60"
                }`}
              >
                {day.getDate()}
              </span>
              <span
                className="w-1 h-1 rounded-full -mt-0.5"
                style={{ backgroundColor: dayEvents[0]?.color ?? "transparent" }}
              />
            </span>
          );
        })}
      </div>
    </button>
  );
}

/** Vue Année : 12 mini-mois, un point sous les jours avec événement */
export default function YearGrid({ year, eventsByDay, onMonthSelect }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, m) => {
        const month = new Date(year, m, 1);
        return (
          <MiniMonth
            key={m}
            month={month}
            eventsByDay={eventsByDay}
            onSelect={() => onMonthSelect(month)}
          />
        );
      })}
    </div>
  );
}
