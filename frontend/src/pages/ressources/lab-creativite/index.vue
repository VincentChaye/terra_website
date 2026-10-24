<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";

const groupesDeTravail = [
  "Algorithmes",
  "Architecture des ordinateurs",
  "Art et Numérique",
  "Cybersécurité",
  "Emploi et Numérique",
  "Géosciences",
  "IA",
  "Jeux",
  "Jeux en Ligne",
  "Magie",
  "Neurosciences",
  "Numérique et Environnement",
  "Numérique Responsable",
  "Patrimoine informatique",
  "Pavages",
  "Géométrie",
  "Physique et Numérique",
  "Probabilité",
  "Quantique",
  "Réseaux",
  "Robotique",
  "Santé et Numérique",
  "Société et Numérique",
  "Spatial et Numérique",
  "Ville et Numérique",
];
</script>

<template>
  <div>
    <PageHeader
      title="Lab Créativité Terra Numerica"
      :breadcrumb="[{ label: 'Ressources', href: '/ressources' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        C'est le cœur de Terra Numerica. Le Lab Créativité a pour vocation d'orienter les développements
        scientifiques, pédagogiques et techniques de Terra Numerica. Ces développements sont menés dans les groupes
        de travail et concernent la création de ressources (susciter et accompagner les projets : réflexion,
        conception, réalisation, expérimentation), les actions de recherche participatives en sciences de
        l'éducation appliquées à la médiation scientifique et le développement de portail des ressources et
        partage de connaissance.
      </p>

      <h2 class="text-xl font-bold text-white mt-8 mb-3">Groupes de travail actuels</h2>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="groupe in groupesDeTravail"
            :key="groupe"
            class="inline-block bg-tn-blue/10 text-tn-blue text-xs px-2 py-0.5 rounded mr-1 mb-1"
          >
            {{ groupe }}
          </span>
      </div>
    </div>
  </div>
</template>
