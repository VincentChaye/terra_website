import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FieldInput } from "@/components/FieldInput";

afterEach(cleanup);

describe("FieldInput", () => {
  it("champ texte : label + saisie → onChange(valeur)", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="title" meta={{ label: "Titre", widget: "text" }} value=""
        readOnly={false} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Bonjour" } });
    expect(onChange).toHaveBeenCalledWith("Bonjour");
  });

  it("champ optionnel vidé → onChange(undefined)", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="url" meta={{ label: "Lien", widget: "url", optional: true }} value="https://x"
        readOnly={false} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText(/Lien/), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("year : valeur numérique", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="year" meta={{ label: "Année", widget: "year" }} value={2026}
        readOnly={false} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText("Année"), { target: { value: "2027" } });
    expect(onChange).toHaveBeenCalledWith(2027);
  });

  it("paragraphs : ajout d'un paragraphe", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="paragraphs" meta={{ label: "Paragraphes", widget: "paragraphs" }}
        value={["Premier"]} readOnly={false} onChange={onChange} />
    );
    fireEvent.click(screen.getByText("Ajouter un paragraphe"));
    expect(onChange).toHaveBeenCalledWith(["Premier", ""]);
  });

  it("readOnly : pas de boutons d'action sur les paragraphes", () => {
    render(
      <FieldInput name="paragraphs" meta={{ label: "Paragraphes", widget: "paragraphs" }}
        value={["Premier"]} readOnly={true} onChange={vi.fn()} />
    );
    expect(screen.queryByText("Ajouter un paragraphe")).toBeNull();
  });

  it("affiche l'erreur de validation", () => {
    render(
      <FieldInput name="date" meta={{ label: "Date", widget: "month" }} value="juin"
        error="Format attendu : YYYY-MM" readOnly={false} onChange={vi.fn()} />
    );
    expect(screen.getByRole("alert").textContent).toContain("YYYY-MM");
  });
});
