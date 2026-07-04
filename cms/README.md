# CMS Terra Numerica — application de bureau

Application Electron d'édition du contenu du site (Phase 2). Elle consomme
les routes `/api/admin/*` du backend Render et partage `content/registry.ts`
avec le site : ajouter une entrée au registre suffit à la faire apparaître ici.

## Développement

```bash
cd cms
npm install
npm run dev        # lance l'app (Electron + Vite HMR)
npm test           # tests Vitest
npm run typecheck  # tsc --noEmit
npm run build      # bundle main/preload/renderer dans out/
```

Variables d'environnement (optionnelles) :

| Variable | Rôle | Défaut |
|---|---|---|
| `CMS_API_BASE` | URL du backend (processus principal) | `https://terra-numerica-backend.onrender.com` |
| `VITE_SITE_BASE` | URL publique du site (aperçus d'images) | `https://terra-numerica.org` |

Dev contre un backend local : `CMS_API_BASE=http://localhost:3000 npm run dev`.

## Architecture (rappels)

- **Aucun appel réseau dans le renderer** : les routes admin n'ont pas de
  CORS (voulu) ; tout fetch passe par le processus principal via IPC
  (`window.cms.apiRequest`). La CSP de `index.html` l'interdit mécaniquement.
- **Aucun secret dans l'app** : seulement le JWT de session (12 h), chiffré
  par le coffre-fort de l'OS (`safeStorage`). Sous Linux sans trousseau
  (GNOME Keyring/KWallet), la session n'est pas persistée : reconnexion à
  chaque lancement.
- **Brouillons** : `userData/drafts/<collection>.json`, autosauvegardés —
  fermer ou planter ne perd rien. Les images téléversées y restent en base64
  jusqu'à la publication (un seul commit JSON + images).
- **PUT jamais rejoué automatiquement** : un timeout pendant la publication
  ne relance pas le commit (risque de doublon) — l'utilisateur décide.

## Checklist E2E manuelle (avant chaque release, sur les 3 OS — spec §11)

1. Login avec un compte Wimi **sans** accès à l'espace CMS → message 403 clair.
2. Login valide (après ~15 min d'inactivité du backend : « Réveil du
   serveur… » puis succès).
3. Ouvrir « Revue de presse » → « Modifier » → le verrou est posé (vérifier
   depuis un 2ᵉ poste : bandeau lecture seule).
4. Modifier un titre, fermer l'app, relancer → le brouillon est proposé.
5. Ajouter une image (> 1920 px de large) → convertie WebP, aperçu OK.
6. Publier → badge « Mise en ligne en cours… » puis « Publié » ; vérifier la
   page sur le site en ligne (~2-3 min) et le commit
   `CMS : Revue de presse modifié par <email>` sur main.
7. « Abandonner le brouillon » et « Libérer le verrou » se comportent comme
   annoncé.
8. Baisser `CMS_MIN_APP_VERSION` côté Render au-dessus de la version de
   l'app → écran « Mise à jour requise » au démarrage.

## Limites connues (documentées dans la spec)

- 2FA Wimi : si Wimi impose la 2FA, le login par API échouera pour ces comptes.
- Distribution, auto-update et signature : Plan 3.
