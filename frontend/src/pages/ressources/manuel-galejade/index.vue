<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Manuel Galéjade – Volume I de la Collection Terra Numerica"
      :breadcrumb="[{ label: 'Ressources', href: '/ressources' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h2 class="text-xl font-bold text-white mt-8 mb-3">
        S'initier aux mathématiques et à l'informatique en jouant avec les graphes
      </h2>

      <p class="text-white/85 leading-relaxed">
        Ce manuel recense les ateliers Galéjade (issus des groupes de travail Terra Numerica Algorithmes et Jeux),
        les résultats mathématiques et les algorithmes qui les sous-tendent. Différentes manières de présenter les
        ateliers, notamment en variant les supports, sont évoquées pour trouver des solutions ainsi que des manières
        de les présenter. Ce manuel s'adresse donc à toutes les personnes (enseignants, médiateurs scientifiques,
        animateurs, parents, etc.) souhaitant proposer à leur public (aux enfants comme aux adultes) des activités
        ludiques permettant d'acquérir des compétences essentielles en mathématiques et informatique.
      </p>

      <p class="text-white/85 leading-relaxed">
        Télécharger la nouvelle version du manuel Galéjade (version 2025) également disponible également sur
        Épi-revel.
      </p>

      <p class="text-white/85 leading-relaxed">
        Ce document a été réalisé par des membres du collectif Terra Numerica et est signé, comme pour les autres
        volumes à venir, Rose Desvents.
      </p>

      <p class="text-white/85 leading-relaxed">
        Les mathématiques étant malheureusement trop souvent réduites au calcul dans l'imaginaire collectif,
        nous avons délibérément décidé de présenter des activités qui ne requièrent pas (ou très peu) de calculs.
        L'idée est d'insister sur le fait que les mathématiques ne sont pas le calcul et que les techniques
        calculatoires ne sont qu'un outil, bien loin d'être toujours nécessaire. Ainsi, les activités
        décrites dans ce document ont pour but de développer toutes les compétences mathématiques, telles que
        décrites au Bulletin Officiel de l'éducation nationale du 30 juillet 2020, hormis Calculer. À savoir
        Chercher, Modéliser, Représenter, Raisonner et Communiquer.
      </p>

      <p class="text-white/85 leading-relaxed">
        D'autre part, les activités de ce manuel permettent aussi de se familiariser avec les notions de graphes
        et d'algorithmes qui sont au cœur de l'informatique.
      </p>
    </div>
  </div>
</template>
