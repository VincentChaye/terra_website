/**
 * content/registry.ts — Schémas Zod + registre de contenu du CMS
 *
 * Module PUR (aucun accès disque) : importable par le loader serveur
 * (lib/content.ts), les routes /api/admin/* et l'app Electron (Plan 2).
 * Ajouter une entrée ici = elle apparaît dans le CMS.
 *
 * Le champ `id` des éléments de collection n'est pas déclaré dans `fields` :
 * il est généré automatiquement par l'app d'édition, jamais saisi.
 */

import { z } from "zod";

// ─── Schémas (déplacés depuis lib/content.ts, inchangés) ─────────────────────

export const PresseItemSchema = z.object({
  id:     z.string(),
  title:  z.string().min(1),
  source: z.string().min(1),
  date:   z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  url:    z.string().url().optional(),
});
export type PresseItem = z.infer<typeof PresseItemSchema>;

export const NewsletterItemSchema = z.object({
  id:    z.string(),
  title: z.string().min(1),
  date:  z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  body:  z.string(),
});
export type NewsletterItem = z.infer<typeof NewsletterItemSchema>;

export const RetrospectiveSchema = z.object({
  year:       z.number().int().min(2020),
  paragraphs: z.array(z.string().min(1)),
  intro:      z.string().optional(),
});
export type Retrospective = z.infer<typeof RetrospectiveSchema>;

export const VideoItemSchema = z.object({
  id:          z.string(),
  title:       z.string().min(1),
  date:        z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  youtubeId:   z.string().optional(),
  description: z.string().optional(),
});
export type VideoItem = z.infer<typeof VideoItemSchema>;

// ─── Registre ────────────────────────────────────────────────────────────────

export type FieldMeta = {
  label: string;
  widget: "text" | "textarea" | "month" | "year" | "url" | "paragraphs" | "image";
  optional?: boolean;
};

export type RegistryEntry = {
  label: string;
  group: string;
  kind: "collection" | "singleton";
  /** Chemin relatif à content/ */
  file: string;
  /** Schéma d'un élément (collection) ou de l'objet complet (singleton) */
  schema: z.ZodType;
  itemTitle?: (item: unknown) => string;
  fields: Record<string, FieldMeta>;
};

export const registry: Record<string, RegistryEntry> = {
  presse: {
    label: "Revue de presse",
    group: "Actualités",
    kind: "collection",
    file: "actualites/presse.json",
    schema: PresseItemSchema,
    itemTitle: (item) => (item as PresseItem).title,
    fields: {
      title:  { label: "Titre",  widget: "text" },
      source: { label: "Source", widget: "text" },
      date:   { label: "Date",   widget: "month" },
      url:    { label: "Lien",   widget: "url", optional: true },
    },
  },
  newsletter: {
    label: "Newsletters",
    group: "Actualités",
    kind: "collection",
    file: "actualites/newsletter.json",
    schema: NewsletterItemSchema,
    itemTitle: (item) => (item as NewsletterItem).title,
    fields: {
      title: { label: "Titre", widget: "text" },
      date:  { label: "Date",  widget: "month" },
      body:  { label: "Contenu", widget: "textarea" },
    },
  },
  retrospectives: {
    label: "Rétrospectives",
    group: "Actualités",
    kind: "collection",
    file: "actualites/retrospectives.json",
    schema: RetrospectiveSchema,
    itemTitle: (item) => String((item as Retrospective).year),
    fields: {
      year:       { label: "Année", widget: "year" },
      intro:      { label: "Introduction", widget: "textarea", optional: true },
      paragraphs: { label: "Paragraphes", widget: "paragraphs" },
    },
  },
  videos: {
    label: "Vidéos",
    group: "Actualités",
    kind: "collection",
    file: "actualites/videos.json",
    schema: VideoItemSchema,
    itemTitle: (item) => (item as VideoItem).title,
    fields: {
      title:       { label: "Titre", widget: "text" },
      date:        { label: "Date",  widget: "month" },
      youtubeId:   { label: "ID YouTube", widget: "text", optional: true },
      description: { label: "Description", widget: "textarea", optional: true },
    },
  },
};

/** Schéma du fichier JSON complet d'une entrée du registre. */
export function payloadSchema(entry: RegistryEntry): z.ZodType {
  return entry.kind === "collection" ? z.array(entry.schema) : entry.schema;
}
