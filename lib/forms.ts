/**
 * lib/forms.ts — Schémas Zod partagés des formulaires
 *
 * Une seule source de vérité pour la validation, importée à la fois :
 *   - côté client  (composants "use client" via zodResolver)
 *   - côté serveur (Route Handlers du backend Render)
 *
 * Le champ `website` est un honeypot anti-spam : invisible pour les humains,
 * il doit rester vide. Le schéma l'accepte (optionnel) ; c'est le handler
 * serveur qui décide de répondre 200 sans envoyer si un bot l'a rempli.
 */

import { z } from "zod";

// ─── Contact entreprises ───────────────────────────────────────────────────

export const contactEntreprisesSchema = z.object({
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
  website: z.string().optional(), // honeypot
});

export type ContactEntreprisesValues = z.infer<typeof contactEntreprisesSchema>;

// ─── Réservation scolaires ──────────────────────────────────────────────────

export const reservationScolairesSchema = z.object({
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
  website: z.string().optional(), // honeypot
});

export type ReservationScolairesValues = z.infer<typeof reservationScolairesSchema>;
