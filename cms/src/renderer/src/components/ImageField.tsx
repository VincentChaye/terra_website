/**
 * Widget image (spec §6) : téléverser (converti WebP localement) ou choisir
 * dans la bibliothèque des images déjà publiées. La valeur du champ est le
 * chemin JSON (« /uploads/… ») ; les octets d'une nouvelle image restent
 * dans le brouillon (`images`) jusqu'à la publication.
 */

import { useState } from "react";
import type { FieldMeta } from "@site/content/registry";
import { convertToWebp, finalizeImage } from "../lib/image";

const SITE_BASE = import.meta.env.VITE_SITE_BASE ?? "https://terra-numerica.org";

type Props = {
  name: string;
  meta: FieldMeta;
  value: string | undefined;
  error?: string;
  readOnly: boolean;
  collection: string;
  /** Images en attente de publication : chemin (sans « / ») → base64. */
  images: Record<string, string>;
  /** Chemins « /uploads/… » déjà publiés (bibliothèque). */
  library: string[];
  onChange: (value: string | undefined) => void;
  onImageReady: (path: string, base64: string) => void;
};

export function ImageField({
  name, meta, value, error, readOnly, collection, images, library, onChange, onImageReady,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Aperçu : image en attente (data URI) ou image publiée (site en ligne).
  const pending = value ? images[value.slice(1)] : undefined;
  const src = !value ? null : pending ? `data:image/webp;base64,${pending}` : `${SITE_BASE}${value}`;

  async function pick(file: File) {
    setLocalError(null);
    setBusy(true);
    try {
      const bytes = await convertToWebp(file);
      const result = await finalizeImage(collection, file.name, bytes);
      if ("error" in result) {
        setLocalError(result.error);
        return;
      }
      onImageReady(result.path, result.base64);
      onChange(`/${result.path}`);
    } catch {
      setLocalError("Impossible de lire cette image — choisissez un fichier image valide.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>
        {meta.label}
        {meta.optional ? <span className="muted"> (optionnel)</span> : null}
      </label>
      {src && <img className="image-preview" src={src} alt="" />}
      {!readOnly && (
        <div className="image-actions">
          <input id={`field-${name}`} type="file" accept="image/*" disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pick(file);
              e.target.value = "";
            }} />
          {library.length > 0 && (
            <select value="" onChange={(e) => e.target.value && onChange(e.target.value)}>
              <option value="">Choisir une image existante…</option>
              {library.map((p) => (
                <option key={p} value={p}>{p.split("/").pop()}</option>
              ))}
            </select>
          )}
          {value && meta.optional && (
            <button type="button" onClick={() => onChange(undefined)}>Retirer l'image</button>
          )}
        </div>
      )}
      {busy && <p className="muted">Conversion de l'image…</p>}
      {(localError ?? error) && <p className="field-error" role="alert">{localError ?? error}</p>}
    </div>
  );
}
