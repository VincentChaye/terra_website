<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import { getNewsletters } from "@/lib/content";

const letters = getNewsletters(); // tri par date desc, synchrone → page statique
</script>

<template>
  <div>
    <PageHeader
      title="La lettre Terra Numerica"
      :breadcrumb="[{ label: 'Actualités', href: '/actualites' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Une lettre d'information mensuelle a vu le jour en décembre 2020. Elle vous permet de
        suivre l'actualité de Terra Numerica. Nous vous proposons de les retrouver sur cette
        page au fur et à mesure de leur parution. S'inscrire à la liste de diffusion.
      </p>

      <section v-for="letter in letters" :key="letter.id">
          <h2 class="text-xl font-bold text-white mt-8 mb-3">{{ letter.title }}</h2>
          <p class="text-white/85 leading-relaxed">{{ letter.body }}</p>
        </section>
    </div>
  </div>
</template>
