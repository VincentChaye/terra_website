import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ readLocks: vi.fn(), writeLocks: vi.fn() }));

import { readLocks, writeLocks, type Locks } from "@/lib/github";
import { acquireLock, holdsLock, releaseLock } from "@/lib/cms-locks";

const mockRead = vi.mocked(readLocks);
const mockWrite = vi.mocked(writeLocks);

const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const past = new Date(Date.now() - 60 * 1000).toISOString();

function withLocks(locks: Locks) {
  mockRead.mockResolvedValue({ locks, sha: "s1" });
}

beforeEach(() => {
  mockRead.mockReset();
  mockWrite.mockReset();
  mockWrite.mockResolvedValue(true);
});

describe("acquireLock", () => {
  it("accorde un verrou libre et l'écrit avec une expiration à ~24h", async () => {
    withLocks({});
    const result = await acquireLock("presse", "a@b.fr");
    expect(result.ok).toBe(true);
    const written = mockWrite.mock.calls[0][0];
    expect(written.presse.email).toBe("a@b.fr");
    const ttlH = (new Date(written.presse.expiresAt).getTime() - Date.now()) / 3_600_000;
    expect(ttlH).toBeGreaterThan(23.9);
    expect(ttlH).toBeLessThan(24.1);
  });

  it("refuse si verrouillé par quelqu'un d'autre (non expiré)", async () => {
    withLocks({ presse: { email: "autre@b.fr", expiresAt: future } });
    const result = await acquireLock("presse", "a@b.fr");
    expect(result).toEqual({ ok: false, heldBy: "autre@b.fr", expiresAt: future });
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("un verrou expiré est considéré libre", async () => {
    withLocks({ presse: { email: "autre@b.fr", expiresAt: past } });
    expect((await acquireLock("presse", "a@b.fr")).ok).toBe(true);
  });

  it("le détenteur peut reprendre son propre verrou (expiration rafraîchie)", async () => {
    withLocks({ presse: { email: "a@b.fr", expiresAt: future } });
    expect((await acquireLock("presse", "a@b.fr")).ok).toBe(true);
    expect(mockWrite).toHaveBeenCalled();
  });

  it("relit et réessaie une fois sur conflit d'écriture GitHub", async () => {
    withLocks({});
    mockWrite.mockResolvedValueOnce(false); // 1er essai : quelqu'un a écrit entre-temps
    mockWrite.mockResolvedValueOnce(true);
    expect((await acquireLock("presse", "a@b.fr")).ok).toBe(true);
    expect(mockRead).toHaveBeenCalledTimes(2);
  });
});

describe("releaseLock / holdsLock", () => {
  it("libère son propre verrou", async () => {
    withLocks({ presse: { email: "a@b.fr", expiresAt: future } });
    expect(await releaseLock("presse", "a@b.fr")).toBe(true);
    expect(mockWrite.mock.calls[0][0]).toEqual({});
  });

  it("refuse de libérer le verrou d'autrui", async () => {
    withLocks({ presse: { email: "autre@b.fr", expiresAt: future } });
    expect(await releaseLock("presse", "a@b.fr")).toBe(false);
  });

  it("holdsLock : vrai seulement pour le détenteur d'un verrou non expiré", async () => {
    withLocks({ presse: { email: "a@b.fr", expiresAt: future } });
    expect(await holdsLock("presse", "a@b.fr")).toBe(true);
    expect(await holdsLock("presse", "autre@b.fr")).toBe(false);
    withLocks({ presse: { email: "a@b.fr", expiresAt: past } });
    expect(await holdsLock("presse", "a@b.fr")).toBe(false);
  });
});
