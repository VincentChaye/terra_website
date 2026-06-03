const WIMI_API = "https://api.wimi.pro";

/** Événement normalisé exposé par l'app */
export type WimiEvent = {
  id: number | string;
  title: string;
  description: string;
  location: string;
  start: string;   // ISO 8601
  end: string;     // ISO 8601
  allDay: boolean;
  url?: string;
  tags: string[];
};

type WimiBody = Record<string, unknown>;

async function wimiCall(target: string, body: WimiBody = {}): Promise<unknown> {
  const token = process.env.WIMI_APP_TOKEN;
  if (!token) throw new Error("WIMI_APP_TOKEN manquant");

  const payload = {
    header: {
      target,
      identification: { app_token: token, api_version: "2.0" },
    },
    body,
  };

  const res = await fetch(WIMI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // pas de cache next — on gère le cache au niveau de la route
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Wimi HTTP ${res.status}`);

  const data = await res.json() as { header?: { status?: string; error?: string }; body?: unknown };

  if (data?.header?.status && data.header.status !== "success") {
    throw new Error(`Wimi erreur : ${data.header.error ?? data.header.status}`);
  }

  return data?.body ?? data;
}

/** Récupère les événements publics sur une plage de dates */
export async function getPublicEvents(fromDate: Date, toDate: Date): Promise<WimiEvent[]> {
  const spaceId = process.env.WIMI_SPACE_ID;

  const fmt = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

  const body: WimiBody = {
    start_date: fmt(fromDate),
    end_date:   fmt(toDate),
  };
  if (spaceId) body.space_id = Number(spaceId);

  const raw = await wimiCall("calendar.event.GetList", body) as unknown;

  return normalizeEvents(raw);
}

/** Normalise la réponse Wimi (structure exacte peut varier selon la version) */
function normalizeEvents(raw: unknown): WimiEvent[] {
  if (!raw || typeof raw !== "object") return [];

  // Cherche un tableau dans les champs courants
  const candidates = [
    (raw as Record<string, unknown>).events,
    (raw as Record<string, unknown>).items,
    (raw as Record<string, unknown>).data,
    raw,
  ];

  const arr = candidates.find(Array.isArray) as unknown[] | undefined;
  if (!arr) return [];

  return arr
    .map((e): WimiEvent | null => {
      if (!e || typeof e !== "object") return null;
      const ev = e as Record<string, unknown>;

      const start =
        (ev.start_date as string | undefined) ??
        (ev.start as string | undefined) ??
        (ev.date_start as string | undefined) ?? "";
      const end =
        (ev.end_date as string | undefined) ??
        (ev.end as string | undefined) ??
        (ev.date_end as string | undefined) ?? start;

      if (!start) return null;

      return {
        id:          (ev.id as number | string | undefined) ?? 0,
        title:       String(ev.title ?? ev.name ?? "Sans titre"),
        description: String(ev.description ?? ev.desc ?? ""),
        location:    String(ev.location ?? ev.place ?? ""),
        start,
        end,
        allDay:      Boolean(ev.all_day ?? ev.allDay ?? false),
        url:         ev.url as string | undefined,
        tags:        Array.isArray(ev.tags) ? (ev.tags as string[]) : [],
      };
    })
    .filter((e): e is WimiEvent => e !== null)
    .sort((a, b) => a.start.localeCompare(b.start));
}
