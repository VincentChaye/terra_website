/**
 * Client HTTP du backend — exécuté dans le processus PRINCIPAL (Node).
 *
 * Pourquoi pas dans le renderer ? Les routes /api/admin/* ne renvoient
 * volontairement aucun en-tête CORS (fermées aux navigateurs, spec §3) :
 * un fetch depuis le renderer (Chromium) serait bloqué. Node n'applique
 * pas CORS.
 *
 * Cold start Render (plan free) : la première requête après ~15 min
 * d'inactivité peut pendre le temps du réveil (~1 min). Stratégie :
 * essai court (8 s) puis un second essai long (90 s) — l'UI affiche
 * « Réveil du serveur… » de son côté au-delà de 8 s. Exception : PUT
 * (publication) n'est jamais rejoué automatiquement — un timeout ne
 * prouve pas que le commit n'a pas eu lieu (risque de double commit) ;
 * un seul essai long, l'utilisateur relance à la main si besoin.
 */

export const API_BASE =
  process.env.CMS_API_BASE ?? "https://terra-numerica-backend.onrender.com";

export type ApiRequestOptions = { method?: string; body?: unknown; token?: string | null };
export type ApiResponse = { status: number; json: unknown };

const FIRST_TIMEOUT_MS = 8_000;
const RETRY_TIMEOUT_MS = 90_000;

export async function apiRequest(
  path: string,
  opts: ApiRequestOptions = {},
  timeouts = { first: FIRST_TIMEOUT_MS, retry: RETRY_TIMEOUT_MS }
): Promise<ApiResponse> {
  const method = opts.method ?? "GET";

  const attempt = async (timeoutMs: number): Promise<ApiResponse> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { status: res.status, json: await res.json().catch(() => ({})) };
  };

  if (method === "PUT") return attempt(timeouts.retry);
  try {
    return await attempt(timeouts.first);
  } catch {
    return attempt(timeouts.retry); // réveil probable → 2e essai long ; s'il échoue, l'erreur remonte
  }
}
