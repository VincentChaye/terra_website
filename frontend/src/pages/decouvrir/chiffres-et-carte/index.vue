<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";

const stats = [
  { value: "150+", label: "ateliers pédagogiques en ligne" },
  { value: "250", label: "lieux d'actions" },
  { value: "36 000+", label: "personnes touchées en 2025" },
  { value: "26", label: "Espaces Partenaires" },
];
</script>

<template>
  <div>
    <PageHeader
      title="Terra Numerica en chiffres et en carte"
      :breadcrumb="[{ label: 'Découvrir', href: '/decouvrir' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12">
      <p class="text-white/85 leading-relaxed">
        Les dispositifs Terra Numerica permettent de sensibiliser et de former aux sciences du
        numérique.
      </p>
      <p class="text-white/85 leading-relaxed mt-4">
        Le
        <a
          href="https://portail.terra-numerica.org"
          target="_blank"
          rel="noopener"
          class="text-tn-blue hover:underline"
        >
          portail de ressources Terra Numerica
        </a>
        en ligne contient plus de 150 ateliers pédagogiques, une dizaine de parcours thématiques et
        mallettes pédagogiques pour le prêt.
      </p>
      <p class="text-white/85 leading-relaxed mt-4">
        Terra Numerica participe à des événements en Région Sud et sur l'ensemble du territoire :
        250 lieux d'actions comptabilisés dont notre lieu-totem Terra Numerica Sophia.
      </p>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
        <div v-for="stat in stats"
            :key="stat.label"
            class="border border-white/20 rounded-lg p-6 text-center"
          >
            <p class="text-3xl font-bold text-tn-blue">{{ stat.value }}</p>
            <p class="text-sm text-white/70 mt-2">{{ stat.label }}</p>
          </div>
      </div>
    </div>
  </div>
</template>
