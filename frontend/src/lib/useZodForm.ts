import { reactive } from "vue";
import type { z } from "zod";

/**
 * Formulaire validé par un schéma Zod (remplace react-hook-form).
 * Les erreurs sont indexées par nom de champ (premier message de chaque champ).
 * `bind(name)` lie un <input>/<textarea>/<select> en conservant une valeur
 * *chaîne* — y compris pour type="number", que v-model convertirait en nombre
 * alors que les schémas de lib/forms.ts attendent des chaînes.
 */
export function useZodForm<S extends z.ZodType>(schema: S, initial: Record<string, string | boolean>) {
  const values = reactive<Record<string, string | boolean>>({ ...initial });
  const errors = reactive<Record<string, string>>({});

  /** Retourne les données validées, ou null (et remplit `errors`). */
  function validate(): z.infer<S> | null {
    for (const key of Object.keys(errors)) delete errors[key];
    const result = schema.safeParse(values);
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return null;
  }

  function reset() {
    Object.assign(values, initial);
    for (const key of Object.keys(errors)) delete errors[key];
  }

  function bind(name: string) {
    return {
      value: values[name] as string,
      onInput: (e: Event) => {
        values[name] = (e.target as HTMLInputElement).value;
      },
    };
  }

  return { values, errors, validate, reset, bind };
}
