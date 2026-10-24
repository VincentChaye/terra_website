<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";

const cards = [
  {
    href: "/visiter/sophia",
    title: "Sophia Antipolis",
    desc: "Notre lieu-totem permanent de plus de 500 m² à Valbonne Sophia Antipolis. Adresse, horaires et accès.",
    cta: "Découvrir le lieu",
  },
  {
    href: "/visiter/agenda",
    title: "Agenda & Événements",
    desc: "Événements et médiations grand public tout au long de l'année : ateliers, conférences, fêtes de la science.",
    cta: "Voir l'agenda",
  },
  {
    href: "/visiter/espaces-partenaires",
    title: "Espaces partenaires",
    desc: "Un réseau de 26 Espaces Partenaires Terra Numerica répartis sur 4 départements en Région Sud.",
    cta: "Explorer le réseau",
  },
];
</script>

<template>
  <div>
    <PageHeader
      title="Visiter Terra Numerica"
      description="Venez découvrir nos espaces, assistez à nos événements grand public ou planifiez votre visite."
    />

    <section class="max-w-4xl mx-auto px-4 py-12">
      <div class="grid sm:grid-cols-3 gap-6">
        <div v-for="c in cards" :key="c.href" class="rounded-lg border border-white/20 p-6 flex flex-col gap-3">
            <h2 class="font-bold text-white text-lg">{{ c.title }}</h2>
            <p class="text-sm text-white/70 flex-1">{{ c.desc }}</p>
            <RouterLink :to="c.href" class="text-sm font-semibold text-tn-blue hover:underline">
              {{ c.cta }} →
            </RouterLink>
          </div>
      </div>
    </section>
  </div>
</template>
