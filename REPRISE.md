# Guide de reprise — Site Terra Numerica

Ce document s'adresse à la personne qui reprend le projet. Il part du principe que vous savez lire du
HTML/CSS et un peu de JavaScript, mais pas forcément Vue.

L'objectif du site a toujours été qu'**une page se modifie en éditant un seul fichier**. Ce guide vous montre
lequel, et comment.

**Sommaire**

1. [Se lancer en 10 minutes](#1-se-lancer-en-10-minutes)
2. [Comprendre l'organisation d'une page](#2-comprendre-lorganisation-dune-page)
3. [Recette : modifier le texte d'une page](#3-recette--modifier-le-texte-dune-page)
4. [Recette : créer une nouvelle page](#4-recette--créer-une-nouvelle-page)
5. [Recette : ajouter une entrée dans le menu](#5-recette--ajouter-une-entrée-dans-le-menu)
6. [Recette : ajouter une image](#6-recette--ajouter-une-image)
7. [Les actualités : contenu séparé du code](#7-les-actualités--contenu-séparé-du-code)
8. [Recette : ajouter un champ ou une collection aux actualités](#8-recette--ajouter-un-champ-ou-une-collection-aux-actualités)
9. [Formulaires et agenda](#9-formulaires-et-agenda)
10. [Mettre en ligne](#10-mettre-en-ligne)
11. [Aide-mémoire des styles](#11-aide-mémoire-des-styles)
12. [Pièges connus](#12-pièges-connus)
13. [Checklist avant de livrer](#13-checklist-avant-de-livrer)

---

## 1. Se lancer en 10 minutes

Le projet est **deux applications séparées** dans un seul dépôt : `frontend/` (le site, Vue 3 + Vite) et
`backend/` (l'API, Fastify — agenda + formulaires). Voir [README.md](./README.md) pour le détail de
l'architecture ; ici, juste de quoi démarrer.

```bash
cd tn-site
npm run install:all      # installe frontend/ et backend/
npm run dev:front        # http://localhost:5173
npm run dev:back         # http://localhost:3001 (dans un autre terminal)
```

Ouvrez http://localhost:5173. Modifiez un texte dans `frontend/src/pages/ressources/ateliers/index.vue`,
sauvegardez : la page se recharge toute seule.

Il vous faut `backend/.env` (copier `backend/.env.example`) et `frontend/.env.local`
(`VITE_API_BASE=http://localhost:3001`) pour que l'agenda et les formulaires fonctionnent en local.
Ils ne sont pas dans le dépôt (ils contiennent des secrets) : demandez les valeurs à l'équipe. Sans eux,
**les pages fonctionnent quand même** — seuls l'agenda et l'envoi des formulaires échoueront.

Vérifiez que tout est sain :

```bash
npm --prefix frontend run test
npm --prefix frontend exec vue-tsc -- --noEmit   # vérification des types
npm run build             # build de production des deux projets
```

---

## 2. Comprendre l'organisation d'une page

### L'URL, c'est le chemin du dossier

Le routeur (Vue Router) lit la liste des pages dans `frontend/src/routes.json` et charge, pour chaque chemin,
le fichier **`index.vue` du dossier correspondant** sous `frontend/src/pages/` :

| URL | Fichier |
|---|---|
| `/` | `frontend/src/pages/index.vue` |
| `/ressources` | `frontend/src/pages/ressources/index.vue` |
| `/ressources/ateliers` | `frontend/src/pages/ressources/ateliers/index.vue` |
| `/scolaires/reserver` | `frontend/src/pages/scolaires/reserver/index.vue` |
| `/actualites/retrospectives/2025` | `frontend/src/pages/actualites/retrospectives/[year]/index.vue` |

Contrairement à Next.js, **créer le dossier ne suffit pas** : il faut aussi déclarer la page dans
`src/routes.json` (voir [section 4](#4-recette--créer-une-nouvelle-page)). Ce même fichier fournit le
`<title>`, la description et l'URL canonique de chaque page, et alimente le `sitemap.xml`. (Dans les exemples
qui suivent, les chemins sont donnés relatifs à `frontend/`.)

### Ce qui entoure votre page

`src/App.vue` enveloppe toutes les pages. Il fournit le `Header` (menu), le `Footer`, le bandeau cookies et
les balises `<head>` de la page. Vous n'avez donc **jamais** à les inclure dans une page.

```vue
<!-- frontend/src/App.vue -->
<Header />
<main class="flex-1">
  <RouterView />   <!-- ← votre page arrive ici -->
</main>
<Footer />
<CookieBanner />
```

### La structure type d'une page

Presque toutes les pages suivent exactement ce moule (exemple réel :
`src/pages/ressources/ateliers/index.vue`) :

```vue
<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <!-- En-tête : fil d'ariane + titre H1 -->
    <PageHeader
      title="Ateliers ludiques"
      :breadcrumb="[{ label: 'Ressources', href: '/ressources' }]"
    />

    <!-- Le corps de la page -->
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Les ateliers Terra Numerica sont à découvrir sur le portail des ressources…
      </p>
    </div>
  </div>
</template>
```

Les métadonnées SEO de la page (`title`, `description`, `canonical`) ne sont **pas** dans le fichier de la
page mais dans l'entrée correspondante de `src/routes.json` :

```json
{
  "path": "/ressources/ateliers",
  "title": "Ateliers ludiques — Terra Numerica",
  "description": "Les ateliers Terra Numerica sont déployés au sein des Espaces de Culture Numérique…",
  "canonical": "/ressources/ateliers"
}
```

Trois choses à retenir :

- **Le texte est écrit directement dans le fichier.** Pas de base de données, pas d'admin. C'est ce qui rend
  la modification simple.
- **`<h1>` est produit par `PageHeader`**, jamais écrit à la main.
- L'attribut `class` contient des classes **Tailwind** (utilitaires CSS). Voir
  [l'aide-mémoire](#11-aide-mémoire-des-styles) plus bas.

`PageHeader` accepte exactement trois props (`components/layout/PageHeader.vue`) :

| Prop | Type | Obligatoire | Effet |
|---|---|---|---|
| `title` | texte | oui | Le `<h1>` |
| `description` | texte | non | Un paragraphe d'accroche sous le titre |
| `breadcrumb` | `{ label, href }[]` | non | Fil d'ariane ; « Accueil » est ajouté automatiquement en tête |

---

## 3. Recette : modifier le texte d'une page

**Exemple concret : corriger le texte de la page « Ateliers ludiques ».**

1. Trouver le fichier. L'URL est `/ressources/ateliers` → le fichier est
   `src/pages/ressources/ateliers/index.vue`.
   *(Astuce : si vous ne trouvez pas, cherchez une phrase de la page avec `grep -r "un bout de phrase" src/pages/`.)*

2. Ouvrir le fichier et modifier le texte entre les balises :

```diff
  <p class="text-white/85 leading-relaxed">
-   Les ateliers Terra Numerica sont à découvrir sur le portail des ressources.
+   Les ateliers Terra Numerica sont à découvrir sur notre portail dédié aux ressources pédagogiques.
  </p>
```

3. Mettre à jour la `description` dans `src/routes.json` si le sens de la page a changé (c'est le texte affiché
   par Google).

4. Vérifier dans le navigateur (`npm run dev:front`), puis committer.

### Apostrophes et caractères spéciaux

Dans un template Vue, l'apostrophe droite `'` s'écrit normalement dans le texte. Seules les doubles accolades
`{{ }}` sont réservées (elles affichent une valeur JavaScript) : pour afficher le caractère littéral, utilisez
`{{ "{{" }}`.

### Ajouter un paragraphe, un titre, une liste

```vue
<div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
  <h2 class="text-white">Nos formats d'atelier</h2>

  <p class="text-white/85 leading-relaxed">Un paragraphe.</p>

  <ul class="list-disc pl-6 space-y-2 text-white/85">
    <li>Atelier en autonomie</li>
    <li>Atelier animé par un médiateur</li>
  </ul>
</div>
```

### Ajouter un lien

```vue
<!-- Lien interne : toujours <RouterLink> (navigation instantanée, sans rechargement) -->
<RouterLink to="/scolaires/reserver" class="text-tn-blue hover:underline">Réserver une visite</RouterLink>

<!-- Lien externe : <a> classique, avec rel obligatoire pour la sécurité -->
<a
  href="https://portail.terra-numerica.org"
  target="_blank"
  rel="noopener noreferrer"
  class="text-tn-blue hover:underline"
>
  Découvrir tous les ateliers →
</a>
```

> Un espace avant une ponctuation après un lien : Vue convertit un retour à la ligne en espace. Pour coller un
> point ou une virgule à un lien, mettez-le **sur la même ligne** que `</a>` / `</RouterLink>`.

### Ajouter un bouton d'appel à l'action

Le motif utilisé partout sur le site :

```vue
<RouterLink
  to="/scolaires/reserver"
  class="inline-block bg-tn-blue text-white px-6 py-3 rounded hover:opacity-90 transition-opacity"
>
  Réserver une visite
</RouterLink>
```

---

## 4. Recette : créer une nouvelle page

**Exemple concret : créer la page « Nos partenaires scolaires » à l'adresse `/scolaires/partenaires`.**

### Étape 1 — Créer le fichier

Créer `src/pages/scolaires/partenaires/index.vue` :

```vue
<script setup lang="ts">
import PageHeader from "@/components/layout/PageHeader.vue";
</script>

<template>
  <div>
    <PageHeader
      title="Nos partenaires scolaires"
      description="Terra Numerica travaille main dans la main avec les établissements du territoire."
      :breadcrumb="[{ label: 'Scolaires', href: '/scolaires' }]"
    />
    <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <p class="text-white/85 leading-relaxed">
        Contenu de la page…
      </p>
    </div>
  </div>
</template>
```

### Étape 2 — Déclarer la page dans `routes.json` ⚠️

**Sans cette entrée, la page n'existe pas** (et l'application plante au démarrage avec
« page introuvable pour … » si le fichier manque). Ajouter un objet dans `frontend/src/routes.json` :

```diff
  {
    "path": "/scolaires/ateliers", …
  },
+ {
+   "path": "/scolaires/partenaires",
+   "title": "Nos partenaires scolaires — Terra Numerica",
+   "description": "Les établissements et académies partenaires de Terra Numerica.",
+   "canonical": "/scolaires/partenaires"
+ },
```

Cette seule entrée alimente à la fois le routeur, le `<title>`/la description de la page et le
`sitemap.xml` (généré au build). La page est ensuite accessible sur http://localhost:5173/scolaires/partenaires.

### Étape 3 — Rendre la page atteignable

Une page qui n'est liée nulle part est invisible. Selon son importance, ajoutez un lien :

- depuis la page de section (`frontend/src/pages/scolaires/index.vue`) — **le plus courant** ;
- dans le pied de page (`frontend/src/components/layout/Footer.vue`, tableau `sections`) ;
- dans le menu principal (voir [section 5](#5-recette--ajouter-une-entrée-dans-le-menu)) — réservé aux
  6 grandes sections.

Pensez aussi à `frontend/src/pages/plan-du-site/index.vue`.

### Récapitulatif : les 4 endroits à toucher

| # | Fichier | Obligatoire ? |
|---|---|---|
| 1 | `frontend/src/pages/<chemin>/index.vue` | oui |
| 2 | `frontend/src/routes.json` (routeur + SEO + sitemap) | oui |
| 3 | Un lien depuis la page de section, et/ou `Footer.vue` | oui (sinon page orpheline) |
| 4 | `frontend/src/pages/plan-du-site/index.vue` | recommandé |

---

## 5. Recette : ajouter une entrée dans le menu

### Menu principal (en-tête)

Il est défini par un simple tableau, dans le `<script setup>` de `frontend/src/components/layout/Header.vue` :

```ts
const navItems = [
  { label: "Découvrir", href: "/decouvrir" },
  { label: "Visiter", href: "/visiter" },
  { label: "Scolaires", href: "/scolaires" },
  { label: "Entreprises", href: "/entreprises" },
  { label: "Ressources", href: "/ressources" },
  { label: "Actualités", href: "/actualites" },
];
```

Ajouter un objet `{ label, href }` suffit : le rendu bureau **et** le menu mobile utilisent le même tableau.

> **Ne le faites qu'à bon escient.** Toute la refonte visait à passer d'un menu à 36 entrées (illisible) à
> 6 sections. Une nouvelle page a presque toujours sa place *dans* une section existante, pas à côté.
>
> À noter : le petit chevron affiché à côté de chaque entrée est **décoratif** — il n'y a pas de sous-menu
> déroulant. Aucun composant de menu déroulant n'existe pour l'instant.

### Pied de page

Même principe, dans `frontend/src/components/layout/Footer.vue`, tableau `sections` :

```ts
const sections = [
  {
    title: "Scolaires & Entreprises",
    links: [
      { label: "Offre pédagogique", href: "/scolaires/offre" },
      { label: "Réserver", href: "/scolaires/reserver" },
      // ← ajouter ici
    ],
  },
];
```

Header et Footer ont chacun leur propre liste : modifier l'un ne modifie pas l'autre.

---

## 6. Recette : ajouter une image

### Étape 1 — Déposer le fichier

Placer l'image dans `frontend/public/`, par exemple `frontend/public/atelier-cryptographie.jpg`.

Conventions de nommage en place : `logo-tn.png`, `globe-tn.png` (marque), `social-fb.png` (réseaux),
`thumb_<idYouTube>.jpg` (vignettes vidéo). Compressez avant de committer (les images du dépôt font
quelques dizaines de Ko).

### Étape 2 — L'afficher — **toujours avec `asset()`**

```vue
<script setup lang="ts">
import { asset } from "@/lib/asset";
</script>

<template>
  <img
    :src="asset('/atelier-cryptographie.jpg')"
    alt="Des élèves manipulent une machine à chiffrer lors d'un atelier"
    width="800"
    height="450"
    class="rounded"
  />
</template>
```

**Pourquoi `asset()` ?** Le site est auto-hébergé à la racine du domaine aujourd'hui (`VITE_BASE_PATH`
vide), mais ça a déjà changé une fois (export GitHub Pages sous `/terra_website/` par le passé) et ça peut
recommencer. `asset()` garantit que les images continuent de fonctionner quel que soit le sous-chemin de
déploiement, sans toucher aux pages. C'était le bug le plus fréquent du projet quand ce sous-chemin existait.

**Le `alt` n'est pas optionnel** : le RGAA est une obligation légale ici. Décrivez ce que l'image apporte
(`alt=""` uniquement si l'image est purement décorative).

---

## 7. Les actualités : contenu séparé du code

Quatre rubriques d'actualités ne sont **pas** écrites dans les pages, pour rester faciles à mettre à jour
sans toucher au code des pages : **revue de presse, newsletters, vidéos, rétrospectives**.

### État actuel : pas de CMS branché — édition par JSON

> ⚠️ **Important pour la reprise.** Une application de bureau séparée (`../tn-cms`, Electron) permettait
> auparavant d'éditer ces rubriques sans coder, via des routes `/api/admin/*` (auth Wimi, verrous, publication
> par commit GitHub). **Ce code a été retiré** du frontend et du backend lors du passage à l'architecture
> auto-hébergée (commit « architecture back-front ») — il n'était pas prioritaire face à la mise en prod.
> `../tn-cms` existe toujours comme dépôt séparé mais **n'est plus connecté à ce backend**. Portez-le vers
> le backend Fastify (`backend/src/routes/`) si l'équipe a de nouveau besoin d'éditer sans coder ; l'historique
> git (`git log --oneline -- 'app/api/admin/*'` avant le commit de split ; ces routes étaient du Next.js) et `docs/cms/` (specs/plans
> du chantier CMS) donnent le point de départ.

En l'état, la seule façon de publier une actualité est de **modifier le JSON et déployer** (voie
développeur ci-dessous) — il n'y a plus de « voie normale » sans coder.

### Modifier une actualité

Éditer le fichier JSON correspondant dans `frontend/src/content/actualites/` et committer. Exemple, ajouter un
article de presse dans `frontend/src/content/actualites/presse.json` :

```json
{
  "id": "nice-matin-2026-05",
  "title": "Terra Numerica ouvre un nouvel espace à Grasse",
  "source": "Nice-Matin",
  "date": "2026-05",
  "url": "https://www.nicematin.com/..."
}
```

Contraintes :

- le fichier doit rester **un tableau JSON valide** ;
- il doit respecter le schéma Zod de `frontend/src/content/registry.ts` — attention au format des dates, qui
  est **`YYYY-MM`** (mois, sans jour) pour presse, newsletters et vidéos. **Un JSON invalide fait échouer
  le build** — c'est volontaire (`frontend/src/lib/content.ts` utilise `parse()`, pas `safeParse()`, pour ne
  jamais publier de contenu cassé) ;
- l'`id` doit être unique dans le fichier.

Pour vérifier avant de pousser :

```bash
npm --prefix frontend test   # valide chaque JSON contre son schéma
npm run build
```

---

## 8. Recette : ajouter un champ ou une collection aux actualités

Tout part de `frontend/src/content/registry.ts`. Il contient encore des commentaires qui parlent du CMS Electron
et d'un script `sync:registry` : **ce script n'existe plus** (voir section 7) — ignorez cette partie des
commentaires, seuls les schémas Zod et le registre sont encore utilisés.

**Exemple concret : ajouter un champ « chapô » aux articles de presse.**

### Étape 1 — Le schéma Zod

```diff
  const PresseItemSchema = z.object({
    id: z.string(),
    title: z.string(),
+   chapo: z.string().optional(),      // .optional() : les articles existants restent valides
    source: z.string(),
    date: z.string(),
    url: z.string().url(),
  });
```

> Mettre un champ **obligatoire** vous force à l'ajouter dans *toutes* les entrées existantes du JSON,
> sinon le build casse. `.optional()` est presque toujours le bon choix pour un champ ajouté après coup.

L'entrée `fields` du `registry` (widgets `text`, `textarea`, `month`, `year`, `url`, `paragraphs`, `image`)
ne pilote plus aucune interface puisque le CMS est débranché — vous pouvez la laisser telle quelle ou la
retirer, ça n'a plus d'effet fonctionnel.

### Étape 2 — Afficher le champ

Dans la page concernée (`frontend/src/pages/actualites/presse/index.vue`) :

```vue
<p v-if="item.chapo" class="text-white/70">{{ item.chapo }}</p>
```

### Étape 3 — Vérifier

```bash
npm --prefix frontend test
```

*Ajouter une **collection** entière suit la même logique : nouveau schéma + nouvelle entrée dans `registry`
+ le fichier JSON dans `frontend/src/content/` + un lecteur dans `frontend/src/lib/content.ts`.*

---

## 9. Formulaires et agenda

Ce sont les seules parties « dynamiques » du site — elles dépendent du backend Fastify (`backend/`).

### Formulaires (réservation scolaires, contact entreprises)

- Composants : `frontend/src/components/forms/ReservationScolairesForm.vue`, `ContactEntreprisesForm.vue`
- Schéma de validation : `frontend/src/lib/forms.ts` — **source de vérité**, utilisée côté navigateur
  (via le composable `frontend/src/lib/useZodForm.ts`). `backend/src/lib/forms.ts` en est une **copie générée** (`npm run sync:forms` à la
  racine, lancée automatiquement avant `dev`/`build` du backend) : ne modifiez jamais la copie backend
  directement, un test (`frontend/tests/forms-sync.test.ts`) échoue sinon.
- Routes : `backend/src/routes/reservation-scolaires.ts`, `contact-entreprises.ts` → e-mail via Resend
  (`backend/src/lib/email.ts`).
- Anti-spam : un champ caché `website` (honeypot). S'il est rempli, le serveur répond « OK » sans envoyer
  d'e-mail.
- Toutes les routes du backend passent par un rate-limiting par IP (`backend/src/lib/rate-limit.ts`,
  15 req/min puis blacklist 1h) — un test de charge agressif depuis une même IP en local peut donc
  déclencher un 429 ; c'est voulu.

**Ajouter un champ à un formulaire** = 3 modifications cohérentes :

1. le schéma dans `frontend/src/lib/forms.ts` (jamais dans la copie backend) puis `npm run sync:forms` ;
2. la valeur initiale dans l'appel à `useZodForm(...)` et le champ (`v-bind="bind('monChamp')"`, ou `v-model` pour un `<select>`/une case à cocher) dans le composant ;
3. la ligne correspondante dans le HTML de l'e-mail, dans la route du backend — en passant la valeur par
   `escapeHtml()`.

### Agenda

`frontend/src/components/AgendaView.vue` interroge `backend/src/routes/agenda.ts`, qui interroge **Wimi**
(`backend/src/lib/wimi.ts`), l'outil où l'équipe saisit déjà ses événements. Il n'y a donc rien à saisir
dans le site : un événement créé dans l'espace Wimi apparaît sur l'agenda (cache en mémoire côté backend).

Deux pièges Wimi documentés dans le code : l'API répond **toujours** HTTP 200 (les erreurs sont dans
`body.error`), et la session est mise en cache en mémoire du process backend.

---

## 10. Mettre en ligne

> ⚠️ **Ça a changé.** Le site n'est plus déployé sur GitHub Pages / Render avec CI automatique : il est
> **auto-hébergé sur une seule machine** (nginx pour le frontend statique, systemd pour le backend Fastify),
> et le déploiement est **manuel**, déclenché depuis le serveur. Voir README.md, section « Architecture »,
> pour le schéma complet.

### Le flux normal (code)

```bash
git checkout -b ma-modification
# … modifications …
npm --prefix frontend test && npm --prefix frontend exec vue-tsc -- --noEmit
git commit -m "Ajoute la page partenaires scolaires"
git push
# → Pull Request → merge sur main
```

Il n'y a **aucune CI** qui redéploie automatiquement sur merge. Quelqu'un doit se connecter au serveur et
lancer le déploiement (section suivante) — a priori la même personne qui gère l'hébergement, ou vous si
vous en avez l'accès.

### Déployer (depuis le serveur)

1. **Backend**, si `backend/` a changé :
   ```bash
   git pull && npm --prefix backend ci && npm --prefix backend run build
   systemctl restart tn-backend
   ```
   Le build relance automatiquement `sync:forms` (script `prebuild`).
2. **Frontend**, si `frontend/` a changé :
   ```bash
   npm run rebuild     # = bash scripts/deploy-frontend.sh
   ```
   Ce script `git pull`, build dans un dossier `frontend/releases/<horodatage>/` séparé du dossier servi,
   vérifie qu'un `index.html` non vide en est sorti, puis **seulement si c'est le cas** bascule le symlink
   `frontend/current` (racine nginx) sur ce nouveau build. Si le build échoue ou est invalide, `current`
   n'est pas touché : le site en ligne reste sur l'ancienne version. Pas de reload nginx nécessaire (il suit
   le symlink). Les releases plus anciennes que les 5 dernières sont purgées automatiquement.

Après une modification de contenu (actualités, `frontend/src/content/`), relancer `npm run rebuild` suffit pour
publier.

### Tester le build de production avant de pousser

```bash
npm run build       # tests + vérification des types + build frontend (SPA statique) + backend
```

C'est là que se révèlent les images oubliées sans `asset()` et les JSON invalides.

---

## 11. Aide-mémoire des styles

Le site utilise **Tailwind CSS v4** : on écrit les styles sous forme de classes utilitaires dans
l'attribut `class`, plutôt que dans un fichier CSS séparé.

### Les couleurs de la charte

Définies dans `frontend/src/assets/main.css`, avec la mention explicite **« NE PAS MODIFIER »** — elles ont été extraites
de l'ancien site pour garantir la fidélité visuelle.

| Token | Valeur | Usage | Classes |
|---|---|---|---|
| `--color-tn-dark` | `#1A182D` | Fond du site, en-tête | `bg-tn-dark` |
| `--color-tn-blue` | `#24A1EB` | Liens, accents, boutons d'action | `text-tn-blue`, `bg-tn-blue` |
| `--color-tn-white` | `#FFFFFF` | Texte | `text-tn-white` |

Le fond étant sombre, le texte est blanc, souvent avec une transparence : `text-white/85` (corps de texte),
`text-white/70` (texte secondaire), `text-white/40` (fil d'ariane).

Police : **Poppins**, chargée dans `frontend/src/main.ts` (paquet `@fontsource/poppins`). Titres en graisse légère (`font-light`).

### Les classes que vous verrez partout

| Classe | Effet |
|---|---|
| `max-w-4xl mx-auto px-4 py-12` | Le conteneur standard du corps de page (largeur limitée, centré) |
| `space-y-6` | Espace vertical entre les enfants directs |
| `text-white/85 leading-relaxed` | Paragraphe de contenu |
| `grid md:grid-cols-2 gap-6` | Grille : 1 colonne sur mobile, 2 à partir des écrans moyens |
| `hover:underline`, `transition-opacity` | Effets au survol |

Les préfixes `sm:` `md:` `lg:` s'appliquent **à partir** d'une largeur d'écran : le style sans préfixe est
celui du mobile.

### Composants réutilisables

Il n'y a plus de bibliothèque de composants (les anciens `Button`/`Card` shadcn n'étaient utilisés nulle
part et ont été retirés lors du passage à Vue) : les pages stylent leurs liens et cartes à la main avec
Tailwind. Suivez ce que fait la page voisine.

---

## 12. Pièges connus

| Symptôme | Cause | Correctif |
|---|---|---|
| Image visible en local, 404 en ligne | `src` sans `asset()` | Voir [section 6](#6-recette--ajouter-une-image) |
| `Error: fetch failed` sur l'agenda/formulaire en local | `backend/.env` absent/incomplet, ou `npm run dev:back` non lancé | Vérifier les deux |
| Formulaire/agenda qui renvoie 429 en rafale de tests | Rate-limiting (15 req/min/IP, `backend/src/lib/rate-limit.ts`) | Attendre, ou augmenter le seuil en local si besoin |
| Formulaire qui ne part pas en production | `VITE_API_BASE` manquant au build frontend, ou backend arrêté/CORS (`FRONTEND_ORIGIN`) | Vérifier la variable, les logs `systemctl status tn-backend` |
| Build qui échoue avec une `ZodError` | JSON de `frontend/src/content/` invalide | Le message indique le champ fautif |
| Au démarrage : `[router] page introuvable pour /…` | Entrée dans `routes.json` sans fichier `index.vue` (ou inversement) | Créer le fichier au bon chemin, ou corriger le chemin |
| Page 404 « Page introuvable » sur une URL qui devrait exister | Page absente de `src/routes.json` | L'ajouter (voir section 4) |
| Espace avant un point/une virgule après un lien | Retour à la ligne entre `</a>` et la ponctuation | Mettre la ponctuation collée à la balise fermante |
| Test `forms-sync.test.ts` rouge | `backend/src/lib/forms.ts` édité directement, ou `frontend/src/lib/forms.ts` changé sans sync | `npm run sync:forms` à la racine, committer la copie |
| Nouvelle page absente de Google | oubli dans `frontend/src/routes.json` (alimente le sitemap) | L'ajouter |
| Rechargement d'une URL profonde → 404 nginx | `try_files` sans repli sur `/index.html` | Reprendre `deploy/nginx.conf.example` |
| Formulaire/agenda cassés après la migration vers Vue | Ancienne variable `NEXT_PUBLIC_API_BASE` encore dans `frontend/.env.local` | La renommer en `VITE_API_BASE` |
| Après `npm run rebuild`, le site ne change pas | Le script n'écrase jamais un build invalide (voir section 10) — vérifier sa sortie, `frontend/current` n'a peut-être pas basculé | Relire la sortie du script, corriger le build cassé |

### SPA : ce que ça change

Le site est une **application à page unique** : le navigateur télécharge `index.html` et le JavaScript, puis
Vue construit chaque page. Conséquences : le `<title>` et les balises meta sont posés par le JavaScript
(`App.vue` + `routes.json`) ; les moteurs de recherche modernes les exécutent, mais un pré-rendu (`vite-ssg`)
serait un plus pour le SEO si besoin. Les vraies erreurs 404 HTTP n'existent pas : nginx renvoie toujours
`index.html`, et c'est le routeur qui affiche la page « Page introuvable ».

---

## 13. Checklist avant de livrer

- [ ] `npm --prefix frontend test` passe
- [ ] `npm run build` (tests + types + frontend + backend) passe
- [ ] Nouvelle page : ajoutée à `frontend/src/routes.json` (avec `title`, `description`, `canonical`) et liée depuis au moins un endroit
- [ ] Images : passées par `asset()`, avec un `alt` pertinent et un poids raisonnable
- [ ] Testé sur une largeur mobile (outils développeur du navigateur)
- [ ] Aucun secret ni valeur d'environnement dans le diff
- [ ] Déployé (section 10) et rendu vérifié en ligne — rien ne se publie tout seul

---

## Où trouver le reste

| Question | Où regarder |
|---|---|
| Vue d'ensemble, stack, architecture, variables d'env | [README.md](./README.md) |
| Pourquoi le site est structuré ainsi, audit de l'ancien site | `../CONTEXTE_PROJET.md` |
| Arborescence cible, redirections 301, charte | `../TN_Architecture_Cible/` |
| CMS (débranché, à reprendre — voir section 7) | `docs/cms/`, `../tn-cms/README.md` |
| Documentation Vue 3 / Vue Router | https://vuejs.org, https://router.vuejs.org |
| Classes Tailwind | https://tailwindcss.com/docs |
