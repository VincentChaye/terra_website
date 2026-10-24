<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader title="Page introuvable" description="Cette page n'existe pas ou a été déplacée." />
    <div class="max-w-4xl mx-auto px-4 py-12">
      <p class="text-white/85 leading-relaxed">
        <RouterLink to="/" class="text-tn-blue hover:underline">Retour à l'accueil</RouterLink>
      </p>
    </div>
  </div>
</template>
