import { describe, expect, it } from "vitest";
import { payloadSchema, registry } from "@site/content/registry";

describe("registre partagé (import depuis la racine du repo)", () => {
  it("expose les collections d'actualités", () => {
    for (const key of ["presse", "newsletter", "retrospectives", "videos"]) {
      expect(registry).toHaveProperty(key);
    }
  });

  it("payloadSchema d'une collection accepte un tableau, refuse un objet", () => {
    expect(payloadSchema(registry.presse).safeParse([]).success).toBe(true);
    expect(payloadSchema(registry.presse).safeParse({}).success).toBe(false);
  });
});
