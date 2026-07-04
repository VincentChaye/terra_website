/**
 * Un champ de formulaire d'après sa FieldMeta du registre. Widgets v1 hors
 * image (widget à part : ImageField). Validation affichée sous le champ ;
 * un champ optionnel vidé devient `undefined` (les schémas utilisent
 * .optional(), pas des chaînes vides).
 */

import type { FieldMeta } from "@site/content/registry";
import { moveItem } from "../lib/form";

type Props = {
  name: string;
  meta: FieldMeta;
  value: unknown;
  error?: string;
  readOnly: boolean;
  onChange: (value: unknown) => void;
};

export function FieldInput({ name, meta, value, error, readOnly, onChange }: Props) {
  const id = `field-${name}`;
  const text = (v: string) => onChange(meta.optional && v === "" ? undefined : v);

  return (
    <div className="field">
      <label htmlFor={id}>
        {meta.label}
        {meta.optional ? <span className="muted"> (optionnel)</span> : null}
      </label>
      {meta.widget === "textarea" ? (
        <textarea id={id} rows={6} value={(value as string) ?? ""} readOnly={readOnly}
          onChange={(e) => text(e.target.value)} />
      ) : meta.widget === "year" ? (
        <input id={id} type="number" value={(value as number) ?? ""} readOnly={readOnly}
          onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)} />
      ) : meta.widget === "paragraphs" ? (
        <ParagraphsInput id={id} value={(value as string[]) ?? []} readOnly={readOnly}
          onChange={onChange} />
      ) : (
        <input id={id}
          type={meta.widget === "month" ? "month" : meta.widget === "url" ? "url" : "text"}
          value={(value as string) ?? ""} readOnly={readOnly}
          onChange={(e) => text(e.target.value)} />
      )}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

function ParagraphsInput({ id, value, readOnly, onChange }: {
  id: string;
  value: string[];
  readOnly: boolean;
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="paragraphs" id={id}>
      {value.map((paragraph, i) => (
        <div key={i} className="paragraph-row">
          <textarea rows={3} value={paragraph} readOnly={readOnly} aria-label={`Paragraphe ${i + 1}`}
            onChange={(e) => onChange(value.map((p, j) => (j === i ? e.target.value : p)))} />
          {!readOnly && (
            <span className="row-actions">
              <button type="button" disabled={i === 0}
                onClick={() => onChange(moveItem(value, i, -1))}>↑</button>
              <button type="button" disabled={i === value.length - 1}
                onClick={() => onChange(moveItem(value, i, +1))}>↓</button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Supprimer
              </button>
            </span>
          )}
        </div>
      ))}
      {!readOnly && (
        <button type="button" onClick={() => onChange([...value, ""])}>
          Ajouter un paragraphe
        </button>
      )}
    </div>
  );
}
