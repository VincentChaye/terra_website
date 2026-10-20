// lib/asset.ts — Préfixe basePath pour les assets de public/ (voir README, NEXT_PUBLIC_BASE_PATH).
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Chemin d'un asset de public/ tenant compte du basePath (ex. asset("/globe-tn.png")). */
export const asset = (path: string): string => `${BASE_PATH}${path}`;
