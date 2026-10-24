<script setup lang="ts">
import { asset } from "@/lib/asset";

const stats = [
  { value: "97 437", label: "Citoyens touchés", sub: "depuis 2022" },
  { value: "6 857",  label: "Enseignants formés", sub: "toutes académies" },
  { value: "300+",   label: "Événements / an", sub: "Région Sud & au-delà" },
  { value: "26",     label: "Espaces partenaires", sub: "4 départements" },
  { value: "150+",   label: "Ateliers en ligne", sub: "portail.terra-numerica.org" },
];

const growthData = [
  { year: "2022", visitors: 8000 },
  { year: "2023", visitors: 18000 },
  { year: "2024", visitors: 30000 },
  { year: "2025", visitors: 36000 },
];
const growthMax = 40000;

const photos = [
  {
    src: asset("/thumb_c2kGOPqLhPM.jpg"),
    alt: "Atelier robotique avec des élèves à Terra Numerica Sophia",
    caption: "Ateliers pour les scolaires",
  },
  {
    src: asset("/thumb_4zo9_7Gm8v4.jpg"),
    alt: "Conférence géométrie interactive avec des enfants",
    caption: "Conférences interactives",
  },
  {
    src: asset("/thumb_036we6iat08.jpg"),
    alt: "Village des sciences Terra Numerica",
    caption: "Village des sciences",
  },
];

const audiences = [
  {
    title: "Scolaires & Enseignants",
    desc: "Ateliers de la maternelle au lycée, gratuits pour les établissements publics.",
    href: "/scolaires/offre",
    cta: "Réserver une visite",
    accent: true,
  },
  {
    title: "Grand Public",
    desc: "Chaque 1er samedi du mois (14h–18h) à Terra Numerica Sophia. Gratuit.",
    href: "/visiter/agenda",
    cta: "Voir l'agenda",
  },
  {
    title: "Entreprises",
    desc: "Team building, formations sur mesure et mécénat scientifique.",
    href: "/entreprises",
    cta: "Nos offres",
  },
];

/* Réseau SVG décoratif (hero) */
const nodes = [
  [15, 20], [35, 8], [55, 18], [75, 12], [90, 25],
  [8, 45],  [28, 38], [48, 50], [68, 42], [85, 55],
  [18, 68], [40, 72], [62, 65], [80, 78], [95, 60],
];
const edges = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,7],[3,8],[4,9],
  [5,6],[6,7],[7,8],[8,9],[5,10],[6,11],[7,12],[8,13],[9,14],
  [10,11],[11,12],[12,13],[13,14],[2,6],[6,11],
];

const formatVisitors = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)} k` : String(v));
const barHeight = (v: number) => `${((v / growthMax) * 148).toFixed(2)}px`;
</script>

<template>
  <!-- ══════════ HERO ══════════ -->
  <section class="relative overflow-hidden min-h-[480px] flex items-center py-20 px-4">
    <svg
      class="absolute inset-0 w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      <line
        v-for="([a, b], i) in edges"
        :key="i"
        :x1="nodes[a][0]" :y1="nodes[a][1]"
        :x2="nodes[b][0]" :y2="nodes[b][1]"
        stroke="#24A1EB"
        stroke-width="0.15"
        stroke-opacity="0.25"
      />
      <circle
        v-for="([x, y], i) in nodes"
        :key="i"
        :cx="x" :cy="y" r="0.6"
        fill="#24A1EB"
        fill-opacity="0.5"
        class="pulse-dot"
        :style="{ animationDelay: `${i * 0.18}s` }"
      />
    </svg>
    <!-- gradient overlay pour lisibilité -->
    <div
      class="absolute inset-0"
      style="background: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(26,24,45,0.3) 0%, rgba(26,24,45,0.85) 100%)"
    />
    <div class="relative max-w-4xl mx-auto text-center z-10">
      <p class="text-tn-blue tracking-[0.2em] text-sm font-semibold uppercase mb-4">
        CNRS · Inria · Université Côte d'Azur
      </p>
      <h1
        class="font-light text-white leading-tight mb-6"
        style="font-size: clamp(2rem, 5vw, 3.2rem)"
      >
        Les sciences du numérique<br />
        <em class="not-italic text-tn-blue">à portée de tous</em>
      </h1>
      <p class="text-white/75 max-w-2xl mx-auto mb-4" style="font-size: 1.1rem; line-height: 1.7">
        L'IA, la cryptographie, les algorithmes et les réseaux façonnent notre quotidien —
        pourtant ils restent opaques pour la plupart des citoyens.
        Terra Numerica rend ces sciences <strong class="text-white font-semibold">accessibles, ludiques et gratuites</strong> pour tous.
      </p>
      <p class="text-white/60 mb-8 text-base">
        Retrouvez-nous à
        <RouterLink to="/visiter/sophia" class="text-tn-blue hover:underline">
          Terra Numerica Sophia</RouterLink>, 18 rue Frédéric Mistral, 06560 Valbonne.
      </p>
      <div class="flex flex-wrap gap-4 justify-center">
        <RouterLink
          to="/scolaires/reserver"
          class="px-7 py-3 rounded font-semibold bg-tn-blue text-white hover:bg-[#1a8fd1] transition-colors"
        >
          Réserver une visite
        </RouterLink>
        <RouterLink
          to="/decouvrir/projet"
          class="px-7 py-3 rounded font-semibold border border-white/30 text-white hover:border-tn-blue hover:text-tn-blue transition-colors"
        >
          Découvrir le projet
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- ══════════ STATS ══════════ -->
  <section class="border-y border-white/10 py-10 px-4 bg-white/3">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
        <div v-for="s in stats" :key="s.label" class="flex flex-col gap-1">
          <span
            class="font-bold text-tn-blue tabular-nums"
            style="font-size: clamp(1.6rem, 3vw, 2.4rem); line-height: 1"
          >
            {{ s.value }}
          </span>
          <span class="text-white font-medium text-sm">{{ s.label }}</span>
          <span class="text-white/45 text-xs">{{ s.sub }}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ PROBLÈME / SOLUTION ══════════ -->
  <section class="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
    <div>
      <p class="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-3">Notre mission</p>
      <h2 class="font-light text-white mb-5" style="font-size: clamp(1.6rem, 3vw, 2.2rem); line-height: 1.25">
        Pourquoi Terra Numerica&nbsp;?
      </h2>
      <p class="text-white/80 mb-4 leading-relaxed" style="font-size: 1rem">
        Le numérique est partout mais compris par trop peu. Les sciences qui le sous-tendent —
        algorithmes, intelligence artificielle, cryptographie, réseaux — sont enseignées
        de façon insuffisante et restent inaccessibles au grand public.
      </p>
      <p class="text-white/80 mb-4 leading-relaxed" style="font-size: 1rem">
        Terra Numerica est un consortium fondé par le CNRS, Inria et l'Université
        Côte d'Azur pour changer cela. Ses chercheurs conçoivent des ateliers
        rigoureusement validés, ludiques et participatifs, adaptés à tous les publics
        — de la maternelle au grand public adulte.
      </p>
      <p class="text-white/80 leading-relaxed" style="font-size: 1rem">
        Résultat : <strong class="text-white">plus de 150 000 personnes</strong> sensibilisées
        ou formées depuis le lancement, dans 250 lieux d'actions en Région Sud et au-delà.
      </p>
    </div>
    <div class="relative rounded-xl overflow-hidden shadow-2xl aspect-video">
      <img
        :src="asset('/thumb_evb13BXG-G0.jpg')"
        alt="97 437 citoyens et 6 857 enseignants touchés par Terra Numerica"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-tn-dark/60 to-transparent" />
    </div>
  </section>

  <!-- ══════════ CROISSANCE — bar chart ══════════ -->
  <section class="border-y border-white/10 py-14 px-4 bg-white/3">
    <div class="max-w-4xl mx-auto">
      <p class="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-2 text-center">Impact</p>
      <h2 class="font-light text-white text-center mb-10" style="font-size: clamp(1.4rem, 2.5vw, 2rem)">
        Une croissance continue depuis l'inauguration
      </h2>
      <div class="flex items-end justify-center gap-6 h-48">
        <div
          v-for="(d, i) in growthData"
          :key="d.year"
          class="flex flex-col items-center gap-2"
          style="width: 80px"
        >
          <span class="text-tn-blue text-sm font-semibold">{{ formatVisitors(d.visitors) }}</span>
          <div
            class="w-full rounded-t bg-tn-blue animate-grow-bar"
            :style="{
              height: barHeight(d.visitors),
              opacity: 0.5 + i * 0.15,
              animationDelay: `${i * 0.12}s`,
            }"
          />
          <span class="text-white/60 text-xs">{{ d.year }}</span>
        </div>
      </div>
      <p class="text-center text-white/40 text-xs mt-4">Visiteurs annuels (estimation)</p>
    </div>
  </section>

  <!-- ══════════ PHOTOS ══════════ -->
  <section class="max-w-5xl mx-auto px-4 py-16">
    <p class="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-2">Sur le terrain</p>
    <h2 class="font-light text-white mb-8" style="font-size: clamp(1.4rem, 2.5vw, 2rem)">
      Des expériences pour tous les publics
    </h2>
    <div class="grid sm:grid-cols-3 gap-4">
      <div v-for="p in photos" :key="p.src" class="group relative overflow-hidden rounded-xl aspect-video">
        <img
          :src="p.src"
          :alt="p.alt"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-tn-dark/80 via-transparent to-transparent" />
        <p class="absolute bottom-3 left-3 text-white text-sm font-medium">{{ p.caption }}</p>
      </div>
    </div>
    <div class="mt-4 grid sm:grid-cols-2 gap-4">
      <div class="group relative overflow-hidden rounded-xl" style="aspect-ratio: 16/7">
        <img
          :src="asset('/thumb_eu8G7O6SGJA.jpg')"
          alt="Présentation Terra Numerica avec partenaires CNRS Inria UCA"
          class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-tn-dark/70 via-transparent to-transparent" />
        <p class="absolute bottom-3 left-3 text-white text-sm font-medium">Réseau de partenaires</p>
      </div>
      <div class="group relative overflow-hidden rounded-xl" style="aspect-ratio: 16/7">
        <img
          :src="asset('/thumb_c2kGOPqLhPM.jpg')"
          alt="Atelier pratique avec des enfants et des chercheurs"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-tn-dark/70 via-transparent to-transparent" />
        <p class="absolute bottom-3 left-3 text-white text-sm font-medium">Ateliers pratiques</p>
      </div>
    </div>
  </section>

  <!-- ══════════ AUDIENCES ══════════ -->
  <section class="border-t border-white/10 py-16 px-4">
    <div class="max-w-5xl mx-auto">
      <p class="text-tn-blue text-xs tracking-widest uppercase font-semibold mb-2 text-center">Accès rapide</p>
      <h2 class="font-light text-white text-center mb-10" style="font-size: clamp(1.4rem, 2.5vw, 2rem)">
        Une offre pour chaque public
      </h2>
      <div class="grid sm:grid-cols-3 gap-6">
        <div
          v-for="a in audiences"
          :key="a.href"
          class="rounded-xl p-7 flex flex-col gap-4 border transition-colors"
          :class="a.accent ? 'border-tn-blue bg-tn-blue/8' : 'border-white/15 hover:border-tn-blue'"
        >
          <h3 class="font-semibold text-white text-lg leading-tight">{{ a.title }}</h3>
          <p class="text-white/65 text-sm leading-relaxed flex-1">{{ a.desc }}</p>
          <RouterLink
            :to="a.href"
            class="inline-block text-sm font-semibold text-center py-2.5 px-5 rounded transition-colors"
            :class="
              a.accent
                ? 'bg-tn-blue text-white hover:bg-[#1a8fd1]'
                : 'text-tn-blue hover:text-white hover:bg-tn-blue'
            "
          >
            {{ a.cta }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <!-- ══════════ ADRESSE / CONTACT ══════════ -->
  <section class="border-t border-white/10 py-10 px-4 text-center">
    <div class="max-w-xl mx-auto">
      <p class="text-white/50 text-sm mb-1">
        <RouterLink to="/visiter/sophia" class="text-tn-blue hover:underline">
          Terra Numerica Sophia
        </RouterLink>
        — 18 rue Frédéric Mistral, 06560 Valbonne
      </p>
      <p class="text-white/50 text-sm">
        <a href="mailto:contact@terra-numerica.org" class="text-tn-blue hover:underline">
          contact@terra-numerica.org
        </a>
      </p>
    </div>
  </section>
</template>
