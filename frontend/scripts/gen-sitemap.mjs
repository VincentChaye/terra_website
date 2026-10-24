#!/usr/bin/env node
// Génère <outDir>/sitemap.xml à partir de src/routes.json (remplace app/sitemap.ts de Next).
// Les rétrospectives (route dynamique :year) sont développées depuis retrospectives.json.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = process.env.VITE_OUT_DIR ?? "out";
const BASE_URL = "https://terra-numerica.org";

const routes = JSON.parse(readFileSync(join(root, "src", "routes.json"), "utf-8"));
const retros = JSON.parse(
  readFileSync(join(root, "src", "content", "actualites", "retrospectives.json"), "utf-8")
);

const paths = routes.flatMap(({ path }) =>
  path === "/actualites/retrospectives/:year"
    ? retros.map((r) => `/actualites/retrospectives/${r.year}`)
    : [path]
);

const today = new Date().toISOString();
const urls = paths.map((p) => {
  const priority = p === "/" ? 1 : p.split("/").length === 2 ? 0.8 : 0.6;
  return `  <url>
    <loc>${BASE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${priority}</priority>
  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

writeFileSync(resolve(root, outDir, "sitemap.xml"), xml);
console.log(`[sitemap] ${paths.length} URLs → ${outDir}/sitemap.xml`);
