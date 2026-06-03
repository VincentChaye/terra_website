import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Terra Numerica présentation (doublons fusionnés)
      { source: "/terra-numerica", destination: "/decouvrir/projet", permanent: true },
      { source: "/le-projet", destination: "/decouvrir/projet", permanent: true },
      { source: "/terra-numerica-en-chiffres", destination: "/decouvrir/chiffres-et-carte", permanent: true },
      { source: "/envie-de-vous-impliquer", destination: "/decouvrir/collectif", permanent: true },
      { source: "/financeurs", destination: "/decouvrir/partenaires-financeurs", permanent: true },
      { source: "/partenaires", destination: "/decouvrir/partenaires-financeurs", permanent: true },
      { source: "/territoires", destination: "/decouvrir/territoires", permanent: true },
      { source: "/offre", destination: "/decouvrir/nous-rejoindre", permanent: true },
      // Espaces → Visiter
      { source: "/espaces", destination: "/visiter", permanent: true },
      { source: "/terra-numerica-sophia", destination: "/visiter/sophia", permanent: true },
      { source: "/espaces-partenaires-terra-numerica", destination: "/visiter/espaces-partenaires", permanent: true },
      { source: "/science-tour-terra-numerica", destination: "/visiter/espaces-partenaires", permanent: true },
      { source: "/actions-hors-les-murs", destination: "/visiter/espaces-partenaires", permanent: true },
      { source: "/grand-public", destination: "/visiter/agenda", permanent: true },
      { source: "/inscription", destination: "/visiter/agenda", permanent: true },
      // Scolaires
      { source: "/scolaires", destination: "/scolaires/offre", permanent: true },
      { source: "/dispositifs-specifiques", destination: "/scolaires/offre", permanent: true },
      // Entreprises
      { source: "/visite-decouverte-et-team-building", destination: "/entreprises/team-building", permanent: true },
      { source: "/formations", destination: "/entreprises/formations", permanent: true },
      { source: "/offre-pro", destination: "/entreprises", permanent: true },
      // Ressources
      { source: "/offre-terra-numerica", destination: "/", permanent: true },
      { source: "/ateliers-sous-toutes-les-formes", destination: "/ressources/ateliers", permanent: true },
      { source: "/conferences", destination: "/ressources/conferences", permanent: true },
      { source: "/manuel-galejade", destination: "/ressources/manuel-galejade", permanent: true },
      { source: "/livret-activites-sttn", destination: "/ressources/livret-science-tour", permanent: true },
      { source: "/lab-terra-numerica", destination: "/ressources/lab-creativite", permanent: true },
      { source: "/trophees-des-makers-du-numerique", destination: "/ressources/trophees-makers", permanent: true },
      // Stages → nous-rejoindre
      { source: "/stages", destination: "/decouvrir/nous-rejoindre", permanent: true },
      // Médias → Actualités
      { source: "/medias", destination: "/actualites", permanent: true },
      { source: "/la-lettre-de-terra-numerica", destination: "/actualites/newsletter", permanent: true },
      { source: "/videotheque", destination: "/actualites/videos", permanent: true },
      { source: "/presse", destination: "/actualites/presse", permanent: true },
      { source: "/retrospective", destination: "/actualites/retrospectives/2025", permanent: true },
      // Gestion du slash final (WP génère des URLs avec trailing slash)
      { source: "/terra-numerica/", destination: "/decouvrir/projet", permanent: true },
      { source: "/le-projet/", destination: "/decouvrir/projet", permanent: true },
      { source: "/terra-numerica-en-chiffres/", destination: "/decouvrir/chiffres-et-carte", permanent: true },
      { source: "/envie-de-vous-impliquer/", destination: "/decouvrir/collectif", permanent: true },
      { source: "/financeurs/", destination: "/decouvrir/partenaires-financeurs", permanent: true },
      { source: "/partenaires/", destination: "/decouvrir/partenaires-financeurs", permanent: true },
      { source: "/territoires/", destination: "/decouvrir/territoires", permanent: true },
      { source: "/offre/", destination: "/decouvrir/nous-rejoindre", permanent: true },
      { source: "/espaces/", destination: "/visiter", permanent: true },
      { source: "/terra-numerica-sophia/", destination: "/visiter/sophia", permanent: true },
      { source: "/espaces-partenaires-terra-numerica/", destination: "/visiter/espaces-partenaires", permanent: true },
      { source: "/science-tour-terra-numerica/", destination: "/visiter/espaces-partenaires", permanent: true },
      { source: "/actions-hors-les-murs/", destination: "/visiter/espaces-partenaires", permanent: true },
      { source: "/grand-public/", destination: "/visiter/agenda", permanent: true },
      { source: "/inscription/", destination: "/visiter/agenda", permanent: true },
      { source: "/scolaires/", destination: "/scolaires/offre", permanent: true },
      { source: "/dispositifs-specifiques/", destination: "/scolaires/offre", permanent: true },
      { source: "/visite-decouverte-et-team-building/", destination: "/entreprises/team-building", permanent: true },
      { source: "/formations/", destination: "/entreprises/formations", permanent: true },
      { source: "/offre-pro/", destination: "/entreprises", permanent: true },
      { source: "/offre-terra-numerica/", destination: "/", permanent: true },
      { source: "/ateliers-sous-toutes-les-formes/", destination: "/ressources/ateliers", permanent: true },
      { source: "/conferences/", destination: "/ressources/conferences", permanent: true },
      { source: "/manuel-galejade/", destination: "/ressources/manuel-galejade", permanent: true },
      { source: "/livret-activites-sttn/", destination: "/ressources/livret-science-tour", permanent: true },
      { source: "/lab-terra-numerica/", destination: "/ressources/lab-creativite", permanent: true },
      { source: "/trophees-des-makers-du-numerique/", destination: "/ressources/trophees-makers", permanent: true },
      { source: "/stages/", destination: "/decouvrir/nous-rejoindre", permanent: true },
      { source: "/medias/", destination: "/actualites", permanent: true },
      { source: "/la-lettre-de-terra-numerica/", destination: "/actualites/newsletter", permanent: true },
      { source: "/videotheque/", destination: "/actualites/videos", permanent: true },
      { source: "/presse/", destination: "/actualites/presse", permanent: true },
      { source: "/retrospective/", destination: "/actualites/retrospectives/2025", permanent: true },
    ];
  },
};

export default nextConfig;
