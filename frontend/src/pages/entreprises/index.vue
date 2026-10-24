<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";

const offres = [
  {
    href: "/entreprises/team-building",
    title: "Team Building & Visite Découverte",
    desc: "Engagez vos équipes autour d'ateliers collaboratifs sur l'IA, la cryptographie et la robotique.",
    duree: "2 h – journée",
  },
  {
    href: "/entreprises/formations",
    title: "Formations sur mesure",
    desc: "Programmes pédagogiques adaptés à votre secteur : sensibilisation au numérique, IA appliquée, cybersécurité.",
    duree: "½ journée – 2 jours",
  },
  {
    href: "/entreprises/mecenat",
    title: "Mécénat & Partenariat",
    desc: "Soutenez la diffusion de la culture scientifique et associez votre marque à l'excellence de la recherche française.",
    duree: "Engagement annuel",
  },
];
</script>

<template>
  <div>
    <PageHeader
      title="Entreprises &amp; Professionnels"
      description="Terra Numerica conçoit des expériences sur mesure pour les entreprises : de la visite découverte au mécénat, en passant par des formations animées par des chercheurs."
    />

    <section class="max-w-4xl mx-auto px-4 py-12">
      <div class="space-y-6">
        <div v-for="o in offres" :key="o.href" class="border border-white/20 rounded-lg p-6 flex flex-col sm:flex-row sm:items-start gap-4">
            <div class="flex-1">
              <h2 class="font-bold text-white text-lg mb-1">{{ o.title }}</h2>
              <p class="text-sm text-white/70 mb-2">{{ o.desc }}</p>
              <span class="text-xs text-tn-blue font-medium">{{ o.duree }}</span>
            </div>
            <RouterLink
              :to="o.href"
              class="shrink-0 px-5 py-2 rounded border border-tn-blue text-tn-blue text-sm font-semibold hover:bg-tn-blue hover:text-tn-white transition-colors"
            >
              En savoir plus
            </RouterLink>
          </div>
      </div>
    </section>
  </div>
</template>
