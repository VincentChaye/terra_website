/**
 * Vérifie que la copie du registre embarquée dans le dépôt tn-cms est
 * identique à la source de vérité du site. Ignoré si tn-cms n'est pas cloné
 * à côté (CI du site seul) — surchargez CMS_REPO pour pointer ailleurs.
 * En cas d'échec : `npm run sync:registry` puis committer dans tn-cms.
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const siteRegistry = resolve(__dirname, "../content/registry.ts");
const cmsRegistry = resolve(
  process.env.CMS_REPO ?? resolve(__dirname, "../../tn-cms"),
  "content/registry.ts"
);

describe("synchronisation du registre avec tn-cms", () => {
  it.skipIf(!existsSync(cmsRegistry))(
    "les deux copies de content/registry.ts sont identiques",
    () => {
      expect(readFileSync(cmsRegistry, "utf8")).toBe(
        readFileSync(siteRegistry, "utf8")
      );
    }
  );
});
