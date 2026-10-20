import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/**
 * Export statique servi par nginx (auto-hébergement, une seule cible de build).
 * Le backend (API) est un service Fastify séparé — voir backend/.
 * NEXT_PUBLIC_BASE_PATH reste utile si le site est un jour servi sous un sous-chemin.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// NEXT_EXPORT_DIR : dossier de sortie de l'export (par défaut "out"), utilisé
// par scripts/deploy-frontend.sh pour builder dans un dossier de release
// horodaté et permettre une bascule atomique (voir README, Déploiement).
//
// En dev (`next dev`), distDir n'a rien à voir avec l'export : c'est le cache
// de build de Next. Lui laisser la même valeur que le dossier d'export ("out")
// fait écrire les deux dans le même dossier — `npm run dev:front` tournant en
// continu pendant qu'on lance `npm run build`/`npm run rebuild` à côté
// corrompt alors le cache dev (erreurs ENOENT/"compaction already active").
// On garde donc le défaut Next (`.next`) en dev, et seulement "out" (ou un
// chemin de release) pour un vrai build/export.
export default function nextConfig(phase: string): NextConfig {
  const distDir =
    phase === PHASE_DEVELOPMENT_SERVER ? ".next" : process.env.NEXT_EXPORT_DIR ?? "out";

  return {
    images: { unoptimized: true },
    output: "export",
    distDir,
    basePath,
    assetPrefix: basePath,
  };
}
