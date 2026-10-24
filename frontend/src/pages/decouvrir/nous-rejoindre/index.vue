<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Nous rejoindre"
      :breadcrumb="[{ label: 'Découvrir', href: '/decouvrir' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12">
      <p class="text-white/85 leading-relaxed">
        Rejoignez le collectif Terra Numerica ! Terra Numerica est porté par une centaine de membres
        actifs en 2025. Vous avez une expertise scientifique, pédagogique, en médiation scientifique,
        création d'ateliers, organisation d'événements, communication ou formation ?
      </p>
      <p class="text-white/85 leading-relaxed mt-4">Vous pouvez :</p>
      <ul class="list-disc list-inside space-y-1 text-white/85 mt-2">
        <li>Participer aux groupes de travail pour la création de contenus</li>
        <li>Renforcer les équipes pour le déploiement des ateliers sur le territoire</li>
        <li>Animer des ateliers pédagogiques</li>
        <li>Contribuer aux développements de Terra Numerica</li>
      </ul>
      <p class="text-white/85 leading-relaxed mt-6">
        Pour nous rejoindre, écrivez-nous à
        <a
          href="mailto:contact@terra-numerica.org"
          class="text-tn-blue hover:underline"
        >
          contact@terra-numerica.org</a>.
      </p>
    </div>
  </div>
</template>
