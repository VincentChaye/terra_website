import { describe, expect, it } from "vitest";
import { registry } from "@site/content/registry";
import { emptyItem, fieldErrors, groupedRegistry, itemLabel, moveItem } from "@/lib/form";

describe("emptyItem", () => {
  it("génère un id pour les schémas qui en ont un, valeurs par widget", () => {
    const item = emptyItem(registry.presse);
    expect(typeof item.id).toBe("string");
    expect((item.id as string).length).toBeGreaterThan(0);
    expect(item.title).toBe("");
    expect(item).not.toHaveProperty("url"); // optionnel → absent
  });

  it("pas d'id si le schéma n'en a pas ; year → année courante ; paragraphs → []", () => {
    const item = emptyItem(registry.retrospectives);
    expect(item).not.toHaveProperty("id");
    expect(item.year).toBe(new Date().getFullYear());
    expect(item.paragraphs).toEqual([]);
  });
});

describe("fieldErrors", () => {
  it("mappe le premier message Zod de chaque champ fautif", () => {
    const errors = fieldErrors(registry.presse, { id: "x", title: "", source: "s", date: "juin" });
    expect(Object.keys(errors).sort()).toEqual(["date", "title"]);
    expect(errors.date).toContain("YYYY-MM");
  });

  it("objet vide si l'élément est valide", () => {
    expect(
      fieldErrors(registry.presse, { id: "x", title: "T", source: "S", date: "2026-06" })
    ).toEqual({});
  });
});

describe("itemLabel / moveItem / groupedRegistry", () => {
  it("itemLabel délègue à itemTitle, jamais d'exception", () => {
    expect(itemLabel(registry.presse, { title: "Un article" })).toBe("Un article");
    expect(itemLabel(registry.presse, null)).toBe("");
  });

  it("moveItem déplace, et ignore hors bornes", () => {
    expect(moveItem([1, 2, 3], 0, +1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 2, +1)).toEqual([1, 2, 3]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
  });

  it("groupedRegistry regroupe les 4 collections sous Actualités", () => {
    const groups = groupedRegistry();
    const actus = groups.find(([g]) => g === "Actualités");
    expect(actus?.[1]).toHaveLength(4);
  });
});
