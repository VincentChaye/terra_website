<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Livret d'activités Science Tour Terra Numerica"
      :breadcrumb="[{ label: 'Ressources', href: '/ressources' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Dans le cadre du Science Tour Terra Numerica, un livret d'activités (60 pages, 40 fiches) a été publié
        le 1er juillet 2025 par les deux porteurs Les Petits Débrouillards PACA et Terra Numerica ainsi que par dix
        partenaires du projet. Ce livret est à destination des médiateurs, enseignants et citoyens à partir de
        quarante ateliers proposés lors des événements réalisés au sein de dix territoires de trois départements.
      </p>
    </div>
  </div>
</template>
