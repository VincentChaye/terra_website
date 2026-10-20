import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("synchronisation des schémas de formulaire", () => {
  it("backend/src/lib/forms.ts est à jour par rapport à la source frontend/lib/forms.ts", () => {
    const source = readFileSync(join(process.cwd(), "lib", "forms.ts"), "utf-8");
    const copy = readFileSync(
      join(process.cwd(), "..", "backend", "src", "lib", "forms.ts"),
      "utf-8"
    );
    const copyWithoutBanner = copy.replace(/^\/\/.*\n\/\/.*\n\n/, "");

    expect(
      copyWithoutBanner,
      "backend/src/lib/forms.ts a divergé — relancez `npm run sync:forms` à la racine"
    ).toBe(source);
  });
});
