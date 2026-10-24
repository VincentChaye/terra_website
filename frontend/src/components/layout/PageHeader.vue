<script setup lang="ts">
interface Crumb {
  label: string;
  href: string;
}

defineProps<{
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
}>();
</script>

<template>
  <div class="py-10 px-4 border-b border-white/15 text-center">
    <div class="max-w-4xl mx-auto">
      <nav
        v-if="breadcrumb && breadcrumb.length > 0"
        aria-label="Fil d'ariane"
        class="text-sm text-white/40 mb-3 flex justify-center gap-1 flex-wrap"
      >
        <RouterLink to="/" class="hover:text-white transition-colors">Accueil</RouterLink>
        <span v-for="crumb in breadcrumb" :key="crumb.href" class="flex items-center gap-1">
          <span>/</span>
          <RouterLink :to="crumb.href" class="hover:text-white transition-colors">
            {{ crumb.label }}
          </RouterLink>
        </span>
      </nav>
      <h1 class="text-[36px] font-light text-white leading-tight">{{ title }}</h1>
      <p
        v-if="description"
        class="text-white/75 mt-3 max-w-2xl mx-auto text-[18px] leading-relaxed mb-0"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
