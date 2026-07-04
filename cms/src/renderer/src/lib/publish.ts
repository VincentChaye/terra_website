/**
 * Logique de publication côté app. Le serveur reste juge de paix
 * (revalidation Zod, verrou, images) — ici on évite juste d'envoyer
 * l'invalide et les images devenues inutiles.
 */

import type { RegistryEntry } from "@site/content/registry";
import type { DeployRun, ImageUpload } from "./api";
import { fieldErrors, itemLabel } from "./form";

/** N'embarque que les images encore référencées (remplacées = abandonnées). */
export function usedImages(content: unknown, images: Record<string, string>): ImageUpload[] {
  const text = JSON.stringify(content);
  return Object.entries(images)
    .filter(([path]) => text.includes(`/${path}`))
    .map(([path, base64]) => ({ path, base64 }));
}

/** Libellés des éléments qui violent le schéma (bloquent la publication). */
export function invalidItems(entry: RegistryEntry, content: unknown): string[] {
  if (entry.kind === "singleton") {
    return Object.keys(fieldErrors(entry, content)).length > 0 ? [entry.label] : [];
  }
  return ((content as unknown[]) ?? [])
    .filter((item) => Object.keys(fieldErrors(entry, item)).length > 0)
    .map((item) => itemLabel(entry, item) || "(sans titre)");
}

/** Badge d'état du déploiement Pages (spec §10). */
export function deployLabel(deploy: DeployRun | null): { text: string; tone: "pending" | "ok" | "error" } {
  if (!deploy || deploy.status !== "completed") {
    return { text: "Mise en ligne en cours… (2 à 3 minutes)", tone: "pending" };
  }
  if (deploy.conclusion === "success") {
    return { text: "Publié — le site est à jour.", tone: "ok" };
  }
  return {
    text: "Échec de la mise en ligne — prévenez l'administrateur du site.",
    tone: "error",
  };
}
