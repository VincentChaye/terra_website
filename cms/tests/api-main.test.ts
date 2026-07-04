import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../src/main/api";

// fetch qui respecte l'AbortSignal : pend jusqu'au timeout.
function hangingFetch(): typeof fetch {
  return ((_url: string, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
    })) as unknown as typeof fetch;
}

let calls: { url: string; init?: RequestInit }[];

beforeEach(() => { calls = []; });
afterEach(() => vi.unstubAllGlobals());

function stubFetch(impls: ((url: string, init?: RequestInit) => Promise<Response>)[]) {
  let i = 0;
  vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return impls[Math.min(i++, impls.length - 1)](url, init);
  });
}

const ok = (json: unknown, status = 200) => async () =>
  new Response(JSON.stringify(json), { status });

describe("apiRequest (main)", () => {
  it("envoie méthode, Bearer et body JSON ; renvoie status + json", async () => {
    stubFetch([ok({ done: true }, 201)]);
    const res = await apiRequest("/api/admin/x", { method: "POST", body: { a: 1 }, token: "jwt" });
    expect(res).toEqual({ status: 201, json: { done: true } });
    const init = calls[0].init!;
    expect(calls[0].url).toContain("/api/admin/x");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer jwt");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("réessaie avec le timeout long après un premier timeout (réveil Render)", async () => {
    stubFetch([
      (u, i) => hangingFetch()(u, i),
      async () => new Response(JSON.stringify({ token: "t" }), { status: 200 }),
    ]);
    const res = await apiRequest("/api/admin/login", { method: "POST", body: {} }, { first: 20, retry: 500 });
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(2);
  });

  it("ne réessaie PAS un PUT (risque de double publication) : un seul essai long", async () => {
    stubFetch([(u, i) => hangingFetch()(u, i)]);
    await expect(
      apiRequest("/api/admin/content/presse", { method: "PUT", body: {} }, { first: 20, retry: 30 })
    ).rejects.toBeTruthy();
    expect(calls).toHaveLength(1);
  });

  it("réponse sans corps JSON (204) → json vide", async () => {
    stubFetch([async () => new Response(null, { status: 204 })]);
    expect(await apiRequest("/api/admin/lock/presse", { method: "DELETE" })).toEqual({ status: 204, json: {} });
  });
});
