<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Conférences interactives"
      :breadcrumb="[{ label: 'Ressources', href: '/ressources' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Que ce soit en géométrie, en histoire (oui oui), le football (mais oui aussi) ou encore les réseaux, les
        algorithmes, la théorie des graphes ou la biologie, les conférences proposées sont destinées à des publics
        variés et peuvent, pour certaines d'entre elles, être adaptées en fonction du niveau de l'auditoire.
        Découvrir toutes les conférences Terra Numerica sur notre portail.
      </p>
      <p>
        <a
          href="https://portail.terra-numerica.org"
          target="_blank"
          rel="noopener noreferrer"
          class="text-tn-blue hover:underline"
        >
          Accéder au portail Terra Numerica →
        </a>
      </p>
    </div>
  </div>
</template>
