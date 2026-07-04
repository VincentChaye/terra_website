import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api")>();
  return { ...mod, api: { ...mod.api, putContent: vi.fn(), status: vi.fn() } };
});

import { registry } from "@site/content/registry";
import { api, ApiError } from "@/lib/api";
import { deployLabel, invalidItems, usedImages } from "@/lib/publish";
import { PublishBar } from "@/components/PublishBar";

const mockPut = vi.mocked(api.putContent);
const mockStatus = vi.mocked(api.status);

const session = { token: "jwt", email: "a@b.fr" };
const validContent = [{ id: "p1", title: "T", source: "S", date: "2026-06" }];

afterEach(cleanup);
beforeEach(() => {
  mockPut.mockReset();
  mockStatus.mockReset();
});

describe("usedImages", () => {
  it("ne garde que les images référencées par le contenu", () => {
    const images = {
      "uploads/presse/gardee-a1b2c3d4.webp": "AAA",
      "uploads/presse/remplacee-ffffffff.webp": "BBB",
    };
    const content = [{ id: "x", photo: "/uploads/presse/gardee-a1b2c3d4.webp" }];
    expect(usedImages(content, images)).toEqual([
      { path: "uploads/presse/gardee-a1b2c3d4.webp", base64: "AAA" },
    ]);
  });
});

describe("invalidItems", () => {
  it("liste les libellés des éléments invalides", () => {
    const content = [
      { id: "a", title: "Valide", source: "S", date: "2026-06" },
      { id: "b", title: "", source: "S", date: "2026-06" },
    ];
    expect(invalidItems(registry.presse, content)).toEqual(["(sans titre)"]);
    expect(invalidItems(registry.presse, validContent)).toEqual([]);
  });
});

describe("deployLabel", () => {
  it("pending / succès / échec", () => {
    expect(deployLabel(null).tone).toBe("pending");
    expect(deployLabel({ status: "in_progress", conclusion: null, url: "" }).tone).toBe("pending");
    expect(deployLabel({ status: "completed", conclusion: "success", url: "" }).tone).toBe("ok");
    const failed = deployLabel({ status: "completed", conclusion: "failure", url: "" });
    expect(failed.tone).toBe("error");
    expect(failed.text).toContain("administrateur");
  });
});

describe("PublishBar", () => {
  const draft = { content: validContent, images: {}, savedAt: "2026-07-03T10:00:00Z" };

  it("publie le brouillon et passe en suivi du déploiement", async () => {
    mockPut.mockResolvedValue({ commitSha: "c1" });
    const onPublished = vi.fn();
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={draft} editing={true} onPublished={onPublished} onError={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    expect(await screen.findByText(/Mise en ligne en cours/)).toBeTruthy();
    expect(mockPut).toHaveBeenCalledWith("jwt", "presse", validContent, []);
    expect(onPublished).toHaveBeenCalled();
  });

  it("refus serveur (verrou perdu, 409) → message affiché", async () => {
    mockPut.mockRejectedValue(new ApiError("Vous ne détenez pas (ou plus) le verrou.", 409));
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={draft} editing={true} onPublished={vi.fn()} onError={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    expect((await screen.findByRole("alert")).textContent).toContain("verrou");
  });

  it("contenu invalide → bouton désactivé + éléments fautifs listés", () => {
    const bad = { ...draft, content: [{ id: "a", title: "", source: "S", date: "2026-06" }] };
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={bad} editing={true} onPublished={vi.fn()} onError={vi.fn()} />
    );
    expect((screen.getByRole("button", { name: "Publier" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/à corriger avant publication/).textContent).toContain("(sans titre)");
  });

  it("pas de brouillon ou pas de verrou → bouton désactivé", () => {
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={null} editing={false} onPublished={vi.fn()} onError={vi.fn()} />
    );
    expect((screen.getByRole("button", { name: "Publier" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
