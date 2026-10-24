<script setup lang="ts">
import ConsentButton from "@/components/ConsentButton.vue";

const droits = [ { right: "Accès", desc: "Obtenir une copie de vos données." }, { right: "Rectification", desc: "Corriger des données inexactes." }, { right: "Effacement", desc: "Supprimer vos données (droit à l'oubli)." }, { right: "Opposition", desc: "Vous opposer à un traitement basé sur l'intérêt légitime." }, { right: "Limitation", desc: "Limiter temporairement un traitement." }, { right: "Portabilité", desc: "Recevoir vos données dans un format structuré." }, ];

/* ── Tableau cookies ─────────────────────────────────────────── */
const cookieCategories = [
  {
    name: "Strictement nécessaires",
    purpose: "Mémorisation du consentement cookies, sécurité de session.",
    examples: "tn_consent (localStorage)",
    duration: "12 mois",
    optional: false,
  },
  {
    name: "Mesure d'audience",
    purpose:
      "Comptage anonyme des pages vues et des sessions pour améliorer le site. Aucune donnée nominative, aucun profil publicitaire. Outil : Plausible Analytics (exemption CNIL n° 39).",
    examples: "Aucun cookie déposé (mesure sans cookie, côté serveur)",
    duration: "Données agrégées conservées 24 mois",
    optional: true,
  },
  {
    name: "Médias externes (YouTube)",
    purpose:
      "Lecture des vidéos Terra Numerica intégrées depuis YouTube/Google. Sans consentement, aucun lecteur vidéo externe n'est chargé.",
    examples: "VISITOR_INFO1_LIVE, YSC, GPS (YouTube/Google)",
    duration: "179 jours à session",
    optional: true,
  },
  {
    name: "Réseaux sociaux",
    purpose:
      "Scripts de partage Facebook, LinkedIn. Permettent le partage de pages vers ces plateformes. Sans consentement, seuls des liens hypertexte sont utilisés.",
    examples: "fr, datr, _fbp (Facebook) · li_gc, lidc (LinkedIn)",
    duration: "3 mois à 2 ans selon la plateforme",
    optional: true,
  },
];

/* ── Page ────────────────────────────────────────────────────── */
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-12 space-y-12">
    <div>
      <h1 class="mb-2">Politique de confidentialité</h1>
      <p class="text-white/50 text-sm">Mise à jour : juin 2026</p>
    </div>

    <!-- ── 1. Responsable de traitement ── -->
    <section>
      <h2 class="mb-4">1. Responsable de traitement</h2>
      <p class="text-white/75">
        Le site <strong>terra-numerica.org</strong> est édité par le consortium Terra Numerica,
        dont les membres fondateurs sont :
      </p>
      <ul class="list-disc list-inside text-white/75 mt-2 space-y-1">
        <li>CNRS (Centre National de la Recherche Scientifique)</li>
        <li>Inria (Institut National de Recherche en Sciences et Technologies du Numérique)</li>
        <li>Université Côte d'Azur</li>
      </ul>
      <p class="text-white/75 mt-3">
        Contact : <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">contact@terra-numerica.org</a>
        <br />
        Adresse : 18 rue Frédéric Mistral, 06560 Valbonne
      </p>
    </section>

    <!-- ── 2. Données collectées ── -->
    <section>
      <h2 class="mb-4">2. Données personnelles collectées</h2>

      <h3 class="mb-2">Formulaire de réservation scolaires</h3>
      <p class="text-white/75">
        Champs collectés : établissement, nom, prénom, adresse e-mail, téléphone, niveau scolaire, nombre d'élèves, dates souhaitées, message libre.
      </p>
      <ul class="list-disc list-inside text-white/70 mt-2 space-y-1 text-sm">
        <li><strong>Finalité :</strong> organisation des visites et ateliers scolaires.</li>
        <li><strong>Base légale :</strong> exécution d'un contrat (Art. 6.1.b RGPD).</li>
        <li><strong>Durée de conservation :</strong> 3 ans à compter du dernier contact.</li>
      </ul>

      <h3 class="mt-6 mb-2">Formulaire de contact entreprises</h3>
      <p class="text-white/75">
        Champs collectés : entreprise, nom, prénom, adresse e-mail, téléphone, domaine d'intérêt, nombre de participants, message.
      </p>
      <ul class="list-disc list-inside text-white/70 mt-2 space-y-1 text-sm">
        <li><strong>Finalité :</strong> réponse aux demandes de partenariat, team building et formations.</li>
        <li><strong>Base légale :</strong> intérêt légitime (Art. 6.1.f RGPD).</li>
        <li><strong>Durée de conservation :</strong> 3 ans à compter du dernier contact.</li>
      </ul>

      <h3 class="mt-6 mb-2">Navigation et mesure d'audience</h3>
      <p class="text-white/75">
        Si vous acceptez les cookies de mesure d'audience, des données agrégées de navigation
        (page visitée, pays, type d'appareil) sont collectées de manière anonyme via Plausible Analytics.
        Aucune donnée nominative n'est associée à ces statistiques.
      </p>
    </section>

    <!-- ── 3. Droits RGPD ── -->
    <section>
      <h2 class="mb-4">3. Vos droits</h2>
      <p class="text-white/75 mb-3">
        Conformément au RGPD (Règlement UE 2016/679) et à la loi Informatique et Libertés, vous disposez des droits suivants :
      </p>
      <div class="grid sm:grid-cols-2 gap-3">
        <div v-for="r in droits" :key="r.right" class="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
            <p class="text-white text-sm font-semibold">{{ r.right }}</p>
            <p class="text-white/55 text-xs mt-0.5">{{ r.desc }}</p>
          </div>
      </div>
      <p class="text-white/65 text-sm mt-4">
        Pour exercer vos droits, écrivez à
        <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">
          contact@terra-numerica.org</a>. En cas de désaccord, vous pouvez saisir la
        <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" class="text-tn-blue hover:underline">
          CNIL</a>.
      </p>
    </section>

    <!-- ── 4. Cookies ── -->
    <section id="cookies">
      <h2 class="mb-2">4. Cookies et traceurs</h2>
      <p class="text-white/75 mb-6">
        Un cookie est un petit fichier texte déposé sur votre appareil lors de votre visite. Certains sont
        indispensables au fonctionnement du site ; d'autres nécessitent votre consentement préalable.
        Vous pouvez modifier vos préférences à tout moment.
      </p>

      <!-- Tableau -->
      <div class="overflow-x-auto rounded-xl border border-white/10">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-white/5 text-white/60 text-xs uppercase tracking-wide">
              <th class="px-4 py-3 text-left font-semibold">Catégorie</th>
              <th class="px-4 py-3 text-left font-semibold">Finalité</th>
              <th class="px-4 py-3 text-left font-semibold">Exemples</th>
              <th class="px-4 py-3 text-left font-semibold">Durée</th>
              <th class="px-4 py-3 text-center font-semibold">Optionnel</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/8">
            <tr v-for="c in cookieCategories" :key="c.name" class="hover:bg-white/3 transition-colors">
                <td class="px-4 py-4 align-top">
                  <span class="text-white font-medium text-sm">{{ c.name }}</span>
                </td>
                <td class="px-4 py-4 text-white/65 text-xs leading-relaxed align-top max-w-xs">
                  {{ c.purpose }}
                </td>
                <td class="px-4 py-4 text-white/50 text-xs font-mono align-top whitespace-nowrap">
                  {{ c.examples }}
                </td>
                <td class="px-4 py-4 text-white/55 text-xs align-top whitespace-nowrap">
                  {{ c.duration }}
                </td>
                <td class="px-4 py-4 text-center align-top">
                  <template v-if="c.optional"><span class="text-tn-blue text-xs font-semibold">Oui</span></template><template v-else><span class="text-white/30 text-xs">Non</span></template>
                </td>
              </tr>
          </tbody>
        </table>
      </div>

      <!-- Bouton gérer les préférences -->
      <div class="mt-6">
        <ConsentButton />
      </div>
    </section>

    <!-- ── 5. Transferts hors UE ── -->
    <section>
      <h2 class="mb-4">5. Transferts de données hors UE</h2>
      <p class="text-white/75">
        Les données issues des formulaires sont traitées sur des serveurs hébergés au sein de l'Union
        européenne. Si vous acceptez les cookies YouTube (Google LLC), vos données peuvent être transférées
        vers les États-Unis dans le cadre du Data Privacy Framework UE–États-Unis.
      </p>
    </section>

    <!-- ── 6. Sécurité ── -->
    <section>
      <h2 class="mb-4">6. Sécurité</h2>
      <p class="text-white/75">
        Terra Numerica met en œuvre des mesures techniques et organisationnelles appropriées pour protéger
        vos données contre tout accès non autorisé, perte ou destruction : chiffrement HTTPS, accès restreint
        aux données, habilitations nominatives.
      </p>
    </section>

    <!-- ── 7. Modifications ── -->
    <section>
      <h2 class="mb-4">7. Modifications de la présente politique</h2>
      <p class="text-white/75">
        Cette politique peut être mise à jour pour tenir compte de l'évolution du site ou de la
        réglementation. La date de mise à jour en haut de page reflète la version en vigueur. En cas de
        modification substantielle affectant les cookies, votre consentement sera de nouveau sollicité.
      </p>
    </section>
  </main>
</template>
