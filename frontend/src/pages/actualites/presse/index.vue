<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import { getPresse } from "@/lib/content";

const items = getPresse(); // tri par date desc

// Regrouper par année (la date est "YYYY-MM")
const byYear = new Map<string, typeof items>();
for (const item of items) {
  const year = item.date.slice(0, 4);
  if (!byYear.has(year)) byYear.set(year, []);
  byYear.get(year)!.push(item);
}
// Les années sont déjà en ordre décroissant car items trié par date desc
const years = Array.from(byYear.keys());
</script>

<template>
  <div>
    <PageHeader
      title="Articles sur Terra Numerica"
      :breadcrumb="[{ label: 'Actualités', href: '/actualites' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Découvrez les publications consacrées à Terra Numerica.
      </p>

      <section v-for="year in years" :key="year">
        <h2 class="text-xl font-bold text-white mt-8 mb-3">{{ year }}</h2>
        <ul class="space-y-1 text-white/85">
          <li v-for="item in byYear.get(year)" :key="item.id">
            <a
              v-if="item.url"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-tn-blue transition-colors"
            >
              {{ item.title }} ({{ item.source }}).
            </a>
            <template v-else>{{ item.title }} ({{ item.source }}).</template>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
