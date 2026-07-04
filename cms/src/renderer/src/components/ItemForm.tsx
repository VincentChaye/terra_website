/**
 * Formulaire d'un élément (ou d'un singleton), généré depuis entry.fields.
 * Ajouter un champ au registre = il apparaît ici, sans toucher à ce code.
 */

import type { RegistryEntry } from "@site/content/registry";
import { FieldInput } from "./FieldInput";
import { ImageField } from "./ImageField";

type Props = {
  entry: RegistryEntry;
  collection: string;
  item: Record<string, unknown>;
  errors: Record<string, string>;
  readOnly: boolean;
  images: Record<string, string>;
  library: string[];
  onChange: (item: Record<string, unknown>) => void;
  onImageReady: (path: string, base64: string) => void;
};

export function ItemForm({
  entry, collection, item, errors, readOnly, images, library, onChange, onImageReady,
}: Props) {
  return (
    <form className="item-form" onSubmit={(e) => e.preventDefault()}>
      {Object.entries(entry.fields).map(([name, meta]) =>
        meta.widget === "image" ? (
          <ImageField key={name} name={name} meta={meta} collection={collection}
            value={item[name] as string | undefined} error={errors[name]} readOnly={readOnly}
            images={images} library={library}
            onChange={(v) => onChange({ ...item, [name]: v })}
            onImageReady={onImageReady} />
        ) : (
          <FieldInput key={name} name={name} meta={meta} value={item[name]}
            error={errors[name]} readOnly={readOnly}
            onChange={(v) => onChange({ ...item, [name]: v })} />
        )
      )}
    </form>
  );
}
