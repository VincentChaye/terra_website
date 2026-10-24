<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Ateliers Terra Numerica"
      description="Des ateliers pédagogiques déployés au sein des Espaces de Culture Numérique pour tous les publics."
      :breadcrumb="[{ label: 'Scolaires', href: '/scolaires' }]"
    />

    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85">
        Les ateliers Terra Numerica sont à découvrir sur le portail des ressources. Ils sont
        déployés au sein des Espaces de Culture Numérique afin de proposer une offre pédagogique
        permettant aux publics d'aborder différents aspects d'une même thématique.
      </p>

      <p class="text-white/85">
        Retrouvez l'intégralité des ateliers sur le
        <a
          href="https://portail.terra-numerica.org"
          target="_blank"
          rel="noopener noreferrer"
          class="text-tn-blue hover:underline"
        >
          portail Terra Numerica</a>.
      </p>
    </div>
  </div>
</template>
