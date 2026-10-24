<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import AgendaView from "@/components/AgendaView.vue";

// Page statique : l'agenda est chargé côté client (cf. AgendaView → /api/agenda). Aucun secret ni fetch serveur ici.
</script>

<template>
  <div>
    <PageHeader
      title="Agenda — Événements grand public"
      description="Terra Numerica organise des événements ouverts à tous tout au long de l'année."
      :breadcrumb="[{ label: 'Visiter', href: '/visiter' }]"
    />

    <div class="max-w-5xl mx-auto px-4 py-10">
      <!-- Intro -->
      <p class="text-white/75 text-base mb-8 max-w-2xl">
        Ateliers numériques, conférences grand public, fêtes de la science — retrouvez tous nos
        prochains rendez-vous ci-dessous. Une question ?
        <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">
          contact@terra-numerica.org
        </a>
      </p>

      <!-- Agenda connecté Wimi (chargé côté client depuis le backend) -->
      <AgendaView />

      <!-- Section info récurrents -->
      <div class="mt-16 grid sm:grid-cols-2 gap-6">
        <div class="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
          <h2 class="text-lg font-semibold text-white mb-2">Samedis numériques</h2>
          <p class="text-white/65 text-sm leading-relaxed">
            Chaque <strong class="text-white">1er samedi du mois</strong> de 14h à 18h à Terra Numerica
            Sophia (18 rue Frédéric Mistral, Valbonne). Gratuit sur inscription. Pour tous, dès 7 ans.
          </p>
        </div>
        <div class="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
          <h2 class="text-lg font-semibold text-white mb-2">Terra Numerica Connect</h2>
          <p class="text-white/65 text-sm leading-relaxed">
            Rencontres professionnels, chercheurs et citoyens. Formats interactifs et ludiques tout
            au long de l'année pour co-construire le numérique de demain.
          </p>
        </div>
        <div class="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
          <h2 class="text-lg font-semibold text-white mb-2">Fête de la science (octobre)</h2>
          <p class="text-white/65 text-sm leading-relaxed">
            Aix-en-Provence, Antibes, Grasse, Mouans-Sartoux, Nice, Sophia Antipolis, Villeneuve-Loubet…
            Terra Numerica participe chaque année à de nombreux villages des sciences en Région Sud.
          </p>
        </div>
        <div class="rounded-xl border border-white/12 bg-white/4 px-6 py-5">
          <h2 class="text-lg font-semibold text-white mb-2">Village des sciences (1er week-end d'oct.)</h2>
          <p class="text-white/65 text-sm leading-relaxed">
            Un week-end entier à Terra Numerica Sophia pour expérimenter le numérique en famille.
            Cinq créneaux d'ouverture, entrée gratuite.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
