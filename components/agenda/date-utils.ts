import type { WimiEvent } from "@/lib/wimi";

export const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
export const MONTHS_FR_SHORT = [
  "janv.","févr.","mars","avr.","mai","juin",
  "juil.","août","sept.","oct.","nov.","déc.",
];
// Semaine commençant le lundi (convention française)
export const DAYS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

export type AgendaViewMode = "week" | "month" | "year";

export function toDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** Lundi de la semaine contenant `d` (à minuit) */
export function startOfWeek(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (r.getDay() + 6) % 7; // 0 = lundi
  return addDays(r, -day);
}

export function isToday(d: Date): boolean {
  return toDayKey(d) === toDayKey(new Date());
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** "29 juin – 5 juil. 2026" */
export function weekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const s = `${weekStart.getDate()} ${MONTHS_FR_SHORT[weekStart.getMonth()]}`;
  const e = `${end.getDate()} ${MONTHS_FR_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  return `${s} – ${e}`;
}

/**
 * Indexe les événements par jour (clé YYYY-MM-DD). Les événements
 * multi-jours apparaissent sur chacun de leurs jours.
 */
export function indexEventsByDay(events: WimiEvent[]): Map<string, WimiEvent[]> {
  const map = new Map<string, WimiEvent[]>();
  for (const ev of events) {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    // garde-fou : 60 jours max par événement
    for (let i = 0; cur <= last && i < 60; i++, cur = addDays(cur, 1)) {
      const key = toDayKey(cur);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
  }
  return map;
}
