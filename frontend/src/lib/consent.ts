export type Consent = {
  v: number;
  necessary: true;
  analytics: boolean;
  media: boolean;
  social: boolean;
  date: string;
};

export const CONSENT_KEY = "tn_consent";
export const CONSENT_VERSION = 1;

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (parsed.v !== CONSENT_VERSION) return null; // version changée → re-demander
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(c: Omit<Consent, "v" | "date" | "necessary">): void {
  const full: Consent = {
    v: CONSENT_VERSION,
    necessary: true,
    ...c,
    date: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
  window.dispatchEvent(new CustomEvent("tn-consent-change", { detail: full }));
}

export function defaultConsent(all: boolean): Omit<Consent, "v" | "date" | "necessary"> {
  return { analytics: all, media: all, social: all };
}

/** Rouvrir le gestionnaire depuis n'importe où (ex. bouton footer/page politique) */
export function openConsentManager(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tn-open-consent"));
  }
}
