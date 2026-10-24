<script setup lang="ts">
import { computed, onWatcherCleanup, ref, watch } from "vue";
import type { WimiEvent } from "@/lib/agenda-types";
import { apiUrl } from "@/lib/api";
import {
  addDays,
  addMonths,
  indexEventsByDay,
  MONTHS_FR,
  startOfWeek,
  toDayKey,
  weekLabel,
  type AgendaViewMode,
} from "@/lib/date-utils";
import MonthGrid from "@/components/agenda/MonthGrid.vue";
import WeekGrid from "@/components/agenda/WeekGrid.vue";
import YearGrid from "@/components/agenda/YearGrid.vue";
import EventPopover from "@/components/agenda/EventPopover.vue";

type Popover = {
  event: WimiEvent;
  anchor: { top: number; left: number; bottom: number; right: number };
};

const VIEWS: { id: AgendaViewMode; label: string }[] = [
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
];

/** Plage de dates visible selon la vue courante */
function visibleRange(view: AgendaViewMode, cursor: Date): [Date, Date] {
  if (view === "week") {
    const s = startOfWeek(cursor);
    return [s, addDays(s, 7)];
  }
  if (view === "month") {
    return [
      new Date(cursor.getFullYear(), cursor.getMonth(), 1),
      new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
    ];
  }
  return [new Date(cursor.getFullYear(), 0, 1), new Date(cursor.getFullYear() + 1, 0, 1)];
}

const view = ref<AgendaViewMode>("month");
const cursor = ref<Date>(new Date());
const events = ref<WimiEvent[]>([]);
const status = ref<"loading" | "ready" | "error">("loading");
const error = ref<string | undefined>(undefined);
const popover = ref<Popover | null>(null);

// Fenêtre de données déjà chargée ; élargie au besoin quand on navigue.
let loadedWindow: [Date, Date] | null = null;

watch(
  [view, cursor],
  async () => {
    const [visFrom, visTo] = visibleRange(view.value, cursor.value);
    if (loadedWindow && visFrom >= loadedWindow[0] && visTo <= loadedWindow[1]) return; // déjà couvert

    // Fenêtre large : année civile du début visible → année suivante complète,
    // pour que la navigation semaine/mois/année reste instantanée.
    const from = new Date(Math.min(visFrom.getFullYear(), new Date().getFullYear()), 0, 1);
    const to = new Date(Math.max(visTo.getFullYear(), new Date().getFullYear() + 1) + 1, 0, 1);

    let cancelled = false;
    onWatcherCleanup(() => {
      cancelled = true;
    });

    try {
      const res = await fetch(
        apiUrl(`/api/agenda?from=${toDayKey(from)}&to=${toDayKey(addDays(to, -1))}`)
      );
      const data = (await res.json().catch(() => ({}))) as {
        events?: WimiEvent[];
        error?: string;
      };
      if (cancelled) return;
      if (!res.ok || data.error) {
        error.value = data.error ?? `Erreur ${res.status}`;
        status.value = "error";
        return;
      }
      loadedWindow = [from, to];
      events.value = data.events ?? [];
      status.value = "ready";
    } catch (err) {
      if (cancelled) return;
      error.value = err instanceof Error ? err.message : String(err);
      status.value = "error";
    }
  },
  { immediate: true }
);

const eventsByDay = computed(() => indexEventsByDay(events.value));

/* Navigation */
const goToday = () => {
  cursor.value = new Date();
};
const go = (dir: 1 | -1) => {
  const c = cursor.value;
  if (view.value === "week") cursor.value = addDays(c, 7 * dir);
  else if (view.value === "month") cursor.value = addMonths(c, dir);
  else cursor.value = new Date(c.getFullYear() + dir, c.getMonth(), 1);
};

/* Titre de la période */
const title = computed(() =>
  view.value === "week"
    ? weekLabel(startOfWeek(cursor.value))
    : view.value === "month"
      ? `${MONTHS_FR[cursor.value.getMonth()]} ${cursor.value.getFullYear()}`
      : String(cursor.value.getFullYear())
);

const monthStart = computed(() => new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1));

const openPopover = (event: WimiEvent, rect: DOMRect) => {
  popover.value = {
    event,
    anchor: { top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right },
  };
};

const selectMonth = (month: Date) => {
  cursor.value = month;
  view.value = "month";
};
</script>

<template>
  <!-- Chargement initial -->
  <div v-if="status === 'loading'" class="rounded-xl border border-white/10 bg-white/3 px-6 py-10 text-center">
    <div
      class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-tn-blue"
      aria-hidden="true"
    />
    <p class="text-white/45 text-sm mt-3">Chargement de l'agenda…</p>
  </div>

  <!-- Erreur API -->
  <div v-else-if="status === 'error'" class="rounded-xl border border-red-500/25 bg-red-900/10 px-6 py-5">
    <p class="text-white/70 text-sm">Impossible de charger l'agenda Wimi.</p>
    <p class="text-white/35 text-xs mt-1 font-mono">{{ error }}</p>
  </div>

  <div v-else>
    <!-- Barre d'outils -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex items-center gap-1">
        <button
          aria-label="Période précédente"
          class="w-8 h-8 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-tn-blue/50 transition-colors flex items-center justify-center"
          @click="go(-1)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          class="h-8 px-3 rounded-lg border border-white/10 text-white/70 text-sm hover:text-white hover:border-tn-blue/50 transition-colors"
          @click="goToday"
        >
          Aujourd'hui
        </button>
        <button
          aria-label="Période suivante"
          class="w-8 h-8 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-tn-blue/50 transition-colors flex items-center justify-center"
          @click="go(1)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <h2 class="text-white font-semibold text-base sm:text-lg flex-1 text-center capitalize">
        {{ title }}
      </h2>

      <!-- Sélecteur de vue -->
      <div class="flex rounded-lg border border-white/10 overflow-hidden">
        <button
          v-for="v in VIEWS"
          :key="v.id"
          class="px-3 h-8 text-sm transition-colors"
          :class="
            view === v.id
              ? 'bg-tn-blue text-white font-medium'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          "
          @click="view = v.id"
        >
          {{ v.label }}
        </button>
      </div>
    </div>

    <!-- Vue courante -->
    <MonthGrid v-if="view === 'month'" :month="monthStart" :events-by-day="eventsByDay" @event-click="openPopover" />
    <WeekGrid v-else-if="view === 'week'" :week-start="startOfWeek(cursor)" :events="events" @event-click="openPopover" />
    <YearGrid v-else :year="cursor.getFullYear()" :events-by-day="eventsByDay" @month-select="selectMonth" />

    <!-- Détail événement -->
    <EventPopover v-if="popover" :event="popover.event" :anchor="popover.anchor" @close="popover = null" />
  </div>
</template>
