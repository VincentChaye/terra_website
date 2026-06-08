/**
 * lib/cors.ts — En-têtes CORS pour le backend Render
 *
 * Le frontend (GitHub Pages) et le backend (Render) sont sur des origines
 * différentes : les routes API doivent donc autoriser explicitement l'origine
 * du frontend et répondre au preflight `OPTIONS`.
 *
 * `FRONTEND_ORIGIN` = origine exacte du frontend (ex. https://user.github.io),
 * sans le chemin. Si absente, on retombe sur `*` (aucune credential/cookie n'est
 * échangée, donc le wildcard est acceptable).
 */

export function corsHeaders(): Record<string, string> {
  const origin = process.env.FRONTEND_ORIGIN ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    // Si on cible une origine précise, indiquer aux caches qu'elle varie.
    ...(origin !== "*" ? { Vary: "Origin" } : {}),
  };
}

/** Réponse standard au preflight CORS (`OPTIONS`). */
export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
