import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { LoginScreen } from "@/components/LoginScreen";

afterEach(cleanup);
beforeEach(() => {
  (window as unknown as { cms: unknown }).cms = {};
});

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText("Email Wimi"), { target: { value: "a@b.fr" } });
  fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "mdp" } });
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
}

describe("LoginScreen", () => {
  it("soumet email + mot de passe", async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginScreen onLogin={onLogin} />);
    fillAndSubmit();
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith("a@b.fr", "mdp"));
  });

  it("affiche le message serveur d'une ApiError (401, 403, 429, 502…)", async () => {
    const onLogin = vi.fn().mockRejectedValue(new ApiError("Identifiants Wimi incorrects.", 401));
    render(<LoginScreen onLogin={onLogin} />);
    fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Identifiants Wimi incorrects."
    );
  });

  it("erreur réseau (pas ApiError) → message générique", async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error("fetch failed"));
    render(<LoginScreen onLogin={onLogin} />);
    fillAndSubmit();
    expect((await screen.findByRole("alert")).textContent).toContain("injoignable");
  });
});
