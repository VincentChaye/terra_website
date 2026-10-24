<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Contact et mentions légales"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h2 class="text-xl font-bold text-white mt-8 mb-3">Contact</h2>
      <p class="text-white/85 leading-relaxed">
        Une question ? Une demande ?
        <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">
          contact@terra-numerica.org</a>.
      </p>

      <h2 class="text-xl font-bold text-white mt-8 mb-3">Adresse</h2>
      <address class="text-white/85 not-italic leading-relaxed">
        Terra Numerica<br />
        18 rue Frédéric Mistral<br />
        06560 Valbonne — Sophia Antipolis
      </address>

      <h2 class="text-xl font-bold text-white mt-8 mb-3">Mentions légales</h2>
      <p class="text-white/85 leading-relaxed">
        Conformité RGPD et Utilisation des cookies.
      </p>
      <ul class="space-y-1 text-white/85">
        <li>
          <RouterLink to="/politique-confidentialite" class="text-tn-blue hover:underline">
            Politique de confidentialité
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/mentions-legales" class="text-tn-blue hover:underline">
            Mentions légales
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
