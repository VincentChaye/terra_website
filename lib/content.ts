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
 * Les schémas Zod sont exportés pour être réutilisés par le back-office (Phase 2).
 */

import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const CONTENT_DIR = join(process.cwd(), "content", "actualites");

function readJson<T>(filename: string, schema: z.ZodType<T>): T {
  const raw = readFileSync(join(CONTENT_DIR, filename), "utf-8");
  // parse() lance une ZodError si le JSON est invalide → le build échoue (fail-fast)
  return schema.parse(JSON.parse(raw));
}

// ─── Presse ──────────────────────────────────────────────────────────────────

export const PresseItemSchema = z.object({
  id:     z.string(),
  title:  z.string().min(1),
  source: z.string().min(1),
  date:   z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  url:    z.string().url().optional(),
});
export type PresseItem = z.infer<typeof PresseItemSchema>;

/** Retourne tous les articles de presse, triés par date décroissante. */
export function getPresse(): PresseItem[] {
  return readJson("presse.json", z.array(PresseItemSchema)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

export const NewsletterItemSchema = z.object({
  id:    z.string(),
  title: z.string().min(1),
  date:  z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  body:  z.string(),
});
export type NewsletterItem = z.infer<typeof NewsletterItemSchema>;

/** Retourne toutes les lettres, triées par date décroissante. */
export function getNewsletters(): NewsletterItem[] {
  return readJson("newsletter.json", z.array(NewsletterItemSchema)).sort(
    (a, b) => b.date.localeCompare(a.date)
  );
}

// ─── Rétrospectives ──────────────────────────────────────────────────────────

export const RetrospectiveSchema = z.object({
  year:       z.number().int().min(2020),
  paragraphs: z.array(z.string().min(1)),
  intro:      z.string().optional(),
});
export type Retrospective = z.infer<typeof RetrospectiveSchema>;

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

export const VideoItemSchema = z.object({
  id:          z.string(),
  title:       z.string().min(1),
  date:        z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  youtubeId:   z.string().optional(),
  description: z.string().optional(),
});
export type VideoItem = z.infer<typeof VideoItemSchema>;

/** Retourne toutes les vidéos, triées par date décroissante. */
export function getVideos(): VideoItem[] {
  return readJson("videos.json", z.array(VideoItemSchema)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}
