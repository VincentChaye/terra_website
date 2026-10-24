# Site Terra Numerica

Site public de [Terra Numerica](https://terra-numerica.org), centre de médiation aux sciences du numérique
(écosystème CNRS / Inria / Université Côte d'Azur, Sophia Antipolis).

Refonte du WordPress historique en Vue 3. Le site est pensé pour être **repris et modifié facilement** :
chaque page est un fichier autonome, le contenu texte est écrit directement dedans, et les actualités sont
éditables sans toucher au code.

> **Vous reprenez le projet ?** Lisez [REPRISE.md](./REPRISE.md) : c'est le guide pas-à-pas
> (modifier une page, en créer une, ajouter une entrée de menu, publier une actualité…).

---

## Démarrage rapide

Deux projets séparés, chacun avec son `package.json` : `frontend/` (Vue 3 + Vite, SPA statique) et
`backend/` (API Fastify).

```bash
npm run install:all          # installe frontend/ et backend/

npm run dev:front            # http://localhost:5173 (Vite, rechargement à chaud)
npm run dev:back             # API sur http://localhost:3001
```

Les pages fonctionnent immédiatement. Pour que l'agenda et les formulaires marchent, il faut un fichier
`backend/.env` (copier `backend/.env.example`) et `frontend/.env.local` (`VITE_API_BASE`) : ces
fichiers ne sont pas versionnés, demandez les valeurs à l'équipe — la liste des clés attendues est dans
« Variables d'environnement » plus bas.

### Commandes

| Commande | Effet |
|---|---|
| `npm run dev:front` / `dev:back` | Serveurs de développement (frontend / backend) |
| `npm run build` | Build de production des deux projets (frontend : tests + types + Vite + sitemap) |
| `npm run rebuild` | `git pull` + rebuild du frontend uniquement (à lancer à la main après une publication de contenu) |
| `npm --prefix frontend test` | Tests unitaires (Vitest, `frontend/tests/`) |
| `npm --prefix frontend exec vue-tsc -- --noEmit` | Vérification des types (inclus dans `npm run build`) |
| `npm --prefix frontend run preview` | Sert le build de `frontend/out` en local (après `build`) |

---

## Historique : migration Next.js → Vue

Le frontend était en Next.js 16 / React 19 (export statique). Il a été réécrit en **Vue 3 + Vite** sans changer
les URLs, le design (Tailwind, mêmes classes), le backend ni le mode de déploiement. Repères pour qui connaît
l'ancienne version :

| Avant (Next/React) | Maintenant (Vue) |
|---|---|
| `app/<chemin>/page.tsx` + `export const metadata` | `src/pages/<chemin>/index.vue` + entrée dans `src/routes.json` |
| `app/layout.tsx` | `src/App.vue` (+ balises `<head>` via `@unhead/vue`) |
| `app/sitemap.ts` | `scripts/gen-sitemap.mjs` (lit `src/routes.json`, lancé par `npm run build`) |
| `<Link>`, `<Image>` | `<RouterLink>`, `<img>` |
| `react-hook-form` + `zodResolver` | `src/lib/useZodForm.ts` + les mêmes schémas Zod |
| `NEXT_PUBLIC_*`, `NEXT_EXPORT_DIR` | `VITE_API_BASE`, `VITE_BASE_PATH`, `VITE_OUT_DIR` |
| composants shadcn (`components/ui`) | supprimés (inutilisés) |
| HTML pré-rendu par page | SPA : `index.html` unique, nginx en repli (`try_files … /index.html`) |

Le dernier commit Next.js est sur `main` avant la fusion de la branche `migration-vue`.

---

## Stack

- **Vue 3** (`<script setup>`) + **Vue Router 4** + **Vite** + **TypeScript** — frontend, SPA servie en statique
- **Fastify** — backend API pure (agenda, formulaires)
- **Tailwind CSS v4** (design tokens dans `frontend/src/assets/main.css`)
- **zod** pour les formulaires, via le composable `useZodForm` (schémas partagés client/serveur, voir plus bas) ; **@unhead/vue** pour `<title>`/meta par page
- **Resend** pour l'envoi d'e-mails, **Wimi** (outil interne de l'association) comme source de l'agenda
- **Vitest** pour les tests

> ℹ️ Le site est une **SPA** : le HTML est rendu par le navigateur, pas pré-rendu. nginx renvoie `index.html`
> pour toute URL (voir `deploy/nginx.conf.example`). Un pré-rendu (`vite-ssg`) pourra être ajouté plus tard.

---

## Architecture : deux projets, une machine, sans CI/CD

C'est le point le plus important à comprendre avant de toucher au code. Le site est **auto-hébergé** : pas
de GitHub Pages, pas de Render, pas de workflow GitHub Actions. Tout tourne sur une même machine.

```
                nginx (frontend/out, statique)         systemd → node backend/dist/server.js
   Visiteur ──► origine A ─────────────────────┐   ┌─► origine B (Fastify, port 3001)
                                                │   │
                                    fetch(VITE_API_BASE + /api/…) — CORS
                                                └───┘
                                                     │
                                          Wimi (agenda)   Resend (mails)
```

| | `frontend/` | `backend/` |
|---|---|---|
| Nature | Vue 3 + Vite (SPA, build dans `out/`) | API Fastify pure |
| Servi par | nginx (fichiers statiques de `frontend/out`) | systemd (`deploy/tn-backend.service`) |
| Contenu | `index.html` + assets JS/CSS (routage côté navigateur) | `/api/agenda`, `/api/contact-entreprises`, `/api/reservation-scolaires` |
| Déploiement | manuel : `npm run rebuild` puis reload nginx si besoin | manuel : `git pull && npm --prefix backend run build && systemctl restart tn-backend` |

Conséquences pratiques :

- **Frontend et backend sont deux origines distinctes** (deux ports/domaines nginx) → le backend gère le
  **CORS** (`FRONTEND_ORIGIN`, `@fastify/cors`), le frontend appelle en URL absolue via `apiUrl()`
  (`frontend/src/lib/api.ts`), qui préfixe avec `VITE_API_BASE`.
- **Tout asset de `public/` doit passer par `asset()`** (`frontend/src/lib/asset.ts`), utile si le site est un
  jour servi sous un sous-chemin (`VITE_BASE_PATH`).
- Voir `deploy/nginx.conf.example` et `deploy/tn-backend.service` pour la configuration de référence.
- Les schémas de formulaires ne sont plus dupliqués à la main : `frontend/src/lib/forms.ts` est la **source de
  vérité**, `backend/src/lib/forms.ts` en est une copie **générée** par `npm run sync:forms` (racine) — ce
  script tourne automatiquement avant `npm --prefix backend run build` (script `prebuild`) et avant
  `npm --prefix backend run dev`. Éditez toujours la version `frontend/`, jamais la copie backend. Un test
  (`frontend/tests/forms-sync.test.ts`) échoue si les deux fichiers divergent.

---

## Organisation du code

```
tn-site/
├── frontend/
│   ├── index.html            # point d'entrée (lang, favicon)
│   ├── vite.config.ts        # base (VITE_BASE_PATH), dossier de sortie (VITE_OUT_DIR)
│   ├── scripts/gen-sitemap.mjs  # génère out/sitemap.xml depuis src/routes.json
│   ├── src/
│   │   ├── main.ts, App.vue  # bootstrap + layout global (Header/Footer/CookieBanner, <head>)
│   │   ├── router.ts         # construit les routes depuis routes.json
│   │   ├── routes.json       # LISTE DES PAGES : chemin, title, description, canonical (+ sitemap)
│   │   ├── assets/main.css   # design tokens (couleurs, typo) + styles de base
│   │   ├── pages/            # une page = un dossier + un index.vue (/a/b → pages/a/b/index.vue)
│   │   ├── components/
│   │   │   ├── layout/       # Header (menu), Footer, PageHeader, CookieBanner
│   │   │   ├── forms/        # formulaires (useZodForm + zod)
│   │   │   └── agenda/       # vues semaine / mois / année
│   │   ├── content/
│   │   │   ├── registry.ts        # déclaration + schémas Zod des contenus éditables
│   │   │   └── actualites/*.json  # le contenu éditable lui-même
│   │   └── lib/              # api, asset, content, consent, forms, useZodForm, date-utils
│   ├── tests/                # tests Vitest
│   └── public/               # images, logos, favicon
├── backend/
│   └── src/
│       ├── server.ts          # bootstrap Fastify + CORS
│       ├── routes/            # agenda, contact-entreprises, reservation-scolaires
│       └── lib/                 # wimi, email, forms (copie)
└── deploy/                    # tn-backend.service (systemd), nginx.conf.example
```

### Deux façons d'avoir du contenu

1. **Texte en dur dans la page** (le cas général, la grande majorité des pages) : le texte est écrit
   directement dans le `index.vue`. C'est volontaire — modifier une page = éditer un seul fichier lisible.
2. **Contenu JSON éditable** (uniquement les actualités : presse, newsletters, vidéos, rétrospectives) :
   les données vivent dans `frontend/src/content/actualites/*.json`, sont validées par Zod et embarquées au build par
   `frontend/src/lib/content.ts`.

---

## CMS

Une application Electron séparée (**`../tn-cms`**) permettait d'éditer les actualités sans coder, via des
routes `app/api/admin/*` (auth Wimi, verrous, publication par commit GitHub). Ce code a été retiré du
frontend et du backend lors du passage à l'architecture auto-hébergée — non prioritaire pour l'instant, à
reprendre dans l'historique git (`git log -- 'app/api/admin/*' lib/cms-*.ts lib/github.ts`) lors d'un futur
chantier de portage vers le backend Fastify.

---

## Variables d'environnement

Aucune valeur ne doit être committée (`.env*` gitignoré, sauf `backend/.env.example`).

| Variable | Où | Rôle |
|---|---|---|
| `VITE_API_BASE` | `frontend/.env.local` | URL absolue du backend appelée par le navigateur |
| `VITE_BASE_PATH` | `frontend/.env.local` | Sous-chemin éventuel (vide par défaut) |
| `PORT` | `backend/.env` | Port d'écoute du backend (défaut 3001) |
| `FRONTEND_ORIGIN` | `backend/.env` | Origine autorisée en CORS |
| `WIMI_APP_TOKEN` | `backend/.env` | Token applicatif Wimi |
| `WIMI_ACCOUNT_NAME` | `backend/.env` | Compte Wimi |
| `WIMI_LOGIN` / `WIMI_PASSWORD` | `backend/.env` | Compte de service Wimi (agenda public) |
| `WIMI_SPACE_ID` | `backend/.env` | Espace Wimi source des événements de l'agenda |
| `RESEND_API_KEY` | `backend/.env` | Clé API Resend |
| `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL` | `backend/.env` | Expéditeur / destinataire des formulaires |

---

## Déploiement (machine unique, sans CI/CD)

1. **Backend** : `git pull && npm --prefix backend ci && npm --prefix backend run build`, puis
   `systemctl restart tn-backend` (unité de référence : `deploy/tn-backend.service`). Le build lance
   automatiquement `sync:forms` (voir plus bas) avant de compiler.
2. **Frontend** : `npm run rebuild` à la racine — lance `scripts/deploy-frontend.sh`, qui build dans un
   dossier `frontend/releases/<horodatage>/` **distinct** du dossier servi, vérifie que le build contient
   bien un `index.html`, puis ne bascule le symlink `frontend/current` (racine nginx, voir
   `deploy/nginx.conf.example`) qu'une fois cette validation passée. But : nginx ne sert jamais un build
   à moitié écrit, et un build cassé n'écrase pas le site en ligne. Les anciennes releases sont purgées
   (5 dernières conservées).

Après une modification de contenu (actualités), relancer le rebuild frontend pour publier.

---

## Contraintes à respecter

- **RGAA (accessibilité)** : obligation légale pour un organisme parapublic. Contrastes, `alt`, structure
  de titres, navigation clavier.
- **RGPD** : aucun cookie non nécessaire sans consentement (`frontend/lib/consent.ts`, `CookieBanner`).
- **Charte visuelle** : les couleurs de `frontend/app/globals.css` reprennent fidèlement l'identité Terra
  Numerica — ne pas les changer sans validation.

---

## Documentation complémentaire

| Fichier | Contenu |
|---|---|
| [REPRISE.md](./REPRISE.md) | Guide de reprise pas-à-pas avec exemples concrets |
| `../CONTEXTE_PROJET.md` | Contexte métier, audit de l'ancien site, justification des choix |
| `../TN_Architecture/` | Analyse de l'ancien site WordPress |
| `../TN_Architecture_Cible/` | Arborescence cible, redirections 301, charte |
| `docs/cms/` | Spécifications et plans du chantier CMS |
