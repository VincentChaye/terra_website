<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { readConsent, writeConsent, defaultConsent, CONSENT_VERSION } from "@/lib/consent";

type Prefs = { analytics: boolean; media: boolean; social: boolean };

const CATEGORIES = [
  {
    key: "necessary" as const,
    label: "Strictement nécessaires",
    desc: "Indispensables au fonctionnement du site : mémorisation du consentement, sécurité de session. Aucune donnée transmise à des tiers.",
    locked: true,
  },
  {
    key: "analytics" as const,
    label: "Mesure d'audience",
    desc: "Comptage anonyme des visites pour améliorer le site (Plausible Analytics). Aucun cookie tiers, données non partagées, exemption CNIL.",
    locked: false,
  },
  {
    key: "media" as const,
    label: "Médias externes (YouTube)",
    desc: "Lecture des vidéos Terra Numerica intégrées depuis YouTube. Sans consentement, les vidéos sont remplacées par un aperçu statique.",
    locked: false,
  },
  {
    key: "social" as const,
    label: "Réseaux sociaux",
    desc: "Boutons de partage Facebook, LinkedIn, YouTube. Sans consentement, aucun script tiers n'est chargé ; les liens sociaux restent actifs.",
    locked: false,
  },
];

const visible = ref(false);
const panel = ref(false); // false = bannière, true = personnalisation
const prefs = reactive<Prefs>({ analytics: false, media: false, social: false });
const dialogRef = ref<HTMLDivElement | null>(null);

function openFromEvent() {
  const existing = readConsent();
  if (existing) {
    prefs.analytics = existing.analytics;
    prefs.media = existing.media;
    prefs.social = existing.social;
  }
  panel.value = true;
  visible.value = true;
}

onMounted(() => {
  const consent = readConsent();
  if (!consent || consent.v !== CONSENT_VERSION) visible.value = true;
  // Écouter l'event "rouvrir depuis la page confidentialité"
  window.addEventListener("tn-open-consent", openFromEvent);
});

onBeforeUnmount(() => window.removeEventListener("tn-open-consent", openFromEvent));

// Place le focus dans le dialog quand le panneau s'ouvre
watch(panel, async (isOpen) => {
  if (isOpen) {
    await nextTick();
    dialogRef.value?.focus();
  }
});

function save(p: Prefs) {
  writeConsent(p);
  visible.value = false;
  panel.value = false;
}

function toggle(key: keyof Prefs) {
  prefs[key] = !prefs[key];
}

const isOn = (cat: (typeof CATEGORIES)[number]) =>
  cat.locked || prefs[cat.key as keyof Prefs];
</script>

<template>
  <!-- ── VUE PERSONNALISATION ─── -->
  <div
    v-if="visible && panel"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    aria-modal="true"
    role="dialog"
    aria-label="Gérer mes préférences cookies"
  >
    <div
      ref="dialogRef"
      tabindex="-1"
      class="w-full max-w-lg bg-[#12102a] border border-white/15 rounded-xl shadow-2xl outline-none"
    >
      <!-- Header -->
      <div class="px-6 pt-5 pb-4 border-b border-white/10">
        <h2 class="text-white font-semibold text-base leading-snug">
          Personnaliser mes préférences cookies
        </h2>
        <p class="text-white/50 text-xs mt-1">
          Activez ou désactivez chaque catégorie. Vos choix sont enregistrés sur votre appareil.
        </p>
      </div>

      <!-- Catégories -->
      <ul class="divide-y divide-white/8">
        <li v-for="cat in CATEGORIES" :key="cat.key" class="flex items-start gap-4 px-6 py-4">
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium leading-snug">{{ cat.label }}</p>
            <p class="text-white/50 text-xs mt-0.5 leading-relaxed">{{ cat.desc }}</p>
          </div>
          <!-- Toggle -->
          <button
            role="switch"
            :aria-checked="isOn(cat)"
            :aria-label="cat.label"
            :disabled="cat.locked"
            class="relative shrink-0 mt-0.5 h-6 w-11 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-tn-blue"
            :class="[
              cat.locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              isOn(cat) ? 'bg-tn-blue' : 'bg-white/20',
            ]"
            @click="!cat.locked && toggle(cat.key as keyof Prefs)"
          >
            <span
              class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
              :class="isOn(cat) ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </li>
      </ul>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:justify-end">
        <button
          class="px-4 py-2 rounded border border-white/20 text-white/60 hover:text-white text-xs transition-colors"
          @click="save(defaultConsent(false))"
        >
          Tout refuser
        </button>
        <button
          class="px-4 py-2 rounded border border-tn-blue text-tn-blue hover:bg-tn-blue hover:text-white text-xs transition-colors"
          @click="save({ ...prefs })"
        >
          Enregistrer mes choix
        </button>
        <button
          class="px-4 py-2 rounded bg-tn-blue text-white text-xs hover:bg-[#1a8fd1] transition-colors"
          @click="save(defaultConsent(true))"
        >
          Tout accepter
        </button>
      </div>
    </div>
  </div>

  <!-- ── VUE BANNIÈRE ─── -->
  <div
    v-else-if="visible"
    class="fixed bottom-0 left-0 right-0 z-50 bg-[#12102a] border-t border-white/10 shadow-lg"
  >
    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <p class="text-white/65 text-xs leading-relaxed max-w-2xl">
        Nous utilisons des cookies pour le fonctionnement du site et, avec votre accord, pour mesurer
        l'audience et activer les médias tiers (YouTube, réseaux sociaux).
        <RouterLink to="/politique-confidentialite#cookies" class="text-tn-blue hover:underline">
          Politique cookies
        </RouterLink>
      </p>
      <div class="flex gap-2 shrink-0 flex-wrap">
        <button
          class="px-3 py-1.5 rounded border border-white/20 text-white/55 hover:text-white text-xs transition-colors"
          @click="save(defaultConsent(false))"
        >
          Tout refuser
        </button>
        <button
          class="px-3 py-1.5 rounded border border-white/30 text-white/80 hover:text-white text-xs transition-colors"
          @click="panel = true"
        >
          Personnaliser
        </button>
        <button
          class="px-3 py-1.5 rounded bg-tn-blue text-white text-xs hover:bg-[#1a8fd1] transition-colors"
          @click="save(defaultConsent(true))"
        >
          Tout accepter
        </button>
      </div>
    </div>
  </div>
</template>
