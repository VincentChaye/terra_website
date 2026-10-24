<script setup lang="ts">
import { computed } from "vue";
import type { WimiEvent } from "@/lib/agenda-types";
import { addDays, formatTime, isToday, DAYS_FR, toDayKey } from "@/lib/date-utils";

const props = defineProps<{
  /** Lundi de la semaine affichée */
  weekStart: Date;
  events: WimiEvent[];
}>();

const emit = defineEmits<{ eventClick: [ev: WimiEvent, anchor: DOMRect] }>();

const HOUR_START = 8;
const HOUR_END = 20;
const HOUR_PX = 48; // hauteur d'une heure

function hourOf(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

const days = computed(() => Array.from({ length: 7 }, (_, i) => addDays(props.weekStart, i)));
const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const gridHeight = hours.length * HOUR_PX;

// Un événement "journée entière" ou multi-jours va dans la rangée du haut
const isAllDayLike = (ev: WimiEvent) =>
  ev.allDay || ev.start.slice(0, 10) !== ev.end.slice(0, 10);

const inWeek = computed(() => {
  const weekEnd = addDays(props.weekStart, 7);
  return props.events.filter((ev) => new Date(ev.end) >= props.weekStart && new Date(ev.start) < weekEnd);
});
const allDay = computed(() => inWeek.value.filter(isAllDayLike));

const timedByDay = computed(() => {
  const map = new Map<string, WimiEvent[]>();
  for (const ev of inWeek.value.filter((e) => !isAllDayLike(e))) {
    const key = ev.start.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ev);
  }
  return map;
});

const allDayOf = (d: Date) => {
  const key = toDayKey(d);
  return allDay.value.filter((ev) => key >= ev.start.slice(0, 10) && key <= ev.end.slice(0, 10));
};

/** Position verticale d'un événement ; null s'il commence après la fin de la grille */
function blockStyle(ev: WimiEvent) {
  const start = Math.max(hourOf(ev.start), HOUR_START);
  const end = Math.min(Math.max(hourOf(ev.end), start + 0.5), HOUR_END);
  if (start >= HOUR_END) return null;
  return {
    top: `${(start - HOUR_START) * HOUR_PX}px`,
    height: `${(end - start) * HOUR_PX - 2}px`,
    backgroundColor: `${ev.color}40`,
    borderColor: `${ev.color}66`,
  };
}

const click = (ev: WimiEvent, e: MouseEvent) =>
  emit("eventClick", ev, (e.currentTarget as HTMLElement).getBoundingClientRect());
</script>

<template>
  <!-- Vue Semaine : grille horaire 8h→20h type Google Agenda -->
  <div class="rounded-xl border border-white/10 overflow-x-auto">
    <div class="min-w-[640px]">
      <!-- En-têtes des jours -->
      <div class="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-white/10 bg-white/3">
        <div />
        <div v-for="(d, i) in days" :key="i" class="px-1 py-2 text-center border-l border-white/8">
          <p class="text-[11px] uppercase tracking-wide text-white/45">{{ DAYS_FR[i] }}</p>
          <p
            class="text-sm mt-0.5"
            :class="
              isToday(d)
                ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-tn-blue text-white font-bold'
                : 'text-white/75'
            "
          >
            {{ d.getDate() }}
          </p>
        </div>
      </div>

      <!-- Rangée "journée entière" / multi-jours -->
      <div v-if="allDay.length > 0" class="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-white/10">
        <div class="py-1 pr-1 text-right text-[10px] text-white/35">Journée</div>
        <div v-for="(d, i) in days" :key="i" class="border-l border-white/8 px-0.5 py-1 space-y-0.5">
          <button
            v-for="(ev, j) in allDayOf(d)"
            :key="`${ev.id}-${j}`"
            class="block w-full truncate text-left text-[11px] leading-tight rounded px-1.5 py-0.5 hover:brightness-125 transition-[filter]"
            :style="{ backgroundColor: `${ev.color}33`, color: ev.color }"
            :title="ev.title"
            @click="click(ev, $event)"
          >
            {{ ev.title }}
          </button>
        </div>
      </div>

      <!-- Grille horaire -->
      <div class="grid grid-cols-[3rem_repeat(7,1fr)]">
        <!-- Colonne des heures -->
        <div class="relative" :style="{ height: `${gridHeight}px` }">
          <div
            v-for="h in hours"
            :key="h"
            class="absolute right-1 -translate-y-1/2 text-[10px] text-white/35"
            :style="{ top: `${(h - HOUR_START) * HOUR_PX}px` }"
          >
            {{ h > HOUR_START ? `${h}h` : "" }}
          </div>
        </div>

        <!-- Colonnes des jours -->
        <div
          v-for="(d, i) in days"
          :key="i"
          class="relative border-l border-white/8"
          :style="{ height: `${gridHeight}px` }"
        >
          <!-- Lignes des heures -->
          <div
            v-for="h in hours.slice(1)"
            :key="h"
            class="absolute inset-x-0 border-t border-white/6"
            :style="{ top: `${(h - HOUR_START) * HOUR_PX}px` }"
          />

          <!-- Blocs événements -->
          <template v-for="(ev, j) in timedByDay.get(toDayKey(d)) ?? []" :key="`${ev.id}-${j}`">
            <button
              v-if="blockStyle(ev)"
              class="absolute inset-x-0.5 overflow-hidden rounded border hover:brightness-125 transition-[filter] px-1.5 py-1 text-left"
              :style="blockStyle(ev)!"
              :title="ev.title"
              @click="click(ev, $event)"
            >
              <p class="text-[11px] font-medium leading-tight truncate" :style="{ color: ev.color }">
                {{ ev.title }}
              </p>
              <p class="text-[10px] text-white/50 truncate">
                {{ formatTime(ev.start) }} – {{ formatTime(ev.end) }}
              </p>
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
