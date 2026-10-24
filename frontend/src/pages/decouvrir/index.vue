<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";

const cards = [
  {
    href: "/decouvrir/projet",
    title: "Le projet",
    description:
      "Objectifs, missions et présentation du consortium Terra Numerica.",
  },
  {
    href: "/decouvrir/chiffres-et-carte",
    title: "Chiffres & carte",
    description:
      "Impact, couverture territoriale et espaces partenaires en chiffres.",
  },
  {
    href: "/decouvrir/collectif",
    title: "Le collectif",
    description:
      "Une centaine de membres actifs aux expertises variées.",
  },
  {
    href: "/decouvrir/territoires",
    title: "Développement territorial",
    description:
      "Les territoires couverts par les Espaces de Culture Numérique.",
  },
  {
    href: "/decouvrir/partenaires-financeurs",
    title: "Partenaires & Financeurs",
    description:
      "Les institutions et partenaires qui soutiennent Terra Numerica.",
  },
  {
    href: "/decouvrir/nous-rejoindre",
    title: "Nous rejoindre",
    description:
      "Rejoignez le collectif et contribuez aux projets de Terra Numerica.",
  },
];
</script>

<template>
  <div>
    <PageHeader
      title="Découvrir Terra Numerica"
      description="Découvrez le projet, le collectif, les territoires et les partenaires de Terra Numerica."
    />
    <div class="max-w-4xl mx-auto px-4 py-12">
      <div class="grid sm:grid-cols-2 gap-6">
        <RouterLink v-for="card in cards"
            :key="card.href"
            :to="card.href"
            class="block rounded-lg border border-white/20 p-6 hover:border-tn-blue transition-colors"
          >
            <h2 class="text-lg font-bold text-white mb-2">{{ card.title }}</h2>
            <p class="text-sm text-white/70">{{ card.description }}</p>
          </RouterLink>
      </div>
    </div>
  </div>
</template>
