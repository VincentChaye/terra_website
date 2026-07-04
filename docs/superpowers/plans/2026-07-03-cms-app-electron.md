# CMS Phase 2 — Plan 2 : App Electron (`cms/`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire l'application de bureau Electron (`cms/`) qui consomme les routes `/api/admin/*` du Plan 1 : login Wimi, navigation par registre, formulaires générés, verrous d'édition, brouillons locaux, images WebP, publication avec suivi du déploiement. Livrable : app complète exécutable en dev (`npm run dev` dans `cms/`) ; l'empaquetage/distribution est le Plan 3.

**Architecture:** Monorepo — l'app vit dans `cms/` avec son propre `package.json` (Electron + Vite + React) et importe `content/registry.ts` de la racine (schémas Zod + métadonnées partagés avec le backend). **Tous les appels HTTP au backend passent par le processus principal (Node) via IPC** : les routes admin ne renvoient volontairement aucun en-tête CORS (spec §3), un `fetch` depuis le renderer (Chromium) serait bloqué. Le renderer ne contient que l'UI ; token en `safeStorage` et brouillons sur disque vivent aussi côté main.

**Tech Stack:** Electron, electron-vite, React 19, TypeScript strict, Vitest + jsdom + @testing-library/react, registre Zod partagé (`@site/content/registry`). Côté backend (Task 2 uniquement) : Next.js 16 + Vitest existants.

## Global Constraints

- **CORS** : les routes `/api/admin/*` n'ont aucun en-tête CORS (voulu, spec §3 « CORS : routes admin fermées aux origines navigateur »). **Aucun `fetch` réseau dans le renderer** — tout passe par `window.cms.apiRequest` (IPC → main). La CSP du `index.html` (`default-src 'self'`) fait respecter cette règle mécaniquement.
- **Aucun secret dans l'app** (spec §9) : pas de token GitHub, pas de `WIMI_APP_TOKEN`, pas de `CMS_JWT_SECRET` dans `cms/`. Seul le JWT de session (12 h) est stocké, via `safeStorage`.
- **Zod : jamais importé directement dans `cms/`** — toujours passer par `entry.schema` / `payloadSchema(entry)` du registre, et aliaser `zod` vers `../node_modules/zod` dans les configs Vite/Vitest (une seule instance de zod, pas de désynchronisation de version avec la racine).
- **Backend (Task 2)** : Next.js 16 — `params` des routes dynamiques est une **Promise** (`const { collection } = await ctx.params`). Style et helpers de `lib/github.ts` existants.
- **Contrats backend à respecter à l'octet** (Plan 1) : chemins d'images publiés `uploads/<collection>/<slug>-<hash8>.webp` (regex serveur `^uploads/<collection>/[a-z0-9][a-z0-9-]*-[a-f0-9]{8}\.webp$`), champ JSON stocké **avec** slash initial (`/uploads/…`, cf. `lib/asset.ts`), publication `PUT {content, images:[{path, base64}]}`, verrou : `POST` → 200 `{expiresAt}` / 423 `{error, heldBy, expiresAt}`.
- **TypeScript strict** partout ; alias `@site/*` → racine du repo, `@/*` → `cms/src/renderer/src/*`.
- **Textes UI en français** (utilisateurs non techniciens) ; commentaires en français, alignés sur l'existant.
- **Commits** : messages en français, style de l'historique, **jamais de ligne `Co-Authored-By: Claude`**.
- **Racine intacte** : `npm test`, `npm run lint`, `npm run build` à la racine doivent rester verts — `cms/` est exclu du Vitest racine, de l'ESLint racine et du `.gitignore` racine est complété (`/node_modules` est ancré à la racine, il n'ignore PAS `cms/node_modules`).
- URL par défaut du backend : `https://terra-numerica-backend.onrender.com` (service `terra-numerica-backend` de `render.yaml`), surchargée par la variable d'env `CMS_API_BASE` (dev local). URL publique du site pour les aperçus d'images : `https://terra-numerica.org` (cf. `app/sitemap.ts`), surchargée par `VITE_SITE_BASE`.
- `npm run dev` (Electron) requiert une session graphique ; en environnement headless, faire les vérifications automatiques (tests, typecheck, build) et **signaler** que la vérification visuelle n'a pas pu être faite — ne pas prétendre l'avoir faite.

## Structure des fichiers

```
cms/
  package.json                 # deps propres (Electron, React, Vite…), scripts dev/build/test/typecheck
  electron.vite.config.ts      # 3 cibles : main, preload, renderer (alias @site, @, zod)
  vitest.config.ts             # jsdom + mêmes alias
  tsconfig.json                # strict, jsx react-jsx, paths
  src/
    shared/bridge.ts           # type CmsBridge + déclaration window.cms (contrat preload ↔ renderer)
    main/
      index.ts                 # fenêtre + cycle de vie
      stores.ts                # TokenStore (safeStorage) + DraftStore (userData/drafts) — pur, testable
      api.ts                   # client HTTP du backend (cold start Render) — pur, testable
      ipc.ts                   # enregistrement des canaux IPC (branche stores + api sur Electron)
    preload/index.ts           # contextBridge → window.cms
    renderer/
      index.html               # CSP stricte (aucun fetch réseau renderer)
      src/
        main.tsx  App.tsx  styles.css  env.d.ts
        lib/
          api.ts               # endpoints typés au-dessus de window.cms.apiRequest + versionAtLeast
          session.ts           # useSession (token via bridge)
          image.ts             # slugify, hash, nommage, conversion WebP (canvas)
          form.ts              # emptyItem, fieldErrors, itemLabel, moveItem, groupedRegistry
          publish.ts           # usedImages (anti-orphelines), invalidItems, deployLabel
        components/
          LoginScreen.tsx  Shell.tsx
          FieldInput.tsx       # widgets text/textarea/month/year/url/paragraphs
          ImageField.tsx       # widget image (upload converti + bibliothèque)
          ItemForm.tsx         # formulaire d'un élément, généré depuis entry.fields
          CollectionScreen.tsx # liste, verrou, brouillon, édition
          PublishBar.tsx       # publication + badge de déploiement
  tests/                       # *.test.ts(x) — Vitest de cms/ uniquement
  README.md                    # dev, variables, limites, checklist E2E manuelle

# Racine (Task 2 — bibliothèque d'images)
lib/github.ts                          # + listDir()
app/api/admin/uploads/[collection]/route.ts
tests/routes-uploads.test.ts
```

---

### Task 1 : Squelette `cms/` (electron-vite + React + Vitest) + garde-fous racine

Une fenêtre Electron qui s'ouvre, un test qui prouve que le registre de la racine s'importe, et la racine protégée (Vitest/ESLint/gitignore).

**Files:**
- Create: `cms/package.json`, `cms/electron.vite.config.ts`, `cms/vitest.config.ts`, `cms/tsconfig.json`
- Create: `cms/src/main/index.ts`, `cms/src/preload/index.ts`
- Create: `cms/src/renderer/index.html`, `cms/src/renderer/src/main.tsx`, `cms/src/renderer/src/App.tsx`, `cms/src/renderer/src/styles.css`, `cms/src/renderer/src/env.d.ts`
- Test: `cms/tests/registry.test.ts`
- Modify: `.gitignore`, `vitest.config.ts` (racine), `eslint.config.mjs` (racine)

**Interfaces:**
- Consumes: `content/registry.ts` (racine) — `registry`, `payloadSchema`.
- Produces: package `cms/` installable/exécutable ; alias `@site/*` (racine du repo), `@/*` (`cms/src/renderer/src`), `zod` (instance de la racine) disponibles dans Vite ET Vitest ; scripts `npm run dev|build|test|typecheck` dans `cms/`.

- [ ] **Step 1: Garde-fous racine (avant tout code cms/)**

Dans `.gitignore` racine, ajouter à la fin :

```
# CMS (app Electron) — /node_modules ci-dessus est ancré à la racine
cms/node_modules/
cms/out/
```

Dans `vitest.config.ts` racine, restreindre les tests à `tests/` (sinon le Vitest racine ramasserait `cms/tests/**`) :

```ts
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
```

Dans `eslint.config.mjs` racine, ajouter `"cms/**"` à la liste `globalIgnores` (le package `cms/` a son propre tsconfig ; il est vérifié par `tsc --noEmit` dans `cms/`, pas par l'ESLint Next de la racine) :

```js
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // App CMS : package séparé (tsconfig propre), vérifiée par `npm run typecheck` dans cms/.
    "cms/**",
  ]),
```

Run: `npm test && npm run lint`
Expected: PASS/inchangé (43 tests racine, lint OK).

- [ ] **Step 2: Créer `cms/package.json` et installer les dépendances**

Créer `cms/package.json` :

```json
{
  "name": "tn-cms",
  "version": "0.1.0",
  "private": true,
  "description": "CMS Terra Numerica — application de bureau d'édition du contenu du site",
  "main": "out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

Puis :

```bash
cd cms
npm install react react-dom
npm install -D electron electron-vite vite @vitejs/plugin-react typescript @types/node @types/react @types/react-dom vitest jsdom @testing-library/react
```

Note : `npm install -D electron` télécharge le binaire Electron (~100 Mo). Si npm signale un conflit de peer dependencies entre `electron-vite` et `vite`, installer la version de `vite` que `electron-vite` déclare (`npm info electron-vite peerDependencies`) au lieu de la dernière. **Ne pas** installer `zod` dans `cms/` (contrainte globale : instance unique via alias).

- [ ] **Step 3: Configs (electron-vite, vitest, tsconfig)**

Créer `cms/electron.vite.config.ts` :

```ts
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// L'app partage content/registry.ts avec le site : alias vers la racine du
// repo, et zod aliasé vers l'instance de la racine (une seule instance).
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const sharedAliases = {
  "@site": repoRoot,
  "@": fileURLToPath(new URL("./src/renderer/src", import.meta.url)),
  zod: fileURLToPath(new URL("../node_modules/zod", import.meta.url)),
};

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    plugins: [react()],
    resolve: { alias: sharedAliases },
    // Autorise Vite à servir des fichiers hors de cms/ (content/registry.ts).
    server: { fs: { allow: [repoRoot] } },
  },
});
```

Créer `cms/vitest.config.ts` :

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom" },
  resolve: {
    alias: {
      "@site": fileURLToPath(new URL("..", import.meta.url)),
      "@": fileURLToPath(new URL("./src/renderer/src", import.meta.url)),
      zod: fileURLToPath(new URL("../node_modules/zod", import.meta.url)),
    },
  },
});
```

Créer `cms/tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "types": ["node", "vite/client"],
    "baseUrl": ".",
    "paths": {
      "@site/*": ["../*"],
      "@/*": ["./src/renderer/src/*"],
      "zod": ["../node_modules/zod"]
    }
  },
  "include": ["src", "tests", "electron.vite.config.ts", "vitest.config.ts", "../content/registry.ts"]
}
```

- [ ] **Step 4: Test du registre partagé (échouera : alias/déps pas encore éprouvés)**

Créer `cms/tests/registry.test.ts` :

```ts
import { describe, expect, it } from "vitest";
import { payloadSchema, registry } from "@site/content/registry";

describe("registre partagé (import depuis la racine du repo)", () => {
  it("expose les collections d'actualités", () => {
    for (const key of ["presse", "newsletter", "retrospectives", "videos"]) {
      expect(registry).toHaveProperty(key);
    }
  });

  it("payloadSchema d'une collection accepte un tableau, refuse un objet", () => {
    expect(payloadSchema(registry.presse).safeParse([]).success).toBe(true);
    expect(payloadSchema(registry.presse).safeParse({}).success).toBe(false);
  });
});
```

Run: `cd cms && npm test`
Expected: FAIL tant que la config n'est pas en place, puis PASS (2 tests) une fois les steps 2-3 faits. Si l'alias `@site` ne résout pas, vérifier `vitest.config.ts` — ne pas dupliquer le registre dans `cms/`.

- [ ] **Step 5: Fenêtre Electron minimale**

Créer `cms/src/main/index.ts` :

```ts
/**
 * Processus principal — fenêtre unique.
 * Sécurité : contextIsolation activé, pas de nodeIntegration ; le renderer
 * ne parle au monde extérieur que via le pont préload (window.cms).
 */

import { app, BrowserWindow } from "electron";
import { join } from "node:path";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Terra Numerica — CMS",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // electron-vite : URL du serveur de dev en `dev`, fichier construit sinon.
  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
```

Créer `cms/src/preload/index.ts` (vide fonctionnellement pour l'instant, complété en Task 3) :

```ts
// Pont renderer ↔ main — complété en Task 3 (stores) et Task 4 (API).
export {};
```

Créer `cms/src/renderer/index.html` :

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <!-- Aucun fetch réseau côté renderer (routes admin sans CORS) : la CSP
         l'interdit mécaniquement. img https: = aperçus de la bibliothèque. -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:"
    />
    <title>Terra Numerica — CMS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Créer `cms/src/renderer/src/main.tsx` :

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Créer `cms/src/renderer/src/App.tsx` (remplacé en Task 8) :

```tsx
export default function App() {
  return <h1>Terra Numerica — CMS</h1>;
}
```

Créer `cms/src/renderer/src/styles.css` (complété en Task 8) :

```css
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
```

Créer `cms/src/renderer/src/env.d.ts` :

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL publique du site (aperçus d'images de la bibliothèque). */
  readonly VITE_SITE_BASE?: string;
}
```

- [ ] **Step 6: Vérifier**

Run: `cd cms && npm test && npm run typecheck && npm run build`
Expected: 2 tests PASS, typecheck OK, build electron-vite OK (dossier `cms/out/`).

Run (si session graphique) : `cd cms && npm run dev`
Expected: une fenêtre « Terra Numerica — CMS » s'ouvre avec le titre. Sinon, noter « vérification visuelle non faite (headless) » dans le rapport.

- [ ] **Step 7: Commit**

```bash
git add .gitignore vitest.config.ts eslint.config.mjs cms/package.json cms/package-lock.json cms/electron.vite.config.ts cms/vitest.config.ts cms/tsconfig.json cms/src cms/tests
git commit -m "CMS : squelette de l'app Electron (electron-vite + React + Vitest, registre partagé)

Package cms/ autonome dans le monorepo : alias @site vers la racine (schémas
Zod partagés, instance zod unique), CSP interdisant tout fetch renderer
(les routes admin n'ont pas de CORS — les appels passeront par IPC).
Racine protégée : Vitest limité à tests/, ESLint et gitignore complétés."
```

---

### Task 2 : Backend — bibliothèque d'images (`GET /api/admin/uploads/{collection}`)

La spec §6 prévoit « choisir une image existante de `public/uploads/` (bibliothèque listée via l'API GitHub) » — aucune route du Plan 1 ne le permet. Petite route de lecture, même style que les routes existantes.

**Files:**
- Modify: `lib/github.ts` (ajouter `listDir`)
- Create: `app/api/admin/uploads/[collection]/route.ts`
- Test: `tests/routes-uploads.test.ts`, ajout dans `tests/github.test.ts`

**Interfaces:**
- Consumes: helpers internes `gh`/`repoPath` de `lib/github.ts`, `requireAuth` (`lib/cms-auth.ts`), `registry` (`content/registry.ts`).
- Produces (utilisé par l'app, Task 4) :
  - `listDir(path: string, ref?: string): Promise<{ name: string; path: string }[]>` — `[]` si le dossier n'existe pas.
  - `GET /api/admin/uploads/{collection}` → 200 `{ images: string[] }` (chemins `/uploads/<collection>/<fichier>.webp`, prêts à stocker dans le JSON) ; 401 sans JWT ; 404 collection hors registre.

- [ ] **Step 1: Écrire les tests**

Dans `tests/github.test.ts`, ajouter en fin de fichier (le mock `fetch` du `beforeEach` existant s'applique) :

```ts
describe("listDir", () => {
  it("liste les fichiers d'un dossier (en filtrant les sous-dossiers)", async () => {
    routes["GET /repos/org/tn-site/contents/public%2Fuploads%2Fpresse?ref=main"] = () => ({
      status: 200,
      json: [
        { type: "file", name: "a-12345678.webp", path: "public/uploads/presse/a-12345678.webp" },
        { type: "dir", name: "archives", path: "public/uploads/presse/archives" },
      ],
    });
    const { listDir } = await import("@/lib/github");
    expect(await listDir("public/uploads/presse")).toEqual([
      { name: "a-12345678.webp", path: "public/uploads/presse/a-12345678.webp" },
    ]);
  });

  it("renvoie [] si le dossier n'existe pas", async () => {
    routes["GET /repos/org/tn-site/contents/public%2Fuploads%2Fpresse?ref=main"] = () => ({ status: 404, json: {} });
    const { listDir } = await import("@/lib/github");
    expect(await listDir("public/uploads/presse")).toEqual([]);
  });
});
```

(Si le fichier importe déjà les fonctions en tête, ajouter `listDir` à l'import statique au lieu du `await import` — suivre le style du fichier.)

Créer `tests/routes-uploads.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ listDir: vi.fn() }));

import { listDir } from "@/lib/github";
import { signCmsJwt } from "@/lib/cms-auth";
import { GET } from "@/app/api/admin/uploads/[collection]/route";

const mockList = vi.mocked(listDir);

function ctx(collection: string) {
  return { params: Promise.resolve({ collection }) };
}

async function authedRequest(): Promise<Request> {
  const jwt = await signCmsJwt("a@b.fr", 7);
  return new Request("http://test/api/admin/uploads/presse", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
}

beforeEach(() => {
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  mockList.mockReset();
});

describe("GET /api/admin/uploads/{collection}", () => {
  it("401 sans JWT", async () => {
    expect((await GET(new Request("http://test/"), ctx("presse"))).status).toBe(401);
  });

  it("404 si collection hors registre", async () => {
    expect((await GET(await authedRequest(), ctx("inconnue"))).status).toBe(404);
  });

  it("liste les chemins /uploads/… des .webp du dossier", async () => {
    mockList.mockResolvedValueOnce([
      { name: "a-12345678.webp", path: "public/uploads/presse/a-12345678.webp" },
      { name: "note.txt", path: "public/uploads/presse/note.txt" },
    ]);
    const res = await GET(await authedRequest(), ctx("presse"));
    expect(await res.json()).toEqual({ images: ["/uploads/presse/a-12345678.webp"] });
    expect(mockList).toHaveBeenCalledWith("public/uploads/presse");
  });

  it("dossier absent → liste vide", async () => {
    mockList.mockResolvedValueOnce([]);
    expect(await (await GET(await authedRequest(), ctx("presse"))).json()).toEqual({ images: [] });
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm test -- tests/routes-uploads.test.ts`
Expected: FAIL — route introuvable (et `listDir` inexistant).

- [ ] **Step 3: Implémenter**

Dans `lib/github.ts`, ajouter après `getFile` :

```ts
/** Liste les fichiers d'un dossier du repo (sous-dossiers exclus). [] si absent. */
export async function listDir(
  path: string,
  ref = "main"
): Promise<{ name: string; path: string }[]> {
  const { status, json } = await gh(
    "GET",
    repoPath(`contents/${encodeURIComponent(path)}?ref=${ref}`)
  );
  if (status === 404) return [];
  if (status !== 200) throw new Error(`GitHub ${status} en listant ${path}`);
  const items = json as { type: string; name: string; path: string }[];
  return items.filter((i) => i.type === "file").map(({ name, path }) => ({ name, path }));
}
```

Créer `app/api/admin/uploads/[collection]/route.ts` :

```ts
/**
 * GET /api/admin/uploads/{collection} — Bibliothèque d'images.
 * Liste les .webp de public/uploads/<collection>/ sur main, sous forme de
 * chemins prêts à stocker dans le JSON (« /uploads/<collection>/<fichier> »,
 * affichés par le site via lib/asset.ts).
 */

import { NextResponse } from "next/server";
import { registry } from "@/content/registry";
import { requireAuth } from "@/lib/cms-auth";
import { listDir } from "@/lib/github";

type Ctx = { params: Promise<{ collection: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { collection } = await ctx.params;
  if (!registry[collection]) {
    return NextResponse.json({ error: "Collection inconnue." }, { status: 404 });
  }
  const files = await listDir(`public/uploads/${collection}`);
  return NextResponse.json({
    images: files
      .filter((f) => f.name.endsWith(".webp"))
      .map((f) => `/uploads/${collection}/${f.name}`),
  });
}
```

- [ ] **Step 4: Vérifier**

Run: `npm test && npm run build`
Expected: tous les tests racine PASS (dont les 6 nouveaux), build Next OK.

- [ ] **Step 5: Commit**

```bash
git add lib/github.ts app/api/admin/uploads tests/routes-uploads.test.ts tests/github.test.ts
git commit -m "CMS : route GET /api/admin/uploads/{collection} (bibliothèque d'images sur main)"
```

---

### Task 3 : Main process — stores (token `safeStorage`, brouillons) + pont IPC

**Files:**
- Create: `cms/src/main/stores.ts`, `cms/src/main/ipc.ts`, `cms/src/shared/bridge.ts`
- Modify: `cms/src/main/index.ts` (enregistrer l'IPC), `cms/src/preload/index.ts`
- Test: `cms/tests/stores.test.ts`

**Interfaces:**
- Consumes: Electron (`app.getPath("userData")`, `safeStorage`, `ipcMain`) — uniquement dans `ipc.ts` ; `stores.ts` reste pur (injectable, testable).
- Produces (utilisé par les Tasks 7, 9, 10) :
  - `type Encryptor = { available(): boolean; encrypt(text: string): Buffer; decrypt(data: Buffer): string }`
  - `class TokenStore { constructor(dir: string, enc: Encryptor); set(token: string): void; get(): string | null; clear(): void }` — chiffré sur disque si le coffre OS est disponible, sinon **mémoire seulement** (session perdue à la fermeture, cas Linux sans trousseau).
  - `class DraftStore { constructor(dir: string); read(key): unknown | null; write(key, data): void; delete(key): void }` — clés validées `/^[a-z0-9-]+$/` (pas de traversal), écriture atomique (tmp + rename).
  - `window.cms: CmsBridge` avec `getToken() / setToken(t) / clearToken() / readDraft(k) / writeDraft(k, d) / deleteDraft(k) / appVersion()` (toutes `Promise`).

- [ ] **Step 1: Écrire les tests**

Créer `cms/tests/stores.test.ts` :

```ts
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DraftStore, TokenStore, type Encryptor } from "../src/main/stores";

let dir: string;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), "cms-stores-")); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const fakeEnc: Encryptor = {
  available: () => true,
  encrypt: (t) => Buffer.from(t, "utf-8").reverse(),
  decrypt: (d) => Buffer.from(d).reverse().toString("utf-8"),
};
const noEnc: Encryptor = {
  available: () => false,
  encrypt: () => { throw new Error("indisponible"); },
  decrypt: () => { throw new Error("indisponible"); },
};

describe("TokenStore", () => {
  it("aller-retour set/get chiffré sur disque (survit à une nouvelle instance)", () => {
    new TokenStore(dir, fakeEnc).set("jeton");
    expect(new TokenStore(dir, fakeEnc).get()).toBe("jeton");
  });

  it("get renvoie null sans token, clear efface", () => {
    const store = new TokenStore(dir, fakeEnc);
    expect(store.get()).toBeNull();
    store.set("jeton");
    store.clear();
    expect(store.get()).toBeNull();
  });

  it("coffre OS indisponible → mémoire seulement (rien sur disque)", () => {
    const store = new TokenStore(dir, noEnc);
    store.set("jeton");
    expect(store.get()).toBe("jeton");            // dans la même instance
    expect(new TokenStore(dir, noEnc).get()).toBeNull(); // pas persisté
  });
});

describe("DraftStore", () => {
  it("aller-retour write/read/delete", () => {
    const store = new DraftStore(dir);
    expect(store.read("presse")).toBeNull();
    store.write("presse", { content: [1], images: {} });
    expect(store.read("presse")).toEqual({ content: [1], images: {} });
    store.delete("presse");
    expect(store.read("presse")).toBeNull();
  });

  it("refuse les clés dangereuses (traversal)", () => {
    const store = new DraftStore(dir);
    expect(() => store.write("../evil", {})).toThrow();
    expect(() => store.read("a/b")).toThrow();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/stores.test.ts`
Expected: FAIL — module `../src/main/stores` introuvable.

- [ ] **Step 3: Implémenter `cms/src/main/stores.ts`**

```ts
/**
 * Stores du processus principal — purs (aucun import Electron) pour être
 * testables : l'Encryptor (safeStorage) et les dossiers sont injectés
 * par ipc.ts.
 *
 * TokenStore : le JWT de session (12 h), chiffré par le coffre-fort de
 * l'OS. Si le coffre est indisponible (Linux sans trousseau), on garde le
 * token en mémoire seulement — reconnexion à chaque lancement, mais jamais
 * de token en clair sur disque.
 *
 * DraftStore : brouillons par collection (spec §4 — fermer ou planter ne
 * perd rien), un fichier JSON par clé dans userData/drafts.
 */

import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Encryptor = {
  available(): boolean;
  encrypt(text: string): Buffer;
  decrypt(data: Buffer): string;
};

const KEY_PATTERN = /^[a-z0-9-]+$/;

export class TokenStore {
  private memory: string | null = null;

  constructor(private dir: string, private enc: Encryptor) {}

  private get file(): string {
    return join(this.dir, "session.bin");
  }

  set(token: string): void {
    if (!this.enc.available()) {
      this.memory = token;
      return;
    }
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(this.file, this.enc.encrypt(token));
  }

  get(): string | null {
    if (!this.enc.available()) return this.memory;
    try {
      return this.enc.decrypt(readFileSync(this.file));
    } catch {
      return null; // fichier absent ou indéchiffrable → non connecté
    }
  }

  clear(): void {
    this.memory = null;
    rmSync(this.file, { force: true });
  }
}

export class DraftStore {
  constructor(private dir: string) {}

  private file(key: string): string {
    if (!KEY_PATTERN.test(key)) throw new Error(`clé de brouillon invalide : ${key}`);
    return join(this.dir, `${key}.json`);
  }

  read(key: string): unknown | null {
    try {
      return JSON.parse(readFileSync(this.file(key), "utf-8"));
    } catch (e) {
      if (e instanceof Error && e.message.startsWith("clé de brouillon")) throw e;
      return null; // absent ou corrompu → pas de brouillon
    }
  }

  write(key: string, data: unknown): void {
    mkdirSync(this.dir, { recursive: true });
    const target = this.file(key);
    const tmp = `${target}.tmp`;
    writeFileSync(tmp, JSON.stringify(data));
    renameSync(tmp, target); // atomique : jamais de brouillon à moitié écrit
  }

  delete(key: string): void {
    rmSync(this.file(key), { force: true });
  }
}
```

- [ ] **Step 4: Vérifier**

Run: `cd cms && npm test -- tests/stores.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Pont IPC + preload (câblage, pas de test unitaire : Electron requis)**

Créer `cms/src/shared/bridge.ts` :

```ts
/**
 * Contrat du pont preload ↔ renderer (window.cms).
 * `apiRequest` est ajouté en Task 4 (couche API).
 */

export type CmsBridge = {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
  readDraft(key: string): Promise<unknown | null>;
  writeDraft(key: string, data: unknown): Promise<void>;
  deleteDraft(key: string): Promise<void>;
  appVersion(): Promise<string>;
};

declare global {
  interface Window {
    cms: CmsBridge;
  }
}
```

Créer `cms/src/main/ipc.ts` :

```ts
/**
 * Enregistrement des canaux IPC : branche les stores purs sur Electron
 * (safeStorage, userData). Appelé une fois au démarrage.
 */

import { app, ipcMain, safeStorage } from "electron";
import { join } from "node:path";
import { DraftStore, TokenStore, type Encryptor } from "./stores";

export function registerIpc(): void {
  const enc: Encryptor = {
    available: () => safeStorage.isEncryptionAvailable(),
    encrypt: (t) => safeStorage.encryptString(t),
    decrypt: (d) => safeStorage.decryptString(d),
  };
  const tokens = new TokenStore(app.getPath("userData"), enc);
  const drafts = new DraftStore(join(app.getPath("userData"), "drafts"));

  ipcMain.handle("token:get", () => tokens.get());
  ipcMain.handle("token:set", (_e, token: string) => tokens.set(token));
  ipcMain.handle("token:clear", () => tokens.clear());
  ipcMain.handle("draft:read", (_e, key: string) => drafts.read(key));
  ipcMain.handle("draft:write", (_e, key: string, data: unknown) => drafts.write(key, data));
  ipcMain.handle("draft:delete", (_e, key: string) => drafts.delete(key));
  ipcMain.handle("app:version", () => app.getVersion());
}
```

Remplacer le contenu de `cms/src/preload/index.ts` :

```ts
/**
 * Préload — expose window.cms au renderer (contextBridge).
 * Seule surface entre l'UI et le système : stores + (Task 4) API backend.
 */

import { contextBridge, ipcRenderer } from "electron";
import type { CmsBridge } from "../shared/bridge";

const bridge: CmsBridge = {
  getToken: () => ipcRenderer.invoke("token:get"),
  setToken: (token) => ipcRenderer.invoke("token:set", token),
  clearToken: () => ipcRenderer.invoke("token:clear"),
  readDraft: (key) => ipcRenderer.invoke("draft:read", key),
  writeDraft: (key, data) => ipcRenderer.invoke("draft:write", key, data),
  deleteDraft: (key) => ipcRenderer.invoke("draft:delete", key),
  appVersion: () => ipcRenderer.invoke("app:version"),
};

contextBridge.exposeInMainWorld("cms", bridge);
```

Dans `cms/src/main/index.ts`, ajouter l'import et l'appel :

```ts
import { registerIpc } from "./ipc";
```

et remplacer `app.whenReady().then(createWindow);` par :

```ts
app.whenReady().then(() => {
  registerIpc();
  createWindow();
});
```

- [ ] **Step 6: Vérifier build + tests**

Run: `cd cms && npm test && npm run typecheck && npm run build`
Expected: PASS partout.

- [ ] **Step 7: Commit**

```bash
git add cms/src cms/tests/stores.test.ts
git commit -m "CMS app : stores du main (JWT via safeStorage, brouillons userData) + pont IPC window.cms"
```

---

### Task 4 : Couche API — fetch dans le main (réveil Render), endpoints typés dans le renderer

**Files:**
- Create: `cms/src/main/api.ts`, `cms/src/renderer/src/lib/api.ts`
- Modify: `cms/src/main/ipc.ts`, `cms/src/preload/index.ts`, `cms/src/shared/bridge.ts`
- Test: `cms/tests/api-main.test.ts`, `cms/tests/api-renderer.test.ts`

**Interfaces:**
- Consumes: bridge de la Task 3 ; env `CMS_API_BASE` (défaut `https://terra-numerica-backend.onrender.com`).
- Produces (utilisé par les Tasks 7-10) :
  - Main : `apiRequest(path: string, opts?: { method?: string; body?: unknown; token?: string | null }, timeouts?: { first: number; retry: number }): Promise<{ status: number; json: unknown }>` — 2 essais (8 s puis 90 s) sauf `PUT` (1 seul essai long : pas de double publication).
  - Bridge : `apiRequest(path, opts)` ajouté à `CmsBridge`.
  - Renderer (`@/lib/api`) :
    - `class ApiError extends Error { status: number }` — message serveur (`json.error`) affichable tel quel.
    - `type DeployRun = { status: string; conclusion: string | null; url: string }`
    - `type LockStatus = { locked: false } | { locked: true; email: string; expiresAt: string; ownedByCaller: boolean }`
    - `type ImageUpload = { path: string; base64: string }`
    - `api.login(email, password): Promise<{ token: string; email: string }>`
    - `api.status(token, sha?): Promise<{ minAppVersion: string; deploy: DeployRun | null }>`
    - `api.getContent(token, collection): Promise<{ content: unknown; sha: string }>`
    - `api.putContent(token, collection, content, images: ImageUpload[]): Promise<{ commitSha: string }>`
    - `api.lockStatus(token, collection): Promise<LockStatus>`
    - `api.acquireLock(token, collection): Promise<{ ok: true; expiresAt: string } | { ok: false; heldBy: string; expiresAt: string }>`
    - `api.releaseLock(token, collection): Promise<void>`
    - `api.listUploads(token, collection): Promise<string[]>`
    - `versionAtLeast(current: string, min: string): boolean`

- [ ] **Step 1: Écrire les tests du client main**

Créer `cms/tests/api-main.test.ts` :

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../src/main/api";

// fetch qui respecte l'AbortSignal : pend jusqu'au timeout.
function hangingFetch(): typeof fetch {
  return ((_url: string, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
    })) as unknown as typeof fetch;
}

let calls: { url: string; init?: RequestInit }[];

beforeEach(() => { calls = []; });
afterEach(() => vi.unstubAllGlobals());

function stubFetch(impls: ((url: string, init?: RequestInit) => Promise<Response>)[]) {
  let i = 0;
  vi.stubGlobal("fetch", (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return impls[Math.min(i++, impls.length - 1)](url, init);
  });
}

const ok = (json: unknown, status = 200) => async () =>
  new Response(JSON.stringify(json), { status });

describe("apiRequest (main)", () => {
  it("envoie méthode, Bearer et body JSON ; renvoie status + json", async () => {
    stubFetch([ok({ done: true }, 201)]);
    const res = await apiRequest("/api/admin/x", { method: "POST", body: { a: 1 }, token: "jwt" });
    expect(res).toEqual({ status: 201, json: { done: true } });
    const init = calls[0].init!;
    expect(calls[0].url).toContain("/api/admin/x");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer jwt");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("réessaie avec le timeout long après un premier timeout (réveil Render)", async () => {
    const hang = hangingFetch();
    stubFetch([(u, i) => hang(u, i) as Promise<Response>, ok({ token: "t" })()  as unknown as (u: string, i?: RequestInit) => Promise<Response>] as never);
    // ↑ si cette écriture est pénible, remplacer par : 1er impl = hang, 2e = ok — voir note.
    const res = await apiRequest("/api/admin/login", { method: "POST", body: {} }, { first: 20, retry: 500 });
    expect(res.status).toBe(200);
    expect(calls).toHaveLength(2);
  });

  it("ne réessaie PAS un PUT (risque de double publication) : un seul essai long", async () => {
    stubFetch([(u, i) => hangingFetch()(u, i)]);
    await expect(
      apiRequest("/api/admin/content/presse", { method: "PUT", body: {} }, { first: 20, retry: 30 })
    ).rejects.toBeTruthy();
    expect(calls).toHaveLength(1);
  });

  it("réponse sans corps JSON (204) → json vide", async () => {
    stubFetch([async () => new Response(null, { status: 204 })]);
    expect(await apiRequest("/api/admin/lock/presse", { method: "DELETE" })).toEqual({ status: 204, json: {} });
  });
});
```

Note sur le 2ᵉ test : l'intention est « 1ᵉʳ appel pend jusqu'à l'abort, 2ᵉ appel répond 200 ». Écrire les deux implémentations proprement :

```ts
    stubFetch([
      (u, i) => hangingFetch()(u, i),
      async () => new Response(JSON.stringify({ token: "t" }), { status: 200 }),
    ]);
```

(utiliser cette forme, pas la ligne biscornue au-dessus).

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/api-main.test.ts`
Expected: FAIL — `src/main/api` introuvable.

- [ ] **Step 3: Implémenter `cms/src/main/api.ts`**

```ts
/**
 * Client HTTP du backend — exécuté dans le processus PRINCIPAL (Node).
 *
 * Pourquoi pas dans le renderer ? Les routes /api/admin/* ne renvoient
 * volontairement aucun en-tête CORS (fermées aux navigateurs, spec §3) :
 * un fetch depuis le renderer (Chromium) serait bloqué. Node n'applique
 * pas CORS.
 *
 * Cold start Render (plan free) : la première requête après ~15 min
 * d'inactivité peut pendre le temps du réveil (~1 min). Stratégie :
 * essai court (8 s) puis un second essai long (90 s) — l'UI affiche
 * « Réveil du serveur… » de son côté au-delà de 8 s. Exception : PUT
 * (publication) n'est jamais rejoué automatiquement — un timeout ne
 * prouve pas que le commit n'a pas eu lieu (risque de double commit) ;
 * un seul essai long, l'utilisateur relance à la main si besoin.
 */

export const API_BASE =
  process.env.CMS_API_BASE ?? "https://terra-numerica-backend.onrender.com";

export type ApiRequestOptions = { method?: string; body?: unknown; token?: string | null };
export type ApiResponse = { status: number; json: unknown };

const FIRST_TIMEOUT_MS = 8_000;
const RETRY_TIMEOUT_MS = 90_000;

export async function apiRequest(
  path: string,
  opts: ApiRequestOptions = {},
  timeouts = { first: FIRST_TIMEOUT_MS, retry: RETRY_TIMEOUT_MS }
): Promise<ApiResponse> {
  const method = opts.method ?? "GET";

  const attempt = async (timeoutMs: number): Promise<ApiResponse> => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { status: res.status, json: await res.json().catch(() => ({})) };
  };

  if (method === "PUT") return attempt(timeouts.retry);
  try {
    return await attempt(timeouts.first);
  } catch {
    return attempt(timeouts.retry); // réveil probable → 2e essai long ; s'il échoue, l'erreur remonte
  }
}
```

- [ ] **Step 4: Vérifier**

Run: `cd cms && npm test -- tests/api-main.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Brancher l'IPC**

Dans `cms/src/shared/bridge.ts`, ajouter au type `CmsBridge` (après `appVersion`) :

```ts
  apiRequest(
    path: string,
    opts?: { method?: string; body?: unknown; token?: string | null }
  ): Promise<{ status: number; json: unknown }>;
```

Dans `cms/src/main/ipc.ts`, ajouter l'import et le handler :

```ts
import { apiRequest, type ApiRequestOptions } from "./api";
```

```ts
  ipcMain.handle("api:request", (_e, path: string, opts?: ApiRequestOptions) =>
    apiRequest(path, opts)
  );
```

Dans `cms/src/preload/index.ts`, ajouter à l'objet `bridge` :

```ts
  apiRequest: (path, opts) => ipcRenderer.invoke("api:request", path, opts),
```

- [ ] **Step 6: Écrire les tests du client renderer**

Créer `cms/tests/api-renderer.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, versionAtLeast } from "@/lib/api";

const mockRequest = vi.fn();

beforeEach(() => {
  mockRequest.mockReset();
  (window as unknown as { cms: unknown }).cms = { apiRequest: mockRequest };
});

describe("api (renderer)", () => {
  it("login POST le bon payload et renvoie le corps", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { token: "t", email: "a@b.fr" } });
    await expect(api.login("a@b.fr", "mdp")).resolves.toEqual({ token: "t", email: "a@b.fr" });
    expect(mockRequest).toHaveBeenCalledWith("/api/admin/login", {
      method: "POST",
      body: { email: "a@b.fr", password: "mdp" },
    });
  });

  it("erreur serveur → ApiError avec le message affichable et le status", async () => {
    mockRequest.mockResolvedValueOnce({ status: 401, json: { error: "Identifiants Wimi incorrects." } });
    const err = await api.login("a@b.fr", "faux").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toBe("Identifiants Wimi incorrects.");
    expect(err.status).toBe(401);
  });

  it("acquireLock : 200 → ok, 423 → détenteur", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { expiresAt: "2026-07-04T13:00:00Z" } });
    await expect(api.acquireLock("t", "presse")).resolves.toEqual({
      ok: true, expiresAt: "2026-07-04T13:00:00Z",
    });
    mockRequest.mockResolvedValueOnce({
      status: 423,
      json: { error: "x", heldBy: "marie@tn.org", expiresAt: "2026-07-04T13:00:00Z" },
    });
    await expect(api.acquireLock("t", "presse")).resolves.toEqual({
      ok: false, heldBy: "marie@tn.org", expiresAt: "2026-07-04T13:00:00Z",
    });
  });

  it("listUploads déballe { images }", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { images: ["/uploads/presse/a-12345678.webp"] } });
    await expect(api.listUploads("t", "presse")).resolves.toEqual(["/uploads/presse/a-12345678.webp"]);
  });

  it("le token part en option de toutes les routes authentifiées", async () => {
    mockRequest.mockResolvedValueOnce({ status: 200, json: { content: [], sha: "s" } });
    await api.getContent("jwt", "presse");
    expect(mockRequest).toHaveBeenCalledWith("/api/admin/content/presse", { token: "jwt" });
  });
});

describe("versionAtLeast", () => {
  it("compare numériquement segment par segment", () => {
    expect(versionAtLeast("1.2.3", "1.2.3")).toBe(true);
    expect(versionAtLeast("1.10.0", "1.9.9")).toBe(true);
    expect(versionAtLeast("0.9.0", "1.0.0")).toBe(false);
    expect(versionAtLeast("1.0", "1.0.1")).toBe(false);
  });
});
```

- [ ] **Step 7: Implémenter `cms/src/renderer/src/lib/api.ts`**

```ts
/**
 * Endpoints typés du backend, au-dessus du pont IPC (window.cms.apiRequest —
 * le fetch réel vit dans le main : pas de CORS depuis Node).
 * Les messages d'erreur du serveur (json.error) sont en français et
 * affichables tels quels : ApiError.message les relaie.
 */

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export type DeployRun = { status: string; conclusion: string | null; url: string };

export type LockStatus =
  | { locked: false }
  | { locked: true; email: string; expiresAt: string; ownedByCaller: boolean };

export type ImageUpload = { path: string; base64: string };

function errorMessage(json: unknown, status: number): string {
  const m = (json as { error?: string } | null)?.error;
  return m ?? `Erreur serveur (${status}).`;
}

async function call<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const { status, json } = await window.cms.apiRequest(path, opts);
  if (status >= 200 && status < 300) return json as T;
  throw new ApiError(errorMessage(json, status), status);
}

export const api = {
  login: (email: string, password: string) =>
    call<{ token: string; email: string }>("/api/admin/login", {
      method: "POST",
      body: { email, password },
    }),

  status: (token: string, sha?: string) =>
    call<{ minAppVersion: string; deploy: DeployRun | null }>(
      `/api/admin/status${sha ? `?sha=${encodeURIComponent(sha)}` : ""}`,
      { token }
    ),

  getContent: (token: string, collection: string) =>
    call<{ content: unknown; sha: string }>(`/api/admin/content/${collection}`, { token }),

  putContent: (token: string, collection: string, content: unknown, images: ImageUpload[]) =>
    call<{ commitSha: string }>(`/api/admin/content/${collection}`, {
      method: "PUT",
      body: { content, images },
      token,
    }),

  lockStatus: (token: string, collection: string) =>
    call<LockStatus>(`/api/admin/lock/${collection}`, { token }),

  releaseLock: (token: string, collection: string) =>
    call<void>(`/api/admin/lock/${collection}`, { method: "DELETE", token }),

  listUploads: (token: string, collection: string) =>
    call<{ images: string[] }>(`/api/admin/uploads/${collection}`, { token }).then((r) => r.images),

  /** 423 n'est pas une erreur mais une réponse métier : union discriminée. */
  acquireLock: async (token: string, collection: string) => {
    const { status, json } = await window.cms.apiRequest(`/api/admin/lock/${collection}`, {
      method: "POST",
      token,
    });
    if (status === 200) {
      return { ok: true as const, expiresAt: (json as { expiresAt: string }).expiresAt };
    }
    if (status === 423) {
      const j = json as { heldBy: string; expiresAt: string };
      return { ok: false as const, heldBy: j.heldBy, expiresAt: j.expiresAt };
    }
    throw new ApiError(errorMessage(json, status), status);
  },
};

/** Comparaison de versions « x.y.z » (contrôle CMS_MIN_APP_VERSION). */
export function versionAtLeast(current: string, min: string): boolean {
  const a = current.split(".").map(Number);
  const b = min.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return true;
}
```

- [ ] **Step 8: Vérifier**

Run: `cd cms && npm test && npm run typecheck`
Expected: PASS partout (les 2 fichiers de tests API inclus).

- [ ] **Step 9: Commit**

```bash
git add cms/src cms/tests/api-main.test.ts cms/tests/api-renderer.test.ts
git commit -m "CMS app : couche API via IPC (fetch dans le main : pas de CORS, réveil Render géré, PUT jamais rejoué)"
```

---

### Task 5 : Pipeline image (conversion WebP, nommage, encodage)

**Files:**
- Create: `cms/src/renderer/src/lib/image.ts`
- Test: `cms/tests/image.test.ts`

**Interfaces:**
- Consumes: rien (module pur + APIs navigateur).
- Produces (utilisé par la Task 6) :
  - `MAX_WIDTH = 1920`, `MAX_IMAGE_BYTES = 4 * 1024 * 1024`
  - `slugify(fileName: string): string` — minuscules ASCII, jamais vide.
  - `toBase64(bytes: Uint8Array): string`
  - `finalizeImage(collection: string, originalName: string, bytes: Uint8Array): Promise<{ path: string; base64: string } | { error: string }>` — `path` **sans** slash initial (`uploads/<collection>/<slug>-<hash8>.webp`, conforme à la regex serveur) ; la valeur stockée dans le JSON est `"/" + path`.
  - `convertToWebp(file: File): Promise<Uint8Array>` — redimensionne à 1920 px max, WebP qualité 0,8 (canvas — non testable sous jsdom, volontairement le plus mince possible).

- [ ] **Step 1: Écrire les tests**

Créer `cms/tests/image.test.ts` :

```ts
import { webcrypto } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { finalizeImage, MAX_IMAGE_BYTES, slugify, toBase64 } from "@/lib/image";

beforeAll(() => {
  // jsdom ne fournit pas crypto.subtle : on branche celui de Node.
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  }
});

describe("slugify", () => {
  it("minuscules ASCII, extension retirée, accents translittérés", () => {
    expect(slugify("Atelier Robots — Édition 2026.JPG")).toBe("atelier-robots-edition-2026");
    expect(slugify("photo.png")).toBe("photo");
  });
  it("jamais vide ni bord de tiret", () => {
    expect(slugify("---.png")).toBe("image");
    expect(slugify("é.png")).toBe("e");
  });
});

describe("toBase64", () => {
  it("encode correctement (aller-retour)", () => {
    const bytes = new Uint8Array([82, 73, 70, 70, 0, 255]);
    expect(atob(toBase64(bytes)).split("").map((c) => c.charCodeAt(0))).toEqual([82, 73, 70, 70, 0, 255]);
  });
});

describe("finalizeImage", () => {
  const webp = new Uint8Array(16);
  webp.set([0x52, 0x49, 0x46, 0x46], 0); // "RIFF"
  webp.set([0x57, 0x45, 0x42, 0x50], 8); // "WEBP"

  it("produit un chemin conforme à la regex du serveur", async () => {
    const result = await finalizeImage("presse", "Atelier Robots.png", webp);
    if ("error" in result) throw new Error(result.error);
    expect(result.path).toMatch(/^uploads\/presse\/atelier-robots-[a-f0-9]{8}\.webp$/);
    expect(result.base64).toBe(toBase64(webp));
  });

  it("même contenu → même hash (nom stable, pas de doublon)", async () => {
    const a = await finalizeImage("presse", "x.png", webp);
    const b = await finalizeImage("presse", "x.png", webp);
    expect(a).toEqual(b);
  });

  it("refuse au-delà de 4 Mo après compression", async () => {
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    const result = await finalizeImage("presse", "x.png", big);
    expect("error" in result && result.error).toContain("4 Mo");
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/image.test.ts`
Expected: FAIL — `@/lib/image` introuvable.

- [ ] **Step 3: Implémenter `cms/src/renderer/src/lib/image.ts`**

```ts
/**
 * Pipeline image du CMS (spec §6) — tout se passe dans l'app :
 * redimensionnement ≤ 1920 px, conversion WebP qualité ~0,8 (canvas
 * Chromium), nommage <slug>-<hash8>.webp, refus > 4 Mo après compression.
 * L'image ne part au serveur qu'à la publication, dans le commit unique.
 *
 * Le chemin renvoyé est SANS slash initial (contrat du backend :
 * `uploads/<collection>/<slug>-<hash8>.webp`) ; le JSON de contenu stocke
 * `"/" + path` (affiché par le site via lib/asset.ts).
 */

export const MAX_WIDTH = 1920;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const WEBP_QUALITY = 0.8;

/** Slug ASCII minuscule à partir d'un nom de fichier. Jamais vide. */
export function slugify(fileName: string): string {
  const slug = fileName
    .replace(/\.[^.]+$/, "") // extension
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "image";
}

/** Uint8Array → base64 (par blocs : String.fromCharCode a une limite d'arguments). */
export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

/** Nom, chemin et base64 d'une image déjà convertie. Erreur si trop lourde. */
export async function finalizeImage(
  collection: string,
  originalName: string,
  bytes: Uint8Array
): Promise<{ path: string; base64: string } | { error: string }> {
  if (bytes.length > MAX_IMAGE_BYTES) {
    return { error: "Image trop lourde après compression (max 4 Mo) — réduisez-la avant l'import." };
  }
  const digest = await crypto.subtle.digest("SHA-256", bytes.slice().buffer);
  const hash = [...new Uint8Array(digest)]
    .slice(0, 4)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return {
    path: `uploads/${collection}/${slugify(originalName)}-${hash}.webp`,
    base64: toBase64(bytes),
  };
}

/**
 * Fichier choisi → WebP ≤ 1920 px de large. Couche canvas volontairement
 * minimale (non testable sous jsdom) : toute la logique testable est dans
 * finalizeImage/slugify/toBase64.
 */
export async function convertToWebp(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );
  if (!blob) throw new Error("Conversion WebP impossible");
  return new Uint8Array(await blob.arrayBuffer());
}
```

- [ ] **Step 4: Vérifier**

Run: `cd cms && npm test -- tests/image.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add cms/src/renderer/src/lib/image.ts cms/tests/image.test.ts
git commit -m "CMS app : pipeline image (WebP ≤1920px via canvas, nommage slug-hash8, limite 4 Mo)"
```

---

### Task 6 : Moteur de formulaires — logique pure + widgets + `ItemForm`

**Files:**
- Create: `cms/src/renderer/src/lib/form.ts`
- Create: `cms/src/renderer/src/components/FieldInput.tsx`, `cms/src/renderer/src/components/ImageField.tsx`, `cms/src/renderer/src/components/ItemForm.tsx`
- Test: `cms/tests/form.test.ts`, `cms/tests/widgets.test.tsx`

**Interfaces:**
- Consumes: `registry`, `RegistryEntry`, `FieldMeta` (`@site/content/registry`) ; `convertToWebp`, `finalizeImage` (Task 5).
- Produces (utilisé par les Tasks 8-10) :
  - `emptyItem(entry: RegistryEntry): Record<string, unknown>` — `id` auto (`crypto.randomUUID()`) si le schéma en a un ; défauts par widget (`year` → année courante, `paragraphs` → `[]`, sinon `""` ; champs optionnels absents).
  - `fieldErrors(entry: RegistryEntry, item: unknown): Record<string, string>` — 1ᵉʳ message Zod par champ, `{}` si valide.
  - `itemLabel(entry: RegistryEntry, item: unknown): string`
  - `moveItem<T>(list: T[], index: number, delta: number): T[]` — hors bornes → liste inchangée.
  - `groupedRegistry(): [string, [string, RegistryEntry][]][]` — entrées par groupe, ordre du registre.
  - `<FieldInput name meta value error readOnly onChange />` — widgets `text|textarea|month|year|url|paragraphs` ; champ optionnel vidé → `onChange(undefined)`.
  - `<ImageField name meta value error readOnly collection images library onChange onImageReady />` — `images: Record<string, string>` (chemin sans slash → base64 en attente), `library: string[]` (chemins `/uploads/…` existants), `onImageReady(path, base64)`.
  - `<ItemForm entry collection item errors readOnly images library onChange onImageReady />`.

- [ ] **Step 1: Écrire les tests de la logique pure**

Créer `cms/tests/form.test.ts` :

```ts
import { describe, expect, it } from "vitest";
import { registry } from "@site/content/registry";
import { emptyItem, fieldErrors, groupedRegistry, itemLabel, moveItem } from "@/lib/form";

describe("emptyItem", () => {
  it("génère un id pour les schémas qui en ont un, valeurs par widget", () => {
    const item = emptyItem(registry.presse);
    expect(typeof item.id).toBe("string");
    expect((item.id as string).length).toBeGreaterThan(0);
    expect(item.title).toBe("");
    expect(item).not.toHaveProperty("url"); // optionnel → absent
  });

  it("pas d'id si le schéma n'en a pas ; year → année courante ; paragraphs → []", () => {
    const item = emptyItem(registry.retrospectives);
    expect(item).not.toHaveProperty("id");
    expect(item.year).toBe(new Date().getFullYear());
    expect(item.paragraphs).toEqual([]);
  });
});

describe("fieldErrors", () => {
  it("mappe le premier message Zod de chaque champ fautif", () => {
    const errors = fieldErrors(registry.presse, { id: "x", title: "", source: "s", date: "juin" });
    expect(Object.keys(errors).sort()).toEqual(["date", "title"]);
    expect(errors.date).toContain("YYYY-MM");
  });

  it("objet vide si l'élément est valide", () => {
    expect(
      fieldErrors(registry.presse, { id: "x", title: "T", source: "S", date: "2026-06" })
    ).toEqual({});
  });
});

describe("itemLabel / moveItem / groupedRegistry", () => {
  it("itemLabel délègue à itemTitle, jamais d'exception", () => {
    expect(itemLabel(registry.presse, { title: "Un article" })).toBe("Un article");
    expect(itemLabel(registry.presse, null)).toBe("");
  });

  it("moveItem déplace, et ignore hors bornes", () => {
    expect(moveItem([1, 2, 3], 0, +1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 2, +1)).toEqual([1, 2, 3]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
  });

  it("groupedRegistry regroupe les 4 collections sous Actualités", () => {
    const groups = groupedRegistry();
    const actus = groups.find(([g]) => g === "Actualités");
    expect(actus?.[1]).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/form.test.ts`
Expected: FAIL — `@/lib/form` introuvable.

- [ ] **Step 3: Implémenter `cms/src/renderer/src/lib/form.ts`**

```ts
/**
 * Moteur de formulaires : tout est dérivé du registre (spec §4 — le CMS ne
 * connaît aucune collection en dur). Logique pure, séparée des composants.
 */

import type { FieldMeta, RegistryEntry } from "@site/content/registry";
import { registry } from "@site/content/registry";

function defaultValue(meta: FieldMeta): unknown {
  if (meta.optional) return undefined;
  switch (meta.widget) {
    case "year":
      return new Date().getFullYear();
    case "paragraphs":
      return [];
    default:
      return ""; // text, textarea, month, url, image
  }
}

/** Nouvel élément : défauts par widget, id auto si le schéma en déclare un. */
export function emptyItem(entry: RegistryEntry): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  const shape = (entry.schema as unknown as { shape?: Record<string, unknown> }).shape ?? {};
  if ("id" in shape) item.id = crypto.randomUUID(); // jamais saisi (cf. content/registry.ts)
  for (const [name, meta] of Object.entries(entry.fields)) {
    const value = defaultValue(meta);
    if (value !== undefined) item[name] = value;
  }
  return item;
}

/** Erreurs Zod par champ (1er message de chaque champ), mêmes messages que le build. */
export function fieldErrors(entry: RegistryEntry, item: unknown): Record<string, string> {
  const result = entry.schema.safeParse(item);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}

export function itemLabel(entry: RegistryEntry, item: unknown): string {
  try {
    return entry.itemTitle?.(item) ?? "";
  } catch {
    return "";
  }
}

/** Déplacement d'un élément dans une liste (réordonnancement ↑/↓). */
export function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

/** Entrées du registre par groupe (barre latérale), dans l'ordre du registre. */
export function groupedRegistry(): [string, [string, RegistryEntry][]][] {
  const groups = new Map<string, [string, RegistryEntry][]>();
  for (const [key, entry] of Object.entries(registry)) {
    const list = groups.get(entry.group) ?? [];
    list.push([key, entry]);
    groups.set(entry.group, list);
  }
  return [...groups.entries()];
}
```

- [ ] **Step 4: Vérifier**

Run: `cd cms && npm test -- tests/form.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Écrire les tests des widgets**

Créer `cms/tests/widgets.test.tsx` :

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FieldInput } from "@/components/FieldInput";

afterEach(cleanup);

describe("FieldInput", () => {
  it("champ texte : label + saisie → onChange(valeur)", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="title" meta={{ label: "Titre", widget: "text" }} value=""
        readOnly={false} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText("Titre"), { target: { value: "Bonjour" } });
    expect(onChange).toHaveBeenCalledWith("Bonjour");
  });

  it("champ optionnel vidé → onChange(undefined)", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="url" meta={{ label: "Lien", widget: "url", optional: true }} value="https://x"
        readOnly={false} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText(/Lien/), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("year : valeur numérique", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="year" meta={{ label: "Année", widget: "year" }} value={2026}
        readOnly={false} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText("Année"), { target: { value: "2027" } });
    expect(onChange).toHaveBeenCalledWith(2027);
  });

  it("paragraphs : ajout d'un paragraphe", () => {
    const onChange = vi.fn();
    render(
      <FieldInput name="paragraphs" meta={{ label: "Paragraphes", widget: "paragraphs" }}
        value={["Premier"]} readOnly={false} onChange={onChange} />
    );
    fireEvent.click(screen.getByText("Ajouter un paragraphe"));
    expect(onChange).toHaveBeenCalledWith(["Premier", ""]);
  });

  it("readOnly : pas de boutons d'action sur les paragraphes", () => {
    render(
      <FieldInput name="paragraphs" meta={{ label: "Paragraphes", widget: "paragraphs" }}
        value={["Premier"]} readOnly={true} onChange={vi.fn()} />
    );
    expect(screen.queryByText("Ajouter un paragraphe")).toBeNull();
  });

  it("affiche l'erreur de validation", () => {
    render(
      <FieldInput name="date" meta={{ label: "Date", widget: "month" }} value="juin"
        error="Format attendu : YYYY-MM" readOnly={false} onChange={vi.fn()} />
    );
    expect(screen.getByRole("alert").textContent).toContain("YYYY-MM");
  });
});
```

- [ ] **Step 6: Vérifier l'échec**

Run: `cd cms && npm test -- tests/widgets.test.tsx`
Expected: FAIL — composant introuvable.

- [ ] **Step 7: Implémenter les composants**

Créer `cms/src/renderer/src/components/FieldInput.tsx` :

```tsx
/**
 * Un champ de formulaire d'après sa FieldMeta du registre. Widgets v1 hors
 * image (widget à part : ImageField). Validation affichée sous le champ ;
 * un champ optionnel vidé devient `undefined` (les schémas utilisent
 * .optional(), pas des chaînes vides).
 */

import type { FieldMeta } from "@site/content/registry";
import { moveItem } from "../lib/form";

type Props = {
  name: string;
  meta: FieldMeta;
  value: unknown;
  error?: string;
  readOnly: boolean;
  onChange: (value: unknown) => void;
};

export function FieldInput({ name, meta, value, error, readOnly, onChange }: Props) {
  const id = `field-${name}`;
  const text = (v: string) => onChange(meta.optional && v === "" ? undefined : v);

  return (
    <div className="field">
      <label htmlFor={id}>
        {meta.label}
        {meta.optional ? <span className="muted"> (optionnel)</span> : null}
      </label>
      {meta.widget === "textarea" ? (
        <textarea id={id} rows={6} value={(value as string) ?? ""} readOnly={readOnly}
          onChange={(e) => text(e.target.value)} />
      ) : meta.widget === "year" ? (
        <input id={id} type="number" value={(value as number) ?? ""} readOnly={readOnly}
          onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)} />
      ) : meta.widget === "paragraphs" ? (
        <ParagraphsInput id={id} value={(value as string[]) ?? []} readOnly={readOnly}
          onChange={onChange} />
      ) : (
        <input id={id}
          type={meta.widget === "month" ? "month" : meta.widget === "url" ? "url" : "text"}
          value={(value as string) ?? ""} readOnly={readOnly}
          onChange={(e) => text(e.target.value)} />
      )}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </div>
  );
}

function ParagraphsInput({ id, value, readOnly, onChange }: {
  id: string;
  value: string[];
  readOnly: boolean;
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="paragraphs" id={id}>
      {value.map((paragraph, i) => (
        <div key={i} className="paragraph-row">
          <textarea rows={3} value={paragraph} readOnly={readOnly} aria-label={`Paragraphe ${i + 1}`}
            onChange={(e) => onChange(value.map((p, j) => (j === i ? e.target.value : p)))} />
          {!readOnly && (
            <span className="row-actions">
              <button type="button" disabled={i === 0}
                onClick={() => onChange(moveItem(value, i, -1))}>↑</button>
              <button type="button" disabled={i === value.length - 1}
                onClick={() => onChange(moveItem(value, i, +1))}>↓</button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                Supprimer
              </button>
            </span>
          )}
        </div>
      ))}
      {!readOnly && (
        <button type="button" onClick={() => onChange([...value, ""])}>
          Ajouter un paragraphe
        </button>
      )}
    </div>
  );
}
```

Créer `cms/src/renderer/src/components/ImageField.tsx` :

```tsx
/**
 * Widget image (spec §6) : téléverser (converti WebP localement) ou choisir
 * dans la bibliothèque des images déjà publiées. La valeur du champ est le
 * chemin JSON (« /uploads/… ») ; les octets d'une nouvelle image restent
 * dans le brouillon (`images`) jusqu'à la publication.
 */

import { useState } from "react";
import type { FieldMeta } from "@site/content/registry";
import { convertToWebp, finalizeImage } from "../lib/image";

const SITE_BASE = import.meta.env.VITE_SITE_BASE ?? "https://terra-numerica.org";

type Props = {
  name: string;
  meta: FieldMeta;
  value: string | undefined;
  error?: string;
  readOnly: boolean;
  collection: string;
  /** Images en attente de publication : chemin (sans « / ») → base64. */
  images: Record<string, string>;
  /** Chemins « /uploads/… » déjà publiés (bibliothèque). */
  library: string[];
  onChange: (value: string | undefined) => void;
  onImageReady: (path: string, base64: string) => void;
};

export function ImageField({
  name, meta, value, error, readOnly, collection, images, library, onChange, onImageReady,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Aperçu : image en attente (data URI) ou image publiée (site en ligne).
  const pending = value ? images[value.slice(1)] : undefined;
  const src = !value ? null : pending ? `data:image/webp;base64,${pending}` : `${SITE_BASE}${value}`;

  async function pick(file: File) {
    setLocalError(null);
    setBusy(true);
    try {
      const bytes = await convertToWebp(file);
      const result = await finalizeImage(collection, file.name, bytes);
      if ("error" in result) {
        setLocalError(result.error);
        return;
      }
      onImageReady(result.path, result.base64);
      onChange(`/${result.path}`);
    } catch {
      setLocalError("Impossible de lire cette image — choisissez un fichier image valide.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <label htmlFor={`field-${name}`}>
        {meta.label}
        {meta.optional ? <span className="muted"> (optionnel)</span> : null}
      </label>
      {src && <img className="image-preview" src={src} alt="" />}
      {!readOnly && (
        <div className="image-actions">
          <input id={`field-${name}`} type="file" accept="image/*" disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pick(file);
              e.target.value = "";
            }} />
          {library.length > 0 && (
            <select value="" onChange={(e) => e.target.value && onChange(e.target.value)}>
              <option value="">Choisir une image existante…</option>
              {library.map((p) => (
                <option key={p} value={p}>{p.split("/").pop()}</option>
              ))}
            </select>
          )}
          {value && meta.optional && (
            <button type="button" onClick={() => onChange(undefined)}>Retirer l'image</button>
          )}
        </div>
      )}
      {busy && <p className="muted">Conversion de l'image…</p>}
      {(localError ?? error) && <p className="field-error" role="alert">{localError ?? error}</p>}
    </div>
  );
}
```

Créer `cms/src/renderer/src/components/ItemForm.tsx` :

```tsx
/**
 * Formulaire d'un élément (ou d'un singleton), généré depuis entry.fields.
 * Ajouter un champ au registre = il apparaît ici, sans toucher à ce code.
 */

import type { RegistryEntry } from "@site/content/registry";
import { FieldInput } from "./FieldInput";
import { ImageField } from "./ImageField";

type Props = {
  entry: RegistryEntry;
  collection: string;
  item: Record<string, unknown>;
  errors: Record<string, string>;
  readOnly: boolean;
  images: Record<string, string>;
  library: string[];
  onChange: (item: Record<string, unknown>) => void;
  onImageReady: (path: string, base64: string) => void;
};

export function ItemForm({
  entry, collection, item, errors, readOnly, images, library, onChange, onImageReady,
}: Props) {
  return (
    <form className="item-form" onSubmit={(e) => e.preventDefault()}>
      {Object.entries(entry.fields).map(([name, meta]) =>
        meta.widget === "image" ? (
          <ImageField key={name} name={name} meta={meta} collection={collection}
            value={item[name] as string | undefined} error={errors[name]} readOnly={readOnly}
            images={images} library={library}
            onChange={(v) => onChange({ ...item, [name]: v })}
            onImageReady={onImageReady} />
        ) : (
          <FieldInput key={name} name={name} meta={meta} value={item[name]}
            error={errors[name]} readOnly={readOnly}
            onChange={(v) => onChange({ ...item, [name]: v })} />
        )
      )}
    </form>
  );
}
```

- [ ] **Step 8: Vérifier**

Run: `cd cms && npm test && npm run typecheck`
Expected: PASS partout (dont les 6 tests de widgets).

- [ ] **Step 9: Commit**

```bash
git add cms/src/renderer/src/lib/form.ts cms/src/renderer/src/components cms/tests/form.test.ts cms/tests/widgets.test.tsx
git commit -m "CMS app : formulaires générés depuis le registre (widgets v1, validation Zod en direct, widget image)"
```

---

### Task 7 : Session + écran de connexion

**Files:**
- Create: `cms/src/renderer/src/lib/session.ts`, `cms/src/renderer/src/components/LoginScreen.tsx`
- Test: `cms/tests/login.test.tsx`

**Interfaces:**
- Consumes: `api`, `ApiError` (Task 4) ; `window.cms` (Task 3).
- Produces (utilisé par les Tasks 8-10) :
  - `type Session = { token: string; email: string }`
  - `useSession(): { session: Session | null | undefined; login(email, password): Promise<void>; logout(): Promise<void> }` — `undefined` = restauration en cours ; la session `{token, email}` est stockée en JSON via `window.cms.setToken`.
  - `<LoginScreen onLogin={(email, password) => Promise<void>} />` — au-delà de 8 s d'attente, affiche « Réveil du serveur… ».

- [ ] **Step 1: Écrire les tests**

Créer `cms/tests/login.test.tsx` :

```tsx
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import { LoginScreen } from "@/components/LoginScreen";

afterEach(cleanup);
beforeEach(() => {
  (window as unknown as { cms: unknown }).cms = {};
});

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText("Email Wimi"), { target: { value: "a@b.fr" } });
  fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "mdp" } });
  fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));
}

describe("LoginScreen", () => {
  it("soumet email + mot de passe", async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<LoginScreen onLogin={onLogin} />);
    fillAndSubmit();
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith("a@b.fr", "mdp"));
  });

  it("affiche le message serveur d'une ApiError (401, 403, 429, 502…)", async () => {
    const onLogin = vi.fn().mockRejectedValue(new ApiError("Identifiants Wimi incorrects.", 401));
    render(<LoginScreen onLogin={onLogin} />);
    fillAndSubmit();
    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      "Identifiants Wimi incorrects."
    );
  });

  it("erreur réseau (pas ApiError) → message générique", async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error("fetch failed"));
    render(<LoginScreen onLogin={onLogin} />);
    fillAndSubmit();
    expect((await screen.findByRole("alert")).textContent).toContain("injoignable");
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/login.test.tsx`
Expected: FAIL — composants introuvables.

- [ ] **Step 3: Implémenter**

Créer `cms/src/renderer/src/lib/session.ts` :

```ts
/**
 * Session CMS : JWT 12 h + email, persistés via le coffre-fort de l'OS
 * (window.cms → safeStorage côté main). `undefined` = restauration en cours.
 */

import { useEffect, useState } from "react";
import { api } from "./api";

export type Session = { token: string; email: string };

export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    void window.cms.getToken().then((stored) => {
      try {
        setSession(stored ? (JSON.parse(stored) as Session) : null);
      } catch {
        setSession(null); // stockage illisible → reconnexion
      }
    });
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const result = await api.login(email, password);
    const next: Session = { token: result.token, email: result.email };
    await window.cms.setToken(JSON.stringify(next));
    setSession(next);
  }

  async function logout(): Promise<void> {
    await window.cms.clearToken();
    setSession(null);
  }

  return { session, login, logout };
}
```

Créer `cms/src/renderer/src/components/LoginScreen.tsx` :

```tsx
/**
 * Connexion par identifiants Wimi. Le mot de passe part au backend (HTTPS)
 * qui le relaie à Wimi — jamais stocké. Au-delà de 8 s, la lenteur est
 * presque sûrement le réveil du serveur Render (plan free) : on l'affiche.
 */

import { useRef, useState } from "react";
import { ApiError } from "../lib/api";

const WAKING_HINT_MS = 8_000;

export function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wakingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    wakingTimer.current = setTimeout(() => setWaking(true), WAKING_HINT_MS);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Serveur injoignable — vérifiez votre connexion internet puis réessayez."
      );
    } finally {
      clearTimeout(wakingTimer.current);
      setPending(false);
      setWaking(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1>Terra Numerica — CMS</h1>
        <p className="muted">Connectez-vous avec votre compte Wimi.</p>
        <div className="field">
          <label htmlFor="login-email">Email Wimi</label>
          <input id="login-email" type="email" required value={email} disabled={pending}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="login-password">Mot de passe</label>
          <input id="login-password" type="password" required value={password} disabled={pending}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </button>
        {waking && (
          <p className="muted">Réveil du serveur… (jusqu'à une minute, merci de patienter)</p>
        )}
        {error && <p className="field-error" role="alert">{error}</p>}
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Vérifier**

Run: `cd cms && npm test -- tests/login.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add cms/src/renderer/src/lib/session.ts cms/src/renderer/src/components/LoginScreen.tsx cms/tests/login.test.tsx
git commit -m "CMS app : session (JWT en safeStorage) + écran de connexion Wimi avec indication du réveil Render"
```

---

### Task 8 : Coquille de l'app — contrôle de version, barre latérale, styles

**Files:**
- Create: `cms/src/renderer/src/components/Shell.tsx`
- Modify: `cms/src/renderer/src/App.tsx`, `cms/src/renderer/src/styles.css`
- Test: `cms/tests/shell.test.tsx`

**Interfaces:**
- Consumes: `useSession` (Task 7), `api`, `ApiError`, `versionAtLeast` (Task 4), `groupedRegistry` (Task 6), `window.cms.appVersion` (Task 3).
- Produces: `<Shell session onLogout />` — au montage, `api.status` + `appVersion()` : version trop ancienne → écran bloquant « Mise à jour requise » (spec §8) ; 401 → `onLogout` ; sinon barre latérale par groupes. La zone principale affiche un texte provisoire — la Task 9 y branche `CollectionScreen`.

- [ ] **Step 1: Écrire les tests**

Créer `cms/tests/shell.test.tsx` :

```tsx
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api")>();
  return { ...mod, api: { ...mod.api, status: vi.fn() } };
});

import { api } from "@/lib/api";
import { Shell } from "@/components/Shell";

const mockStatus = vi.mocked(api.status);
const session = { token: "jwt", email: "a@b.fr" };

afterEach(cleanup);
beforeEach(() => {
  mockStatus.mockReset();
  (window as unknown as { cms: unknown }).cms = { appVersion: vi.fn().mockResolvedValue("0.1.0") };
});

describe("Shell", () => {
  it("version suffisante → barre latérale avec les groupes du registre", async () => {
    mockStatus.mockResolvedValueOnce({ minAppVersion: "0.1.0", deploy: null });
    render(<Shell session={session} onLogout={vi.fn()} />);
    expect(await screen.findByText("Actualités")).toBeTruthy();
    expect(screen.getByText("Revue de presse")).toBeTruthy();
    expect(screen.getByText("a@b.fr")).toBeTruthy();
  });

  it("app trop ancienne → écran bloquant de mise à jour", async () => {
    mockStatus.mockResolvedValueOnce({ minAppVersion: "2.0.0", deploy: null });
    render(<Shell session={session} onLogout={vi.fn()} />);
    expect(await screen.findByText("Mise à jour requise")).toBeTruthy();
    expect(screen.queryByText("Revue de presse")).toBeNull();
  });

  it("401 au démarrage (JWT expiré) → onLogout", async () => {
    const { ApiError } = await import("@/lib/api");
    const onLogout = vi.fn();
    mockStatus.mockRejectedValueOnce(new ApiError("Non authentifié.", 401));
    render(<Shell session={session} onLogout={onLogout} />);
    await vi.waitFor(() => expect(onLogout).toHaveBeenCalled());
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/shell.test.tsx`
Expected: FAIL — `Shell` introuvable.

- [ ] **Step 3: Implémenter `cms/src/renderer/src/components/Shell.tsx`**

```tsx
/**
 * Coquille : contrôle de version au démarrage (le backend impose
 * CMS_MIN_APP_VERSION — une app aux schémas périmés est bloquée, spec §8),
 * puis barre latérale générée depuis le registre.
 */

import { useEffect, useState } from "react";
import { api, ApiError, versionAtLeast } from "../lib/api";
import { groupedRegistry } from "../lib/form";
import type { Session } from "../lib/session";

type Gate = "checking" | "ok" | "outdated" | "offline";

export function Shell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [gate, setGate] = useState<Gate>("checking");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [status, version] = await Promise.all([
          api.status(session.token),
          window.cms.appVersion(),
        ]);
        if (cancelled) return;
        setGate(versionAtLeast(version, status.minAppVersion) ? "ok" : "outdated");
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          onLogout(); // JWT expiré → retour au login
          return;
        }
        setGate("offline");
      }
    })();
    return () => { cancelled = true; };
  }, [session.token, onLogout]);

  if (gate === "checking") {
    return <p className="centered">Connexion au serveur… (le réveil peut prendre une minute)</p>;
  }
  if (gate === "outdated") {
    return (
      <div className="centered">
        <h1>Mise à jour requise</h1>
        <p>
          Cette version de l'application est trop ancienne pour le serveur.
          Téléchargez la dernière version puis relancez.
        </p>
      </div>
    );
  }
  if (gate === "offline") {
    return (
      <div className="centered">
        <p>Serveur injoignable — vérifiez votre connexion puis relancez l'application.</p>
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <header>
          <strong>Terra Numerica — CMS</strong>
          <span className="muted">{session.email}</span>
        </header>
        <nav>
          {groupedRegistry().map(([group, entries]) => (
            <section key={group}>
              <h2>{group}</h2>
              {entries.map(([key, entry]) => (
                <button key={key} className={selected === key ? "active" : ""}
                  onClick={() => setSelected(key)}>
                  {entry.label}
                </button>
              ))}
            </section>
          ))}
        </nav>
        <button className="logout" onClick={onLogout}>Se déconnecter</button>
      </aside>
      <main>
        {selected ? (
          /* Remplacé par <CollectionScreen> en Task 9. */
          <p className="centered">{selected}</p>
        ) : (
          <p className="centered">Choisissez un contenu à modifier dans le menu.</p>
        )}
      </main>
    </div>
  );
}
```

Remplacer `cms/src/renderer/src/App.tsx` :

```tsx
import { LoginScreen } from "./components/LoginScreen";
import { Shell } from "./components/Shell";
import { useSession } from "./lib/session";

export default function App() {
  const { session, login, logout } = useSession();

  if (session === undefined) return <p className="centered">Chargement…</p>;
  if (session === null) return <LoginScreen onLogin={login} />;
  return <Shell session={session} onLogout={() => void logout()} />;
}
```

Remplacer `cms/src/renderer/src/styles.css` :

```css
/* CMS Terra Numerica — styles sobres, lisibles pour des non-techniciens. */

* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: #1a1a2e; background: #f6f7fb; }
button { font: inherit; cursor: pointer; }
h1 { font-size: 1.3rem; }

.centered { display: grid; place-items: center; min-height: 100vh; text-align: center; padding: 2rem; }
.muted { color: #667; font-size: 0.85rem; }

/* Connexion */
.login { display: grid; place-items: center; min-height: 100vh; }
.login form { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,.08); width: min(360px, 90vw); display: grid; gap: 0.75rem; }

/* Coquille */
.shell { display: grid; grid-template-columns: 240px 1fr; min-height: 100vh; }
.sidebar { background: #1a1a2e; color: #eee; display: flex; flex-direction: column; padding: 1rem; gap: 1rem; }
.sidebar header { display: grid; gap: 0.25rem; }
.sidebar h2 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #99a; margin: 0.75rem 0 0.25rem; }
.sidebar nav { flex: 1; display: grid; align-content: start; gap: 2px; }
.sidebar nav button { display: block; width: 100%; text-align: left; background: none; border: 0; color: #dde; padding: 0.45rem 0.6rem; border-radius: 6px; }
.sidebar nav button:hover { background: #2a2a44; }
.sidebar nav button.active { background: #3d5afe; color: #fff; }
.sidebar .logout { background: none; border: 1px solid #556; color: #dde; padding: 0.45rem; border-radius: 6px; }
main { padding: 1.5rem; overflow-y: auto; }
main .centered { min-height: 60vh; }

/* Écran de collection */
.screen-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.banner { padding: 0.6rem 0.9rem; border-radius: 6px; display: flex; align-items: center; gap: 0.75rem; }
.banner-lock { background: #fff3e0; border: 1px solid #ffb74d; }
.banner-draft { background: #e3f2fd; border: 1px solid #64b5f6; }
.collection-layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; margin-top: 1rem; }
.item-list { display: grid; gap: 0.5rem; align-content: start; }
.item-list ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.item-list li { display: flex; align-items: center; gap: 0.25rem; border-radius: 6px; }
.item-list li.active { background: #e8eaf6; }
.item-title { flex: 1; text-align: left; background: none; border: 0; padding: 0.45rem 0.6rem; }
.row-actions button, .item-actions button { background: none; border: 1px solid #ccd; border-radius: 4px; padding: 0.1rem 0.4rem; }

/* Formulaires */
.item-form { display: grid; gap: 1rem; background: #fff; padding: 1.25rem; border-radius: 8px; max-width: 640px; }
.field { display: grid; gap: 0.3rem; }
.field label { font-weight: 600; font-size: 0.9rem; }
.field input, .field textarea, .field select { font: inherit; padding: 0.45rem 0.6rem; border: 1px solid #ccd; border-radius: 6px; width: 100%; }
.field-error { color: #c62828; font-size: 0.85rem; margin: 0; }
.paragraphs { display: grid; gap: 0.5rem; }
.paragraph-row { display: grid; gap: 0.25rem; }
.image-preview { max-width: 320px; border-radius: 6px; border: 1px solid #ccd; }
.image-actions { display: grid; gap: 0.5rem; }

/* Publication */
.primary { background: #3d5afe; color: #fff; border: 0; padding: 0.55rem 1.1rem; border-radius: 6px; }
.primary:disabled { opacity: 0.5; cursor: default; }
.publish-bar { margin-top: 1rem; display: grid; gap: 0.5rem; justify-items: start; }
.deploy-badge { padding: 0.4rem 0.8rem; border-radius: 999px; font-size: 0.85rem; margin: 0; }
.deploy-pending { background: #fff8e1; border: 1px solid #ffd54f; }
.deploy-ok { background: #e8f5e9; border: 1px solid #81c784; }
.deploy-error { background: #ffebee; border: 1px solid #e57373; }
```

- [ ] **Step 4: Vérifier**

Run: `cd cms && npm test && npm run typecheck`
Expected: PASS partout (dont les 3 tests du Shell).

Run (si session graphique) : `cd cms && npm run dev`
Expected: écran de connexion visible ; sans identifiants valides on s'arrête là (les vraies routes exigent le backend configuré). Sinon noter « vérification visuelle non faite ».

- [ ] **Step 5: Commit**

```bash
git add cms/src/renderer/src cms/tests/shell.test.tsx
git commit -m "CMS app : coquille (contrôle de version bloquant, barre latérale par groupes du registre, styles)"
```

---

### Task 9 : Écran de collection — lecture, verrous, édition, brouillons locaux

Le cœur de l'app : liste + formulaire, lecture seule tant qu'on n'a pas le verrou, brouillon local dès la première modification.

**Files:**
- Create: `cms/src/renderer/src/components/CollectionScreen.tsx`
- Modify: `cms/src/renderer/src/components/Shell.tsx` (brancher l'écran)
- Test: `cms/tests/collection.test.tsx`

**Interfaces:**
- Consumes: `api`, `ApiError`, `LockStatus` (Task 4) ; `emptyItem`, `fieldErrors`, `itemLabel`, `moveItem` (Task 6) ; `ItemForm` (Task 6) ; `window.cms.readDraft/writeDraft/deleteDraft` (Task 3) ; `Session` (Task 7).
- Produces (utilisé par la Task 10) :
  - `type Draft = { content: unknown; images: Record<string, string>; savedAt: string }` (exporté).
  - `DRAFT_SAVE_DELAY_MS = 500` (exporté, débounce d'autosauvegarde).
  - `<CollectionScreen collection session onAuthExpired />` — la Task 10 y insérera `<PublishBar>` (point d'insertion marqué par un commentaire).

- [ ] **Step 1: Écrire les tests**

Créer `cms/tests/collection.test.tsx` :

```tsx
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...mod,
    api: {
      ...mod.api,
      getContent: vi.fn(),
      lockStatus: vi.fn(),
      acquireLock: vi.fn(),
      releaseLock: vi.fn(),
      listUploads: vi.fn(),
    },
  };
});

import { api } from "@/lib/api";
import { CollectionScreen } from "@/components/CollectionScreen";

const mocked = {
  getContent: vi.mocked(api.getContent),
  lockStatus: vi.mocked(api.lockStatus),
  acquireLock: vi.mocked(api.acquireLock),
  listUploads: vi.mocked(api.listUploads),
};

const session = { token: "jwt", email: "a@b.fr" };
const future = new Date(Date.now() + 3_600_000).toISOString();
const presse = [
  { id: "p1", title: "Premier article", source: "Nice-Matin", date: "2026-06" },
  { id: "p2", title: "Deuxième article", source: "Var-Matin", date: "2026-05" },
];

let cmsStub: { readDraft: ReturnType<typeof vi.fn>; writeDraft: ReturnType<typeof vi.fn>; deleteDraft: ReturnType<typeof vi.fn> };

afterEach(cleanup);
beforeEach(() => {
  Object.values(mocked).forEach((m) => m.mockReset());
  mocked.getContent.mockResolvedValue({ content: presse, sha: "sha1" });
  mocked.lockStatus.mockResolvedValue({ locked: false });
  mocked.listUploads.mockResolvedValue([]);
  cmsStub = {
    readDraft: vi.fn().mockResolvedValue(null),
    writeDraft: vi.fn().mockResolvedValue(undefined),
    deleteDraft: vi.fn().mockResolvedValue(undefined),
  };
  (window as unknown as { cms: unknown }).cms = cmsStub;
});

function renderScreen() {
  return render(
    <CollectionScreen collection="presse" session={session} onAuthExpired={vi.fn()} />
  );
}

describe("CollectionScreen", () => {
  it("liste le contenu de main, en lecture seule sans verrou", async () => {
    renderScreen();
    expect(await screen.findByText("Premier article")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Modifier" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Ajouter" })).toBeNull();
  });

  it("verrou d'autrui → bandeau + bouton Modifier désactivé", async () => {
    mocked.lockStatus.mockResolvedValue({
      locked: true, email: "marie@tn.org", expiresAt: future, ownedByCaller: false,
    });
    renderScreen();
    expect((await screen.findByText(/En cours d'édition par marie@tn.org/)).textContent)
      .toContain("lecture seule");
    expect((screen.getByRole("button", { name: "Modifier" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("« Modifier » acquiert le verrou et active l'édition", async () => {
    mocked.acquireLock.mockResolvedValue({ ok: true, expiresAt: future });
    renderScreen();
    fireEvent.click(await screen.findByRole("button", { name: "Modifier" }));
    expect(await screen.findByRole("button", { name: "Ajouter" })).toBeTruthy();
    expect(mocked.acquireLock).toHaveBeenCalledWith("jwt", "presse");
  });

  it("une modification écrit un brouillon local (autosauvegarde)", async () => {
    mocked.acquireLock.mockResolvedValue({ ok: true, expiresAt: future });
    renderScreen();
    fireEvent.click(await screen.findByRole("button", { name: "Modifier" }));
    fireEvent.click(await screen.findByText("Premier article"));
    fireEvent.change(await screen.findByLabelText("Titre"), { target: { value: "Titre modifié" } });
    await waitFor(
      () => {
        expect(cmsStub.writeDraft).toHaveBeenCalled();
        const [key, draft] = cmsStub.writeDraft.mock.calls.at(-1)!;
        expect(key).toBe("presse");
        expect(JSON.stringify(draft)).toContain("Titre modifié");
      },
      { timeout: 2000 }
    );
  });

  it("un brouillon existant prime sur le serveur, avec bandeau", async () => {
    cmsStub.readDraft.mockResolvedValue({
      content: [{ id: "p1", title: "Version brouillon", source: "s", date: "2026-06" }],
      images: {},
      savedAt: "2026-07-03T10:00:00Z",
    });
    renderScreen();
    expect(await screen.findByText("Version brouillon")).toBeTruthy();
    expect(screen.getByText(/Brouillon local/)).toBeTruthy();
    expect(screen.queryByText("Premier article")).toBeNull();
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/collection.test.tsx`
Expected: FAIL — `CollectionScreen` introuvable.

- [ ] **Step 3: Implémenter `cms/src/renderer/src/components/CollectionScreen.tsx`**

```tsx
/**
 * Écran d'une entrée du registre : liste + formulaire (collection) ou
 * formulaire direct (singleton).
 *
 * Règles (spec §4-5) :
 *  - lecture : toujours le contenu de main (API GitHub via le backend) ;
 *  - édition : uniquement verrou en poche (sinon lecture seule + bandeau) ;
 *  - toute modification vit dans un brouillon local (userData/drafts),
 *    autosauvegardé — fermer ou planter ne perd rien ;
 *  - publication : Task 10 (PublishBar).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { registry } from "@site/content/registry";
import { api, ApiError, type LockStatus } from "../lib/api";
import { emptyItem, fieldErrors, itemLabel, moveItem } from "../lib/form";
import type { Session } from "../lib/session";
import { ItemForm } from "./ItemForm";

export type Draft = {
  content: unknown;
  /** Images en attente de publication : chemin (sans « / ») → base64. */
  images: Record<string, string>;
  savedAt: string;
};

export const DRAFT_SAVE_DELAY_MS = 500;

type Props = { collection: string; session: Session; onAuthExpired: () => void };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export function CollectionScreen({ collection, session, onAuthExpired }: Props) {
  const entry = registry[collection];
  const [server, setServer] = useState<{ content: unknown; sha: string } | null>(null);
  const [lock, setLock] = useState<LockStatus>({ locked: false });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [library, setLibrary] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fail = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) {
        onAuthExpired(); // JWT expiré → retour au login
        return;
      }
      setError(e instanceof ApiError ? e.message : "Serveur injoignable — réessayez.");
    },
    [onAuthExpired]
  );

  // Chargement initial : contenu (main), verrou, brouillon, bibliothèque.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [content, lockStatus, rawDraft, uploads] = await Promise.all([
          api.getContent(session.token, collection),
          api.lockStatus(session.token, collection),
          window.cms.readDraft(collection),
          api.listUploads(session.token, collection),
        ]);
        if (cancelled) return;
        setServer(content);
        setLock(lockStatus);
        setDraft(rawDraft as Draft | null);
        setLibrary(uploads);
      } catch (e) {
        if (!cancelled) fail(e);
      }
    })();
    return () => { cancelled = true; };
  }, [collection, session.token, fail]);

  // Autosauvegarde débouncée du brouillon…
  useEffect(() => {
    if (!draft) return;
    const t = setTimeout(() => void window.cms.writeDraft(collection, draft), DRAFT_SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [draft, collection]);

  // …et sauvegarde immédiate au démontage (dernières frappes jamais perdues).
  const draftRef = useRef(draft);
  draftRef.current = draft;
  useEffect(
    () => () => {
      if (draftRef.current) void window.cms.writeDraft(collection, draftRef.current);
    },
    [collection]
  );

  if (!entry) return null;
  if (error) return <p className="field-error centered">{error}</p>;
  if (!server) return <p className="centered">Chargement…</p>;

  const editing = lock.locked && lock.ownedByCaller;
  const working = draft?.content ?? server.content;
  const items = entry.kind === "collection" ? ((working as Record<string, unknown>[]) ?? []) : null;

  function patchDraft(patch: (d: Draft) => Draft): void {
    setDraft((prev) => {
      const base: Draft = prev ?? { content: server!.content, images: {}, savedAt: "" };
      return { ...patch(base), savedAt: new Date().toISOString() };
    });
  }
  const setContent = (content: unknown) => patchDraft((d) => ({ ...d, content }));
  const addImage = (path: string, base64: string) =>
    patchDraft((d) => ({ ...d, images: { ...d.images, [path]: base64 } }));

  async function acquire() {
    try {
      const result = await api.acquireLock(session.token, collection);
      setLock(
        result.ok
          ? { locked: true, email: session.email, expiresAt: result.expiresAt, ownedByCaller: true }
          : { locked: true, email: result.heldBy, expiresAt: result.expiresAt, ownedByCaller: false }
      );
    } catch (e) {
      fail(e);
    }
  }

  async function release() {
    try {
      await api.releaseLock(session.token, collection);
      setLock({ locked: false });
    } catch (e) {
      fail(e);
    }
  }

  async function discardDraft() {
    if (!window.confirm("Abandonner le brouillon local et revenir au contenu publié ?")) return;
    await window.cms.deleteDraft(collection);
    setDraft(null);
    setSelected(null);
  }

  function addItem() {
    setContent([emptyItem(entry), ...items!]);
    setSelected(0);
    setQuery("");
  }

  function deleteItem(index: number) {
    if (!window.confirm("Supprimer cet élément ?")) return;
    setContent(items!.filter((_, i) => i !== index));
    setSelected(null);
  }

  function move(index: number, delta: number) {
    setContent(moveItem(items!, index, delta));
    if (selected === index) setSelected(index + delta);
  }

  const visible = items
    ?.map((item, index) => ({ item, index }))
    .filter(({ item }) => itemLabel(entry, item).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>{entry.label}</h1>
        {editing ? (
          <button onClick={() => void release()}>Libérer le verrou</button>
        ) : (
          <button onClick={() => void acquire()} disabled={lock.locked}>Modifier</button>
        )}
      </header>

      {lock.locked && !lock.ownedByCaller && (
        <p className="banner banner-lock">
          En cours d'édition par {lock.email} jusqu'au {formatDate(lock.expiresAt)} — lecture seule.
        </p>
      )}

      {draft && (
        <p className="banner banner-draft">
          Brouillon local du {formatDate(draft.savedAt)} (non publié).
          <button onClick={() => void discardDraft()}>Abandonner le brouillon</button>
        </p>
      )}

      {entry.kind === "singleton" ? (
        <ItemForm entry={entry} collection={collection}
          item={working as Record<string, unknown>}
          errors={fieldErrors(entry, working)} readOnly={!editing}
          images={draft?.images ?? {}} library={library}
          onChange={setContent} onImageReady={addImage} />
      ) : (
        <div className="collection-layout">
          <div className="item-list">
            <input type="search" placeholder="Rechercher…" value={query}
              onChange={(e) => setQuery(e.target.value)} />
            {editing && <button onClick={addItem}>Ajouter</button>}
            <ul>
              {visible!.map(({ item, index }) => (
                <li key={index} className={selected === index ? "active" : ""}>
                  <button className="item-title" onClick={() => setSelected(index)}>
                    {itemLabel(entry, item) || "(sans titre)"}
                  </button>
                  {editing && (
                    <span className="item-actions">
                      <button disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
                      <button disabled={index === items!.length - 1} onClick={() => move(index, +1)}>↓</button>
                      <button onClick={() => deleteItem(index)}>✕</button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="item-detail">
            {selected !== null && items![selected] !== undefined ? (
              <ItemForm entry={entry} collection={collection}
                item={items![selected]}
                errors={fieldErrors(entry, items![selected])} readOnly={!editing}
                images={draft?.images ?? {}} library={library}
                onChange={(item) => setContent(items!.map((it, i) => (i === selected ? item : it)))}
                onImageReady={addImage} />
            ) : (
              <p className="muted">Sélectionnez un élément dans la liste.</p>
            )}
          </div>
        </div>
      )}
      {/* Task 10 : <PublishBar> s'insère ici. */}
    </div>
  );
}
```

- [ ] **Step 4: Brancher dans le Shell**

Dans `cms/src/renderer/src/components/Shell.tsx` :

Ajouter l'import :

```tsx
import { CollectionScreen } from "./CollectionScreen";
```

Remplacer :

```tsx
        {selected ? (
          /* Remplacé par <CollectionScreen> en Task 9. */
          <p className="centered">{selected}</p>
        ) : (
```

par :

```tsx
        {selected ? (
          <CollectionScreen key={selected} collection={selected} session={session}
            onAuthExpired={onLogout} />
        ) : (
```

(`key={selected}` : changer de collection remonte l'écran de zéro — état frais, brouillon de la bonne collection.)

- [ ] **Step 5: Vérifier**

Run: `cd cms && npm test && npm run typecheck`
Expected: PASS partout (dont les 5 tests de l'écran).

- [ ] **Step 6: Commit**

```bash
git add cms/src/renderer/src/components cms/tests/collection.test.tsx
git commit -m "CMS app : écran de collection (verrou exclusif, lecture seule, liste, édition, brouillons autosauvegardés)"
```

---

### Task 10 : Publication + statut du déploiement

**Files:**
- Create: `cms/src/renderer/src/lib/publish.ts`, `cms/src/renderer/src/components/PublishBar.tsx`
- Modify: `cms/src/renderer/src/components/CollectionScreen.tsx`
- Test: `cms/tests/publish.test.tsx`

**Interfaces:**
- Consumes: `api`, `ApiError`, `DeployRun`, `ImageUpload` (Task 4) ; `fieldErrors`, `itemLabel` (Task 6) ; `Draft` (Task 9) ; `Session` (Task 7).
- Produces :
  - `usedImages(content: unknown, images: Record<string, string>): ImageUpload[]` — n'embarque que les images encore référencées par le contenu (pas d'orphelines, spec §6).
  - `invalidItems(entry: RegistryEntry, content: unknown): string[]` — libellés des éléments invalides (bloque la publication côté app ; le serveur revalide de toute façon).
  - `deployLabel(deploy: DeployRun | null): { text: string; tone: "pending" | "ok" | "error" }`
  - `DEPLOY_POLL_MS = 10_000`
  - `<PublishBar entry collection session draft editing onPublished onError />` — `onPublished()` : le parent supprime le brouillon local, reflète le contenu publié et marque le verrou libéré (le PUT du backend le libère).

- [ ] **Step 1: Écrire les tests**

Créer `cms/tests/publish.test.tsx` :

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/api")>();
  return { ...mod, api: { ...mod.api, putContent: vi.fn(), status: vi.fn() } };
});

import { registry } from "@site/content/registry";
import { api, ApiError } from "@/lib/api";
import { deployLabel, invalidItems, usedImages } from "@/lib/publish";
import { PublishBar } from "@/components/PublishBar";

const mockPut = vi.mocked(api.putContent);
const mockStatus = vi.mocked(api.status);

const session = { token: "jwt", email: "a@b.fr" };
const validContent = [{ id: "p1", title: "T", source: "S", date: "2026-06" }];

afterEach(cleanup);
beforeEach(() => {
  mockPut.mockReset();
  mockStatus.mockReset();
});

describe("usedImages", () => {
  it("ne garde que les images référencées par le contenu", () => {
    const images = {
      "uploads/presse/gardee-a1b2c3d4.webp": "AAA",
      "uploads/presse/remplacee-ffffffff.webp": "BBB",
    };
    const content = [{ id: "x", photo: "/uploads/presse/gardee-a1b2c3d4.webp" }];
    expect(usedImages(content, images)).toEqual([
      { path: "uploads/presse/gardee-a1b2c3d4.webp", base64: "AAA" },
    ]);
  });
});

describe("invalidItems", () => {
  it("liste les libellés des éléments invalides", () => {
    const content = [
      { id: "a", title: "Valide", source: "S", date: "2026-06" },
      { id: "b", title: "", source: "S", date: "2026-06" },
    ];
    expect(invalidItems(registry.presse, content)).toEqual(["(sans titre)"]);
    expect(invalidItems(registry.presse, validContent)).toEqual([]);
  });
});

describe("deployLabel", () => {
  it("pending / succès / échec", () => {
    expect(deployLabel(null).tone).toBe("pending");
    expect(deployLabel({ status: "in_progress", conclusion: null, url: "" }).tone).toBe("pending");
    expect(deployLabel({ status: "completed", conclusion: "success", url: "" }).tone).toBe("ok");
    const failed = deployLabel({ status: "completed", conclusion: "failure", url: "" });
    expect(failed.tone).toBe("error");
    expect(failed.text).toContain("administrateur");
  });
});

describe("PublishBar", () => {
  const draft = { content: validContent, images: {}, savedAt: "2026-07-03T10:00:00Z" };

  it("publie le brouillon et passe en suivi du déploiement", async () => {
    mockPut.mockResolvedValue({ commitSha: "c1" });
    const onPublished = vi.fn();
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={draft} editing={true} onPublished={onPublished} onError={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    expect(await screen.findByText(/Mise en ligne en cours/)).toBeTruthy();
    expect(mockPut).toHaveBeenCalledWith("jwt", "presse", validContent, []);
    expect(onPublished).toHaveBeenCalled();
  });

  it("refus serveur (verrou perdu, 409) → message affiché", async () => {
    mockPut.mockRejectedValue(new ApiError("Vous ne détenez pas (ou plus) le verrou.", 409));
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={draft} editing={true} onPublished={vi.fn()} onError={vi.fn()} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    expect((await screen.findByRole("alert")).textContent).toContain("verrou");
  });

  it("contenu invalide → bouton désactivé + éléments fautifs listés", () => {
    const bad = { ...draft, content: [{ id: "a", title: "", source: "S", date: "2026-06" }] };
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={bad} editing={true} onPublished={vi.fn()} onError={vi.fn()} />
    );
    expect((screen.getByRole("button", { name: "Publier" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/à corriger avant publication/).textContent).toContain("(sans titre)");
  });

  it("pas de brouillon ou pas de verrou → bouton désactivé", () => {
    render(
      <PublishBar entry={registry.presse} collection="presse" session={session}
        draft={null} editing={false} onPublished={vi.fn()} onError={vi.fn()} />
    );
    expect((screen.getByRole("button", { name: "Publier" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `cd cms && npm test -- tests/publish.test.tsx`
Expected: FAIL — modules introuvables.

- [ ] **Step 3: Implémenter `cms/src/renderer/src/lib/publish.ts`**

```ts
/**
 * Logique de publication côté app. Le serveur reste juge de paix
 * (revalidation Zod, verrou, images) — ici on évite juste d'envoyer
 * l'invalide et les images devenues inutiles.
 */

import type { RegistryEntry } from "@site/content/registry";
import type { DeployRun, ImageUpload } from "./api";
import { fieldErrors, itemLabel } from "./form";

/** N'embarque que les images encore référencées (remplacées = abandonnées). */
export function usedImages(content: unknown, images: Record<string, string>): ImageUpload[] {
  const text = JSON.stringify(content);
  return Object.entries(images)
    .filter(([path]) => text.includes(`/${path}`))
    .map(([path, base64]) => ({ path, base64 }));
}

/** Libellés des éléments qui violent le schéma (bloquent la publication). */
export function invalidItems(entry: RegistryEntry, content: unknown): string[] {
  if (entry.kind === "singleton") {
    return Object.keys(fieldErrors(entry, content)).length > 0 ? [entry.label] : [];
  }
  return ((content as unknown[]) ?? [])
    .filter((item) => Object.keys(fieldErrors(entry, item)).length > 0)
    .map((item) => itemLabel(entry, item) || "(sans titre)");
}

/** Badge d'état du déploiement Pages (spec §10). */
export function deployLabel(deploy: DeployRun | null): { text: string; tone: "pending" | "ok" | "error" } {
  if (!deploy || deploy.status !== "completed") {
    return { text: "Mise en ligne en cours… (2 à 3 minutes)", tone: "pending" };
  }
  if (deploy.conclusion === "success") {
    return { text: "Publié — le site est à jour.", tone: "ok" };
  }
  return {
    text: "Échec de la mise en ligne — prévenez l'administrateur du site.",
    tone: "error",
  };
}
```

- [ ] **Step 4: Implémenter `cms/src/renderer/src/components/PublishBar.tsx`**

```tsx
/**
 * Publier = un commit sur main (via le backend) puis suivi du déploiement
 * Pages jusqu'à son issue. Le PUT n'est jamais rejoué automatiquement
 * (voir main/api.ts) : en cas d'erreur, l'utilisateur décide.
 */

import { useEffect, useState } from "react";
import type { RegistryEntry } from "@site/content/registry";
import { api, ApiError, type DeployRun } from "../lib/api";
import { deployLabel, invalidItems, usedImages } from "../lib/publish";
import type { Session } from "../lib/session";
import type { Draft } from "./CollectionScreen";

export const DEPLOY_POLL_MS = 10_000;

type PublishState =
  | { step: "idle" }
  | { step: "publishing" }
  | { step: "deploying"; sha: string; deploy: DeployRun | null }
  | { step: "failed"; message: string };

type Props = {
  entry: RegistryEntry;
  collection: string;
  session: Session;
  draft: Draft | null;
  editing: boolean;
  /** Publication acceptée : le parent purge le brouillon et l'état du verrou. */
  onPublished: () => void;
  onError: (e: unknown) => void;
};

export function PublishBar({ entry, collection, session, draft, editing, onPublished, onError }: Props) {
  const [state, setState] = useState<PublishState>({ step: "idle" });

  const problems = draft ? invalidItems(entry, draft.content) : [];
  const canPublish = editing && draft !== null && problems.length === 0 && state.step !== "publishing";

  async function publishNow() {
    if (!draft) return;
    setState({ step: "publishing" });
    try {
      const { commitSha } = await api.putContent(
        session.token,
        collection,
        draft.content,
        usedImages(draft.content, draft.images)
      );
      onPublished();
      setState({ step: "deploying", sha: commitSha, deploy: null });
    } catch (e) {
      if (e instanceof ApiError) {
        setState({ step: "failed", message: e.message });
      } else {
        setState({ step: "idle" });
        onError(e);
      }
    }
  }

  // Sondage du déploiement Pages jusqu'à son issue.
  useEffect(() => {
    if (state.step !== "deploying" || state.deploy?.status === "completed") return;
    const timer = setInterval(async () => {
      try {
        const { deploy } = await api.status(session.token, state.sha);
        setState((s) => (s.step === "deploying" ? { ...s, deploy } : s));
      } catch {
        // panne passagère : on retentera au prochain tick
      }
    }, DEPLOY_POLL_MS);
    return () => clearInterval(timer);
  }, [state, session.token]);

  return (
    <div className="publish-bar">
      {draft && problems.length > 0 && (
        <p className="field-error">
          Éléments à corriger avant publication : {problems.join(", ")}
        </p>
      )}
      <button className="primary" disabled={!canPublish} onClick={() => void publishNow()}>
        {state.step === "publishing" ? "Publication…" : "Publier"}
      </button>
      {state.step === "deploying" && <DeployBadge deploy={state.deploy} />}
      {state.step === "failed" && (
        <p className="field-error" role="alert">Publication refusée : {state.message}</p>
      )}
    </div>
  );
}

function DeployBadge({ deploy }: { deploy: DeployRun | null }) {
  const { text, tone } = deployLabel(deploy);
  return <p className={`deploy-badge deploy-${tone}`}>{text}</p>;
}
```

- [ ] **Step 5: Brancher dans `CollectionScreen.tsx`**

Ajouter l'import :

```tsx
import { PublishBar } from "./PublishBar";
```

Ajouter la fonction, à côté de `discardDraft` :

```tsx
  async function handlePublished() {
    // Le PUT du backend a commité ET libéré le verrou : on reflète localement.
    await window.cms.deleteDraft(collection);
    setServer((s) => (draftRef.current && s ? { ...s, content: draftRef.current.content } : s));
    setDraft(null);
    setLock({ locked: false });
  }
```

Remplacer :

```tsx
      {/* Task 10 : <PublishBar> s'insère ici. */}
```

par :

```tsx
      <PublishBar entry={entry} collection={collection} session={session}
        draft={draft} editing={editing}
        onPublished={() => void handlePublished()} onError={fail} />
```

- [ ] **Step 6: Vérifier**

Run: `cd cms && npm test && npm run typecheck && npm run build`
Expected: PASS partout (dont les 8 tests de publication).

- [ ] **Step 7: Commit**

```bash
git add cms/src/renderer/src cms/tests/publish.test.tsx
git commit -m "CMS app : publication (images orphelines filtrées, validation bloquante) + badge de suivi du déploiement Pages"
```

---

### Task 11 : Finitions — README, checklist E2E, vérification complète

**Files:**
- Create: `cms/README.md`
- (Vérification globale racine + cms, dernier commit, push.)

**Interfaces:**
- Consumes: tout le plan.
- Produces: doc de dev et d'E2E manuel ; branche prête pour le Plan 3 (distribution).

- [ ] **Step 1: Créer `cms/README.md`**

```markdown
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
```

Attention au bloc de code imbriqué : dans le fichier réel, le bloc bash interne
est un bloc de code normal (le README n'est pas imbriqué dans autre chose).

- [ ] **Step 2: Vérification complète (racine + cms)**

Run: `npm test && npm run lint && npm run build`
Expected: racine verte (tests Plan 1 + Task 2, lint, build Next).

Run: `cd cms && npm test && npm run typecheck && npm run build`
Expected: tous les tests cms PASS (~40), typecheck OK, build OK.

Run (si session graphique) : `cd cms && npm run dev` — dérouler ce qui est possible sans identifiants réels : écran de login, messages d'erreur. Sinon noter « E2E manuel à faire » dans le rapport final.

- [ ] **Step 3: Commit + push**

```bash
git add cms/README.md
git commit -m "CMS app : README (dev, architecture, checklist E2E manuelle)"
git push
```

Note : le push redéploie Render (Task 2 : route uploads) — sans effet visible tant que les variables d'env du Plan 1 ne sont pas saisies dans le dashboard. Le workflow Pages tourne aussi (aucun changement de pages publiques). `cms/**` ne déclenche pas de redéploiement backend (build filter du Plan 1) ; le `paths-ignore: cms/**` du workflow Pages arrive au Plan 3.

- [ ] **Step 4: Rapport final — actions restantes côté utilisateur**

À lister dans le rapport de fin :
1. Les 4 actions manuelles du Plan 1 restent préalables à tout test réel (PAT GitHub, variables Render, ID d'espace Wimi, test curl du login).
2. Valider empiriquement la cible Wimi `project.GetList` (toujours fail-closed, cf. Plan 1 Task 3 Step 6).
3. Dérouler la checklist E2E du README avec de vrais identifiants.
4. Plan 3 à écrire : packaging electron-builder, workflow `cms-v*`, GitHub Releases, electron-updater, `paths-ignore: cms/**`.

---

## Hors périmètre de ce plan

- **Plan 3 — Distribution** : electron-builder, workflow `cms-v*` (matrice Win/mac/Linux), GitHub Releases, electron-updater (bandeau manuel sur macOS non signé), avertissements « développeur non vérifié », `paths-ignore: cms/**` sur le workflow Pages.
- **Plans de migration** : lots 2-4 de pages (spec §7) — chaque migration ajoute schéma + entrée de registre + JSON, l'app les affiche sans changement de code.
- Éditeur riche/markdown, recadrage d'images, nettoyage des images inutilisées, « forcer la libération » d'un verrou (évolutions notées dans la spec).
