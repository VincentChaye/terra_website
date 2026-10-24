<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";

const horaires = [
  { jour: "Lundi – Vendredi", heure: "Sur réservation (groupes scolaires & entreprises)" },
  { jour: "Samedi", heure: "Ouvertures grand public ponctuelles — voir l'agenda" },
  { jour: "Dimanche & jours fériés", heure: "Fermé" },
];
</script>

<template>
  <div>
    <PageHeader
      title="Terra Numerica Sophia – Région Sud"
      description="Notre lieu-totem permanent, au cœur de la technopole Sophia Antipolis, à Valbonne (06)."
      :breadcrumb="[{ label: 'Visiter', href: '/visiter' }]"
    />

    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85">
        Terra Numerica Sophia – Région Sud est un lieu unique de plus de 500 mètres carrés
        entièrement dédié à la diffusion de la culture des sciences du numérique : de la découverte
        à la formation. Mis à disposition par la ville de Valbonne Sophia Antipolis, l'inauguration
        de ce lieu-totem s'est déroulée le samedi 11 juin 2022. Des ateliers ludiques y sont déployés
        et l'offre pédagogique permet de répondre aux besoins de tous les publics.
      </p>

      <p class="text-white/85">
        Terra Numerica Sophia est ouvert chaque premier samedi du mois au grand public avec des
        thématiques variées pour tous les petits et les grands.
      </p>

      <!-- Adresse & horaires -->
      <div class="grid sm:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 class="text-xl font-bold text-white mt-8 mb-3">Adresse</h2>
          <address class="not-italic text-white/85 space-y-1 text-sm">
            <p class="font-semibold">Terra Numerica</p>
            <p>18 rue Frédéric Mistral</p>
            <p>06560 Valbonne — Sophia Antipolis</p>
          </address>
          <a
            href="https://maps.google.com/?q=18+rue+Frédéric+Mistral+06560+Valbonne"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block mt-3 text-sm text-tn-blue hover:underline"
          >
            Ouvrir dans Google Maps →
          </a>
        </div>
        <div>
          <h2 class="text-xl font-bold text-white mt-8 mb-3">Horaires</h2>
          <table class="w-full text-sm">
            <tbody>
              <tr v-for="h in horaires" :key="h.jour" class="border-b border-white/10">
                  <td class="py-2 pr-4 font-medium text-white whitespace-nowrap">{{ h.jour }}</td>
                  <td class="py-2 text-white/70">{{ h.heure }}</td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Accès -->
      <div>
        <h2 class="text-xl font-bold text-white mt-8 mb-3">Accès</h2>
        <ul class="space-y-2 text-white/85">
          <li class="flex gap-2 text-sm">
            <span class="text-tn-blue font-bold">Bus</span>
            Lignes Envibus desservant Sophia Antipolis — arrêt Frédéric Mistral
          </li>
          <li class="flex gap-2 text-sm">
            <span class="text-tn-blue font-bold">Voiture</span>
            A8 sortie Antibes / Sophia Antipolis — parking gratuit à proximité
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="flex flex-wrap gap-4 pt-4">
        <RouterLink
          to="/scolaires/reserver"
          class="px-6 py-3 rounded font-semibold bg-tn-blue text-white hover:bg-[#1a8fd1] transition-colors text-sm"
        >
          Réserver une visite scolaire
        </RouterLink>
        <RouterLink
          to="/visiter/agenda"
          class="px-6 py-3 rounded font-semibold border border-tn-dark text-white hover:bg-white/5 transition-colors text-sm"
        >
          Voir l'agenda grand public
        </RouterLink>
      </div>
    </div>
  </div>
</template>
