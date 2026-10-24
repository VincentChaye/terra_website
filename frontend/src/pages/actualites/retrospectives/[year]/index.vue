<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import PageHeader from "@/components/layout/PageHeader.vue";
import { getRetrospective } from "@/lib/content";

const route = useRoute();
const year = computed(() => String(route.params.year));
const retro = computed(() => getRetrospective(Number(year.value)));
</script>

<template>
  <div v-if="retro">
    <PageHeader
      :title="`Rétrospective ${year}`"
      :breadcrumb="[{ label: 'Actualités', href: '/actualites' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p v-if="retro.intro" class="text-white/85 leading-relaxed font-medium">{{ retro.intro }}</p>
      <p v-for="(p, i) in retro.paragraphs" :key="i" class="text-white/85 leading-relaxed">
        {{ p }}
      </p>
    </div>
  </div>
</template>
