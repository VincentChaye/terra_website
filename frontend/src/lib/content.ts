/**
 * lib/content.ts — Loader des actualités
 *
 * Les JSON de src/content/actualites/ sont importés statiquement (embarqués au
 * build) puis validés par les schémas Zod de content/registry.ts. Un JSON
 * invalide lève une ZodError : tests/registry.test.ts fait échouer le build.
 */

import { z } from "zod";
import presseJson from "@/content/actualites/presse.json";
import newsletterJson from "@/content/actualites/newsletter.json";
import retrospectivesJson from "@/content/actualites/retrospectives.json";
import videosJson from "@/content/actualites/videos.json";
import {
  NewsletterItemSchema, PresseItemSchema, RetrospectiveSchema, VideoItemSchema,
  type NewsletterItem, type PresseItem, type Retrospective, type VideoItem,
} from "@/content/registry";

export {
  NewsletterItemSchema, PresseItemSchema, RetrospectiveSchema, VideoItemSchema,
  type NewsletterItem, type PresseItem, type Retrospective, type VideoItem,
};

// ─── Presse ──────────────────────────────────────────────────────────────────

/** Retourne tous les articles de presse, triés par date décroissante. */
export function getPresse(): PresseItem[] {
  return z.array(PresseItemSchema).parse(presseJson).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

/** Retourne toutes les lettres, triées par date décroissante. */
export function getNewsletters(): NewsletterItem[] {
  return z.array(NewsletterItemSchema).parse(newsletterJson).sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}

// ─── Rétrospectives ──────────────────────────────────────────────────────────

/** Retourne toutes les rétrospectives, triées par année décroissante. */
export function getRetrospectives(): Retrospective[] {
  return z.array(RetrospectiveSchema).parse(retrospectivesJson).sort(
    (a, b) => b.year - a.year
  );
}

/** Retourne la rétrospective d'une année précise, ou undefined. */
export function getRetrospective(year: number): Retrospective | undefined {
  return getRetrospectives().find((r) => r.year === year);
}

// ─── Vidéos ──────────────────────────────────────────────────────────────────

/** Retourne toutes les vidéos, triées par date décroissante. */
export function getVideos(): VideoItem[] {
  return z.array(VideoItemSchema).parse(videosJson).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}
