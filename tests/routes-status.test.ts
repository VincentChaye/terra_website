import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ getPagesRunForCommit: vi.fn() }));

import { getPagesRunForCommit } from "@/lib/github";
import { signCmsJwt } from "@/lib/cms-auth";
import { GET } from "@/app/api/admin/status/route";

const mockRun = vi.mocked(getPagesRunForCommit);

async function authedRequest(url: string): Promise<Request> {
  const jwt = await signCmsJwt("a@b.fr", 7);
  return new Request(url, { headers: { Authorization: `Bearer ${jwt}` } });
}

beforeEach(() => {
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  process.env.CMS_MIN_APP_VERSION = "1.0.0";
  mockRun.mockReset();
});

describe("GET /api/admin/status", () => {
  it("401 sans JWT", async () => {
    expect((await GET(new Request("http://test/api/admin/status"))).status).toBe(401);
  });

  it("renvoie la version minimale, deploy null sans sha", async () => {
    const res = await GET(await authedRequest("http://test/api/admin/status"));
    expect(await res.json()).toEqual({ minAppVersion: "1.0.0", deploy: null });
  });

  it("relaie le run Actions du commit demandé", async () => {
    mockRun.mockResolvedValueOnce({ status: "completed", conclusion: "success", url: "https://gh/run/1" });
    const res = await GET(await authedRequest("http://test/api/admin/status?sha=abc123"));
    expect((await res.json()).deploy).toEqual({ status: "completed", conclusion: "success", url: "https://gh/run/1" });
    expect(mockRun).toHaveBeenCalledWith("abc123");
  });
});
