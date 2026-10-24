<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Ateliers ludiques"
      :breadcrumb="[{ label: 'Ressources', href: '/ressources' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Les ateliers Terra Numerica sont à découvrir sur le portail des ressources. Ils sont déployés au sein des
        Espaces de Culture Numérique afin de proposer une offre pédagogique permettant aux publics d'aborder
        différents aspects d'une même thématique. Les ateliers peuvent aussi être déployés hors les murs pour des
        événements ponctuels et aussi être prêtés pour des périodes plus ou moins longues (avec possible formation).
        Terra Numerica développe également des jeux en ligne et des mallettes pédagogiques mises à disposition des
        établissements scolaires.
      </p>
      <p>
        <a
          href="https://portail.terra-numerica.org"
          target="_blank"
          rel="noopener noreferrer"
          class="text-tn-blue hover:underline"
        >
          Découvrir tous les ateliers sur le portail Terra Numerica →
        </a>
      </p>
    </div>
  </div>
</template>
