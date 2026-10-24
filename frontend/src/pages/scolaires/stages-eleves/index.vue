<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Stages élèves"
      description="Des stages de découverte pour les collégiens et lycéens au sein de l'espace Terra Numerica Sophia."
      :breadcrumb="[{ label: 'Scolaires', href: '/scolaires' }]"
    />

    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85">
        Terra Numerica accueille des stagiaires (3e et seconde) au sein de l'espace Terra Numerica
        Sophia. Ces stages de découverte permettent aux collégiens et lycéens de découvrir les
        métiers du numérique et de la recherche scientifique.
      </p>

      <p class="text-white/85">
        Pour toute demande de stage, merci de nous écrire :
        <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">
          contact@terra-numerica.org</a>.
      </p>
    </div>
  </div>
</template>
