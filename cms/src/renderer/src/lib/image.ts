/**
 * Pipeline image du CMS (spec §6) — tout se passe dans l'app :
 * redimensionnement ≤ 1920 px, conversion WebP qualité ~0,8 (canvas
 * Chromium), nommage <slug>-<hash8>.webp, refus > 4 Mo après compression.
 * L'image ne part au serveur qu'à la publication, dans le commit unique.
 *
 * Le chemin renvoyé est SANS slash initial (contrat du backend :
 * `uploads/<collection>/<slug>-<hash8>.webp`) ; le JSON de contenu stocke
 * `"/" + path` (affiché par le site via lib/asset.ts).
 */

export const MAX_WIDTH = 1920;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const WEBP_QUALITY = 0.8;

/** Slug ASCII minuscule à partir d'un nom de fichier. Jamais vide. */
export function slugify(fileName: string): string {
  const slug = fileName
    .replace(/\.[^.]+$/, "") // extension
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "image";
}

/** Uint8Array → base64 (par blocs : String.fromCharCode a une limite d'arguments). */
export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Nom, chemin et base64 d'une image déjà convertie. Erreur si trop lourde. */
export async function finalizeImage(
  collection: string,
  originalName: string,
  bytes: Uint8Array
): Promise<{ path: string; base64: string } | { error: string }> {
  if (bytes.length > MAX_IMAGE_BYTES) {
    return { error: "Image trop lourde après compression (max 4 Mo) — réduisez-la avant l'import." };
  }
  const digest = await crypto.subtle.digest("SHA-256", bytes.slice().buffer);
  const hash = [...new Uint8Array(digest)]
    .slice(0, 4)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return {
    path: `uploads/${collection}/${slugify(originalName)}-${hash}.webp`,
    base64: toBase64(bytes),
  };
}

/**
 * Fichier choisi → WebP ≤ 1920 px de large. Couche canvas volontairement
 * minimale (non testable sous jsdom) : toute la logique testable est dans
 * finalizeImage/slugify/toBase64.
 */
export async function convertToWebp(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );
  if (!blob) throw new Error("Conversion WebP impossible");
  return new Uint8Array(await blob.arrayBuffer());
}
