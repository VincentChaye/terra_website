#!/usr/bin/env node
// Copie frontend/src/lib/forms.ts (source de vérité) vers backend/src/lib/forms.ts.
// Lancé automatiquement avant le build backend (voir backend/package.json,
// script "prebuild") et disponible en manuel via `npm run sync:forms`.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "frontend", "src", "lib", "forms.ts");
const target = join(root, "backend", "src", "lib", "forms.ts");

const banner =
  "// ⚠️  Fichier généré depuis frontend/src/lib/forms.ts par `npm run sync:forms`.\n" +
  "// Ne modifiez pas cette copie directement : éditez la source puis relancez le script.\n\n";

writeFileSync(target, banner + readFileSync(source, "utf-8"));
console.log(`[sync-forms] frontend/src/lib/forms.ts → backend/src/lib/forms.ts`);
