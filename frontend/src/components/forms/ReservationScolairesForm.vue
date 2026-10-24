<script setup lang="ts">
import { ref } from "vue";
import { apiUrl } from "@/lib/api";
import { reservationScolairesSchema } from "@/lib/forms";
import { useZodForm } from "@/lib/useZodForm";

const niveaux = [
  "Maternelle",
  "CP", "CE1", "CE2",
  "CM1", "CM2",
  "6e", "5e", "4e", "3e",
  "Seconde", "Première", "Terminale",
  "BTS / BUT",
  "Autre",
];

const status = ref<"idle" | "sending" | "sent" | "error">("idle");

const { values, errors, validate, reset, bind } = useZodForm(reservationScolairesSchema, {
  etablissement: "",
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  niveau: "",
  nbEleves: "",
  datesSouhaitees: "",
  message: "",
  rgpd: false,
  website: "", // honeypot
});

async function onSubmit() {
  const data = validate();
  if (!data) return;
  status.value = "sending";
  try {
    const res = await fetch(apiUrl("/api/reservation-scolaires"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("server");
    status.value = "sent";
    reset();
  } catch {
    status.value = "error";
  }
}

const field =
  "w-full rounded border border-white/30 bg-white/8 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tn-blue focus:border-transparent";
const error = "text-xs text-red-400 mt-1";
</script>

<template>
  <div v-if="status === 'sent'" class="rounded-lg bg-green-950/50 border border-green-800 p-6 text-center">
    <p class="font-semibold text-green-800">Demande envoyée !</p>
    <p class="text-sm text-green-400 mt-1">
      Nous vous recontacterons sous 48 h ouvrées pour confirmer votre créneau.
    </p>
  </div>

  <form v-else novalidate class="space-y-5" @submit.prevent="onSubmit">
    <!-- Honeypot anti-spam : invisible, doit rester vide -->
    <div aria-hidden="true" class="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label for="resa-website">Ne pas remplir</label>
      <input id="resa-website" type="text" tabindex="-1" autocomplete="off" v-bind="bind('website')" />
    </div>
    <!-- Contact -->
    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-white mb-2">Votre établissement</legend>
      <div>
        <label for="etablissement" class="block text-sm mb-1">
          Établissement <span aria-hidden="true">*</span>
        </label>
        <input id="etablissement" type="text" v-bind="bind('etablissement')" :class="field" />
        <p v-if="errors.etablissement" :class="error">{{ errors.etablissement }}</p>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label for="prenom" class="block text-sm mb-1">Prénom *</label>
          <input id="prenom" type="text" v-bind="bind('prenom')" :class="field" />
          <p v-if="errors.prenom" :class="error">{{ errors.prenom }}</p>
        </div>
        <div>
          <label for="nom" class="block text-sm mb-1">Nom *</label>
          <input id="nom" type="text" v-bind="bind('nom')" :class="field" />
          <p v-if="errors.nom" :class="error">{{ errors.nom }}</p>
        </div>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label for="email" class="block text-sm mb-1">E-mail *</label>
          <input id="email" type="email" v-bind="bind('email')" :class="field" />
          <p v-if="errors.email" :class="error">{{ errors.email }}</p>
        </div>
        <div>
          <label for="telephone" class="block text-sm mb-1">Téléphone *</label>
          <input id="telephone" type="tel" v-bind="bind('telephone')" :class="field" />
          <p v-if="errors.telephone" :class="error">{{ errors.telephone }}</p>
        </div>
      </div>
    </fieldset>

    <!-- Visite -->
    <fieldset class="space-y-4">
      <legend class="text-sm font-semibold text-white mb-2">Votre visite</legend>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label for="niveau" class="block text-sm mb-1">Niveau de la classe *</label>
          <select id="niveau" v-model="values.niveau" :class="field">
            <option value="">-- Choisir --</option>
            <option v-for="n in niveaux" :key="n" :value="n">{{ n }}</option>
          </select>
          <p v-if="errors.niveau" :class="error">{{ errors.niveau }}</p>
        </div>
        <div>
          <label for="nbEleves" class="block text-sm mb-1">Nombre d'élèves *</label>
          <input id="nbEleves" type="number" min="1" max="200" v-bind="bind('nbEleves')" :class="field" />
          <p v-if="errors.nbEleves" :class="error">{{ errors.nbEleves }}</p>
        </div>
      </div>
      <div>
        <label for="datesSouhaitees" class="block text-sm mb-1">Disponibilités souhaitées *</label>
        <input
          id="datesSouhaitees"
          type="text"
          placeholder="ex : semaine du 12 mai, matinée de préférence"
          v-bind="bind('datesSouhaitees')"
          :class="field"
        />
        <p v-if="errors.datesSouhaitees" :class="error">{{ errors.datesSouhaitees }}</p>
      </div>
      <div>
        <label for="message" class="block text-sm mb-1">Message complémentaire</label>
        <textarea
          id="message"
          rows="3"
          v-bind="bind('message')"
          :class="field"
          placeholder="Thème souhaité, contraintes particulières…"
        />
      </div>
    </fieldset>

    <!-- RGPD -->
    <div>
      <label class="flex items-start gap-2 text-sm">
        <input v-model="values.rgpd" type="checkbox" class="mt-0.5 accent-tn-blue" />
        <span>
          J'accepte que mes données soient utilisées pour traiter ma demande de réservation,
          conformément à la
          <RouterLink to="/politique-confidentialite" target="_blank" class="text-tn-blue underline">politique de confidentialité</RouterLink>.
        </span>
      </label>
      <p v-if="errors.rgpd" :class="error">{{ errors.rgpd }}</p>
    </div>

    <p v-if="status === 'error'" class="text-sm text-red-600">
      Une erreur est survenue. Veuillez réessayer ou nous contacter directement.
    </p>

    <button
      type="submit"
      :disabled="status === 'sending'"
      class="w-full sm:w-auto px-8 py-3 rounded font-semibold bg-tn-blue text-tn-white hover:bg-[#1a8fd1] disabled:opacity-60 transition-colors"
    >
      {{ status === "sending" ? "Envoi en cours…" : "Envoyer ma demande" }}
    </button>
  </form>
</template>
