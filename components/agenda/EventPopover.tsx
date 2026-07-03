"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { WimiEvent } from "@/lib/wimi";
import { formatTime, MONTHS_FR_SHORT } from "./date-utils";

type Props = {
  event: WimiEvent;
  /** Rectangle (viewport) de l'élément cliqué, pour ancrer le popover */
  anchor: { top: number; left: number; bottom: number; right: number };
  onClose: () => void;
};

const POPOVER_WIDTH = 320;
const MARGIN = 8;

function dateLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FR_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Détail d'un événement : popover flottant ancré sur l'élément cliqué
 * (desktop), feuille pleine largeur en bas d'écran (mobile).
 */
export default function EventPopover({ event, anchor, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const copyLocation = async () => {
    try {
      await navigator.clipboard.writeText(event.location);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponible (http, permissions…) : sélection manuelle possible
    }
  };

  useLayoutEffect(() => {
    if (isMobile || !ref.current) return;
    const h = ref.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Sous l'ancre par défaut, au-dessus si pas la place
    let top = anchor.bottom + MARGIN;
    if (top + h > vh - MARGIN) top = Math.max(MARGIN, anchor.top - h - MARGIN);

    let left = anchor.left;
    if (left + POPOVER_WIDTH > vw - MARGIN) left = vw - POPOVER_WIDTH - MARGIN;
    if (left < MARGIN) left = MARGIN;

    setPos({ top, left });
  }, [anchor, isMobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const sameDay = event.start.slice(0, 10) === event.end.slice(0, 10);

  const body = (
    <div
      ref={ref}
      role="dialog"
      aria-label={event.title}
      className={
        isMobile
          ? "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/15 bg-[#101418] px-5 pt-4 pb-6 shadow-2xl"
          : "fixed z-50 w-80 rounded-xl border border-white/15 bg-[#101418] px-5 py-4 shadow-2xl"
      }
      style={!isMobile ? { top: pos?.top ?? -9999, left: pos?.left ?? -9999 } : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-white font-semibold text-sm leading-snug flex items-start gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
            style={{ backgroundColor: event.color }}
            aria-hidden="true"
          />
          {event.title}
        </h3>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="text-white/40 hover:text-white transition-colors shrink-0 -mt-0.5"
        >
          ✕
        </button>
      </div>

      <p className="text-white/55 text-xs mt-1.5">
        {sameDay ? (
          <>
            {dateLabel(event.start)}
            {!event.allDay && ` · ${formatTime(event.start)} – ${formatTime(event.end)}`}
            {event.allDay && " · Journée entière"}
          </>
        ) : (
          <>
            {dateLabel(event.start)}
            {!event.allDay && ` ${formatTime(event.start)}`} → {dateLabel(event.end)}
            {!event.allDay && ` ${formatTime(event.end)}`}
          </>
        )}
      </p>

      {event.location && (
        <div className="flex items-center gap-1.5 mt-2">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white/35 shrink-0" aria-hidden="true">
            <path fillRule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM2 6a6 6 0 1 1 10.68 3.77l-3.98 4.37a1 1 0 0 1-1.4 0L3.32 9.77A5.97 5.97 0 0 1 2 6zm6-.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V6a.5.5 0 0 0-.5-.5z" clipRule="evenodd"/>
          </svg>
          <span className="text-white/55 text-xs">{event.location}</span>
          <button
            onClick={copyLocation}
            aria-label="Copier l'adresse"
            title="Copier l'adresse"
            className="text-white/40 hover:text-white transition-colors shrink-0"
          >
            {copied ? (
              <span className="text-[10px] text-tn-blue">Copié ✓</span>
            ) : (
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                <path d="M10 1H4a1.5 1.5 0 0 0-1.5 1.5V11H4V2.5h6V1z"/>
                <path d="M6 3.5h6A1.5 1.5 0 0 1 13.5 5v8.5A1.5 1.5 0 0 1 12 15H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5zm0 1.5v8.5h6V5H6z"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {event.description && (
        <p className="text-white/60 text-xs mt-3 leading-relaxed max-h-32 overflow-y-auto">
          {event.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {event.tags.map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-tn-blue/15 text-tn-blue border border-tn-blue/20">
            {t}
          </span>
        ))}
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tn-blue text-xs hover:underline ml-auto"
          >
            S&apos;inscrire →
          </a>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Fond cliquable pour fermer */}
      <div
        className={`fixed inset-0 z-40 ${isMobile ? "bg-black/50" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {body}
    </>
  );
}
