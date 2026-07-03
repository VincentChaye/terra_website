/**
 * lib/cms-publish.ts — Publication d'une collection
 *
 * publish() est la SEULE porte d'écriture vers main : verrou exigé,
 * contenu revalidé par le schéma Zod du build (un contenu invalide ne peut
 * pas casser le build), images revérifiées (chemin liste-blanche, magic
 * bytes WebP, taille), un unique commit, verrou libéré en cas de succès.
 */

import { payloadSchema, registry } from "@/content/registry";
import { holdsLock, releaseLock } from "@/lib/cms-locks";
import { commitFiles, type RepoFile } from "@/lib/github";

export type ImageUpload = { path: string; base64: string };

export class PublishError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "PublishError";
  }
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Chemin imposé : uploads/<collection>/<slug>-<hash8>.webp (aucun traversal possible). */
function imagePathPattern(collection: string): RegExp {
  return new RegExp(`^uploads/${collection}/[a-z0-9][a-z0-9-]*-[a-f0-9]{8}\\.webp$`);
}

/** Message d'erreur, ou null si toutes les images sont acceptables. */
export function validateImages(collection: string, images: ImageUpload[]): string | null {
  const pattern = imagePathPattern(collection);
  for (const img of images) {
    if (!pattern.test(img.path)) {
      return `Chemin d'image non autorisé : ${img.path}`;
    }
    const bytes = Buffer.from(img.base64, "base64");
    if (bytes.length > MAX_IMAGE_BYTES) {
      return `Image trop lourde (max 4 Mo) : ${img.path}`;
    }
    // Magic bytes WebP : "RIFF" [taille 4 octets] "WEBP"
    if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
        bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
      return `Format invalide (WebP attendu) : ${img.path}`;
    }
  }
  return null;
}

export async function publish(
  collection: string,
  email: string,
  content: unknown,
  images: ImageUpload[]
): Promise<{ commitSha: string }> {
  const entry = registry[collection];
  if (!entry) throw new PublishError("Collection inconnue.", 404);

  if (!(await holdsLock(collection, email))) {
    throw new PublishError(
      "Vous ne détenez pas (ou plus) le verrou d'édition de cette collection.",
      409
    );
  }

  const parsed = payloadSchema(entry).safeParse(content);
  if (!parsed.success) {
    throw new PublishError(`Contenu invalide : ${parsed.error.message}`, 400);
  }

  const imageError = validateImages(collection, images);
  if (imageError) throw new PublishError(imageError, 400);

  const files: RepoFile[] = [
    { path: `content/${entry.file}`, content: JSON.stringify(parsed.data, null, 2) + "\n" },
    ...images.map((img) => ({ path: `public/${img.path}`, contentBase64: img.base64 })),
  ];

  const commitSha = await commitFiles(files, `CMS : ${entry.label} modifié par ${email}`);

  // Le commit a réussi : la publication a eu lieu et le déploiement est déclenché.
  // Si la libération du verrou échoue à ce stade, on ne doit pas renvoyer une
  // erreur 502 au client — ce serait mentir sur l'état réel (le contenu est
  // bien publié). Le verrou expirera de lui-même sous 24 h.
  try {
    await releaseLock(collection, email);
  } catch (error) {
    console.warn(
      `CMS : échec de la libération du verrou pour la collection "${collection}" (utilisateur ${email})`,
      error
    );
  }

  return { commitSha };
}
