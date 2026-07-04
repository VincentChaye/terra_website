import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...mod,
    api: {
      ...mod.api,
      getContent: vi.fn(),
      lockStatus: vi.fn(),
      acquireLock: vi.fn(),
      releaseLock: vi.fn(),
      listUploads: vi.fn(),
    },
  };
});

import { api } from "@/lib/api";
import { CollectionScreen } from "@/components/CollectionScreen";

const mocked = {
  getContent: vi.mocked(api.getContent),
  lockStatus: vi.mocked(api.lockStatus),
  acquireLock: vi.mocked(api.acquireLock),
  listUploads: vi.mocked(api.listUploads),
};

const session = { token: "jwt", email: "a@b.fr" };
const future = new Date(Date.now() + 3_600_000).toISOString();
const presse = [
  { id: "p1", title: "Premier article", source: "Nice-Matin", date: "2026-06" },
  { id: "p2", title: "Deuxième article", source: "Var-Matin", date: "2026-05" },
];

let cmsStub: { readDraft: ReturnType<typeof vi.fn>; writeDraft: ReturnType<typeof vi.fn>; deleteDraft: ReturnType<typeof vi.fn> };

afterEach(cleanup);
beforeEach(() => {
  Object.values(mocked).forEach((m) => m.mockReset());
  mocked.getContent.mockResolvedValue({ content: presse, sha: "sha1" });
  mocked.lockStatus.mockResolvedValue({ locked: false });
  mocked.listUploads.mockResolvedValue([]);
  cmsStub = {
    readDraft: vi.fn().mockResolvedValue(null),
    writeDraft: vi.fn().mockResolvedValue(undefined),
    deleteDraft: vi.fn().mockResolvedValue(undefined),
  };
  (window as unknown as { cms: unknown }).cms = cmsStub;
});

function renderScreen() {
  return render(
    <CollectionScreen collection="presse" session={session} onAuthExpired={vi.fn()} />
  );
}

describe("CollectionScreen", () => {
  it("liste le contenu de main, en lecture seule sans verrou", async () => {
    renderScreen();
    expect(await screen.findByText("Premier article")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Modifier" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Ajouter" })).toBeNull();
  });

  it("verrou d'autrui → bandeau + bouton Modifier désactivé", async () => {
    mocked.lockStatus.mockResolvedValue({
      locked: true, email: "marie@tn.org", expiresAt: future, ownedByCaller: false,
    });
    renderScreen();
    expect((await screen.findByText(/En cours d'édition par marie@tn.org/)).textContent)
      .toContain("lecture seule");
    expect((screen.getByRole("button", { name: "Modifier" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("« Modifier » acquiert le verrou et active l'édition", async () => {
    mocked.acquireLock.mockResolvedValue({ ok: true, expiresAt: future });
    renderScreen();
    fireEvent.click(await screen.findByRole("button", { name: "Modifier" }));
    expect(await screen.findByRole("button", { name: "Ajouter" })).toBeTruthy();
    expect(mocked.acquireLock).toHaveBeenCalledWith("jwt", "presse");
  });

  it("une modification écrit un brouillon local (autosauvegarde)", async () => {
    mocked.acquireLock.mockResolvedValue({ ok: true, expiresAt: future });
    renderScreen();
    fireEvent.click(await screen.findByRole("button", { name: "Modifier" }));
    fireEvent.click(await screen.findByText("Premier article"));
    fireEvent.change(await screen.findByLabelText("Titre"), { target: { value: "Titre modifié" } });
    await waitFor(
      () => {
        expect(cmsStub.writeDraft).toHaveBeenCalled();
        const [key, draft] = cmsStub.writeDraft.mock.calls.at(-1)!;
        expect(key).toBe("presse");
        expect(JSON.stringify(draft)).toContain("Titre modifié");
      },
      { timeout: 2000 }
    );
  });

  it("un brouillon existant prime sur le serveur, avec bandeau", async () => {
    cmsStub.readDraft.mockResolvedValue({
      content: [{ id: "p1", title: "Version brouillon", source: "s", date: "2026-06" }],
      images: {},
      savedAt: "2026-07-03T10:00:00Z",
    });
    renderScreen();
    expect(await screen.findByText("Version brouillon")).toBeTruthy();
    expect(screen.getByText(/Brouillon local/)).toBeTruthy();
    expect(screen.queryByText("Premier article")).toBeNull();
  });
});
