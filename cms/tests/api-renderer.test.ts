import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, versionAtLeast } from "@/lib/api";

const mockRequest = vi.fn();

beforeEach(() => {
  mockRequest.mockReset();
  (window as unknown as { cms: unknown }).cms = { apiRequest: mockRequest };
});

describe("api (renderer)", () => {
  it("login POST le bon payload et renvoie le corps", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { token: "t", email: "a@b.fr" } });
    await expect(api.login("a@b.fr", "mdp")).resolves.toEqual({ token: "t", email: "a@b.fr" });
    expect(mockRequest).toHaveBeenCalledWith("/api/admin/login", {
      method: "POST",
      body: { email: "a@b.fr", password: "mdp" },
    });
  });

  it("erreur serveur → ApiError avec le message affichable et le status", async () => {
    mockRequest.mockResolvedValueOnce({ status: 401, json: { error: "Identifiants Wimi incorrects." } });
    const err = await api.login("a@b.fr", "faux").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Identifiants Wimi incorrects.");
    expect(err.status).toBe(401);
  });

  it("acquireLock : 200 → ok, 423 → détenteur", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { expiresAt: "2026-07-04T13:00:00Z" } });
    await expect(api.acquireLock("t", "presse")).resolves.toEqual({
      ok: true, expiresAt: "2026-07-04T13:00:00Z",
    });
    mockRequest.mockResolvedValueOnce({
      status: 423,
      json: { error: "x", heldBy: "marie@tn.org", expiresAt: "2026-07-04T13:00:00Z" },
    });
    await expect(api.acquireLock("t", "presse")).resolves.toEqual({
      ok: false, heldBy: "marie@tn.org", expiresAt: "2026-07-04T13:00:00Z",
    });
  });

  it("listUploads déballe { images }", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { images: ["/uploads/presse/a-12345678.webp"] } });
    await expect(api.listUploads("t", "presse")).resolves.toEqual(["/uploads/presse/a-12345678.webp"]);
  });

  it("le token part en option de toutes les routes authentifiées", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { content: [], sha: "s" } });
    await api.getContent("jwt", "presse");
    expect(mockRequest).toHaveBeenCalledWith("/api/admin/content/presse", { token: "jwt" });
  });
});

describe("versionAtLeast", () => {
  it("compare numériquement segment par segment", () => {
    expect(versionAtLeast("1.2.3", "1.2.3")).toBe(true);
    expect(versionAtLeast("1.10.0", "1.9.9")).toBe(true);
    expect(versionAtLeast("0.9.0", "1.0.0")).toBe(false);
    expect(versionAtLeast("1.0", "1.0.1")).toBe(false);
  });
});
