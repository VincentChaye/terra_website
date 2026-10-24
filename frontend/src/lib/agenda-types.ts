/**
 * lib/agenda-types.ts — Forme de l'événement renvoyé par GET /api/agenda (backend)
 *
 * Doit rester synchronisé avec `WimiEvent` dans backend/src/lib/wimi.ts.
 */
export type WimiEvent = {
  id: number | string;
  title: string;
  description: string;
  location: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  allDay: boolean;
  url?: string;
  tags: string[];
  color: string;
};
