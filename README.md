# Site Terra Numerica

Site public de [Terra Numerica](https://terra-numerica.org), centre de médiation aux sciences du numérique
(écosystème CNRS / Inria / Université Côte d'Azur, Sophia Antipolis).

Refonte du WordPress historique en Next.js. Le site est pensé pour être **repris et modifié facilement** :
chaque page est un fichier autonome, le contenu texte est écrit directement dedans, et les actualités sont
éditables sans toucher au code.

> **Vous reprenez le projet ?** Lisez [REPRISE.md](./REPRISE.md) : c'est le guide pas-à-pas
> (modifier une page, en créer une, ajouter une entrée de menu, publier une actualité…).

---

## Démarrage rapide

Deux projets séparés, chacun avec son `package.json` : `frontend/` (Next.js, export statique) et
`backend/` (API Fastify).

```bash
npm run install:all          # installe frontend/ et backend/

npm run dev:front            # http://localhost:3000 (pages, export statique en dev)
npm run dev:back             # API sur http://localhost:3001
```

Les pages fonctionnent immédiatement. Pour que l'agenda et les formulaires marchent, il faut un fichier
`backend/.env` (copier `backend/.env.example`) et `frontend/.env.local` (`NEXT_PUBLIC_API_BASE`) : ces
fichiers ne sont pas versionnés, demandez les valeurs à l'équipe — la liste des clés attendues est dans
« Variables d'environnement » plus bas.

### Commandes

| Commande | Effet |
|---|---|
| `npm run dev:front` / `dev:back` | Serveurs de développement (frontend / backend) |
| `npm run build` | Build de production des deux projets |
| `npm run rebuild` | `git pull` + rebuild du frontend uniquement (à lancer à la main après une publication de contenu) |
| `npm --prefix frontend run lint` | ESLint |
| `npm --prefix frontend test` | Tests unitaires (Vitest, `frontend/tests/`) |

---

## Stack

- **Next.js 16** (App Router, React Server Components) + **React 19** + **TypeScript** — frontend, export statique
- **Fastify** — backend API pure (agenda, formulaires)
- **Tailwind CSS v4** (design tokens dans `frontend/app/globals.css`) + composants **shadcn/ui** sur base `@base-ui/react`
- **react-hook-form** + **zod** pour les formulaires (schémas dupliqués client/serveur, voir plus bas)
- **Resend** pour l'envoi d'e-mails, **Wimi** (outil interne de l'association) comme source de l'agenda
- **Vitest** pour les tests

> ⚠️ Next.js 16 est récent : ses conventions diffèrent de beaucoup de tutoriels en ligne.
> En cas de doute, la doc de la version installée est dans `frontend/node_modules/next/dist/docs/`.

---

## Architecture : deux projets, une machine, sans CI/CD

C'est le point le plus important à comprendre avant de toucher au code. Le site est **auto-hébergé** : pas
de GitHub Pages, pas de Render, pas de workflow GitHub Actions. Tout tourne sur une même machine.

```
                nginx (frontend/out, statique)         systemd → node backend/dist/server.js
   Visiteur ──► origine A ─────────────────────┐   ┌─► origine B (Fastify, port 3001)
                                                │   │
                                    fetch(NEXT_PUBLIC_API_BASE + /api/…) — CORS
                                                └───┘
                                                     │
                                          Wimi (agenda)   Resend (mails)
```

| | `frontend/` | `backend/` |
|---|---|---|
| Nature | Next.js, `output: "export"` | API Fastify pure |
| Servi par | nginx (fichiers statiques de `frontend/out`) | systemd (`deploy/tn-backend.service`) |
| Contenu | Toutes les pages HTML | `/api/agenda`, `/api/contact-entreprises`, `/api/reservation-scolaires` |
| Déploiement | manuel : `npm run rebuild` puis reload nginx si besoin | manuel : `git pull && npm --prefix backend run build && systemctl restart tn-backend` |

Conséquences pratiques :

- **Frontend et backend sont deux origines distinctes** (deux ports/domaines nginx) → le backend gère le
  **CORS** (`FRONTEND_ORIGIN`, `@fastify/cors`), le frontend appelle en URL absolue via `apiUrl()`
  (`frontend/lib/api.ts`), qui préfixe avec `NEXT_PUBLIC_API_BASE`.
- **Tout asset de `public/` doit passer par `asset()`** (`frontend/lib/asset.ts`), utile si le site est un
  jour servi sous un sous-chemin (`NEXT_PUBLIC_BASE_PATH`).
- Voir `deploy/nginx.conf.example` et `deploy/tn-backend.service` pour la configuration de référence.
- Les schémas de formulaires (`lib/forms.ts`) sont **dupliqués** entre `frontend/` et `backend/` (pas de
  workspace npm pour l'instant) — à synchroniser à la main si un champ change.

---

## Organisation du code

```
tn-site/
├── frontend/
│   ├── app/                  # une page = un dossier + un page.tsx (App Router)
│   │   ├── layout.tsx        # layout global : police, metadata, Header/Footer/CookieBanner
│   │   ├── globals.css       # design tokens (couleurs, typo) + styles de base
│   │   ├── page.tsx          # page d'accueil (mise en page sur mesure)
│   │   ├── sitemap.ts        # liste des URLs — à mettre à jour à chaque nouvelle page
│   │   └── decouvrir/ visiter/ scolaires/ entreprises/ ressources/ actualites/
│   ├── components/
│   │   ├── layout/           # Header (menu), Footer, PageHeader, CookieBanner
│   │   ├── forms/             # formulaires (react-hook-form + zod)
│   │   ├── agenda/            # vues semaine / mois / année
│   │   └── ui/                 # composants shadcn (button, card…)
│   ├── content/
│   │   ├── registry.ts        # déclaration + schémas Zod des contenus éditables
│   │   └── actualites/*.json  # le contenu éditable lui-même
│   ├── lib/                  # utilitaires : api, asset, content, consent, forms, utils
│   ├── tests/                 # tests Vitest
│   └── public/                 # images, logos, favicon
├── backend/
│   └── src/
│       ├── server.ts          # bootstrap Fastify + CORS
│       ├── routes/            # agenda, contact-entreprises, reservation-scolaires
│       └── lib/                 # wimi, email, forms (copie)
└── deploy/                    # tn-backend.service (systemd), nginx.conf.example
```

### Deux façons d'avoir du contenu

1. **Texte en dur dans la page** (le cas général, la grande majorité des pages) : le texte est écrit
   directement dans le `page.tsx`. C'est volontaire — modifier une page = éditer un seul fichier lisible.
2. **Contenu JSON éditable** (uniquement les actualités : presse, newsletters, vidéos, rétrospectives) :
   les données vivent dans `frontend/content/actualites/*.json`, sont validées par Zod et lues au build par
   `frontend/lib/content.ts`.

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
| `NEXT_PUBLIC_API_BASE` | `frontend/.env.local` | URL absolue du backend appelée par le navigateur |
| `NEXT_PUBLIC_BASE_PATH` | `frontend/.env.local` | Sous-chemin éventuel (vide par défaut) |
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
   `systemctl restart tn-backend` (unité de référence : `deploy/tn-backend.service`).
2. **Frontend** : `npm run rebuild` à la racine (git pull + build export dans `frontend/out`) — nginx sert
   directement ces fichiers, pas de reload nécessaire (`deploy/nginx.conf.example`).

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
| `docs/superpowers/` | Spécifications et plans du chantier CMS |
