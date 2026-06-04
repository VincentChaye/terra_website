import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
  output: "export",
};

export default nextConfig;
