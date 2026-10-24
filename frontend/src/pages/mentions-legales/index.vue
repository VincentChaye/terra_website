<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader title="Mentions légales" />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h2 class="text-xl font-bold text-white mt-8 mb-3">Éditeur</h2>
      <p class="text-white/85 leading-relaxed">
        Terra Numerica<br />
        18 rue Frédéric Mistral<br />
        06560 Valbonne — Sophia Antipolis<br />
        Contact :
        <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">
          contact@terra-numerica.org
        </a>
      </p>

      <h2 class="text-xl font-bold text-white mt-8 mb-3">Hébergement</h2>
      <p class="text-white/85 leading-relaxed">
        Ce site est hébergé par des infrastructures conformes aux exigences de sécurité et de disponibilité en
        vigueur.
      </p>

      <h2 class="text-xl font-bold text-white mt-8 mb-3">Propriété intellectuelle</h2>
      <p class="text-white/85 leading-relaxed">
        L'ensemble des contenus présents sur ce site (textes, images, illustrations, ressources pédagogiques)
        sont la propriété de Terra Numerica ou de ses partenaires et sont protégés par les lois relatives à la
        propriété intellectuelle. Toute reproduction ou utilisation sans autorisation préalable est interdite.
      </p>
    </div>
  </div>
</template>
