<script setup lang="ts">
import { computed } from "vue";
import type { WimiEvent } from "@/lib/agenda-types";
import { addDays, DAYS_FR, isToday, startOfWeek, toDayKey } from "@/lib/date-utils";

const props = defineProps<{
  /** 1er jour du mois affiché */
  month: Date;
  eventsByDay: Map<string, WimiEvent[]>;
}>();

const emit = defineEmits<{ eventClick: [ev: WimiEvent, anchor: DOMRect] }>();

const MAX_CHIPS = 3;

const cells = computed(() => {
  const { month } = props;
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const weeks = Math.ceil(
    (new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() +
      ((first.getDay() + 6) % 7)) / 7
  );
  const out: Date[] = [];
  for (let i = 0; i < weeks * 7; i++) out.push(addDays(gridStart, i));
  return out;
});

const eventsOf = (day: Date) => props.eventsByDay.get(toDayKey(day)) ?? [];
const click = (ev: WimiEvent, e: MouseEvent) =>
  emit("eventClick", ev, (e.currentTarget as HTMLElement).getBoundingClientRect());
</script>

<template>
  <!-- Vue Mois : grille 7 colonnes type Google Agenda -->
  <div class="rounded-xl border border-white/10 overflow-hidden">
    <!-- En-têtes des jours -->
    <div class="grid grid-cols-7 border-b border-white/10 bg-white/3">
      <div
        v-for="d in DAYS_FR"
        :key="d"
        class="px-1 py-2 text-center text-[11px] uppercase tracking-wide text-white/45"
      >
        {{ d }}
      </div>
    </div>

    <!-- Cases -->
    <div class="grid grid-cols-7">
      <div
        v-for="(day, i) in cells"
        :key="i"
        class="min-h-16 sm:min-h-24 border-white/8 px-1 py-1 sm:px-1.5"
        :class="[
          i % 7 !== 0 ? 'border-l' : '',
          i >= 7 ? 'border-t' : '',
          day.getMonth() === month.getMonth() ? '' : 'bg-white/2',
        ]"
      >
        <div class="flex justify-center sm:justify-start">
          <span
            class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
            :class="
              isToday(day)
                ? 'bg-tn-blue text-white font-bold'
                : day.getMonth() === month.getMonth()
                  ? 'text-white/75'
                  : 'text-white/25'
            "
          >
            {{ day.getDate() }}
          </span>
        </div>

        <!-- Desktop : pastilles avec titre -->
        <div class="hidden sm:block mt-1 space-y-0.5">
          <button
            v-for="(ev, j) in eventsOf(day).slice(0, MAX_CHIPS)"
            :key="`${ev.id}-${j}`"
            class="block w-full truncate text-left text-[11px] leading-tight rounded px-1.5 py-0.5 hover:brightness-125 transition-[filter]"
            :style="{ backgroundColor: `${ev.color}33`, color: ev.color }"
            :title="ev.title"
            @click="click(ev, $event)"
          >
            {{ ev.title }}
          </button>
          <p v-if="eventsOf(day).length > MAX_CHIPS" class="text-[10px] text-white/40 px-1.5">
            +{{ eventsOf(day).length - MAX_CHIPS }} autres
          </p>
        </div>

        <!-- Mobile : points -->
        <button
          v-if="eventsOf(day).length > 0"
          class="sm:hidden flex justify-center gap-0.5 w-full mt-1"
          :aria-label="`${eventsOf(day).length} événement(s) le ${day.getDate()}`"
          @click="click(eventsOf(day)[0], $event)"
        >
          <span
            v-for="(ev, j) in eventsOf(day).slice(0, 3)"
            :key="j"
            class="w-1.5 h-1.5 rounded-full"
            :style="{ backgroundColor: ev.color }"
          />
        </button>
      </div>
    </div>
  </div>
</template>
