<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Partenaires & Financeurs"
      :breadcrumb="[{ label: 'Découvrir', href: '/decouvrir' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12">
      <p class="text-white/85 leading-relaxed">
        Terra Numerica est un consortium fédérateur, porté par le CNRS, Inria et Université Côte
        d'Azur, regroupant l'éducation nationale et un large ensemble de partenaires dans le
        domaine du numérique (laboratoires de recherche, grands organismes publics d'enseignement
        supérieur et de recherche, entreprises, collectivités territoriales, fondations, associations et
        projets de médiation scientifique, institut de formation des professeurs, etc.).
      </p>
      <p class="text-white/85 leading-relaxed mt-4">
        Terra Numerica propose des partenariats structurants afin notamment de nouer le dialogue avec
        le grand public autour de cas d'usage et/ou de permettre de créer de nouvelles ressources
        ludiques autour des recherches et des innovations des territoires. Nous vous invitons à nous
        écrire :
        <a
          href="mailto:contact@terra-numerica.org"
          class="text-tn-blue hover:underline"
        >
          contact@terra-numerica.org</a>.
      </p>
    </div>
  </div>
</template>
