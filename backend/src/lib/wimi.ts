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
  /** Couleur hex choisie dans Wimi (via color_id) */
  color: string;
};

// Palette officielle Wimi (extraite du CSS de l'app : `[data-color="N"].color-background`).
const WIMI_COLORS: Record<number, string> = {
  1: "#ff8200", 2: "#03a9f4", 3: "#55b900", 4: "#a100eb", 5: "#f2c000",
  6: "#dd0043", 7: "#b47200", 8: "#676b6e", 9: "#006de1", 10: "#d500c9",
  11: "#338500", 12: "#2f3337", 13: "#f3f5f8", 14: "#cbcfd4",
};
const DEFAULT_COLOR = "#24A1EB"; // tn-blue, si l'événement n'a pas de couleur Wimi

type WimiBody = Record<string, unknown>;

type WimiSession = {
  token: string;
  accountId: number;
  userId: number;
  at: number;
};

// Le token Wimi vit 12 h (token_ttl_mins: 720) ; on garde une marge.
const SESSION_TTL_MS = 10 * 60 * 60 * 1000;
let session: WimiSession | null = null;

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} manquant`);
  return v;
}

/** Erreur renvoyée par la WApi dans body.error (HTTP 200 malgré tout). */
export class WimiApiError extends Error {
  constructor(message: string, readonly errorId?: number, readonly target?: string) {
    super(message);
    this.name = "WimiApiError";
  }
}

/**
 * Appel bas niveau à la WApi. Attention, pièges constatés :
 * - la casse des cibles compte (`auth.user.Login`, pas `auth.user.login`) ;
 * - `msg_key` est obligatoire (sans lui : « Bad Request » générique) ;
 * - HTTP 200 même en erreur — les erreurs arrivent dans `body.error`.
 */
export async function wimiCall(
  target: string,
  identification: Record<string, unknown>,
  data: WimiBody | null,
  extraHeader: Record<string, unknown> = {}
): Promise<{ header: Record<string, unknown>; data: unknown }> {
  const payload = {
    header: {
      target,
      identification,
      api_version: "1.2",
      app_token: requiredEnv("WIMI_APP_TOKEN"),
      msg_key: target,
      ...extraHeader,
    },
    body: { data },
  };

  const res = await fetch(WIMI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Wimi HTTP ${res.status}`);

  const raw = (await res.json()) as {
    header?: Record<string, unknown>;
    body?: { data?: unknown; error?: { success?: boolean; str?: string; id?: number } };
  };

  const err = raw?.body?.error;
  if (err && err.success === false) {
    throw new WimiApiError(
      `Wimi erreur ${err.id ?? ""} : ${err.str ?? "inconnue"} (${target})`.trim(),
      err.id,
      target
    );
  }

  return { header: raw?.header ?? {}, data: raw?.body?.data };
}

/** Ouvre (ou réutilise) une session Wimi : token + account_id + user_id. */
async function getSession(): Promise<WimiSession> {
  if (session && Date.now() - session.at < SESSION_TTL_MS) return session;

  const accountName = requiredEnv("WIMI_ACCOUNT_NAME").replace(/\.wimi$/, "");
  const { header, data } = await wimiCall(
    "auth.user.Login",
    { account_name: accountName },
    null,
    { auth: { login: requiredEnv("WIMI_LOGIN"), password: requiredEnv("WIMI_PASSWORD") } }
  );

  const token = header.token as string | undefined;
  const d = data as { user?: { user_id?: number }; account?: { account_id?: number } } | undefined;
  const userId = d?.user?.user_id;
  const accountId = d?.account?.account_id;
  if (!token || !userId || !accountId) {
    throw new Error("Wimi login : réponse sans token/user_id/account_id");
  }

  session = { token, accountId, userId, at: Date.now() };
  return session;
}

/** Récupère les événements publics sur une plage de dates */
export async function getPublicEvents(fromDate: Date, toDate: Date): Promise<WimiEvent[]> {
  const projectId = Number(requiredEnv("WIMI_SPACE_ID"));
  const fmt = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

  const run = async () => {
    const s = await getSession();
    return wimiCall(
      "calendar.event.GetList",
      { account_id: s.accountId, user_id: s.userId, project_id: projectId },
      {
        start_date: `${fmt(fromDate)} 00:00:00`,
        end_date: `${fmt(toDate)} 23:59:59`,
      },
      { token: s.token }
    );
  };

  let result;
  try {
    result = await run();
  } catch {
    // Session probablement expirée ou invalidée : re-login puis une seule relance.
    session = null;
    result = await run();
  }

  const events = (result.data as { events?: unknown[] } | undefined)?.events;
  return normalizeEvents(Array.isArray(events) ? events : []);
}

/** Normalise les CalendarEvent Wimi vers notre format */
function normalizeEvents(arr: unknown[]): WimiEvent[] {
  return arr
    .map((e): WimiEvent | null => {
      if (!e || typeof e !== "object") return null;
      const ev = e as Record<string, unknown>;

      const start = (ev.start_date as string | undefined) ?? "";
      if (!start) return null;

      return {
        id:          (ev.calendar_event_id as number | undefined) ?? (ev.id as number | string | undefined) ?? 0,
        title:       String(ev.title ?? "Sans titre"),
        description: String(ev.description ?? ""),
        location:    String(ev.location ?? ""),
        start,
        end:         (ev.end_date as string | undefined) ?? start,
        allDay:      Boolean(ev.all_day ?? false),
        tags:        Array.isArray(ev.tags) ? (ev.tags as string[]).map(String) : [],
        color:       WIMI_COLORS[ev.color_id as number] ?? DEFAULT_COLOR,
      };
    })
    .filter((e): e is WimiEvent => e !== null)
    .sort((a, b) => a.start.localeCompare(b.start));
}
