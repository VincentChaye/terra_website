<script setup lang="ts">
import { ref } from "vue";
import { apiUrl } from "@/lib/api";
import { contactEntreprisesSchema } from "@/lib/forms";
import { useZodForm } from "@/lib/useZodForm";

const interets = [
  "Team building / visite découverte",
  "Formation sur mesure",
  "Mécénat / partenariat",
  "Autre",
];

const status = ref<"idle" | "sending" | "sent" | "error">("idle");

const { values, errors, validate, reset, bind } = useZodForm(contactEntreprisesSchema, {
  entreprise: "",
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  interet: "",
  nbParticipants: "",
  message: "",
  rgpd: false,
  website: "", // honeypot
});

async function onSubmit() {
  const data = validate();
  if (!data) return;
  status.value = "sending";
  try {
    const res = await fetch(apiUrl("/api/contact-entreprises"), {
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
const errCls = "text-xs text-red-400 mt-1";
</script>

<template>
  <div v-if="status === 'sent'" class="rounded-lg bg-green-950/50 border border-green-800 p-6 text-center">
    <p class="font-semibold text-green-800">Message envoyé !</p>
    <p class="text-sm text-green-400 mt-1">Notre équipe vous répondra sous 2 jours ouvrés.</p>
  </div>

  <form v-else novalidate class="space-y-5" @submit.prevent="onSubmit">
    <!-- Honeypot anti-spam : invisible, doit rester vide -->
    <div aria-hidden="true" class="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label for="ent-website">Ne pas remplir</label>
      <input id="ent-website" type="text" tabindex="-1" autocomplete="off" v-bind="bind('website')" />
    </div>
    <div>
      <label for="entreprise" class="block text-sm mb-1">Entreprise *</label>
      <input id="entreprise" type="text" v-bind="bind('entreprise')" :class="field" />
      <p v-if="errors.entreprise" :class="errCls">{{ errors.entreprise }}</p>
    </div>
    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label for="ent-prenom" class="block text-sm mb-1">Prénom *</label>
        <input id="ent-prenom" type="text" v-bind="bind('prenom')" :class="field" />
        <p v-if="errors.prenom" :class="errCls">{{ errors.prenom }}</p>
      </div>
      <div>
        <label for="ent-nom" class="block text-sm mb-1">Nom *</label>
        <input id="ent-nom" type="text" v-bind="bind('nom')" :class="field" />
        <p v-if="errors.nom" :class="errCls">{{ errors.nom }}</p>
      </div>
    </div>
    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label for="ent-email" class="block text-sm mb-1">E-mail *</label>
        <input id="ent-email" type="email" v-bind="bind('email')" :class="field" />
        <p v-if="errors.email" :class="errCls">{{ errors.email }}</p>
      </div>
      <div>
        <label for="ent-tel" class="block text-sm mb-1">Téléphone *</label>
        <input id="ent-tel" type="tel" v-bind="bind('telephone')" :class="field" />
        <p v-if="errors.telephone" :class="errCls">{{ errors.telephone }}</p>
      </div>
    </div>
    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label for="interet" class="block text-sm mb-1">Sujet *</label>
        <select id="interet" v-model="values.interet" :class="field">
          <option value="">-- Choisir --</option>
          <option v-for="i in interets" :key="i" :value="i">{{ i }}</option>
        </select>
        <p v-if="errors.interet" :class="errCls">{{ errors.interet }}</p>
      </div>
      <div>
        <label for="nbParticipants" class="block text-sm mb-1">Nb de participants</label>
        <input id="nbParticipants" type="number" min="1" v-bind="bind('nbParticipants')" :class="field" />
        <p v-if="errors.nbParticipants" :class="errCls">{{ errors.nbParticipants }}</p>
      </div>
    </div>
    <div>
      <label for="ent-message" class="block text-sm mb-1">Votre message *</label>
      <textarea id="ent-message" rows="4" v-bind="bind('message')" :class="field" />
      <p v-if="errors.message" :class="errCls">{{ errors.message }}</p>
    </div>

    <div>
      <label class="flex items-start gap-2 text-sm">
        <input v-model="values.rgpd" type="checkbox" class="mt-0.5 accent-tn-blue" />
        <span>
          J'accepte que mes données soient utilisées pour traiter ma demande, conformément à la
          <RouterLink to="/politique-confidentialite" target="_blank" class="text-tn-blue underline">politique de confidentialité</RouterLink>.
        </span>
      </label>
      <p v-if="errors.rgpd" :class="errCls">{{ errors.rgpd }}</p>
    </div>

    <p v-if="status === 'error'" class="text-sm text-red-600">
      Une erreur est survenue. Veuillez réessayer.
    </p>

    <button
      type="submit"
      :disabled="status === 'sending'"
      class="w-full sm:w-auto px-8 py-3 rounded font-semibold bg-tn-blue text-tn-white hover:bg-[#1a8fd1] disabled:opacity-60 transition-colors"
    >
      {{ status === "sending" ? "Envoi…" : "Envoyer" }}
    </button>
  </form>
</template>
