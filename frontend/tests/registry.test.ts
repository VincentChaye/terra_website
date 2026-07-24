import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { payloadSchema, registry } from "@/content/registry";

describe("registre de contenu", () => {
  it("chaque entrée pointe vers un fichier JSON existant et valide", () => {
    for (const [key, entry] of Object.entries(registry)) {
      const raw = readFileSync(join(process.cwd(), "content", entry.file), "utf-8");
      const result = payloadSchema(entry).safeParse(JSON.parse(raw));
      expect(result.success, `${key} : ${result.success ? "" : result.error.message}`).toBe(true);
    }
  });

  it("les champs déclarés existent dans le schéma d'élément", () => {
    for (const entry of Object.values(registry)) {
      // Tous les schémas d'élément sont des z.object : on compare les clés.
      const shape = (entry.schema as unknown as { shape: Record<string, unknown> }).shape;
      for (const field of Object.keys(entry.fields)) {
        expect(shape, `champ ${field} absent du schéma`).toHaveProperty(field);
      }
    }
  });
});
