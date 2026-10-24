<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Mécénat & Partenariat"
      description="Devenez partenaire de Terra Numerica et soutenez la diffusion de la culture des sciences du numérique."
      :breadcrumb="[{ label: 'Entreprises', href: '/entreprises' }]"
    />

    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85">
        Terra Numerica est un consortium fédérateur, porté par le CNRS, Inria et Université Côte
        d'Azur, regroupant l'éducation nationale et un large ensemble de partenaires dans le domaine
        du numérique.
      </p>

      <p class="text-white/85">
        Terra Numerica propose des partenariats structurants afin notamment de nouer le dialogue
        avec le grand public autour de cas d'usage et/ou de permettre de créer de nouvelles
        ressources ludiques autour des recherches et des innovations des territoires.
      </p>

      <p class="text-white/85">
        Vous souhaitez devenir partenaire ou soutenir Terra Numerica ? Merci de nous écrire :
        <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">
          contact@terra-numerica.org</a>.
      </p>
    </div>
  </div>
</template>
