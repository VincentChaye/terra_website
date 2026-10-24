<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
import ContactEntreprisesForm from "@/components/forms/ContactEntreprisesForm.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Contactez-nous — Entreprises"
      description="Team building, formation, mécénat — décrivez votre projet et nous revenons vers vous sous 2 jours ouvrés."
      :breadcrumb="[{ label: 'Entreprises', href: '/entreprises' }]"
    />
    <section class="max-w-3xl mx-auto px-4 py-12">
      <div class="grid lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2">
          <ContactEntreprisesForm />
        </div>
        <aside class="space-y-6 text-sm">
          <div class="rounded-lg bg-white/5 border border-white/20 p-5">
            <h2 class="font-semibold text-white mb-3">Nos offres entreprises</h2>
            <ul class="space-y-2">
              <li>
                <RouterLink to="/entreprises/team-building" class="text-tn-blue hover:underline">
                  Team building →
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/entreprises/formations" class="text-tn-blue hover:underline">
                  Formations →
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/entreprises/mecenat" class="text-tn-blue hover:underline">
                  Mécénat →
                </RouterLink>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
