<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Le collectif Terra Numerica"
      :breadcrumb="[{ label: 'Découvrir', href: '/decouvrir' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12">
      <p class="text-white/85 leading-relaxed">
        Terra Numerica est porté par une centaine de membres actifs en 2025 qui ont une expertise
        scientifique, pédagogique, en médiation scientifique, création d'ateliers et dispositifs
        interactifs, recherche en sciences de l'éducation, organisation d'événements,
        communication, formation, etc. Vous souhaitez participer aux groupes de travail pour la
        création de contenus, renforcer les équipes pour le déploiement des ateliers sur le territoire,
        animer des ateliers pédagogiques, participer aux développements de Terra Numerica, nous vous
        invitons à rejoindre le collectif en nous écrivant :
        <a
          href="mailto:contact@terra-numerica.org"
          class="text-tn-blue hover:underline"
        >
          contact@terra-numerica.org</a>. Vous pouvez également vous inscrire à la liste de diffusion.
      </p>
    </div>
  </div>
</template>
