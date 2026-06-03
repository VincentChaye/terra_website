"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("tn_cookies")) setVisible(true);
  }, []);

  const accept = () => { localStorage.setItem("tn_cookies", "accepted"); setVisible(false); };
  const refuse = () => { localStorage.setItem("tn_cookies", "refused");  setVisible(false); };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#12102a] border-t border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-white/70 max-w-2xl">
        Ce site utilise des cookies de mesure d&apos;audience (Plausible, exempt CNIL).{" "}
        <Link href="/politique-confidentialite" className="text-tn-blue hover:underline">
          En savoir plus
        </Link>
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={refuse}
          className="px-4 py-1.5 rounded border border-white/20 text-white/60 hover:text-white text-xs transition-colors"
        >
          Refuser
        </button>
        <button
          onClick={accept}
          className="px-4 py-1.5 rounded bg-tn-blue text-white text-xs hover:bg-[#1a8fd1] transition-colors"
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
