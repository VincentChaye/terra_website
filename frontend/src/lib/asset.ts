// lib/asset.ts — Préfixe base pour les assets de public/ (voir README, VITE_BASE_PATH).
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Chemin d'un asset de public/ tenant compte de la base (ex. asset("/globe-tn.png")). */
export const asset = (path: string): string => `${BASE}${path}`;
