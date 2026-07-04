import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api")>();
  return { ...mod, api: { ...mod.api, status: vi.fn() } };
});

import { api } from "@/lib/api";
import { Shell } from "@/components/Shell";

const mockStatus = vi.mocked(api.status);
const session = { token: "jwt", email: "a@b.fr" };

afterEach(cleanup);
beforeEach(() => {
  mockStatus.mockReset();
  (window as unknown as { cms: unknown }).cms = { appVersion: vi.fn().mockResolvedValue("0.1.0") };
});

describe("Shell", () => {
  it("version suffisante → barre latérale avec les groupes du registre", async () => {
    mockStatus.mockResolvedValueOnce({ minAppVersion: "0.1.0", deploy: null });
    render(<Shell session={session} onLogout={vi.fn()} />);
    expect(await screen.findByText("Actualités")).toBeTruthy();
    expect(screen.getByText("Revue de presse")).toBeTruthy();
    expect(screen.getByText("a@b.fr")).toBeTruthy();
  });

  it("app trop ancienne → écran bloquant de mise à jour", async () => {
    mockStatus.mockResolvedValueOnce({ minAppVersion: "2.0.0", deploy: null });
    render(<Shell session={session} onLogout={vi.fn()} />);
    expect(await screen.findByText("Mise à jour requise")).toBeTruthy();
    expect(screen.queryByText("Revue de presse")).toBeNull();
  });

  it("401 au démarrage (JWT expiré) → onLogout", async () => {
    const { ApiError } = await import("@/lib/api");
    const onLogout = vi.fn();
    mockStatus.mockRejectedValueOnce(new ApiError("Non authentifié.", 401));
    render(<Shell session={session} onLogout={onLogout} />);
    await vi.waitFor(() => expect(onLogout).toHaveBeenCalled());
  });
});
