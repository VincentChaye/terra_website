import type { NextConfig } from "next";

/**
 * Un seul fichier, deux cibles de build (architecture hybride) :
 *
 *  - Frontend GitHub Pages : `STATIC_EXPORT=true` → export statique + basePath.
 *    Le workflow CI retire `app/api` avant le build (l'export ne supporte ni les
 *    handlers POST ni les GET dynamiques — cf. docs Next « static-exports »).
 *
 *  - Backend Render : aucun flag → app Node complète servant les routes app/api/*,
 *    à la racine du domaine (pas de basePath).
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isStaticExport ? { output: "export", basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
