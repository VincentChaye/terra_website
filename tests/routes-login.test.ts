import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms-auth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/cms-auth")>();
  return {
    ...mod,
    wimiUserLogin: vi.fn(),
    userHasCmsAccess: vi.fn(),
    checkLoginRateLimit: vi.fn(() => true),
  };
});

import { checkLoginRateLimit, userHasCmsAccess, WimiAuthError, wimiUserLogin } from "@/lib/cms-auth";
import { POST } from "@/app/api/admin/login/route";

const mockLogin = vi.mocked(wimiUserLogin);
const mockAccess = vi.mocked(userHasCmsAccess);
const mockRate = vi.mocked(checkLoginRateLimit);

function loginRequest(body: unknown): Request {
  return new Request("http://test/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  mockLogin.mockReset();
  mockAccess.mockReset();
  mockRate.mockReturnValue(true);
});

describe("POST /api/admin/login", () => {
  it("200 + JWT si login Wimi OK et accès à l'espace", async () => {
    mockLogin.mockResolvedValueOnce({ token: "t", userId: 7, accountId: 3 });
    mockAccess.mockResolvedValueOnce(true);
    const res = await POST(loginRequest({ email: "a@b.fr", password: "mdp" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.email).toBe("a@b.fr");
    expect(typeof json.token).toBe("string");
  });

  it("401 si identifiants refusés", async () => {
    mockLogin.mockRejectedValueOnce(new WimiAuthError());
    const res = await POST(loginRequest({ email: "a@b.fr", password: "faux" }));
    expect(res.status).toBe(401);
  });

  it("403 si pas d'accès à l'espace CMS", async () => {
    mockLogin.mockResolvedValueOnce({ token: "t", userId: 7, accountId: 3 });
    mockAccess.mockResolvedValueOnce(false);
    expect((await POST(loginRequest({ email: "a@b.fr", password: "mdp" }))).status).toBe(403);
  });

  it("502 si Wimi est en panne", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Wimi HTTP 503"));
    expect((await POST(loginRequest({ email: "a@b.fr", password: "mdp" }))).status).toBe(502);
  });

  it("400 si payload invalide", async () => {
    expect((await POST(loginRequest({ email: "pas-un-email" }))).status).toBe(400);
  });

  it("429 si rate-limit dépassé", async () => {
    mockRate.mockReturnValueOnce(false);
    expect((await POST(loginRequest({ email: "a@b.fr", password: "mdp" }))).status).toBe(429);
  });
});
