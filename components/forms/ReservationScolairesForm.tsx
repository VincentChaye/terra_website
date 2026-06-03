"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  etablissement: z.string().min(2, "Nom de l'établissement requis"),
  nom: z.string().min(2, "Nom requis"),
  prenom: z.string().min(2, "Prénom requis"),
  email: z.string().email("Adresse e-mail invalide"),
  telephone: z.string().min(10, "Téléphone invalide").max(15),
  niveau: z.string().min(1, "Niveau requis"),
  nbEleves: z.string().refine((v) => {
    const n = parseInt(v, 10);
    return !isNaN(n) && n >= 1 && n <= 200;
  }, "Entre 1 et 200 élèves"),
  datesSouhaitees: z.string().min(5, "Précisez vos disponibilités"),
  message: z.string().optional(),
  rgpd: z.literal(true, { message: "Vous devez accepter le traitement de vos données" }),
});

type FormValues = z.infer<typeof schema>;

const niveaux = [
  "Maternelle",
  "CP", "CE1", "CE2",
  "CM1", "CM2",
  "6e", "5e", "4e", "3e",
  "Seconde", "Première", "Terminale",
  "BTS / BUT",
  "Autre",
];

export default function ReservationScolairesForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setStatus("sending");
    try {
      const res = await fetch("/api/reservation-scolaires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("server");
      setStatus("sent");
      reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg bg-green-950/50 border border-green-800 p-6 text-center">
        <p className="font-semibold text-green-800">Demande envoyée !</p>
        <p className="text-sm text-green-400 mt-1">
          Nous vous recontacterons sous 48 h ouvrées pour confirmer votre créneau.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded border border-white/30 bg-white/8 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tn-blue focus:border-transparent";
  const error = "text-xs text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Contact */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-white mb-2">Votre établissement</legend>
        <div>
          <label htmlFor="etablissement" className="block text-sm mb-1">
            Établissement <span aria-hidden="true">*</span>
          </label>
          <input id="etablissement" type="text" {...register("etablissement")} className={field} />
          {errors.etablissement && <p className={error}>{errors.etablissement.message}</p>}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prenom" className="block text-sm mb-1">Prénom *</label>
            <input id="prenom" type="text" {...register("prenom")} className={field} />
            {errors.prenom && <p className={error}>{errors.prenom.message}</p>}
          </div>
          <div>
            <label htmlFor="nom" className="block text-sm mb-1">Nom *</label>
            <input id="nom" type="text" {...register("nom")} className={field} />
            {errors.nom && <p className={error}>{errors.nom.message}</p>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-1">E-mail *</label>
            <input id="email" type="email" {...register("email")} className={field} />
            {errors.email && <p className={error}>{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="telephone" className="block text-sm mb-1">Téléphone *</label>
            <input id="telephone" type="tel" {...register("telephone")} className={field} />
            {errors.telephone && <p className={error}>{errors.telephone.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* Visite */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-white mb-2">Votre visite</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="niveau" className="block text-sm mb-1">Niveau de la classe *</label>
            <select id="niveau" {...register("niveau")} className={field}>
              <option value="">-- Choisir --</option>
              {niveaux.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {errors.niveau && <p className={error}>{errors.niveau.message}</p>}
          </div>
          <div>
            <label htmlFor="nbEleves" className="block text-sm mb-1">Nombre d&apos;élèves *</label>
            <input id="nbEleves" type="number" min={1} max={200} {...register("nbEleves")} className={field} />
            {errors.nbEleves && <p className={error}>{errors.nbEleves.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="datesSouhaitees" className="block text-sm mb-1">
            Disponibilités souhaitées *
          </label>
          <input
            id="datesSouhaitees"
            type="text"
            placeholder="ex : semaine du 12 mai, matinée de préférence"
            {...register("datesSouhaitees")}
            className={field}
          />
          {errors.datesSouhaitees && <p className={error}>{errors.datesSouhaitees.message}</p>}
        </div>
        <div>
          <label htmlFor="message" className="block text-sm mb-1">Message complémentaire</label>
          <textarea
            id="message"
            rows={3}
            {...register("message")}
            className={field}
            placeholder="Thème souhaité, contraintes particulières…"
          />
        </div>
      </fieldset>

      {/* RGPD */}
      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" {...register("rgpd")} className="mt-0.5 accent-tn-blue" />
          <span>
            J&apos;accepte que mes données soient utilisées pour traiter ma demande de réservation,
            conformément à la{" "}
            <a href="/politique-confidentialite" className="text-tn-blue underline">
              politique de confidentialité
            </a>
            .
          </span>
        </label>
        {errors.rgpd && <p className={error}>{errors.rgpd.message}</p>}
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">
          Une erreur est survenue. Veuillez réessayer ou nous contacter directement.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full sm:w-auto px-8 py-3 rounded font-semibold bg-tn-blue text-tn-white hover:bg-[#1a8fd1] disabled:opacity-60 transition-colors"
      >
        {status === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
