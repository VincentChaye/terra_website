<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Développement territorial"
      :breadcrumb="[{ label: 'Découvrir', href: '/decouvrir' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12">
      <p class="text-white/85 leading-relaxed">
        Terra Numerica développe des réseaux interconnectés d'Espaces de Culture Numérique,
        chacun couvrant un territoire ciblé avec un possible lieu-totem agissant comme un pôle de
        rayonnement, et intégrant des communautés apprenantes. L'ensemble des territoires est très
        dynamique et s'affine au fur et à mesure des développements :
      </p>
      <ul class="list-disc list-inside space-y-1 text-white/85 mt-4">
        <li>Sophia Antipolis et académie de Nice/Centre en Région Sud</li>
        <li>Nice, Métropole Nice Côte d'Azur et académie de Nice/Est en Région Sud</li>
        <li>Var et académie de Nice/Ouest en Région Sud</li>
        <li>Marseille et académie d'Aix-Marseille en Région Sud</li>
        <li>Nouvelle-Calédonie</li>
        <li>Corse</li>
      </ul>
    </div>
  </div>
</template>
