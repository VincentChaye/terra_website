/**
 * lib/api.ts — Base URL du backend (côté client)
 *
 * Le frontend statique (GitHub Pages) appelle le backend Render via une URL
 * absolue, injectée au build par `NEXT_PUBLIC_API_BASE`. Les variables
 * `NEXT_PUBLIC_*` sont inlinées au build : si elle manque, on retombe sur un
 * chemin relatif (404 probable sur l'hôte statique) — d'où l'avertissement.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

if (!API_BASE && typeof window !== "undefined") {
  console.warn(
    "[config] NEXT_PUBLIC_API_BASE non défini : les appels API utilisent un chemin relatif " +
      "(404 probable sur GitHub Pages). Définissez-le au build du frontend."
  );
}

/** Construit une URL absolue vers le backend (ex. apiUrl("/api/agenda")). */
export const apiUrl = (path: string): string => `${API_BASE}${path}`;
