<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import CookieBanner from "@/components/layout/CookieBanner.vue";

const SITE_NAME = "Terra Numerica";
const SITE_URL = "https://terra-numerica.org";

const route = useRoute();

/** Remplace les paramètres de route (:year) dans une chaîne de meta. */
const fill = (s: unknown) =>
  String(s ?? "").replace(/:(\w+)/g, (m, k: string) => String(route.params[k] ?? m));

const title = computed(() => {
  const t = fill(route.meta.title);
  return t.includes(SITE_NAME) ? t : `${t} — ${SITE_NAME}`;
});
const description = computed(() => fill(route.meta.description));
const canonical = computed(() => `${SITE_URL}${fill(route.meta.canonical ?? route.path)}`);

useHead({
  title,
  meta: [
    { name: "description", content: description },
    { name: "robots", content: () => (route.meta.noindex ? "noindex" : "index, follow") },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: `${SITE_URL}/logo-tn.png` },
  ],
  link: [{ rel: "canonical", href: canonical }],
});
</script>

<template>
  <Header />
  <main class="flex-1">
    <RouterView />
  </main>
  <Footer />
  <CookieBanner />
</template>
