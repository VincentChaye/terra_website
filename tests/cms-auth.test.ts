import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/wimi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/wimi")>();
  return { ...mod, wimiCall: vi.fn() };
});

import { wimiCall, WimiApiError } from "@/lib/wimi";
import {
  checkLoginRateLimit, requireAuth, signCmsJwt, userHasCmsAccess,
  verifyCmsJwt, WimiAuthError, wimiUserLogin, _resetRateLimit,
} from "@/lib/cms-auth";

const mockCall = vi.mocked(wimiCall);

beforeEach(() => {
  process.env.WIMI_ACCOUNT_NAME = "terranumerica";
  process.env.WIMI_CMS_SPACE_ID = "42";
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  mockCall.mockReset();
  _resetRateLimit();
});

describe("wimiUserLogin", () => {
  it("renvoie token/userId/accountId si Wimi accepte", async () => {
    mockCall.mockResolvedValueOnce({
      header: { token: "wimi-token" },
      data: { user: { user_id: 7 }, account: { account_id: 3 } },
    });
    await expect(wimiUserLogin("a@b.fr", "mdp")).resolves.toEqual({
      token: "wimi-token", userId: 7, accountId: 3,
    });
  });

  it("lève WimiAuthError si Wimi refuse (body.error)", async () => {
    mockCall.mockRejectedValueOnce(new WimiApiError("Wimi erreur 401 : bad credentials", 401));
    await expect(wimiUserLogin("a@b.fr", "faux")).rejects.toBeInstanceOf(WimiAuthError);
  });

  it("relaie les pannes réseau telles quelles (pas un WimiAuthError)", async () => {
    mockCall.mockRejectedValueOnce(new Error("Wimi HTTP 503"));
    await expect(wimiUserLogin("a@b.fr", "mdp")).rejects.not.toBeInstanceOf(WimiAuthError);
  });
});

describe("userHasCmsAccess", () => {
  const session = { token: "t", userId: 7, accountId: 3 };
  it("true si l'espace autorisé est dans la liste", async () => {
    mockCall.mockResolvedValueOnce({ header: {}, data: { projects: [{ project_id: 41 }, { project_id: 42 }] } });
    await expect(userHasCmsAccess(session)).resolves.toBe(true);
    // Cible validée empiriquement le 2026-07-06 contre la vraie WApi :
    // project.GetList n'existe pas (400 générique), c'est main.session.LoadProjects.
    expect(mockCall).toHaveBeenCalledWith(
      "main.session.LoadProjects",
      { account_id: 3, user_id: 7 },
      null,
      { token: "t" }
    );
  });
  it("false sinon", async () => {
    mockCall.mockResolvedValueOnce({ header: {}, data: { projects: [{ project_id: 41 }] } });
    await expect(userHasCmsAccess(session)).resolves.toBe(false);
  });
});

describe("JWT", () => {
  it("aller-retour sign/verify", async () => {
    const jwt = await signCmsJwt("a@b.fr", 7);
    await expect(verifyCmsJwt(jwt)).resolves.toEqual({ email: "a@b.fr", userId: 7 });
  });
  it("verify renvoie null sur un token altéré", async () => {
    const jwt = await signCmsJwt("a@b.fr", 7);
    await expect(verifyCmsJwt(jwt + "x")).resolves.toBeNull();
  });
  it("requireAuth lit le Bearer", async () => {
    const jwt = await signCmsJwt("a@b.fr", 7);
    const req = new Request("http://test/", { headers: { Authorization: `Bearer ${jwt}` } });
    await expect(requireAuth(req)).resolves.toEqual({ email: "a@b.fr", userId: 7 });
    await expect(requireAuth(new Request("http://test/"))).resolves.toBeNull();
  });
});

describe("rate-limit login", () => {
  it("bloque à partir de la 6e tentative sur 15 min", () => {
    for (let i = 0; i < 5; i++) expect(checkLoginRateLimit("1.2.3.4")).toBe(true);
    expect(checkLoginRateLimit("1.2.3.4")).toBe(false);
    expect(checkLoginRateLimit("5.6.7.8")).toBe(true); // autre IP indépendante
  });
});
