/**
 * Moteur de formulaires : tout est dérivé du registre (spec §4 — le CMS ne
 * connaît aucune collection en dur). Logique pure, séparée des composants.
 */

import type { FieldMeta, RegistryEntry } from "@site/content/registry";
import { registry } from "@site/content/registry";

function defaultValue(meta: FieldMeta): unknown {
  if (meta.optional) return undefined;
  switch (meta.widget) {
    case "year":
      return new Date().getFullYear();
    case "paragraphs":
      return [];
    default:
      return ""; // text, textarea, month, url, image
  }
}

/** Nouvel élément : défauts par widget, id auto si le schéma en déclare un. */
export function emptyItem(entry: RegistryEntry): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  const shape = (entry.schema as unknown as { shape?: Record<string, unknown> }).shape ?? {};
  if ("id" in shape) item.id = crypto.randomUUID(); // jamais saisi (cf. content/registry.ts)
  for (const [name, meta] of Object.entries(entry.fields)) {
    const value = defaultValue(meta);
    if (value !== undefined) item[name] = value;
  }
  return item;
}

/** Erreurs Zod par champ (1er message de chaque champ), mêmes messages que le build. */
export function fieldErrors(entry: RegistryEntry, item: unknown): Record<string, string> {
  const result = entry.schema.safeParse(item);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}

export function itemLabel(entry: RegistryEntry, item: unknown): string {
  try {
    return entry.itemTitle?.(item) ?? "";
  } catch {
    return "";
  }
}

/** Déplacement d'un élément dans une liste (réordonnancement ↑/↓). */
export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

/** Entrées du registre par groupe (barre latérale), dans l'ordre du registre. */
export function groupedRegistry(): [string, [string, RegistryEntry][]][] {
  const groups = new Map<string, [string, RegistryEntry][]>();
  for (const [key, entry] of Object.entries(registry)) {
    const list = groups.get(entry.group) ?? [];
    list.push([key, entry]);
    groups.set(entry.group, list);
  }
  return [...groups.entries()];
}
