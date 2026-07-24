/**
 * lib/content.ts — Loader serveur pour les actualités
 *
 * Ce module utilise `fs.readFileSync` (synchrone) afin que les Server Components
 * qui l'importent restent statiques (prérendus au build, pas de requête dynamique).
 *
 * ⚠️  NE PAS importer depuis un composant "use client" — `fs` n'existe pas dans
 *     les navigateurs. Next.js tree-shake les imports fs en client bundle, mais
 *     toute violation produirait une erreur de build immédiate.
 *
 * Les schémas Zod vivent dans content/registry.ts (module pur, sans accès disque).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import {
  NewsletterItemSchema, PresseItemSchema, RetrospectiveSchema, VideoItemSchema,
  type NewsletterItem, type PresseItem, type Retrospective, type VideoItem,
} from "@/content/registry";

// Ré-export : les consommateurs existants (pages, futur back-office) ne changent pas.
export {
  NewsletterItemSchema, PresseItemSchema, RetrospectiveSchema, VideoItemSchema,
  type NewsletterItem, type PresseItem, type Retrospective, type VideoItem,
};

const CONTENT_DIR = join(process.cwd(), "content", "actualites");

function readJson<T>(filename: string, schema: z.ZodType<T>): T {
  const raw = readFileSync(join(CONTENT_DIR, filename), "utf-8");
  // parse() lance une ZodError si le JSON est invalide → le build échoue (fail-fast)
  return schema.parse(JSON.parse(raw));
}

// ─── Presse ──────────────────────────────────────────────────────────────────

/** Retourne tous les articles de presse, triés par date décroissante. */
export function getPresse(): PresseItem[] {
  return readJson("presse.json", z.array(PresseItemSchema)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

/** Retourne toutes les lettres, triées par date décroissante. */
export function getNewsletters(): NewsletterItem[] {
  return readJson("newsletter.json", z.array(NewsletterItemSchema)).sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}

// ─── Rétrospectives ──────────────────────────────────────────────────────────

/** Retourne toutes les rétrospectives, triées par année décroissante. */
export function getRetrospectives(): Retrospective[] {
  return readJson("retrospectives.json", z.array(RetrospectiveSchema)).sort(
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
  return readJson("videos.json", z.array(VideoItemSchema)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}
