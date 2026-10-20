#!/usr/bin/env bash
# Déploiement atomique du frontend statique.
#
# Problème réglé : `npm run build` réécrivait directement dans frontend/out,
# le dossier servi par nginx — un visiteur pouvait tomber sur un build à
# moitié écrit pendant les quelques secondes du build. Ici on construit dans
# un dossier de release horodaté, on vérifie le résultat, puis on ne bascule
# le symlink `frontend/current` (racine nginx, voir deploy/nginx.conf.example)
# qu'une fois le build validé.
set -euo pipefail
cd "$(dirname "$0")/.."

RELEASE_NAME="$(date +%Y%m%d%H%M%S)"
RELEASE_REL="releases/$RELEASE_NAME"          # relatif à frontend/ (distDir)
RELEASE_DIR="frontend/$RELEASE_REL"           # relatif à la racine du repo
KEEP=5

echo "==> git pull"
git pull

echo "==> installation des dépendances frontend"
npm --prefix frontend ci

echo "==> build → $RELEASE_DIR"
NEXT_EXPORT_DIR="$RELEASE_REL" npm --prefix frontend run build

echo "==> validation du build"
if [ ! -s "$RELEASE_DIR/index.html" ]; then
  echo "Build invalide : index.html absent ou vide dans $RELEASE_DIR — abandon, 'current' inchangé." >&2
  rm -rf "$RELEASE_DIR"
  exit 1
fi

echo "==> bascule atomique de frontend/current"
ln -sfn "$(pwd)/$RELEASE_DIR" frontend/current.tmp
mv -Tf frontend/current.tmp frontend/current

echo "==> purge des anciennes releases (on garde les $KEEP dernières)"
ls -1dt frontend/releases/*/ 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -rf

echo "OK — déployé : $RELEASE_DIR"
