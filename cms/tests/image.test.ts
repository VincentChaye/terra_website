import { webcrypto } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { finalizeImage, MAX_IMAGE_BYTES, slugify, toBase64 } from "@/lib/image";

beforeAll(() => {
  // jsdom ne fournit pas crypto.subtle : on branche celui de Node.
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  }
});

describe("slugify", () => {
  it("minuscules ASCII, extension retirée, accents translittérés", () => {
    expect(slugify("Atelier Robots — Édition 2026.JPG")).toBe("atelier-robots-edition-2026");
    expect(slugify("photo.png")).toBe("photo");
  });
  it("jamais vide ni bord de tiret", () => {
    expect(slugify("---.png")).toBe("image");
    expect(slugify("é.png")).toBe("e");
  });
});

describe("toBase64", () => {
  it("encode correctement (aller-retour)", () => {
    const bytes = new Uint8Array([82, 73, 70, 70, 0, 255]);
    expect(atob(toBase64(bytes)).split("").map((c) => c.charCodeAt(0))).toEqual([82, 73, 70, 70, 0, 255]);
  });
});

describe("finalizeImage", () => {
  const webp = new Uint8Array(16);
  webp.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  webp.set([0x57, 0x45, 0x42, 0x50], 8); // "WEBP"

  it("produit un chemin conforme à la regex du serveur", async () => {
    const result = await finalizeImage("presse", "Atelier Robots.png", webp);
    if ("error" in result) throw new Error(result.error);
    expect(result.path).toMatch(/^uploads\/presse\/atelier-robots-[a-f0-9]{8}\.webp$/);
    expect(result.base64).toBe(toBase64(webp));
  });

  it("même contenu → même hash (nom stable, pas de doublon)", async () => {
    const a = await finalizeImage("presse", "x.png", webp);
    const b = await finalizeImage("presse", "x.png", webp);
    expect(a).toEqual(b);
  });

  it("refuse au-delà de 4 Mo après compression", async () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    const result = await finalizeImage("presse", "x.png", big);
    expect("error" in result && result.error).toContain("4 Mo");
  });
});
