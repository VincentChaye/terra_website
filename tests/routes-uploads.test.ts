import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ listDir: vi.fn() }));

import { listDir } from "@/lib/github";
import { signCmsJwt } from "@/lib/cms-auth";
import { GET } from "@/app/api/admin/uploads/[collection]/route";

const mockList = vi.mocked(listDir);

function ctx(collection: string) {
  return { params: Promise.resolve({ collection }) };
}

async function authedRequest(): Promise<Request> {
  const jwt = await signCmsJwt("a@b.fr", 7);
  return new Request("http://test/api/admin/uploads/presse", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

beforeEach(() => {
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  mockList.mockReset();
});

describe("GET /api/admin/uploads/{collection}", () => {
  it("401 sans JWT", async () => {
    expect((await GET(new Request("http://test/"), ctx("presse"))).status).toBe(401);
  });

  it("404 si collection hors registre", async () => {
    expect((await GET(await authedRequest(), ctx("inconnue"))).status).toBe(404);
  });

  it("liste les chemins /uploads/… des .webp du dossier", async () => {
    mockList.mockResolvedValueOnce([
      { name: "a-12345678.webp", path: "public/uploads/presse/a-12345678.webp" },
      { name: "note.txt", path: "public/uploads/presse/note.txt" },
    ]);
    const res = await GET(await authedRequest(), ctx("presse"));
    expect(await res.json()).toEqual({ images: ["/uploads/presse/a-12345678.webp"] });
    expect(mockList).toHaveBeenCalledWith("public/uploads/presse");
  });

  it("dossier absent → liste vide", async () => {
    mockList.mockResolvedValueOnce([]);
    expect(await (await GET(await authedRequest(), ctx("presse"))).json()).toEqual({ images: [] });
  });
});
