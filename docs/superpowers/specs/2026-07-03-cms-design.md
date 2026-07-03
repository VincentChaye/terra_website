# CMS Terra Numerica — Design (Phase 2)

**Date** : 2026-07-03
**Statut** : validé section par section en brainstorming, en attente de relecture finale

## 1. Objectif et contraintes

Permettre à des éditeurs **non techniciens** (sans compte GitHub) de modifier le
contenu de **tout le site sauf l'agenda Wimi**, via une **application de bureau
téléchargeable** (Windows `.exe`, macOS `.dmg`, Linux `.deb`/`.AppImage`).

Contraintes validées :

- Le contenu reste **versionné dans le repo** (source de vérité unique) ; le site
  reste 100 % statique sur GitHub Pages. Publier = commit sur `main` → rebuild
  CI (~2-3 min), délai accepté.
- **Authentification par comptes Wimi** : un compte CMS existe si et seulement si
  le login Wimi fonctionne ET que l'utilisateur a accès à un espace Wimi donné.
- **Upload d'images** par les éditeurs.
- **Verrouillage exclusif** des collections en édition (pas d'édition parallèle) :
  le verrou dure jusqu'à la publication, la libération explicite, ou 24 h.
- Zéro coût d'infrastructure supplémentaire (Render free + GitHub gratuits).

## 2. Architecture générale

```
┌─────────────────┐   HTTPS    ┌──────────────────────┐   API GitHub   ┌────────────┐
│  App Electron    │ ────────▶ │  Backend Render       │ ─────────────▶ │  Repo git   │
│  (cms/, aucun    │           │  app/api/admin/*      │  commits sur   │  main       │
│   secret)        │           │  secrets : PAT GitHub,│  main +        │             │
│                  │           │  WIMI_APP_TOKEN, JWT  │  branche       │  push ⇒ CI  │
└─────────────────┘           └──────────┬───────────┘  cms-locks     └──────┬─────┘
                                          │ auth.user.Login                    │
                                          ▼                                    ▼
                                     API Wimi                          GitHub Pages
```

- **App Electron** (`cms/` dans le même repo) : uniquement l'interface d'édition.
  Ne contient **aucun secret** (un binaire distribué se décompile).
- **Backend Render** (existant) : nouvelles routes `app/api/admin/*` — login Wimi,
  validation Zod, verrous, commits GitHub. Comme `app/api`, ces routes sont
  retirées du build statique par la CI.
- **Repo git** : contenu dans `content/`, images dans `public/uploads/`,
  verrous sur la branche `cms-locks`.

### Flux de publication

1. L'éditeur modifie une collection dans l'app et clique « Publier ».
2. Le backend revalide le payload avec le schéma Zod (le même que celui du build
   → un contenu invalide ne peut pas casser le build).
3. Le backend crée **un seul commit** sur `main` via l'API Git Trees (JSON modifié
   + nouvelles images), authentifié par un **PAT GitHub fine-grained** (ce repo
   uniquement, permission `contents: write`). Message :
   `CMS : <collection> modifié par <email Wimi>` (traçabilité via l'historique git).
4. Le push déclenche le workflow Pages existant → en ligne en ~2-3 min.
5. L'app affiche l'état du déploiement (API GitHub Actions relayée par le backend).

**Pas de brouillons partagés en v1** : publier = commiter sur `main`.
(Brouillons/preview par branche = évolution possible, hors périmètre.)

## 3. Authentification Wimi

1. Écran de connexion dans l'app : email + mot de passe Wimi → `POST /api/admin/login`.
2. Le backend appelle `auth.user.Login` avec **les identifiants de l'éditeur**
   (même mécanique que `lib/wimi.ts`, quirks connus : casse des cibles, `msg_key`
   obligatoire, erreurs dans `body.error` malgré HTTP 200). Échec → 401.
   Le mot de passe n'est **jamais stocké ni journalisé**.
3. Vérification d'accès : avec le token Wimi obtenu, le backend liste les espaces
   accessibles à l'utilisateur et exige la présence de `WIMI_CMS_SPACE_ID`
   (variable d'env Render, distincte du `WIMI_SPACE_ID` de l'agenda).
   Absent → 403 avec message clair.
4. Succès → **JWT signé** (`CMS_JWT_SECRET`, validité 12 h, alignée sur le token
   Wimi) contenant email + user_id Wimi. Stocké dans l'app via `safeStorage`
   (coffre-fort de l'OS), envoyé en `Authorization: Bearer` sur toutes les
   routes admin.

Garde-fous :

- Rate-limit sur le login : 5 tentatives / IP / 15 min (en mémoire — un seul
  process Render, suffisant).
- Toutes les routes `/api/admin/*` (hors login) exigent un JWT valide ;
  expiration → l'app redemande le login.
- CORS : routes admin fermées aux origines navigateur.

**Limite documentée** : si Wimi impose un jour la 2FA, `auth.user.Login` par API
échouera pour les comptes concernés.

## 4. Registre de contenu et interface d'édition

**Le CMS ne connaît aucune collection en dur.** Un registre décrit chaque contenu :

```ts
// content/registry.ts — pur (pas de fs), partagé backend + app Electron
presse: {
  label: "Revue de presse",
  kind: "collection",                 // ou "singleton" (pages)
  file: "actualites/presse.json",
  schema: PresseItemSchema,           // Zod, identique au build
  itemTitle: (item) => item.title,
  fields: {
    title:  { label: "Titre",  widget: "text" },
    source: { label: "Source", widget: "text" },
    date:   { label: "Date",   widget: "month" },
    url:    { label: "Lien",   widget: "url", optional: true },
  },
}
```

Ajouter une entrée au registre = elle apparaît dans l'app, sans toucher au code
de l'app. C'est ce qui rend le périmètre « tout le site » atteignable
progressivement.

- **Navigation** : barre latérale par groupes (Actualités, Découvrir, Scolaires…).
  Collection → vue liste (tri, recherche, ajout/suppression/réordonnancement)
  puis formulaire par élément. Singleton → formulaire direct.
- **Widgets v1** : texte, texte long, mois (AAAA-MM), année, URL, liste de
  paragraphes, image. Pas d'éditeur riche en v1 (à ajouter si la migration des
  pages le réclame — probablement un widget markdown).
- **Validation en direct** champ par champ avec les schémas Zod (mêmes messages
  que le build) ; revalidation serveur à la publication (la validation client
  n'est que du confort).
- **Lecture du contenu** : `GET /api/admin/content/{collection}` lit le fichier
  **via l'API GitHub (`main`)**, jamais sur le disque de Render (périmé après
  un commit CMS, le disque datant du dernier déploiement).
- **Brouillons locaux** : les modifications non publiées sont persistées sur le
  disque de l'éditeur (par collection) — fermer ou planter ne perd rien.

## 5. Verrouillage exclusif d'édition

- Ouvrir une collection en édition = `POST /api/admin/lock/{collection}`.
- Verrou accordé → la personne a la main **jusqu'à sa publication, sa libération
  explicite (« Libérer »), ou 24 h**, premier des trois.
- Les autres voient la collection en **lecture seule** avec bandeau :
  « En cours d'édition par marie@… jusqu'au 04/07 15h12 ».
- Le détenteur peut re-obtenir son propre verrou (reprise après fermeture,
  changement de machine).
- `PUT` (publication) **exige** le verrou et le libère en cas de succès.
  Un seul écrivain garanti → pas de conflit possible.

**Persistance** : le backend free s'endort et perd sa RAM → les verrous vivent
dans `locks.json` sur une **branche dédiée `cms-locks`**, lue/écrite via l'API
GitHub. Cette branche ne déclenche aucun déploiement (le workflow Pages n'écoute
que `main`) ; les opérations de verrou sont rares ; les verrous survivent aux
redémarrages.

```json
{ "presse": { "email": "marie@terra-numerica.org", "expiresAt": "2026-07-04T13:12:00Z" } }
```

Cas limites :

- Verrou expiré → considéré libre.
- Deux acquisitions quasi simultanées : la 2ᵉ écriture GitHub échoue (sha de
  `locks.json` changé) → relecture → refus propre.
- Évolution possible si trop rigide à l'usage : « forcer la libération »
  réservé à l'administrateur.

## 6. Gestion des images

- Versionnées dans `public/uploads/<collection>/`, servies par GitHub Pages.
  Pas de stockage externe.
- **Widget image** : téléverser ou choisir une image existante de
  `public/uploads/` (bibliothèque listée via l'API GitHub). Le JSON stocke un
  chemin relatif (`/uploads/presse/atelier-robots-a1b2c3.webp`) ; le site
  l'affiche via `lib/asset.ts` (préfixe `basePath` déjà géré).
- **Optimisation à l'upload, dans l'app** (le site est en
  `images: { unoptimized: true }` → rien n'est optimisé au build) :
  largeur max 1920 px, conversion WebP qualité ~80, refus au-delà de 4 Mo après
  compression. Protège le poids des pages ET la taille du dépôt.
- **Les images partent dans le commit de publication, pas avant** : sélection →
  aperçu local ; publication → un seul commit JSON + images (Git Trees).
  Pas d'images orphelines si brouillon abandonné, pas de déploiement déclenché
  par un simple upload.
- **Nommage** : `<slug>-<hash court>.webp` (lisible, sans collision).
- Côté serveur : type MIME et taille revérifiés.
- Hors v1 (noté) : nettoyage des images inutilisées, recadrage dans l'app.

## 7. Migration des pages existantes

Seules les 4 collections actualités sont en JSON ; ~30 pages ont leurs textes en
dur dans les TSX. Motif de migration, appliqué page par page (généralisation de
la Phase 1) :

1. Créer `content/<section>/<page>.json` (textes, listes, images de la page).
2. Déclarer schéma Zod + entrée de registre (singleton, libellés, widgets).
3. La page TSX lit le JSON via le loader — toujours prérendue au build,
   zéro changement visiteur.

**Éditable** : titres, paragraphes, listes de cartes, images, liens.
**Reste du code** : mise en page, composants, styles, mécanique des formulaires
(contact, réservation — leurs textes d'intro seront éditables), agenda Wimi (exclu).

**Lots** (le CMS est utilisable dès le lot 1 ; ordre des lots 2-4 ajustable) :

1. Actualités — déjà en JSON, branchement immédiat.
2. Forte rotation : ateliers (scolaires + ressources), collectif/équipe,
   partenaires-financeurs, offres scolaires.
3. Présentation : visiter, entreprises, découvrir, ressources restantes.
4. Quasi figées : mentions légales, accessibilité, confidentialité, plan du site.

## 8. Organisation du code, distribution, mises à jour

**Monorepo** : l'app vit dans `cms/` (package.json propre : Electron, React,
Vite, electron-builder). Elle partage registre et schémas avec le site — un seul
commit fait évoluer schéma + formulaire + backend, sans désynchronisation.

**Découpage préalable** : `lib/content.ts` mélange schémas Zod et lecture `fs`.
On sépare : `content/registry.ts` (schémas + métadonnées, pur, importable
partout) et `lib/content.ts` (loader `fs`, importe le registre). Pages du site
inchangées.

| Cible | Déclencheur | Contenu |
|---|---|---|
| GitHub Pages | push `main` (workflow existant) | export statique, sans `app/api` ni `cms/` |
| Render | push `main` touchant le backend | app Node + routes `/api/admin/*` |
| App CMS | tag `cms-v*` (nouveau workflow) | matrice Win/mac/Linux → `.exe`, `.dmg`, `.deb` + `.AppImage` en GitHub Release |

Hygiène : build filter Render (pas de redéploiement backend quand seul
`content/` ou `cms/` change) ; `paths-ignore: cms/**` sur le workflow Pages.

**Mises à jour** : electron-updater sur les GitHub Releases — automatique sur
Windows et Linux. **macOS : l'auto-update exige une app signée (99 $/an Apple)** ;
sans signature, bandeau « nouvelle version disponible » + retéléchargement
manuel du `.dmg`. Sans signature, macOS et Windows affichent par ailleurs un
avertissement à l'installation (« développeur non vérifié ») — à documenter pour
les éditeurs.

**Compatibilité** : le backend expose une version minimale requise ; une app
trop ancienne (schémas périmés) est bloquée avec message de mise à jour.

## 9. Sécurité (récapitulatif)

- Aucun secret dans l'app distribuée : `WIMI_APP_TOKEN`, PAT GitHub,
  `CMS_JWT_SECRET` uniquement sur Render.
- PAT GitHub fine-grained : ce repo uniquement, `contents: write` seul.
- Mots de passe Wimi relayés en HTTPS, jamais stockés/journalisés ;
  JWT 12 h dans `safeStorage`.
- Rate-limit login ; JWT exigé partout ailleurs ; CORS fermé.
- Noms de collection validés contre le registre (liste blanche) — aucun chemin
  de fichier ne vient du client (pas de path traversal).
- Payloads revalidés par Zod côté serveur ; images revérifiées (MIME, taille).

## 10. Gestion des erreurs

- **Cold start Render** (~1 min, plan free) : détection du timeout →
  « Réveil du serveur… » + relance automatique. Principal irritant prévisible.
- **Wimi indisponible vs identifiants refusés** : messages distincts.
- **Échec du déploiement Pages post-publication** : badge de statut en erreur +
  consigne de prévenir l'administrateur. (La validation Zod pré-commit exclut
  le contenu invalide comme cause — seule une panne CI reste possible.)
- **Perte de brouillon** : impossible (persistance locale par collection).

## 11. Tests

- **Unitaires** : verrous (acquisition, expiration, reprise), génération de
  formulaires depuis le registre, schémas.
- **Intégration** : routes `/api/admin/*` avec Wimi et GitHub mockés
  (login OK/KO/sans espace, publication, conflit de verrou, rate-limit).
- **Build** : compilation du site après chaque migration (CI existante) +
  test « chaque entrée du registre pointe vers un fichier existant et valide ».
- **E2E manuel** avant chaque release : login → éditer → publier → vérifier en
  ligne, sur les trois OS.

## 12. Variables d'environnement nouvelles (Render)

| Variable | Rôle |
|---|---|
| `GITHUB_CMS_TOKEN` | PAT fine-grained, commits de contenu |
| `GITHUB_REPO` | `owner/repo` cible |
| `WIMI_CMS_SPACE_ID` | espace Wimi donnant droit d'accès au CMS |
| `CMS_JWT_SECRET` | signature des sessions CMS |
| `CMS_MIN_APP_VERSION` | version minimale de l'app acceptée |
