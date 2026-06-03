"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  entreprise: z.string().min(2, "Nom de l'entreprise requis"),
  nom: z.string().min(2, "Nom requis"),
  prenom: z.string().min(2, "Prénom requis"),
  email: z.string().email("Adresse e-mail invalide"),
  telephone: z.string().min(10, "Téléphone invalide").max(15),
  interet: z.string().min(1, "Veuillez sélectionner un sujet"),
  nbParticipants: z.string().optional().refine((v) => {
    if (!v || v === "") return true;
    const n = parseInt(v, 10);
    return !isNaN(n) && n >= 1 && n <= 500;
  }, "Entre 1 et 500 participants"),
  message: z.string().min(10, "Message trop court"),
  rgpd: z.literal(true, { message: "Vous devez accepter le traitement de vos données" }),
});

type FormValues = z.infer<typeof schema>;

const interets = [
  "Team building / visite découverte",
  "Formation sur mesure",
  "Mécénat / partenariat",
  "Autre",
];

export default function ContactEntreprisesForm() {
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
      const res = await fetch("/api/contact-entreprises", {
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
        <p className="font-semibold text-green-800">Message envoyé !</p>
        <p className="text-sm text-green-400 mt-1">
          Notre équipe vous répondra sous 2 jours ouvrés.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded border border-white/30 bg-white/8 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tn-blue focus:border-transparent";
  const errCls = "text-xs text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="entreprise" className="block text-sm mb-1">Entreprise *</label>
        <input id="entreprise" type="text" {...register("entreprise")} className={field} />
        {errors.entreprise && <p className={errCls}>{errors.entreprise.message}</p>}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ent-prenom" className="block text-sm mb-1">Prénom *</label>
          <input id="ent-prenom" type="text" {...register("prenom")} className={field} />
          {errors.prenom && <p className={errCls}>{errors.prenom.message}</p>}
        </div>
        <div>
          <label htmlFor="ent-nom" className="block text-sm mb-1">Nom *</label>
          <input id="ent-nom" type="text" {...register("nom")} className={field} />
          {errors.nom && <p className={errCls}>{errors.nom.message}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ent-email" className="block text-sm mb-1">E-mail *</label>
          <input id="ent-email" type="email" {...register("email")} className={field} />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="ent-tel" className="block text-sm mb-1">Téléphone *</label>
          <input id="ent-tel" type="tel" {...register("telephone")} className={field} />
          {errors.telephone && <p className={errCls}>{errors.telephone.message}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="interet" className="block text-sm mb-1">Sujet *</label>
          <select id="interet" {...register("interet")} className={field}>
            <option value="">-- Choisir --</option>
            {interets.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          {errors.interet && <p className={errCls}>{errors.interet.message}</p>}
        </div>
        <div>
          <label htmlFor="nbParticipants" className="block text-sm mb-1">Nb de participants</label>
          <input id="nbParticipants" type="number" min={1} {...register("nbParticipants")} className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="ent-message" className="block text-sm mb-1">Votre message *</label>
        <textarea id="ent-message" rows={4} {...register("message")} className={field} />
        {errors.message && <p className={errCls}>{errors.message.message}</p>}
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" {...register("rgpd")} className="mt-0.5 accent-tn-blue" />
          <span>
            J&apos;accepte que mes données soient utilisées pour traiter ma demande, conformément à la{" "}
            <a href="/politique-confidentialite" className="text-tn-blue underline">
              politique de confidentialité
            </a>
            .
          </span>
        </label>
        {errors.rgpd && <p className={errCls}>{errors.rgpd.message}</p>}
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">Une erreur est survenue. Veuillez réessayer.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full sm:w-auto px-8 py-3 rounded font-semibold bg-tn-blue text-tn-white hover:bg-[#1a8fd1] disabled:opacity-60 transition-colors"
      >
        {status === "sending" ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
