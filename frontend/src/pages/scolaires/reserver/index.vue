<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import ReservationScolairesForm from "@/components/forms/ReservationScolairesForm.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Réserver une visite scolaire"
      description="Remplissez ce formulaire et nous vous confirmons votre créneau sous 48 h ouvrées. Les visites sont gratuites pour les établissements publics."
      :breadcrumb="[{ label: 'Scolaires', href: '/scolaires/offre' }]"
    />

    <!-- Form -->
    <section class="max-w-3xl mx-auto px-4 py-12">
      <div class="grid lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2">
          <ReservationScolairesForm />
        </div>
        <!-- Sidebar -->
        <aside class="space-y-6 text-sm">
          <div class="rounded-lg bg-white/5 border border-white/20 p-5">
            <h2 class="font-semibold text-white mb-3">Informations pratiques</h2>
            <ul class="space-y-2 text-white/70">
              <li>📍 Sophia Antipolis (06) + espaces partenaires</li>
              <li>🕘 Demi-journée ou journée complète</li>
              <li>👥 Groupes de 15 à 35 élèves</li>
              <li>🆓 Gratuit — établissements publics</li>
            </ul>
          </div>
          <div class="rounded-lg bg-tn-dark text-tn-white p-5">
            <h2 class="font-semibold mb-2">Voir l'offre complète</h2>
            <p class="text-white/70 text-xs mb-3">
              Consultez nos modules par niveau avant de réserver.
            </p>
            <RouterLink
              to="/scolaires/offre"
              class="text-tn-blue text-sm font-medium hover:underline"
            >
              Offre pédagogique →
            </RouterLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
