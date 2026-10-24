<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { WimiEvent } from "@/lib/agenda-types";
import { formatTime, MONTHS_FR_SHORT } from "@/lib/date-utils";

const props = defineProps<{
  event: WimiEvent;
  /** Rectangle (viewport) de l'élément cliqué, pour ancrer le popover */
  anchor: { top: number; left: number; bottom: number; right: number };
}>();

const emit = defineEmits<{ close: [] }>();

const POPOVER_WIDTH = 320;
const MARGIN = 8;

function dateLabel(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_FR_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Détail d'un événement : popover flottant ancré sur l'élément cliqué
 * (desktop), feuille pleine largeur en bas d'écran (mobile).
 */
const el = ref<HTMLDivElement | null>(null);
const pos = ref<{ top: number; left: number } | null>(null);
const copied = ref(false);
const isMobile = window.innerWidth < 640;

async function copyLocation() {
  try {
    await navigator.clipboard.writeText(props.event.location);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    // Clipboard indisponible (http, permissions…) : sélection manuelle possible
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") emit("close");
}

onMounted(async () => {
  window.addEventListener("keydown", onKey);
  if (isMobile) return;
  await nextTick();
  if (!el.value) return;
  const h = el.value.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const { anchor } = props;

  // Sous l'ancre par défaut, au-dessus si pas la place
  let top = anchor.bottom + MARGIN;
  if (top + h > vh - MARGIN) top = Math.max(MARGIN, anchor.top - h - MARGIN);

  let left = anchor.left;
  if (left + POPOVER_WIDTH > vw - MARGIN) left = vw - POPOVER_WIDTH - MARGIN;
  if (left < MARGIN) left = MARGIN;

  pos.value = { top, left };
});

onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

const sameDay = computed(() => props.event.start.slice(0, 10) === props.event.end.slice(0, 10));
</script>

<template>
  <!-- Fond cliquable pour fermer -->
  <div
    class="fixed inset-0 z-40"
    :class="isMobile ? 'bg-black/50' : ''"
    aria-hidden="true"
    @click="emit('close')"
  />
  <div
    ref="el"
    role="dialog"
    :aria-label="event.title"
    :class="
      isMobile
        ? 'fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/15 bg-[#101418] px-5 pt-4 pb-6 shadow-2xl'
        : 'fixed z-50 w-80 rounded-xl border border-white/15 bg-[#101418] px-5 py-4 shadow-2xl'
    "
    :style="!isMobile ? { top: `${pos?.top ?? -9999}px`, left: `${pos?.left ?? -9999}px` } : undefined"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-white font-semibold text-sm leading-snug flex items-start gap-2">
        <span
          class="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
          :style="{ backgroundColor: event.color }"
          aria-hidden="true"
        />
        {{ event.title }}
      </h3>
      <button
        aria-label="Fermer"
        class="text-white/40 hover:text-white transition-colors shrink-0 -mt-0.5"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>

    <p class="text-white/55 text-xs mt-1.5">
      <template v-if="sameDay">
        {{ dateLabel(event.start) }}
        <template v-if="!event.allDay"> · {{ formatTime(event.start) }} – {{ formatTime(event.end) }}</template>
        <template v-else> · Journée entière</template>
      </template>
      <template v-else>
        {{ dateLabel(event.start) }}<template v-if="!event.allDay"> {{ formatTime(event.start) }}</template>
        → {{ dateLabel(event.end) }}<template v-if="!event.allDay"> {{ formatTime(event.end) }}</template>
      </template>
    </p>

    <div v-if="event.location" class="flex items-center gap-1.5 mt-2">
      <svg viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 text-white/35 shrink-0" aria-hidden="true">
        <path fill-rule="evenodd" d="M8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM2 6a6 6 0 1 1 10.68 3.77l-3.98 4.37a1 1 0 0 1-1.4 0L3.32 9.77A5.97 5.97 0 0 1 2 6zm6-.5a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V6a.5.5 0 0 0-.5-.5z" clip-rule="evenodd" />
      </svg>
      <span class="text-white/55 text-xs">{{ event.location }}</span>
      <button
        aria-label="Copier l'adresse"
        title="Copier l'adresse"
        class="text-white/40 hover:text-white transition-colors shrink-0"
        @click="copyLocation"
      >
        <span v-if="copied" class="text-[10px] text-tn-blue">Copié ✓</span>
        <svg v-else viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3" aria-hidden="true">
          <path d="M10 1H4a1.5 1.5 0 0 0-1.5 1.5V11H4V2.5h6V1z" />
          <path d="M6 3.5h6A1.5 1.5 0 0 1 13.5 5v8.5A1.5 1.5 0 0 1 12 15H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5zm0 1.5v8.5h6V5H6z" />
        </svg>
      </button>
    </div>

    <p v-if="event.description" class="text-white/60 text-xs mt-3 leading-relaxed max-h-32 overflow-y-auto">
      {{ event.description }}
    </p>

    <div class="flex items-center gap-2 mt-3 flex-wrap">
      <span
        v-for="t in event.tags"
        :key="t"
        class="text-[10px] px-2 py-0.5 rounded-full bg-tn-blue/15 text-tn-blue border border-tn-blue/20"
      >
        {{ t }}
      </span>
      <a
        v-if="event.url"
        :href="event.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-tn-blue text-xs hover:underline ml-auto"
      >
        S'inscrire →
      </a>
    </div>
  </div>
</template>
