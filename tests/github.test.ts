import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { commitFiles, getFile, readLocks, writeLocks } from "@/lib/github";

// Mock de fetch : on route par (méthode, chemin) et on enregistre les appels.
type Handler = (init?: RequestInit) => { status: number; json: unknown };
let routes: Record<string, Handler>;
let calls: { key: string; body: unknown }[];

beforeEach(() => {
  process.env.GITHUB_CMS_TOKEN = "test-token";
  process.env.GITHUB_REPO = "org/tn-site";
  routes = {};
  calls = [];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname + new URL(url).search;
    const key = `${init?.method ?? "GET"} ${path}`;
    const handler = routes[key];
    if (!handler) throw new Error(`route non mockée : ${key}`);
    calls.push({ key, body: init?.body ? JSON.parse(init.body as string) : undefined });
    const { status, json } = handler(init);
    return new Response(JSON.stringify(json), { status });
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("getFile", () => {
  it("décode le contenu base64 et renvoie le sha", async () => {
    routes["GET /repos/org/tn-site/contents/content%2Factualites%2Fpresse.json?ref=main"] = () => ({
      status: 200,
      json: { content: Buffer.from("[1,2]").toString("base64"), sha: "abc" },
    });
    expect(await getFile("content/actualites/presse.json")).toEqual({ text: "[1,2]", sha: "abc" });
  });

  it("renvoie null sur 404", async () => {
    routes["GET /repos/org/tn-site/contents/nope.json?ref=main"] = () => ({ status: 404, json: {} });
    expect(await getFile("nope.json")).toBeNull();
  });
});

describe("commitFiles", () => {
  it("blobs → tree → commit → update ref, renvoie le sha du commit", async () => {
    routes["GET /repos/org/tn-site/git/ref/heads%2Fmain"] = () => ({ status: 200, json: { object: { sha: "head1" } } });
    routes["GET /repos/org/tn-site/git/commits/head1"] = () => ({ status: 200, json: { tree: { sha: "tree1" } } });
    routes["POST /repos/org/tn-site/git/blobs"] = () => ({ status: 201, json: { sha: "blob1" } });
    routes["POST /repos/org/tn-site/git/trees"] = () => ({ status: 201, json: { sha: "tree2" } });
    routes["POST /repos/org/tn-site/git/commits"] = () => ({ status: 201, json: { sha: "commit1" } });
    routes["PATCH /repos/org/tn-site/git/refs/heads%2Fmain"] = () => ({ status: 200, json: {} });

    const sha = await commitFiles(
      [{ path: "content/actualites/presse.json", content: "[]" }],
      "CMS : test"
    );
    expect(sha).toBe("commit1");
    const commitCall = calls.find((c) => c.key === "POST /repos/org/tn-site/git/commits");
    expect(commitCall?.body).toMatchObject({ message: "CMS : test", parents: ["head1"], tree: "tree2" });
  });
});

describe("verrous (branche cms-locks)", () => {
  it("readLocks renvoie vide si le fichier n'existe pas", async () => {
    routes["GET /repos/org/tn-site/contents/locks.json?ref=cms-locks"] = () => ({ status: 404, json: {} });
    expect(await readLocks()).toEqual({ locks: {}, sha: null });
  });

  it("writeLocks crée la branche si absente puis écrit ; false si conflit de sha", async () => {
    routes["GET /repos/org/tn-site/git/ref/heads%2Fcms-locks"] = () => ({ status: 404, json: {} });
    routes["GET /repos/org/tn-site/git/ref/heads%2Fmain"] = () => ({ status: 200, json: { object: { sha: "head1" } } });
    routes["POST /repos/org/tn-site/git/refs"] = () => ({ status: 201, json: {} });
    routes["PUT /repos/org/tn-site/contents/locks.json"] = () => ({ status: 200, json: {} });
    expect(await writeLocks({}, null)).toBe(true);

    routes["GET /repos/org/tn-site/git/ref/heads%2Fcms-locks"] = () => ({ status: 200, json: {} });
    routes["PUT /repos/org/tn-site/contents/locks.json"] = () => ({ status: 409, json: {} });
    expect(await writeLocks({}, "old-sha")).toBe(false);
  });
});
