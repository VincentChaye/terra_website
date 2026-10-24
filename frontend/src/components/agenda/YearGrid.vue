<script setup lang="ts">
import type { WimiEvent } from "@/lib/agenda-types";
import { addDays, isToday, MONTHS_FR, startOfWeek, toDayKey } from "@/lib/date-utils";

defineProps<{
  year: number;
  eventsByDay: Map<string, WimiEvent[]>;
}>();

/** Clic sur un mini-mois → bascule en vue Mois */
const emit = defineEmits<{ monthSelect: [month: Date] }>();

const WEEK_LETTERS = ["L", "M", "M", "J", "V", "S", "D"];

/** 42 jours à partir du lundi de la semaine du 1er du mois */
function cellsOf(month: Date): Date[] {
  const gridStart = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1));
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
</script>

<template>
  <!-- Vue Année : 12 mini-mois, un point sous les jours avec événement -->
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <button
      v-for="m in 12"
      :key="m"
      class="rounded-xl border border-white/10 bg-white/2 hover:border-tn-blue/50 hover:bg-white/4 transition-colors p-3 text-left"
      @click="emit('monthSelect', new Date(year, m - 1, 1))"
    >
      <p class="text-tn-blue text-xs font-semibold uppercase tracking-widest mb-2">
        {{ MONTHS_FR[m - 1] }}
      </p>
      <div class="grid grid-cols-7 gap-y-0.5">
        <span v-for="(d, i) in WEEK_LETTERS" :key="i" class="text-center text-[9px] text-white/30">
          {{ d }}
        </span>
        <template v-for="(day, i) in cellsOf(new Date(year, m - 1, 1))" :key="i">
          <span v-if="day.getMonth() !== m - 1" />
          <span v-else class="flex flex-col items-center">
            <span
              class="flex items-center justify-center w-5 h-5 rounded-full text-[10px] leading-none"
              :class="isToday(day) ? 'bg-tn-blue text-white font-bold' : 'text-white/60'"
            >
              {{ day.getDate() }}
            </span>
            <span
              class="w-1 h-1 rounded-full -mt-0.5"
              :style="{ backgroundColor: eventsByDay.get(toDayKey(day))?.[0]?.color ?? 'transparent' }"
            />
          </span>
        </template>
      </div>
    </button>
  </div>
</template>
