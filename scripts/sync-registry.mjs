/**
 * scripts/sync-registry.mjs — Recopie content/registry.ts vers le dépôt tn-cms
 *
 * Le registre est partagé entre le site (source de vérité) et l'app Electron
 * (dépôt séparé). Ce script pousse la copie du site vers tn-cms ; les tests
 * des deux dépôts vérifient que les copies sont identiques.
 *
 * Usage : npm run sync:registry
 * Le chemin du dépôt tn-cms se déduit du dossier parent (../tn-cms) et peut
 * être surchargé par la variable d'environnement CMS_REPO.
 */

import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cmsRoot = process.env.CMS_REPO ?? resolve(siteRoot, "..", "tn-cms");

const src = resolve(siteRoot, "content/registry.ts");
const dest = resolve(cmsRoot, "content/registry.ts");

if (!existsSync(dest)) {
  console.error(
    `Dépôt tn-cms introuvable (${dest} absent). ` +
      "Cloner tn-cms à côté du site ou définir CMS_REPO."
  );
  process.exit(1);
}

if (readFileSync(src, "utf8") === readFileSync(dest, "utf8")) {
  console.log("Registre déjà synchronisé, rien à faire.");
} else {
  copyFileSync(src, dest);
  console.log(`Registre copié vers ${dest} — penser à committer dans tn-cms.`);
}
