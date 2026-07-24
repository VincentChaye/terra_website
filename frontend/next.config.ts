import type { NextConfig } from "next";

/**
 * Export statique servi par nginx (auto-hébergement, une seule cible de build).
 * Le backend (API) est un service Fastify séparé — voir backend/.
 * NEXT_PUBLIC_BASE_PATH reste utile si le site est un jour servi sous un sous-chemin.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  output: "export",
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
