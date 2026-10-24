import { createRouter, createWebHistory, type RouteParams, type RouteRecordRaw } from "vue-router";
import routeList from "./routes.json";
import NotFound from "./pages/NotFound.vue";
import { getRetrospective } from "./lib/content";

/**
 * Les routes (chemin + title/description/canonical) vivent dans routes.json,
 * partagé avec scripts/gen-sitemap.mjs. Chaque chemin /a/b est servi par
 * pages/a/b/index.vue (":year" → dossier "[year]").
 */
const pages = import.meta.glob<{ default: RouteRecordRaw["component"] }>("./pages/**/index.vue");

const routes: RouteRecordRaw[] = routeList.map(({ path, title, description, canonical }) => {
  const file =
    path === "/"
      ? "./pages/index.vue"
      : `./pages${path.replace(/:(\w+)/g, "[$1]")}/index.vue`;
  const load = pages[file];
  if (!load) throw new Error(`[router] page introuvable pour ${path} (${file})`);
  const route: RouteRecordRaw = { path, component: load, meta: { title, description, canonical } };
  // Une année sans rétrospective → vraie page 404 (voir router.beforeEach).
  if (path === "/actualites/retrospectives/:year") {
    route.meta!.exists = (params: RouteParams) => !!getRetrospective(Number(params.year));
  }
  return route;
});

routes.push({
  path: "/:pathMatch(.*)*",
  name: "not-found",
  component: NotFound,
  meta: {
    title: "Page introuvable — Terra Numerica",
    description: "Cette page n'existe pas ou a été déplacée.",
    noindex: true,
  },
});

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash) return { el: to.hash, top: 80 }; // sous le header collant
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});

// Garde global (et non beforeEnter : celui-ci ne se relance pas quand seul le
// paramètre change, ex. /2025 → /1999) : une route dont `meta.exists` refuse
// les paramètres affiche la 404, URL conservée.
router.beforeEach((to) => {
  const exists = to.meta.exists as ((params: RouteParams) => boolean) | undefined;
  if (exists && !exists(to.params)) {
    return { name: "not-found", params: { pathMatch: to.path.slice(1).split("/") }, query: to.query, hash: to.hash };
  }
});
