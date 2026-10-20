// lib/api.ts — Base URL du backend (voir README, section Architecture).

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

if (!API_BASE && typeof window !== "undefined") {
  console.warn(
    "[config] NEXT_PUBLIC_API_BASE non défini : les appels API utilisent un chemin relatif " +
      "(404 probable). Définissez-le au build du frontend."
  );
}

/** Construit une URL absolue vers le backend (ex. apiUrl("/api/agenda")). */
export const apiUrl = (path: string): string => `${API_BASE}${path}`;
