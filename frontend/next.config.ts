import type { NextConfig } from "next";

/**
 * Export statique servi par nginx (auto-hébergement, une seule cible de build).
 * Le backend (API) est un service Fastify séparé — voir backend/.
 * NEXT_PUBLIC_BASE_PATH reste utile si le site est un jour servi sous un sous-chemin.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// NEXT_EXPORT_DIR : dossier de sortie de l'export (par défaut "out"), utilisé
// par scripts/deploy-frontend.sh pour builder dans un dossier de release
// horodaté et permettre une bascule atomique (voir README, Déploiement).
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  output: "export",
  distDir: process.env.NEXT_EXPORT_DIR ?? "out",
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
