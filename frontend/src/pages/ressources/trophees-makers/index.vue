<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";

const themesScientifiques = [
  "Intelligence Artificielle (dont IA générative), Véhicules autonomes",
  "Quantique",
  "Numérique et environnement",
  "Art et Science",
  "Santé et médecine",
  "Crypto (dont block chain)",
  "Réalité virtuelle",
  "Robotique",
  "Citoyenneté numérique",
  "Architecture des ordinateurs",
  "Géométrie",
];
</script>

<template>
  <div>
    <PageHeader
      title="Trophées des Makers du numérique"
      :breadcrumb="[{ label: 'Ressources', href: '/ressources' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Le Trophée des Makers du numérique porté par Telecom Valley et Terra Numerica est une initiative ambitieuse
        pour nos territoires, visant à construire collectivement les ateliers de médiation scientifique de demain qui
        susciteront les envies d'apprentissage et les vocations scientifiques chez les filles et les garçons. En
        participant à ce projet, vous contribuez à façonner l'avenir de l'éducation au numérique et à
        stimuler le développement de compétences numériques essentielles pour aujourd'hui et demain !
      </p>

      <p class="text-white/85 leading-relaxed">
        Chaque année, les équipes ont pour mission de fabriquer un atelier de médiation en sciences du numérique.
        Pour cela, chaque équipe (de 3 à 5 personnes) peut profiter des compétences et des machines de SoFAB (ainsi
        que d'un budget de matières premières) et de l'expertise de Terra Numerica (sciences, pédagogie).
        Comme en 2024-2025, Orange est partenaire et sponsor de l'édition 2025-2026.
      </p>

      <p class="text-white/85 leading-relaxed">
        La constitution des équipes de 3 à 5 personnes doit se faire au plus tard le 31 octobre 2025. Pour
        s'inscrire, merci d'écrire à
        <a href="mailto:contact@terra-numeria.org" class="text-tn-blue hover:underline">
          contact@terra-numeria.org</a>.
      </p>

      <p class="text-white/85 leading-relaxed">
        La remise des trophées sera organisée en juin 2026.
      </p>

      <h2 class="text-xl font-bold text-white mt-8 mb-3">
        Thèmes scientifiques (liste non exhaustive)
      </h2>
      <ul class="space-y-1 text-white/85">
        <li v-for="theme in themesScientifiques" :key="theme" class="flex items-start gap-2">
            <span class="text-tn-blue mt-1">–</span>
            <span>{{ theme }}</span>
          </li>
      </ul>
    </div>
  </div>
</template>
