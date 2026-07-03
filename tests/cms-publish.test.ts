import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ getFile: vi.fn(), commitFiles: vi.fn() }));
vi.mock("@/lib/cms-locks", () => ({ holdsLock: vi.fn(), releaseLock: vi.fn() }));

import { commitFiles } from "@/lib/github";
import { holdsLock, releaseLock } from "@/lib/cms-locks";
import { publish, validateImages } from "@/lib/cms-publish";

const mockCommit = vi.mocked(commitFiles);
const mockHolds = vi.mocked(holdsLock);
const mockRelease = vi.mocked(releaseLock);

// WebP minimal : RIFF....WEBP (12 octets d'en-tête suffisent pour le magic check)
const webpBase64 = Buffer.concat([
  Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"),
]).toString("base64");

const validPresse = [
  { id: "p-001", title: "Titre", source: "Nice-Matin", date: "2026-06" },
];

beforeEach(() => {
  mockCommit.mockReset().mockResolvedValue("commit1");
  mockHolds.mockReset().mockResolvedValue(true);
  mockRelease.mockReset().mockResolvedValue(true);
});

describe("validateImages", () => {
  it("accepte un WebP conforme au bon chemin", () => {
    expect(validateImages("presse", [{ path: "uploads/presse/photo-a1b2c3d4.webp", base64: webpBase64 }])).toBeNull();
  });
  it("refuse un chemin hors uploads/<collection>/ (traversal)", () => {
    expect(validateImages("presse", [{ path: "uploads/../lib/x.webp", base64: webpBase64 }])).toBeTruthy();
    expect(validateImages("presse", [{ path: "uploads/autre/x-a1b2c3d4.webp", base64: webpBase64 }])).toBeTruthy();
  });
  it("refuse un fichier qui n'est pas du WebP", () => {
    const png = Buffer.from("\x89PNG mais pas webp").toString("base64");
    expect(validateImages("presse", [{ path: "uploads/presse/x-a1b2c3d4.webp", base64: png }])).toBeTruthy();
  });
  it("refuse au-delà de 4 Mo", () => {
    const big = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(4 * 1024 * 1024)]).toString("base64");
    expect(validateImages("presse", [{ path: "uploads/presse/x-a1b2c3d4.webp", base64: big }])).toBeTruthy();
  });
});

describe("publish", () => {
  it("valide, commite JSON + images en un commit, libère le verrou", async () => {
    const result = await publish("presse", "a@b.fr", validPresse, [
      { path: "uploads/presse/photo-a1b2c3d4.webp", base64: webpBase64 },
    ]);
    expect(result).toEqual({ commitSha: "commit1" });
    const [files, message] = mockCommit.mock.calls[0];
    expect(files).toHaveLength(2);
    expect(files[0]).toMatchObject({ path: "content/actualites/presse.json" });
    expect(files[1]).toMatchObject({ path: "public/uploads/presse/photo-a1b2c3d4.webp" });
    expect(message).toContain("a@b.fr");
    expect(mockRelease).toHaveBeenCalledWith("presse", "a@b.fr");
  });

  it("publie quand même si la libération du verrou échoue", async () => {
    mockRelease.mockRejectedValueOnce(new Error("conflit"));
    await expect(publish("presse", "a@b.fr", validPresse, [])).resolves.toEqual({ commitSha: "commit1" });
  });

  it("409 si l'appelant ne détient pas le verrou", async () => {
    mockHolds.mockResolvedValueOnce(false);
    await expect(publish("presse", "a@b.fr", validPresse, [])).rejects.toMatchObject({ status: 409 });
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("400 si le contenu viole le schéma Zod", async () => {
    await expect(publish("presse", "a@b.fr", [{ id: "x", title: "", source: "s", date: "2026-06" }], []))
      .rejects.toMatchObject({ status: 400 });
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("le JSON commité est formaté (2 espaces + saut de ligne final)", async () => {
    await publish("presse", "a@b.fr", validPresse, []);
    const file = mockCommit.mock.calls[0][0][0] as { content: string };
    expect(file.content).toBe(JSON.stringify(validPresse, null, 2) + "\n");
  });

  it("PublishError si collection inconnue (404)", async () => {
    await expect(publish("inconnue", "a@b.fr", [], [])).rejects.toMatchObject({ status: 404 });
  });
});
