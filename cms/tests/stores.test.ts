import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DraftStore, TokenStore, type Encryptor } from "../src/main/stores";

let dir: string;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), "cms-stores-")); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const fakeEnc: Encryptor = {
  available: () => true,
  encrypt: (t) => Buffer.from(t, "utf-8").reverse(),
  decrypt: (d) => Buffer.from(d).reverse().toString("utf-8"),
};
const noEnc: Encryptor = {
  available: () => false,
  encrypt: () => { throw new Error("indisponible"); },
  decrypt: () => { throw new Error("indisponible"); },
};

describe("TokenStore", () => {
  it("aller-retour set/get chiffré sur disque (survit à une nouvelle instance)", () => {
    new TokenStore(dir, fakeEnc).set("jeton");
    expect(new TokenStore(dir, fakeEnc).get()).toBe("jeton");
  });

  it("get renvoie null sans token, clear efface", () => {
    const store = new TokenStore(dir, fakeEnc);
    expect(store.get()).toBeNull();
    store.set("jeton");
    store.clear();
    expect(store.get()).toBeNull();
  });

  it("coffre OS indisponible → mémoire seulement (rien sur disque)", () => {
    const store = new TokenStore(dir, noEnc);
    store.set("jeton");
    expect(store.get()).toBe("jeton");            // dans la même instance
    expect(new TokenStore(dir, noEnc).get()).toBeNull(); // pas persisté
  });
});

describe("DraftStore", () => {
  it("aller-retour write/read/delete", () => {
    const store = new DraftStore(dir);
    expect(store.read("presse")).toBeNull();
    store.write("presse", { content: [1], images: {} });
    expect(store.read("presse")).toEqual({ content: [1], images: {} });
    store.delete("presse");
    expect(store.read("presse")).toBeNull();
  });

  it("refuse les clés dangereuses (traversal)", () => {
    const store = new DraftStore(dir);
    expect(() => store.write("../evil", {})).toThrow();
    expect(() => store.read("a/b")).toThrow();
  });
});
