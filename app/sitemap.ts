import type { MetadataRoute } from "next";


const BASE_URL = "https://terra-numerica.org";

const staticRoutes = [
  "/",
  "/decouvrir",
  "/decouvrir/projet",
  "/decouvrir/chiffres-et-carte",
  "/decouvrir/collectif",
  "/decouvrir/territoires",
  "/decouvrir/partenaires-financeurs",
  "/decouvrir/nous-rejoindre",
  "/visiter",
  "/visiter/sophia",
  "/visiter/agenda",
  "/visiter/espaces-partenaires",
  "/scolaires",
  "/scolaires/offre",
  "/scolaires/ateliers",
  "/scolaires/stages-eleves",
  "/scolaires/reserver",
  "/entreprises",
  "/entreprises/team-building",
  "/entreprises/formations",
  "/entreprises/mecenat",
  "/entreprises/contact",
  "/ressources",
  "/ressources/ateliers",
  "/ressources/conferences",
  "/ressources/manuel-galejade",
  "/ressources/livret-science-tour",
  "/ressources/lab-creativite",
  "/ressources/trophees-makers",
  "/actualites",
  "/actualites/newsletter",
  "/actualites/videos",
  "/actualites/presse",
  "/actualites/retrospectives/2025",
  "/contact",
  "/mentions-legales",
  "/politique-confidentialite",
  "/accessibilite",
  "/plan-du-site",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.split("/").length === 2 ? 0.8 : 0.6,
  }));
}
