<script setup lang="ts">
import { ref } from "vue";
import { ChevronDown, Menu, X } from "lucide-vue-next";
import { asset } from "@/lib/asset";

const navItems = [
  { label: "Découvrir", href: "/decouvrir" },
  { label: "Visiter", href: "/visiter" },
  { label: "Scolaires", href: "/scolaires" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Ressources", href: "/ressources" },
  { label: "Actualités", href: "/actualites" },
];

const open = ref(false);
</script>

<template>
  <header class="bg-tn-dark text-white sticky top-0 z-50 border-b-2 border-tn-blue">
    <!-- Row 1 — Logo -->
    <div class="relative flex items-center justify-center py-5 px-4">
      <RouterLink to="/" class="flex items-center gap-5" aria-label="Terra Numerica — accueil">
        <img
          :src="asset('/globe-tn.png')"
          alt=""
          width="270"
          height="270"
          class="w-[72px] h-[72px] shrink-0"
        />
        <div class="leading-[1.05] select-none">
          <span class="block font-bold tracking-[0.18em] text-white" style="font-size: 2.1rem">
            TERRA
          </span>
          <span class="block font-bold tracking-[0.18em] text-tn-blue" style="font-size: 2.1rem">
            NUMERICA
          </span>
        </div>
      </RouterLink>

      <!-- Mobile toggle — positionné en absolu pour ne pas décaler le logo -->
      <button
        class="lg:hidden absolute right-4 p-2 text-white hover:text-tn-blue transition-colors"
        :aria-label="open ? 'Fermer le menu' : 'Ouvrir le menu'"
        :aria-expanded="open"
        aria-controls="mobile-menu"
        @click="open = !open"
      >
        <X v-if="open" :size="26" />
        <Menu v-else :size="26" />
      </button>
    </div>

    <!-- Row 2 — Navigation desktop -->
    <nav class="hidden lg:block border-t border-white/15" aria-label="Navigation principale">
      <ul class="flex justify-center items-stretch">
        <li v-for="item in navItems" :key="item.href">
          <RouterLink
            :to="item.href"
            class="flex items-center gap-1.5 px-6 py-3.5 text-[0.875rem] tracking-wide font-medium text-white/90 hover:text-tn-blue transition-colors"
          >
            {{ item.label }}
            <ChevronDown :size="12" class="opacity-40 mt-px" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Mobile menu -->
    <nav
      v-if="open"
      id="mobile-menu"
      class="lg:hidden border-t border-white/15"
      aria-label="Navigation mobile"
    >
      <ul class="flex flex-col">
        <li v-for="item in navItems" :key="item.href">
          <RouterLink
            :to="item.href"
            class="flex items-center justify-between px-6 py-4 text-sm text-white hover:text-tn-blue border-b border-white/10 transition-colors"
            @click="open = false"
          >
            {{ item.label }}
            <ChevronDown :size="14" class="opacity-40" aria-hidden="true" />
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
