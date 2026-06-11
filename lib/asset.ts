/**
 * lib/asset.ts — Préfixe basePath pour les assets de public/.
 *
 * En export statique sous sous-chemin (GitHub Pages /terra_website), Next
 * n'ajoute PAS automatiquement le basePath devant le `src` de next/image ni
 * devant les icônes de metadata. La doc Next est explicite : « When using the
 * next/image component, you will need to add the basePath in front of src ».
 * On le préfixe donc nous-mêmes.
 *
 * NEXT_PUBLIC_BASE_PATH est défini au build GitHub Pages (= /terra_website) et
 * vide ailleurs (backend Render servi à la racine, dev local) → chemin correct
 * dans les trois cas. Variable NEXT_PUBLIC_* → inlinée au build, donc dispo
 * côté client comme côté serveur.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Chemin d'un asset de public/ tenant compte du basePath (ex. asset("/globe-tn.png")). */
export const asset = (path: string): string => `${BASE_PATH}${path}`;
