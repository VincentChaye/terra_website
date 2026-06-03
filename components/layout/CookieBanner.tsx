"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  readConsent,
  writeConsent,
  defaultConsent,
  CONSENT_VERSION,
} from "@/lib/consent";

type Prefs = { analytics: boolean; media: boolean; social: boolean };

const CATEGORIES = [
  {
    key: "necessary" as const,
    label: "Strictement nécessaires",
    desc: "Indispensables au fonctionnement du site : mémorisation du consentement, sécurité de session. Aucune donnée transmise à des tiers.",
    locked: true,
  },
  {
    key: "analytics" as const,
    label: "Mesure d'audience",
    desc: "Comptage anonyme des visites pour améliorer le site (Plausible Analytics). Aucun cookie tiers, données non partagées, exemption CNIL.",
    locked: false,
  },
  {
    key: "media" as const,
    label: "Médias externes (YouTube)",
    desc: "Lecture des vidéos Terra Numerica intégrées depuis YouTube. Sans consentement, les vidéos sont remplacées par un aperçu statique.",
    locked: false,
  },
  {
    key: "social" as const,
    label: "Réseaux sociaux",
    desc: "Boutons de partage Facebook, LinkedIn, YouTube. Sans consentement, aucun script tiers n'est chargé ; les liens sociaux restent actifs.",
    locked: false,
  },
] as const;

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [panel, setPanel] = useState(false); // false = bannière, true = personnalisation
  const [prefs, setPrefs] = useState<Prefs>({ analytics: false, media: false, social: false });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = readConsent();
    if (!consent || consent.v !== CONSENT_VERSION) {
      setVisible(true);
    }
    // Écouter l'event "rouvrir depuis la page confidentialité"
    const handler = () => {
      const existing = readConsent();
      if (existing) setPrefs({ analytics: existing.analytics, media: existing.media, social: existing.social });
      setPanel(true);
      setVisible(true);
    };
    window.addEventListener("tn-open-consent", handler);
    return () => window.removeEventListener("tn-open-consent", handler);
  }, []);

  // Piège le focus dans le dialog quand panneau ouvert
  useEffect(() => {
    if (panel && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [panel]);

  const save = (p: Prefs) => {
    writeConsent(p);
    setVisible(false);
    setPanel(false);
  };

  const toggle = (key: keyof Prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible) return null;

  /* ── VUE PERSONNALISATION ─── */
  if (panel) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        aria-modal="true"
        role="dialog"
        aria-label="Gérer mes préférences cookies"
      >
        <div
          ref={dialogRef}
          tabIndex={-1}
          className="w-full max-w-lg bg-[#12102a] border border-white/15 rounded-xl shadow-2xl outline-none"
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-base leading-snug">
              Personnaliser mes préférences cookies
            </h2>
            <p className="text-white/50 text-xs mt-1">
              Activez ou désactivez chaque catégorie. Vos choix sont enregistrés sur votre appareil.
            </p>
          </div>

          {/* Catégories */}
          <ul className="divide-y divide-white/8">
            {CATEGORIES.map((cat) => {
              const isOn = cat.locked || prefs[cat.key as keyof Prefs];
              return (
                <li key={cat.key} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-snug">{cat.label}</p>
                    <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{cat.desc}</p>
                  </div>
                  {/* Toggle */}
                  <button
                    role="switch"
                    aria-checked={isOn}
                    aria-label={cat.label}
                    disabled={cat.locked}
                    onClick={() => !cat.locked && toggle(cat.key as keyof Prefs)}
                    className={`relative shrink-0 mt-0.5 h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-tn-blue
                      ${cat.locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                      ${isOn ? "bg-tn-blue" : "bg-white/20"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200
                        ${isOn ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => save(defaultConsent(false))}
              className="px-4 py-2 rounded border border-white/20 text-white/60 hover:text-white text-xs transition-colors"
            >
              Tout refuser
            </button>
            <button
              onClick={() => save(prefs)}
              className="px-4 py-2 rounded border border-tn-blue text-tn-blue hover:bg-tn-blue hover:text-white text-xs transition-colors"
            >
              Enregistrer mes choix
            </button>
            <button
              onClick={() => save(defaultConsent(true))}
              className="px-4 py-2 rounded bg-tn-blue text-white text-xs hover:bg-[#1a8fd1] transition-colors"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── VUE BANNIÈRE ─── */
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#12102a] border-t border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-white/65 text-xs leading-relaxed max-w-2xl">
          Nous utilisons des cookies pour le fonctionnement du site et, avec votre accord, pour mesurer
          l&apos;audience et activer les médias tiers (YouTube, réseaux sociaux).{" "}
          <Link href="/politique-confidentialite#cookies" className="text-tn-blue hover:underline">
            Politique cookies
          </Link>
        </p>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => save(defaultConsent(false))}
            className="px-3 py-1.5 rounded border border-white/20 text-white/55 hover:text-white text-xs transition-colors"
          >
            Tout refuser
          </button>
          <button
            onClick={() => setPanel(true)}
            className="px-3 py-1.5 rounded border border-white/30 text-white/80 hover:text-white text-xs transition-colors"
          >
            Personnaliser
          </button>
          <button
            onClick={() => save(defaultConsent(true))}
            className="px-3 py-1.5 rounded bg-tn-blue text-white text-xs hover:bg-[#1a8fd1] transition-colors"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
