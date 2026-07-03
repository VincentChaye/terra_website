# CMS Phase 2 — Plan 1 : Backend (API admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exposer sur le backend Render les routes `/api/admin/*` (login Wimi, verrous d'édition, lecture/publication de contenu via commits GitHub, statut de déploiement) définies par la spec `docs/superpowers/specs/2026-07-03-cms-design.md`, testables par API sans l'app Electron.

**Architecture:** Le contenu vit dans le repo ; le backend valide (Zod), verrouille (branche `cms-locks`) et commite (API GitHub Git Data) — aucun état persistant sur Render. Auth = relais `auth.user.Login` Wimi + vérification d'accès à un espace + JWT signé. Les plans suivants (app Electron, distribution) consomment ces routes.

**Tech Stack:** Next.js 16 (route handlers `app/api/admin/*`), Zod 4, `jose` (JWT), Vitest (nouveau), API GitHub REST via `fetch`, API Wimi (WApi).

## Global Constraints

- **Next.js 16** : les APIs diffèrent des versions connues — en cas de doute, lire `node_modules/next/dist/docs/`. Confirmé : dans les routes dynamiques, `params` est une **Promise** (`const { collection } = await ctx.params`).
- **Wimi (WApi)** : casse des cibles stricte (`auth.user.Login`), `msg_key` obligatoire dans le header, erreurs renvoyées dans `body.error` avec HTTP 200. Voir `lib/wimi.ts`.
- **TypeScript strict** (tsconfig `"strict": true`), alias `@/*` → racine du repo.
- **Aucun secret côté client** : `GITHUB_CMS_TOKEN`, `WIMI_APP_TOKEN`, `CMS_JWT_SECRET` uniquement en env Render.
- **Commits** : messages en français, style de l'historique existant, **jamais de ligne `Co-Authored-By: Claude`**.
- **Style de code** : commentaires en français, alignés sur l'existant (`lib/wimi.ts`, `lib/content.ts`).
- Node 20 en CI/Render (Node 22 en local, compatible).
- Les routes admin ne renvoient **aucun en-tête CORS** (fermées aux navigateurs ; seule l'app Electron, hors navigateur, les appelle).

---

### Task 1 : Vitest + extraction du registre de contenu (`content/registry.ts`)

Sépare les schémas Zod (purs, importables par l'app Electron au Plan 2) du loader `fs`, ajoute les métadonnées d'affichage, et met en place Vitest.

**Files:**
- Create: `content/registry.ts`
- Create: `vitest.config.ts`
- Create: `tests/registry.test.ts`
- Modify: `lib/content.ts` (retirer les schémas, importer/ré-exporter depuis le registre)
- Modify: `package.json` (devDep `vitest`, script `test`)

**Interfaces:**
- Consumes: schémas Zod existants de `lib/content.ts` (`PresseItemSchema`, `NewsletterItemSchema`, `RetrospectiveSchema`, `VideoItemSchema`).
- Produces (utilisé par les tâches 5-6 et le Plan 2) :
  - `type FieldMeta = { label: string; widget: "text" | "textarea" | "month" | "year" | "url" | "paragraphs" | "image"; optional?: boolean }`
  - `type RegistryEntry = { label: string; group: string; kind: "collection" | "singleton"; file: string; schema: z.ZodType; itemTitle?: (item: unknown) => string; fields: Record<string, FieldMeta> }`
  - `const registry: Record<string, RegistryEntry>` (clés : `presse`, `newsletter`, `retrospectives`, `videos`)
  - `function payloadSchema(entry: RegistryEntry): z.ZodType` — schéma du fichier complet (`z.array(entry.schema)` pour une collection, `entry.schema` pour un singleton).
  - `lib/content.ts` continue d'exporter les mêmes noms qu'aujourd'hui (pages du site inchangées).

- [ ] **Step 1: Installer Vitest et brancher le script de test**

```bash
npm install -D vitest
```

Dans `package.json`, ajouter aux `scripts` :

```json
"test": "vitest run"
```

Créer `vitest.config.ts` :

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
```

- [ ] **Step 2: Écrire le test du registre (échouera : le module n'existe pas)**

Créer `tests/registry.test.ts` :

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { payloadSchema, registry } from "@/content/registry";

describe("registre de contenu", () => {
  it("chaque entrée pointe vers un fichier JSON existant et valide", () => {
    for (const [key, entry] of Object.entries(registry)) {
      const raw = readFileSync(join(process.cwd(), "content", entry.file), "utf-8");
      const result = payloadSchema(entry).safeParse(JSON.parse(raw));
      expect(result.success, `${key} : ${result.success ? "" : result.error.message}`).toBe(true);
    }
  });

  it("les champs déclarés existent dans le schéma d'élément", () => {
    for (const entry of Object.values(registry)) {
      // Tous les schémas d'élément sont des z.object : on compare les clés.
      const shape = (entry.schema as unknown as { shape: Record<string, unknown> }).shape;
      for (const field of Object.keys(entry.fields)) {
        expect(shape, `champ ${field} absent du schéma`).toHaveProperty(field);
      }
    }
  });
});
```

- [ ] **Step 3: Vérifier l'échec**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/content/registry'` (ou équivalent Vite).

- [ ] **Step 4: Créer `content/registry.ts`**

Déplacer les 4 schémas depuis `lib/content.ts` (copie à l'identique, y compris commentaires) et ajouter le registre :

```ts
/**
 * content/registry.ts — Schémas Zod + registre de contenu du CMS
 *
 * Module PUR (aucun accès disque) : importable par le loader serveur
 * (lib/content.ts), les routes /api/admin/* et l'app Electron (Plan 2).
 * Ajouter une entrée ici = elle apparaît dans le CMS.
 *
 * Le champ `id` des éléments de collection n'est pas déclaré dans `fields` :
 * il est généré automatiquement par l'app d'édition, jamais saisi.
 */

import { z } from "zod";

// ─── Schémas (déplacés depuis lib/content.ts, inchangés) ─────────────────────

export const PresseItemSchema = z.object({
  id:     z.string(),
  title:  z.string().min(1),
  source: z.string().min(1),
  date:   z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  url:    z.string().url().optional(),
});
export type PresseItem = z.infer<typeof PresseItemSchema>;

export const NewsletterItemSchema = z.object({
  id:    z.string(),
  title: z.string().min(1),
  date:  z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  body:  z.string(),
});
export type NewsletterItem = z.infer<typeof NewsletterItemSchema>;

export const RetrospectiveSchema = z.object({
  year:       z.number().int().min(2020),
  paragraphs: z.array(z.string().min(1)),
  intro:      z.string().optional(),
});
export type Retrospective = z.infer<typeof RetrospectiveSchema>;

export const VideoItemSchema = z.object({
  id:          z.string(),
  title:       z.string().min(1),
  date:        z.string().regex(/^\d{4}-\d{2}$/, "Format attendu : YYYY-MM"),
  youtubeId:   z.string().optional(),
  description: z.string().optional(),
});
export type VideoItem = z.infer<typeof VideoItemSchema>;

// ─── Registre ────────────────────────────────────────────────────────────────

export type FieldMeta = {
  label: string;
  widget: "text" | "textarea" | "month" | "year" | "url" | "paragraphs" | "image";
  optional?: boolean;
};

export type RegistryEntry = {
  label: string;
  group: string;
  kind: "collection" | "singleton";
  /** Chemin relatif à content/ */
  file: string;
  /** Schéma d'un élément (collection) ou de l'objet complet (singleton) */
  schema: z.ZodType;
  itemTitle?: (item: unknown) => string;
  fields: Record<string, FieldMeta>;
};

export const registry: Record<string, RegistryEntry> = {
  presse: {
    label: "Revue de presse",
    group: "Actualités",
    kind: "collection",
    file: "actualites/presse.json",
    schema: PresseItemSchema,
    itemTitle: (item) => (item as PresseItem).title,
    fields: {
      title:  { label: "Titre",  widget: "text" },
      source: { label: "Source", widget: "text" },
      date:   { label: "Date",   widget: "month" },
      url:    { label: "Lien",   widget: "url", optional: true },
    },
  },
  newsletter: {
    label: "Newsletters",
    group: "Actualités",
    kind: "collection",
    file: "actualites/newsletter.json",
    schema: NewsletterItemSchema,
    itemTitle: (item) => (item as NewsletterItem).title,
    fields: {
      title: { label: "Titre", widget: "text" },
      date:  { label: "Date",  widget: "month" },
      body:  { label: "Contenu", widget: "textarea" },
    },
  },
  retrospectives: {
    label: "Rétrospectives",
    group: "Actualités",
    kind: "collection",
    file: "actualites/retrospectives.json",
    schema: RetrospectiveSchema,
    itemTitle: (item) => String((item as Retrospective).year),
    fields: {
      year:       { label: "Année", widget: "year" },
      intro:      { label: "Introduction", widget: "textarea", optional: true },
      paragraphs: { label: "Paragraphes", widget: "paragraphs" },
    },
  },
  videos: {
    label: "Vidéos",
    group: "Actualités",
    kind: "collection",
    file: "actualites/videos.json",
    schema: VideoItemSchema,
    itemTitle: (item) => (item as VideoItem).title,
    fields: {
      title:       { label: "Titre", widget: "text" },
      date:        { label: "Date",  widget: "month" },
      youtubeId:   { label: "ID YouTube", widget: "text", optional: true },
      description: { label: "Description", widget: "textarea", optional: true },
    },
  },
};

/** Schéma du fichier JSON complet d'une entrée du registre. */
export function payloadSchema(entry: RegistryEntry): z.ZodType {
  return entry.kind === "collection" ? z.array(entry.schema) : entry.schema;
}
```

- [ ] **Step 5: Alléger `lib/content.ts`**

Supprimer les 4 blocs de schémas de `lib/content.ts` et les remplacer par un import + ré-export (les pages du site importent depuis `lib/content` — rien ne doit casser) :

```ts
import {
  NewsletterItemSchema, PresseItemSchema, RetrospectiveSchema, VideoItemSchema,
  type NewsletterItem, type PresseItem, type Retrospective, type VideoItem,
} from "@/content/registry";

// Ré-export : les consommateurs existants (pages, futur back-office) ne changent pas.
export {
  NewsletterItemSchema, PresseItemSchema, RetrospectiveSchema, VideoItemSchema,
  type NewsletterItem, type PresseItem, type Retrospective, type VideoItem,
};
```

Les fonctions `getPresse`, `getNewsletters`, `getRetrospectives`, `getRetrospective`, `getVideos` et `readJson` restent inchangées. Mettre à jour le commentaire d'en-tête (les schémas vivent désormais dans `content/registry.ts`).

- [ ] **Step 6: Vérifier tests + build**

Run: `npm test`
Expected: PASS (2 tests).

Run: `npm run build`
Expected: build Next.js sans erreur (mêmes pages qu'avant).

- [ ] **Step 7: Commit**

```bash
git add content/registry.ts lib/content.ts vitest.config.ts tests/registry.test.ts package.json package-lock.json
git commit -m "CMS : registre de contenu pur (schémas + métadonnées) + Vitest

Sépare les schémas Zod du loader fs (lib/content.ts) vers content/registry.ts,
importable par le backend admin et l'app Electron. Registre des 4 collections
actualités avec libellés/widgets. Test : chaque entrée pointe vers un JSON valide."
```

---

### Task 2 : Client API GitHub (`lib/github.ts`)

Lecture de fichiers, commit multi-fichiers (Git Data), verrous sur la branche `cms-locks`, statut du workflow Pages. Tout via `fetch`, sans dépendance.

**Files:**
- Create: `lib/github.ts`
- Test: `tests/github.test.ts`

**Interfaces:**
- Consumes: env `GITHUB_CMS_TOKEN` (PAT fine-grained `contents: write` + `actions: read`), `GITHUB_REPO` (`owner/repo`).
- Produces (utilisé par les tâches 4-7) :
  - `type RepoFile = { path: string; content: string } | { path: string; contentBase64: string }`
  - `getFile(path: string, ref?: string): Promise<{ text: string; sha: string } | null>` — `null` si 404.
  - `commitFiles(files: RepoFile[], message: string): Promise<string>` — sha du commit créé sur `main`.
  - `type Locks = Record<string, { email: string; expiresAt: string }>`
  - `readLocks(): Promise<{ locks: Locks; sha: string | null }>`
  - `writeLocks(locks: Locks, sha: string | null): Promise<boolean>` — `false` si conflit de sha (écriture concurrente).
  - `getPagesRunForCommit(commitSha: string): Promise<{ status: string; conclusion: string | null; url: string } | null>`

- [ ] **Step 1: Écrire les tests (fetch mocké)**

Créer `tests/github.test.ts` :

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { commitFiles, getFile, readLocks, writeLocks } from "@/lib/github";

// Mock de fetch : on route par (méthode, chemin) et on enregistre les appels.
type Handler = (init?: RequestInit) => { status: number; json: unknown };
let routes: Record<string, Handler>;
let calls: { key: string; body: unknown }[];

beforeEach(() => {
  process.env.GITHUB_CMS_TOKEN = "test-token";
  process.env.GITHUB_REPO = "org/tn-site";
  routes = {};
  calls = [];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname + new URL(url).search;
    const key = `${init?.method ?? "GET"} ${path}`;
    const handler = routes[key];
    if (!handler) throw new Error(`route non mockée : ${key}`);
    calls.push({ key, body: init?.body ? JSON.parse(init.body as string) : undefined });
    const { status, json } = handler(init);
    return new Response(JSON.stringify(json), { status });
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("getFile", () => {
  it("décode le contenu base64 et renvoie le sha", async () => {
    routes["GET /repos/org/tn-site/contents/content%2Factualites%2Fpresse.json?ref=main"] = () => ({
      status: 200,
      json: { content: Buffer.from("[1,2]").toString("base64"), sha: "abc" },
    });
    expect(await getFile("content/actualites/presse.json")).toEqual({ text: "[1,2]", sha: "abc" });
  });

  it("renvoie null sur 404", async () => {
    routes["GET /repos/org/tn-site/contents/nope.json?ref=main"] = () => ({ status: 404, json: {} });
    expect(await getFile("nope.json")).toBeNull();
  });
});

describe("commitFiles", () => {
  it("blobs → tree → commit → update ref, renvoie le sha du commit", async () => {
    routes["GET /repos/org/tn-site/git/ref/heads%2Fmain"] = () => ({ status: 200, json: { object: { sha: "head1" } } });
    routes["GET /repos/org/tn-site/git/commits/head1"] = () => ({ status: 200, json: { tree: { sha: "tree1" } } });
    routes["POST /repos/org/tn-site/git/blobs"] = () => ({ status: 201, json: { sha: "blob1" } });
    routes["POST /repos/org/tn-site/git/trees"] = () => ({ status: 201, json: { sha: "tree2" } });
    routes["POST /repos/org/tn-site/git/commits"] = () => ({ status: 201, json: { sha: "commit1" } });
    routes["PATCH /repos/org/tn-site/git/refs/heads%2Fmain"] = () => ({ status: 200, json: {} });

    const sha = await commitFiles(
      [{ path: "content/actualites/presse.json", content: "[]" }],
      "CMS : test"
    );
    expect(sha).toBe("commit1");
    const commitCall = calls.find((c) => c.key === "POST /repos/org/tn-site/git/commits");
    expect(commitCall?.body).toMatchObject({ message: "CMS : test", parents: ["head1"], tree: "tree2" });
  });
});

describe("verrous (branche cms-locks)", () => {
  it("readLocks renvoie vide si le fichier n'existe pas", async () => {
    routes["GET /repos/org/tn-site/contents/locks.json?ref=cms-locks"] = () => ({ status: 404, json: {} });
    expect(await readLocks()).toEqual({ locks: {}, sha: null });
  });

  it("writeLocks crée la branche si absente puis écrit ; false si conflit de sha", async () => {
    routes["GET /repos/org/tn-site/git/ref/heads%2Fcms-locks"] = () => ({ status: 404, json: {} });
    routes["GET /repos/org/tn-site/git/ref/heads%2Fmain"] = () => ({ status: 200, json: { object: { sha: "head1" } } });
    routes["POST /repos/org/tn-site/git/refs"] = () => ({ status: 201, json: {} });
    routes["PUT /repos/org/tn-site/contents/locks.json"] = () => ({ status: 200, json: {} });
    expect(await writeLocks({}, null)).toBe(true);

    routes["GET /repos/org/tn-site/git/ref/heads%2Fcms-locks"] = () => ({ status: 200, json: {} });
    routes["PUT /repos/org/tn-site/contents/locks.json"] = () => ({ status: 409, json: {} });
    expect(await writeLocks({}, "old-sha")).toBe(false);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm test -- tests/github.test.ts`
Expected: FAIL — module `@/lib/github` introuvable.

- [ ] **Step 3: Implémenter `lib/github.ts`**

```ts
/**
 * lib/github.ts — Client API GitHub du CMS (fetch pur, sans dépendance)
 *
 * Trois responsabilités :
 *  - lire des fichiers du repo (source de vérité : `main`, jamais le disque
 *    de Render, périmé après un commit CMS) ;
 *  - créer UN commit multi-fichiers sur `main` (API Git Data) — c'est lui
 *    qui déclenche le déploiement Pages ;
 *  - lire/écrire `locks.json` sur la branche `cms-locks` (verrous d'édition,
 *    aucune CI n'écoute cette branche).
 */

const API = "https://api.github.com";
const LOCKS_BRANCH = "cms-locks";
const LOCKS_FILE = "locks.json";

export type RepoFile =
  | { path: string; content: string }        // texte UTF-8 (JSON…)
  | { path: string; contentBase64: string }; // binaire (images)

export type Locks = Record<string, { email: string; expiresAt: string }>;

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} manquant`);
  return v;
}

function repoPath(suffix: string): string {
  return `/repos/${requiredEnv("GITHUB_REPO")}/${suffix}`;
}

async function gh(
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; json: unknown }> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${requiredEnv("GITHUB_CMS_TOKEN")}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

/** Comme gh(), mais lève une erreur hors 2xx. */
async function ghOk(method: string, path: string, body?: unknown): Promise<unknown> {
  const { status, json } = await gh(method, path, body);
  if (status < 200 || status >= 300) {
    throw new Error(`GitHub ${status} sur ${method} ${path}`);
  }
  return json;
}

/** Lit un fichier du repo. `null` si inexistant. */
export async function getFile(
  path: string,
  ref = "main"
): Promise<{ text: string; sha: string } | null> {
  const { status, json } = await gh(
    "GET",
    repoPath(`contents/${encodeURIComponent(path)}?ref=${ref}`)
  );
  if (status === 404) return null;
  if (status !== 200) throw new Error(`GitHub ${status} en lisant ${path}`);
  const f = json as { content: string; sha: string };
  return { text: Buffer.from(f.content, "base64").toString("utf-8"), sha: f.sha };
}

/** Crée UN commit sur main contenant tous les fichiers. Renvoie son sha. */
export async function commitFiles(files: RepoFile[], message: string): Promise<string> {
  const ref = (await ghOk("GET", repoPath(`git/ref/${encodeURIComponent("heads/main")}`))) as {
    object: { sha: string };
  };
  const headSha = ref.object.sha;
  const head = (await ghOk("GET", repoPath(`git/commits/${headSha}`))) as { tree: { sha: string } };

  const tree = await Promise.all(
    files.map(async (f) => {
      const blob = (await ghOk("POST", repoPath("git/blobs"), {
        content: "content" in f ? f.content : f.contentBase64,
        encoding: "content" in f ? "utf-8" : "base64",
      })) as { sha: string };
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
    })
  );

  const newTree = (await ghOk("POST", repoPath("git/trees"), {
    base_tree: head.tree.sha,
    tree,
  })) as { sha: string };

  const commit = (await ghOk("POST", repoPath("git/commits"), {
    message,
    tree: newTree.sha,
    parents: [headSha],
  })) as { sha: string };

  await ghOk("PATCH", repoPath(`git/refs/${encodeURIComponent("heads/main")}`), {
    sha: commit.sha,
  });
  return commit.sha;
}

/** Crée la branche cms-locks depuis main si elle n'existe pas encore. */
async function ensureLocksBranch(): Promise<void> {
  const { status } = await gh("GET", repoPath(`git/ref/${encodeURIComponent(`heads/${LOCKS_BRANCH}`)}`));
  if (status === 200) return;
  const ref = (await ghOk("GET", repoPath(`git/ref/${encodeURIComponent("heads/main")}`))) as {
    object: { sha: string };
  };
  await ghOk("POST", repoPath("git/refs"), {
    ref: `refs/heads/${LOCKS_BRANCH}`,
    sha: ref.object.sha,
  });
}

export async function readLocks(): Promise<{ locks: Locks; sha: string | null }> {
  const file = await getFile(LOCKS_FILE, LOCKS_BRANCH);
  if (!file) return { locks: {}, sha: null };
  return { locks: JSON.parse(file.text) as Locks, sha: file.sha };
}

/**
 * Écrit locks.json sur cms-locks. `sha` = version lue au préalable (verrou
 * optimiste GitHub) ; `false` si quelqu'un a écrit entre-temps → relire et réessayer.
 */
export async function writeLocks(locks: Locks, sha: string | null): Promise<boolean> {
  await ensureLocksBranch();
  const { status } = await gh("PUT", repoPath(`contents/${LOCKS_FILE}`), {
    message: "CMS : mise à jour des verrous",
    content: Buffer.from(JSON.stringify(locks, null, 2)).toString("base64"),
    branch: LOCKS_BRANCH,
    ...(sha ? { sha } : {}),
  });
  if (status === 409 || status === 422) return false; // conflit de sha
  if (status < 200 || status >= 300) throw new Error(`GitHub ${status} en écrivant les verrous`);
  return true;
}

/** Dernier run GitHub Actions associé à un commit (déploiement Pages). */
export async function getPagesRunForCommit(
  commitSha: string
): Promise<{ status: string; conclusion: string | null; url: string } | null> {
  const json = (await ghOk("GET", repoPath(`actions/runs?head_sha=${commitSha}&per_page=1`))) as {
    workflow_runs: { status: string; conclusion: string | null; html_url: string }[];
  };
  const run = json.workflow_runs?.[0];
  return run ? { status: run.status, conclusion: run.conclusion, url: run.html_url } : null;
}
```

- [ ] **Step 4: Vérifier**

Run: `npm test -- tests/github.test.ts`
Expected: PASS (6 tests). Si un test échoue sur une clé de route mockée (encodage d'URL), aligner le test sur l'URL réellement construite — pas l'inverse — après vérification manuelle que l'URL est correcte pour l'API GitHub.

- [ ] **Step 5: Commit**

```bash
git add lib/github.ts tests/github.test.ts
git commit -m "CMS : client API GitHub (lecture, commit multi-fichiers, verrous, statut CI)"
```

---

### Task 3 : Auth Wimi utilisateur + JWT (`lib/cms-auth.ts`)

Login Wimi avec les identifiants de l'éditeur, vérification d'accès à l'espace `WIMI_CMS_SPACE_ID`, JWT `jose`, rate-limit.

**Files:**
- Modify: `lib/wimi.ts` (exporter `wimiCall` + erreur typée)
- Create: `lib/cms-auth.ts`
- Test: `tests/cms-auth.test.ts`

**Interfaces:**
- Consumes: `wimiCall` (lib/wimi.ts), env `WIMI_APP_TOKEN`, `WIMI_ACCOUNT_NAME`, `WIMI_CMS_SPACE_ID`, `CMS_JWT_SECRET`.
- Produces (utilisé par les tâches 4-7) :
  - `class WimiAuthError extends Error` — identifiants refusés (vs panne Wimi = autre erreur).
  - `wimiUserLogin(email: string, password: string): Promise<{ token: string; userId: number; accountId: number }>`
  - `userHasCmsAccess(s: { token: string; userId: number; accountId: number }): Promise<boolean>`
  - `signCmsJwt(email: string, userId: number): Promise<string>` / `verifyCmsJwt(token: string): Promise<{ email: string; userId: number } | null>`
  - `checkLoginRateLimit(ip: string): boolean` — `false` si > 5 tentatives / 15 min.
  - `requireAuth(request: Request): Promise<{ email: string; userId: number } | null>` — lit `Authorization: Bearer`.

- [ ] **Step 1: Exporter `wimiCall` avec erreur typée**

Dans `lib/wimi.ts` :
1. Ajouter avant `wimiCall` :

```ts
/** Erreur renvoyée par la WApi dans body.error (HTTP 200 malgré tout). */
export class WimiApiError extends Error {
  constructor(message: string, readonly errorId?: number, readonly target?: string) {
    super(message);
    this.name = "WimiApiError";
  }
}
```

2. Remplacer le `throw new Error(...)` du bloc `if (err && err.success === false)` par :

```ts
    throw new WimiApiError(
      `Wimi erreur ${err.id ?? ""} : ${err.str ?? "inconnue"} (${target})`.trim(),
      err.id,
      target
    );
```

3. Passer `async function wimiCall(` en `export async function wimiCall(` (le reste du fichier est inchangé).

- [ ] **Step 2: Écrire les tests (wimiCall mocké)**

Créer `tests/cms-auth.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/wimi", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/wimi")>();
  return { ...mod, wimiCall: vi.fn() };
});

import { wimiCall, WimiApiError } from "@/lib/wimi";
import {
  checkLoginRateLimit, requireAuth, signCmsJwt, userHasCmsAccess,
  verifyCmsJwt, WimiAuthError, wimiUserLogin, _resetRateLimit,
} from "@/lib/cms-auth";

const mockCall = vi.mocked(wimiCall);

beforeEach(() => {
  process.env.WIMI_ACCOUNT_NAME = "terranumerica";
  process.env.WIMI_CMS_SPACE_ID = "42";
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  mockCall.mockReset();
  _resetRateLimit();
});

describe("wimiUserLogin", () => {
  it("renvoie token/userId/accountId si Wimi accepte", async () => {
    mockCall.mockResolvedValueOnce({
      header: { token: "wimi-token" },
      data: { user: { user_id: 7 }, account: { account_id: 3 } },
    });
    await expect(wimiUserLogin("a@b.fr", "mdp")).resolves.toEqual({
      token: "wimi-token", userId: 7, accountId: 3,
    });
  });

  it("lève WimiAuthError si Wimi refuse (body.error)", async () => {
    mockCall.mockRejectedValueOnce(new WimiApiError("Wimi erreur 401 : bad credentials", 401));
    await expect(wimiUserLogin("a@b.fr", "faux")).rejects.toBeInstanceOf(WimiAuthError);
  });

  it("relaie les pannes réseau telles quelles (pas un WimiAuthError)", async () => {
    mockCall.mockRejectedValueOnce(new Error("Wimi HTTP 503"));
    await expect(wimiUserLogin("a@b.fr", "mdp")).rejects.not.toBeInstanceOf(WimiAuthError);
  });
});

describe("userHasCmsAccess", () => {
  const session = { token: "t", userId: 7, accountId: 3 };
  it("true si l'espace autorisé est dans la liste", async () => {
    mockCall.mockResolvedValueOnce({ header: {}, data: { projects: [{ project_id: 41 }, { project_id: 42 }] } });
    await expect(userHasCmsAccess(session)).resolves.toBe(true);
  });
  it("false sinon", async () => {
    mockCall.mockResolvedValueOnce({ header: {}, data: { projects: [{ project_id: 41 }] } });
    await expect(userHasCmsAccess(session)).resolves.toBe(false);
  });
});

describe("JWT", () => {
  it("aller-retour sign/verify", async () => {
    const jwt = await signCmsJwt("a@b.fr", 7);
    await expect(verifyCmsJwt(jwt)).resolves.toEqual({ email: "a@b.fr", userId: 7 });
  });
  it("verify renvoie null sur un token altéré", async () => {
    const jwt = await signCmsJwt("a@b.fr", 7);
    await expect(verifyCmsJwt(jwt + "x")).resolves.toBeNull();
  });
  it("requireAuth lit le Bearer", async () => {
    const jwt = await signCmsJwt("a@b.fr", 7);
    const req = new Request("http://test/", { headers: { Authorization: `Bearer ${jwt}` } });
    await expect(requireAuth(req)).resolves.toEqual({ email: "a@b.fr", userId: 7 });
    await expect(requireAuth(new Request("http://test/"))).resolves.toBeNull();
  });
});

describe("rate-limit login", () => {
  it("bloque à partir de la 6e tentative sur 15 min", () => {
    for (let i = 0; i < 5; i++) expect(checkLoginRateLimit("1.2.3.4")).toBe(true);
    expect(checkLoginRateLimit("1.2.3.4")).toBe(false);
    expect(checkLoginRateLimit("5.6.7.8")).toBe(true); // autre IP indépendante
  });
});
```

- [ ] **Step 3: Vérifier l'échec**

Run: `npm test -- tests/cms-auth.test.ts`
Expected: FAIL — `@/lib/cms-auth` introuvable.

- [ ] **Step 4: Installer jose et implémenter `lib/cms-auth.ts`**

```bash
npm install jose
```

```ts
/**
 * lib/cms-auth.ts — Authentification du CMS par comptes Wimi
 *
 * Un éditeur est légitime si et seulement si :
 *  1. `auth.user.Login` réussit avec SES identifiants (jamais stockés/loggés) ;
 *  2. il a accès à l'espace Wimi `WIMI_CMS_SPACE_ID`.
 * On émet alors un JWT signé (12 h, durée du token Wimi) que l'app présente
 * en `Authorization: Bearer` sur toutes les routes /api/admin/*.
 */

import { jwtVerify, SignJWT } from "jose";
import { wimiCall, WimiApiError } from "@/lib/wimi";

export class WimiAuthError extends Error {
  constructor() {
    super("Identifiants Wimi refusés");
    this.name = "WimiAuthError";
  }
}

export type WimiUserSession = { token: string; userId: number; accountId: number };

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} manquant`);
  return v;
}

/** Login Wimi avec les identifiants de l'ÉDITEUR (pas le compte de service). */
export async function wimiUserLogin(email: string, password: string): Promise<WimiUserSession> {
  const accountName = requiredEnv("WIMI_ACCOUNT_NAME").replace(/\.wimi$/, "");
  let header: Record<string, unknown>, data: unknown;
  try {
    ({ header, data } = await wimiCall(
      "auth.user.Login",
      { account_name: accountName },
      null,
      { auth: { login: email, password } }
    ));
  } catch (e) {
    // body.error de Wimi = identifiants refusés ; toute autre erreur = panne.
    if (e instanceof WimiApiError) throw new WimiAuthError();
    throw e;
  }
  const token = header.token as string | undefined;
  const d = data as { user?: { user_id?: number }; account?: { account_id?: number } } | undefined;
  if (!token || !d?.user?.user_id || !d?.account?.account_id) {
    throw new Error("Wimi login : réponse sans token/user_id/account_id");
  }
  return { token, userId: d.user.user_id, accountId: d.account.account_id };
}

/** L'utilisateur a-t-il accès à l'espace qui donne droit au CMS ? */
export async function userHasCmsAccess(s: WimiUserSession): Promise<boolean> {
  const spaceId = Number(requiredEnv("WIMI_CMS_SPACE_ID"));
  const { data } = await wimiCall(
    "project.GetList",
    { account_id: s.accountId, user_id: s.userId },
    null,
    { token: s.token }
  );
  const projects = (data as { projects?: { project_id?: number }[] } | undefined)?.projects;
  return Array.isArray(projects) && projects.some((p) => p.project_id === spaceId);
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

const JWT_TTL = "12h"; // aligné sur la durée du token Wimi

function jwtSecret(): Uint8Array {
  return new TextEncoder().encode(requiredEnv("CMS_JWT_SECRET"));
}

export async function signCmsJwt(email: string, userId: number): Promise<string> {
  return new SignJWT({ email, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_TTL)
    .sign(jwtSecret());
}

export async function verifyCmsJwt(token: string): Promise<{ email: string; userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (typeof payload.email !== "string" || typeof payload.userId !== "number") return null;
    return { email: payload.email, userId: payload.userId };
  } catch {
    return null;
  }
}

/** Extrait et vérifie le Bearer d'une requête. `null` = non authentifié. */
export async function requireAuth(request: Request): Promise<{ email: string; userId: number } | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token ? verifyCmsJwt(token) : null;
}

// ─── Rate-limit du login (en mémoire — un seul process Render) ──────────────

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

/** Réservé aux tests. */
export function _resetRateLimit(): void {
  attempts.clear();
}
```

- [ ] **Step 5: Vérifier**

Run: `npm test -- tests/cms-auth.test.ts`
Expected: PASS (10 tests).

- [ ] **Step 6: Vérification empirique de la cible `project.GetList` (spike)**

La cible exacte de « liste des espaces de l'utilisateur » n'a jamais été appelée dans ce repo (l'agenda utilise `calendar.event.GetList` avec un `project_id` connu). À valider contre la vraie API avant de considérer la tâche finie :

```bash
# Écrire scripts/wimi-spike.mjs (temporaire, NE PAS COMMITER) qui :
#  1. fait auth.user.Login avec les identifiants de test (.env.local),
#  2. appelle project.GetList avec {account_id, user_id} + token,
#  3. affiche la réponse brute.
node --env-file=.env.local scripts/wimi-spike.mjs
```

- Si la réponse liste bien les espaces avec `project_id` → OK, supprimer le script.
- Si la cible ou la forme diffère (rappel : casse stricte, `msg_key` obligatoire, erreur dans `body.error`) → corriger `userHasCmsAccess` ET le test correspondant d'après la réponse réelle, documenter la cible correcte dans le commentaire de la fonction, supprimer le script.
- Si aucun identifiant de test n'est disponible dans l'environnement d'exécution → marquer ce step comme À VALIDER dans le message de commit et le signaler dans le rapport de fin de tâche ; ne pas inventer un résultat.

- [ ] **Step 7: Commit**

```bash
git add lib/wimi.ts lib/cms-auth.ts tests/cms-auth.test.ts package.json package-lock.json
git commit -m "CMS : auth par comptes Wimi (login relayé, contrôle d'espace, JWT 12h, rate-limit)"
```

---

### Task 4 : Route `POST /api/admin/login`

**Files:**
- Create: `app/api/admin/login/route.ts`
- Test: `tests/routes-login.test.ts`

**Interfaces:**
- Consumes: `wimiUserLogin`, `userHasCmsAccess`, `signCmsJwt`, `checkLoginRateLimit`, `WimiAuthError` (Task 3).
- Produces: `POST /api/admin/login` body `{ email, password }` →
  - 200 `{ token, email }` ; 400 payload invalide ; 401 identifiants refusés ;
  - 403 pas d'accès à l'espace ; 429 rate-limit ; 502 Wimi indisponible.
  - Réponses d'erreur : `{ error: string }` (message affichable tel quel dans l'app).

- [ ] **Step 1: Écrire les tests**

Créer `tests/routes-login.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms-auth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/cms-auth")>();
  return {
    ...mod,
    wimiUserLogin: vi.fn(),
    userHasCmsAccess: vi.fn(),
    checkLoginRateLimit: vi.fn(() => true),
  };
});

import { checkLoginRateLimit, userHasCmsAccess, WimiAuthError, wimiUserLogin } from "@/lib/cms-auth";
import { POST } from "@/app/api/admin/login/route";

const mockLogin = vi.mocked(wimiUserLogin);
const mockAccess = vi.mocked(userHasCmsAccess);
const mockRate = vi.mocked(checkLoginRateLimit);

function loginRequest(body: unknown): Request {
  return new Request("http://test/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  mockLogin.mockReset();
  mockAccess.mockReset();
  mockRate.mockReturnValue(true);
});

describe("POST /api/admin/login", () => {
  it("200 + JWT si login Wimi OK et accès à l'espace", async () => {
    mockLogin.mockResolvedValueOnce({ token: "t", userId: 7, accountId: 3 });
    mockAccess.mockResolvedValueOnce(true);
    const res = await POST(loginRequest({ email: "a@b.fr", password: "mdp" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.email).toBe("a@b.fr");
    expect(typeof json.token).toBe("string");
  });

  it("401 si identifiants refusés", async () => {
    mockLogin.mockRejectedValueOnce(new WimiAuthError());
    const res = await POST(loginRequest({ email: "a@b.fr", password: "faux" }));
    expect(res.status).toBe(401);
  });

  it("403 si pas d'accès à l'espace CMS", async () => {
    mockLogin.mockResolvedValueOnce({ token: "t", userId: 7, accountId: 3 });
    mockAccess.mockResolvedValueOnce(false);
    expect((await POST(loginRequest({ email: "a@b.fr", password: "mdp" }))).status).toBe(403);
  });

  it("502 si Wimi est en panne", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Wimi HTTP 503"));
    expect((await POST(loginRequest({ email: "a@b.fr", password: "mdp" }))).status).toBe(502);
  });

  it("400 si payload invalide", async () => {
    expect((await POST(loginRequest({ email: "pas-un-email" }))).status).toBe(400);
  });

  it("429 si rate-limit dépassé", async () => {
    mockRate.mockReturnValueOnce(false);
    expect((await POST(loginRequest({ email: "a@b.fr", password: "mdp" }))).status).toBe(429);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm test -- tests/routes-login.test.ts`
Expected: FAIL — route introuvable.

- [ ] **Step 3: Implémenter la route**

Créer `app/api/admin/login/route.ts` :

```ts
/**
 * POST /api/admin/login — Connexion au CMS par identifiants Wimi.
 *
 * Pas d'en-têtes CORS : ces routes sont réservées à l'app Electron
 * (hors navigateur). Le mot de passe est relayé à Wimi puis oublié.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  checkLoginRateLimit, signCmsJwt, userHasCmsAccess, WimiAuthError, wimiUserLogin,
} from "@/lib/cms-auth";

const BodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "inconnue").split(",")[0].trim();
  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives — réessayez dans 15 minutes." },
      { status: 429 }
    );
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou mot de passe manquant." }, { status: 400 });
  }

  let session;
  try {
    session = await wimiUserLogin(parsed.data.email, parsed.data.password);
  } catch (e) {
    if (e instanceof WimiAuthError) {
      return NextResponse.json({ error: "Identifiants Wimi incorrects." }, { status: 401 });
    }
    console.error("[admin/login] Wimi indisponible :", e);
    return NextResponse.json(
      { error: "Service Wimi indisponible — réessayez plus tard." },
      { status: 502 }
    );
  }

  if (!(await userHasCmsAccess(session))) {
    return NextResponse.json(
      { error: "Votre compte Wimi n'a pas accès à l'espace du CMS." },
      { status: 403 }
    );
  }

  const token = await signCmsJwt(parsed.data.email, session.userId);
  return NextResponse.json({ token, email: parsed.data.email });
}
```

- [ ] **Step 4: Vérifier**

Run: `npm test -- tests/routes-login.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/login/route.ts tests/routes-login.test.ts
git commit -m "CMS : route POST /api/admin/login (Wimi + espace + JWT)"
```

---

### Task 5 : Verrous d'édition (`lib/cms-locks.ts` + route)

**Files:**
- Create: `lib/cms-locks.ts`
- Create: `app/api/admin/lock/[collection]/route.ts`
- Test: `tests/cms-locks.test.ts`

**Interfaces:**
- Consumes: `readLocks`/`writeLocks` (Task 2), `requireAuth` (Task 3), `registry` (Task 1).
- Produces :
  - `type LockStatus = { locked: false } | { locked: true; email: string; expiresAt: string; ownedByCaller: boolean }`
  - `acquireLock(collection: string, email: string): Promise<{ ok: true; expiresAt: string } | { ok: false; heldBy: string; expiresAt: string }>`
  - `releaseLock(collection: string, email: string): Promise<boolean>` — `false` si le verrou appartient à quelqu'un d'autre.
  - `holdsLock(collection: string, email: string): Promise<boolean>` — utilisé par le PUT de la Task 6.
  - Route : `GET /api/admin/lock/{collection}` → 200 `LockStatus` ; `POST` → 200 `{ expiresAt }` ou 423 `{ error, heldBy, expiresAt }` ; `DELETE` → 204 ou 403. Toutes : 401 sans JWT, 404 si collection hors registre.

- [ ] **Step 1: Écrire les tests**

Créer `tests/cms-locks.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ readLocks: vi.fn(), writeLocks: vi.fn() }));

import { readLocks, writeLocks, type Locks } from "@/lib/github";
import { acquireLock, holdsLock, releaseLock } from "@/lib/cms-locks";

const mockRead = vi.mocked(readLocks);
const mockWrite = vi.mocked(writeLocks);

const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const past = new Date(Date.now() - 60 * 1000).toISOString();

function withLocks(locks: Locks) {
  mockRead.mockResolvedValue({ locks, sha: "s1" });
}

beforeEach(() => {
  mockRead.mockReset();
  mockWrite.mockReset();
  mockWrite.mockResolvedValue(true);
});

describe("acquireLock", () => {
  it("accorde un verrou libre et l'écrit avec une expiration à ~24h", async () => {
    withLocks({});
    const result = await acquireLock("presse", "a@b.fr");
    expect(result.ok).toBe(true);
    const written = mockWrite.mock.calls[0][0];
    expect(written.presse.email).toBe("a@b.fr");
    const ttlH = (new Date(written.presse.expiresAt).getTime() - Date.now()) / 3_600_000;
    expect(ttlH).toBeGreaterThan(23.9);
    expect(ttlH).toBeLessThan(24.1);
  });

  it("refuse si verrouillé par quelqu'un d'autre (non expiré)", async () => {
    withLocks({ presse: { email: "autre@b.fr", expiresAt: future } });
    const result = await acquireLock("presse", "a@b.fr");
    expect(result).toEqual({ ok: false, heldBy: "autre@b.fr", expiresAt: future });
    expect(mockWrite).not.toHaveBeenCalled();
  });

  it("un verrou expiré est considéré libre", async () => {
    withLocks({ presse: { email: "autre@b.fr", expiresAt: past } });
    expect((await acquireLock("presse", "a@b.fr")).ok).toBe(true);
  });

  it("le détenteur peut reprendre son propre verrou (expiration rafraîchie)", async () => {
    withLocks({ presse: { email: "a@b.fr", expiresAt: future } });
    expect((await acquireLock("presse", "a@b.fr")).ok).toBe(true);
    expect(mockWrite).toHaveBeenCalled();
  });

  it("relit et réessaie une fois sur conflit d'écriture GitHub", async () => {
    withLocks({});
    mockWrite.mockResolvedValueOnce(false); // 1er essai : quelqu'un a écrit entre-temps
    mockWrite.mockResolvedValueOnce(true);
    expect((await acquireLock("presse", "a@b.fr")).ok).toBe(true);
    expect(mockRead).toHaveBeenCalledTimes(2);
  });
});

describe("releaseLock / holdsLock", () => {
  it("libère son propre verrou", async () => {
    withLocks({ presse: { email: "a@b.fr", expiresAt: future } });
    expect(await releaseLock("presse", "a@b.fr")).toBe(true);
    expect(mockWrite.mock.calls[0][0]).toEqual({});
  });

  it("refuse de libérer le verrou d'autrui", async () => {
    withLocks({ presse: { email: "autre@b.fr", expiresAt: future } });
    expect(await releaseLock("presse", "a@b.fr")).toBe(false);
  });

  it("holdsLock : vrai seulement pour le détenteur d'un verrou non expiré", async () => {
    withLocks({ presse: { email: "a@b.fr", expiresAt: future } });
    expect(await holdsLock("presse", "a@b.fr")).toBe(true);
    expect(await holdsLock("presse", "autre@b.fr")).toBe(false);
    withLocks({ presse: { email: "a@b.fr", expiresAt: past } });
    expect(await holdsLock("presse", "a@b.fr")).toBe(false);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm test -- tests/cms-locks.test.ts`
Expected: FAIL — `@/lib/cms-locks` introuvable.

- [ ] **Step 3: Implémenter `lib/cms-locks.ts`**

```ts
/**
 * lib/cms-locks.ts — Verrouillage exclusif d'édition
 *
 * Un verrou = { email, expiresAt } dans locks.json (branche cms-locks, via
 * lib/github.ts). Durée : jusqu'à publication, libération explicite, ou 24 h.
 * Le sha de locks.json sert de verrou optimiste : une écriture concurrente
 * échoue → on relit et on réessaie une fois.
 */

import { readLocks, writeLocks, type Locks } from "@/lib/github";

const LOCK_TTL_MS = 24 * 60 * 60 * 1000;

export type LockStatus =
  | { locked: false }
  | { locked: true; email: string; expiresAt: string; ownedByCaller: boolean };

function isExpired(lock: { expiresAt: string }): boolean {
  return Date.now() > new Date(lock.expiresAt).getTime();
}

/** Verrou actif (non expiré) d'une collection, ou null. */
function activeLock(locks: Locks, collection: string) {
  const lock = locks[collection];
  return lock && !isExpired(lock) ? lock : null;
}

export async function getLockStatus(collection: string, callerEmail: string): Promise<LockStatus> {
  const { locks } = await readLocks();
  const lock = activeLock(locks, collection);
  if (!lock) return { locked: false };
  return { locked: true, email: lock.email, expiresAt: lock.expiresAt, ownedByCaller: lock.email === callerEmail };
}

export async function acquireLock(
  collection: string,
  email: string
): Promise<{ ok: true; expiresAt: string } | { ok: false; heldBy: string; expiresAt: string }> {
  // 2 essais : le second couvre une écriture concurrente sur locks.json.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { locks, sha } = await readLocks();
    const lock = activeLock(locks, collection);
    if (lock && lock.email !== email) {
      return { ok: false, heldBy: lock.email, expiresAt: lock.expiresAt };
    }
    const expiresAt = new Date(Date.now() + LOCK_TTL_MS).toISOString();
    const next: Locks = { ...locks, [collection]: { email, expiresAt } };
    if (await writeLocks(next, sha)) return { ok: true, expiresAt };
  }
  throw new Error("Impossible d'écrire le verrou (conflits répétés)");
}

/** Libère le verrou. `false` s'il appartient à quelqu'un d'autre. */
export async function releaseLock(collection: string, email: string): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { locks, sha } = await readLocks();
    const lock = activeLock(locks, collection);
    if (lock && lock.email !== email) return false;
    if (!locks[collection]) return true; // déjà libre (ou expiré et absent)
    const next = { ...locks };
    delete next[collection];
    if (await writeLocks(next, sha)) return true;
  }
  throw new Error("Impossible de libérer le verrou (conflits répétés)");
}

/** L'appelant détient-il un verrou valide ? (exigé pour publier) */
export async function holdsLock(collection: string, email: string): Promise<boolean> {
  const { locks } = await readLocks();
  return activeLock(locks, collection)?.email === email;
}
```

- [ ] **Step 4: Vérifier**

Run: `npm test -- tests/cms-locks.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Implémenter la route (pas de nouveau test unitaire : logique déjà couverte, la route n'est que du câblage)**

Créer `app/api/admin/lock/[collection]/route.ts` :

```ts
/**
 * /api/admin/lock/{collection} — Verrou d'édition exclusif.
 * GET = état ; POST = acquérir (423 si pris) ; DELETE = libérer (403 si autrui).
 */

import { NextResponse } from "next/server";
import { registry } from "@/content/registry";
import { requireAuth } from "@/lib/cms-auth";
import { acquireLock, getLockStatus, releaseLock } from "@/lib/cms-locks";

type Ctx = { params: Promise<{ collection: string }> };

async function checkRequest(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth) return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  const { collection } = await ctx.params;
  if (!registry[collection]) {
    return { error: NextResponse.json({ error: "Collection inconnue." }, { status: 404 }) };
  }
  return { auth, collection };
}

export async function GET(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  return NextResponse.json(await getLockStatus(checked.collection, checked.auth.email));
}

export async function POST(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const result = await acquireLock(checked.collection, checked.auth.email);
  if (!result.ok) {
    return NextResponse.json(
      { error: `En cours d'édition par ${result.heldBy}.`, heldBy: result.heldBy, expiresAt: result.expiresAt },
      { status: 423 }
    );
  }
  return NextResponse.json({ expiresAt: result.expiresAt });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const released = await releaseLock(checked.collection, checked.auth.email);
  if (!released) {
    return NextResponse.json({ error: "Ce verrou appartient à quelqu'un d'autre." }, { status: 403 });
  }
  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 6: Vérifier build + tests**

Run: `npm test && npm run build`
Expected: tous les tests PASS, build sans erreur (la route compile avec `params` en Promise).

- [ ] **Step 7: Commit**

```bash
git add lib/cms-locks.ts app/api/admin/lock tests/cms-locks.test.ts
git commit -m "CMS : verrous d'édition exclusifs 24h (branche cms-locks) + route /api/admin/lock"
```

---

### Task 6 : Contenu — `GET`/`PUT /api/admin/content/{collection}`

Lecture depuis `main` via GitHub ; publication = validation Zod + vérification du verrou + commit unique (JSON + images) + libération du verrou.

**Files:**
- Create: `lib/cms-publish.ts`
- Create: `app/api/admin/content/[collection]/route.ts`
- Test: `tests/cms-publish.test.ts`

**Interfaces:**
- Consumes: `registry`, `payloadSchema` (Task 1) ; `getFile`, `commitFiles`, `RepoFile` (Task 2) ; `requireAuth` (Task 3) ; `holdsLock`, `releaseLock` (Task 5).
- Produces :
  - `type ImageUpload = { path: string; base64: string }` — `path` de la forme `uploads/<collection>/<slug>-<hash8>.webp`.
  - `validateImages(collection: string, images: ImageUpload[]): string | null` — message d'erreur ou `null` si OK (chemin conforme, magic bytes WebP, ≤ 4 Mo).
  - `publish(collection: string, email: string, content: unknown, images: ImageUpload[]): Promise<{ commitSha: string }>` — lève `PublishError` (avec `status` HTTP) sur toute violation.
  - Routes : `GET` → 200 `{ content, sha }` ; `PUT` body `{ content, images? }` → 200 `{ commitSha }`, 400 contenu/images invalides, 401 sans JWT, 404 collection inconnue, 409 verrou non détenu.

- [ ] **Step 1: Écrire les tests**

Créer `tests/cms-publish.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ getFile: vi.fn(), commitFiles: vi.fn() }));
vi.mock("@/lib/cms-locks", () => ({ holdsLock: vi.fn(), releaseLock: vi.fn() }));

import { commitFiles } from "@/lib/github";
import { holdsLock, releaseLock } from "@/lib/cms-locks";
import { publish, PublishError, validateImages } from "@/lib/cms-publish";

const mockCommit = vi.mocked(commitFiles);
const mockHolds = vi.mocked(holdsLock);
const mockRelease = vi.mocked(releaseLock);

// WebP minimal : RIFF....WEBP (12 octets d'en-tête suffisent pour le magic check)
const webpBase64 = Buffer.concat([
  Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"),
]).toString("base64");

const validPresse = [
  { id: "p-001", title: "Titre", source: "Nice-Matin", date: "2026-06" },
];

beforeEach(() => {
  mockCommit.mockReset().mockResolvedValue("commit1");
  mockHolds.mockReset().mockResolvedValue(true);
  mockRelease.mockReset().mockResolvedValue(true);
});

describe("validateImages", () => {
  it("accepte un WebP conforme au bon chemin", () => {
    expect(validateImages("presse", [{ path: "uploads/presse/photo-a1b2c3d4.webp", base64: webpBase64 }])).toBeNull();
  });
  it("refuse un chemin hors uploads/<collection>/ (traversal)", () => {
    expect(validateImages("presse", [{ path: "uploads/../lib/x.webp", base64: webpBase64 }])).toBeTruthy();
    expect(validateImages("presse", [{ path: "uploads/autre/x-a1b2c3d4.webp", base64: webpBase64 }])).toBeTruthy();
  });
  it("refuse un fichier qui n'est pas du WebP", () => {
    const png = Buffer.from("\x89PNG mais pas webp").toString("base64");
    expect(validateImages("presse", [{ path: "uploads/presse/x-a1b2c3d4.webp", base64: png }])).toBeTruthy();
  });
  it("refuse au-delà de 4 Mo", () => {
    const big = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBP"), Buffer.alloc(4 * 1024 * 1024)]).toString("base64");
    expect(validateImages("presse", [{ path: "uploads/presse/x-a1b2c3d4.webp", base64: big }])).toBeTruthy();
  });
});

describe("publish", () => {
  it("valide, commite JSON + images en un commit, libère le verrou", async () => {
    const result = await publish("presse", "a@b.fr", validPresse, [
      { path: "uploads/presse/photo-a1b2c3d4.webp", base64: webpBase64 },
    ]);
    expect(result).toEqual({ commitSha: "commit1" });
    const [files, message] = mockCommit.mock.calls[0];
    expect(files).toHaveLength(2);
    expect(files[0]).toMatchObject({ path: "content/actualites/presse.json" });
    expect(files[1]).toMatchObject({ path: "public/uploads/presse/photo-a1b2c3d4.webp" });
    expect(message).toContain("a@b.fr");
    expect(mockRelease).toHaveBeenCalledWith("presse", "a@b.fr");
  });

  it("409 si l'appelant ne détient pas le verrou", async () => {
    mockHolds.mockResolvedValueOnce(false);
    await expect(publish("presse", "a@b.fr", validPresse, [])).rejects.toMatchObject({ status: 409 });
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("400 si le contenu viole le schéma Zod", async () => {
    await expect(publish("presse", "a@b.fr", [{ id: "x", title: "", source: "s", date: "2026-06" }], []))
      .rejects.toMatchObject({ status: 400 });
    expect(mockCommit).not.toHaveBeenCalled();
  });

  it("le JSON commité est formaté (2 espaces + saut de ligne final)", async () => {
    await publish("presse", "a@b.fr", validPresse, []);
    const file = mockCommit.mock.calls[0][0][0] as { content: string };
    expect(file.content).toBe(JSON.stringify(validPresse, null, 2) + "\n");
  });

  it("PublishError si collection inconnue (404)", async () => {
    await expect(publish("inconnue", "a@b.fr", [], [])).rejects.toMatchObject({ status: 404 });
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm test -- tests/cms-publish.test.ts`
Expected: FAIL — `@/lib/cms-publish` introuvable.

- [ ] **Step 3: Implémenter `lib/cms-publish.ts`**

```ts
/**
 * lib/cms-publish.ts — Publication d'une collection
 *
 * publish() est la SEULE porte d'écriture vers main : verrou exigé,
 * contenu revalidé par le schéma Zod du build (un contenu invalide ne peut
 * pas casser le build), images revérifiées (chemin liste-blanche, magic
 * bytes WebP, taille), un unique commit, verrou libéré en cas de succès.
 */

import { payloadSchema, registry } from "@/content/registry";
import { holdsLock, releaseLock } from "@/lib/cms-locks";
import { commitFiles, type RepoFile } from "@/lib/github";

export type ImageUpload = { path: string; base64: string };

export class PublishError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "PublishError";
  }
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** Chemin imposé : uploads/<collection>/<slug>-<hash8>.webp (aucun traversal possible). */
function imagePathPattern(collection: string): RegExp {
  return new RegExp(`^uploads/${collection}/[a-z0-9][a-z0-9-]*-[a-f0-9]{8}\\.webp$`);
}

/** Message d'erreur, ou null si toutes les images sont acceptables. */
export function validateImages(collection: string, images: ImageUpload[]): string | null {
  const pattern = imagePathPattern(collection);
  for (const img of images) {
    if (!pattern.test(img.path)) {
      return `Chemin d'image non autorisé : ${img.path}`;
    }
    const bytes = Buffer.from(img.base64, "base64");
    if (bytes.length > MAX_IMAGE_BYTES) {
      return `Image trop lourde (max 4 Mo) : ${img.path}`;
    }
    // Magic bytes WebP : "RIFF" [taille 4 octets] "WEBP"
    if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
        bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
      return `Format invalide (WebP attendu) : ${img.path}`;
    }
  }
  return null;
}

export async function publish(
  collection: string,
  email: string,
  content: unknown,
  images: ImageUpload[]
): Promise<{ commitSha: string }> {
  const entry = registry[collection];
  if (!entry) throw new PublishError("Collection inconnue.", 404);

  if (!(await holdsLock(collection, email))) {
    throw new PublishError(
      "Vous ne détenez pas (ou plus) le verrou d'édition de cette collection.",
      409
    );
  }

  const parsed = payloadSchema(entry).safeParse(content);
  if (!parsed.success) {
    throw new PublishError(`Contenu invalide : ${parsed.error.message}`, 400);
  }

  const imageError = validateImages(collection, images);
  if (imageError) throw new PublishError(imageError, 400);

  const files: RepoFile[] = [
    { path: `content/${entry.file}`, content: JSON.stringify(parsed.data, null, 2) + "\n" },
    ...images.map((img) => ({ path: `public/${img.path}`, contentBase64: img.base64 })),
  ];

  const commitSha = await commitFiles(files, `CMS : ${entry.label} modifié par ${email}`);
  await releaseLock(collection, email);
  return { commitSha };
}
```

- [ ] **Step 4: Vérifier**

Run: `npm test -- tests/cms-publish.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Implémenter la route (câblage)**

Créer `app/api/admin/content/[collection]/route.ts` :

```ts
/**
 * /api/admin/content/{collection}
 * GET = contenu actuel lu depuis main via l'API GitHub (jamais le disque
 * Render, périmé après un commit CMS). PUT = publication (verrou requis).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { registry } from "@/content/registry";
import { requireAuth } from "@/lib/cms-auth";
import { publish, PublishError } from "@/lib/cms-publish";
import { getFile } from "@/lib/github";

type Ctx = { params: Promise<{ collection: string }> };

const PutSchema = z.object({
  content: z.unknown(),
  images: z.array(z.object({ path: z.string(), base64: z.string() })).default([]),
});

async function checkRequest(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth) return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  const { collection } = await ctx.params;
  if (!registry[collection]) {
    return { error: NextResponse.json({ error: "Collection inconnue." }, { status: 404 }) };
  }
  return { auth, collection };
}

export async function GET(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const file = await getFile(`content/${registry[checked.collection].file}`);
  if (!file) return NextResponse.json({ error: "Fichier introuvable sur main." }, { status: 404 });
  return NextResponse.json({ content: JSON.parse(file.text), sha: file.sha });
}

export async function PUT(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const parsed = PutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload invalide." }, { status: 400 });

  try {
    const result = await publish(
      checked.collection, checked.auth.email, parsed.data.content, parsed.data.images
    );
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof PublishError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[admin/content] publication échouée :", e);
    return NextResponse.json({ error: "Publication échouée — réessayez." }, { status: 502 });
  }
}
```

- [ ] **Step 6: Vérifier build + tests**

Run: `npm test && npm run build`
Expected: PASS partout, build OK.

- [ ] **Step 7: Commit**

```bash
git add lib/cms-publish.ts app/api/admin/content tests/cms-publish.test.ts
git commit -m "CMS : publication de contenu (validation Zod, images WebP, commit unique) + routes GET/PUT"
```

---

### Task 7 : Route `GET /api/admin/status` (déploiement + version minimale)

**Files:**
- Create: `app/api/admin/status/route.ts`
- Test: `tests/routes-status.test.ts`

**Interfaces:**
- Consumes: `getPagesRunForCommit` (Task 2), `requireAuth` (Task 3), env `CMS_MIN_APP_VERSION`.
- Produces: `GET /api/admin/status?sha=<commit>` → 200 `{ minAppVersion: string, deploy: { status, conclusion, url } | null }` (`deploy: null` sans `?sha` ou si aucun run trouvé) ; 401 sans JWT. C'est aussi la route que l'app (Plan 2) sonde au démarrage pour le contrôle de version et la détection du cold start Render.

- [ ] **Step 1: Écrire les tests**

Créer `tests/routes-status.test.ts` :

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/github", () => ({ getPagesRunForCommit: vi.fn() }));

import { getPagesRunForCommit } from "@/lib/github";
import { signCmsJwt } from "@/lib/cms-auth";
import { GET } from "@/app/api/admin/status/route";

const mockRun = vi.mocked(getPagesRunForCommit);

async function authedRequest(url: string): Promise<Request> {
  const jwt = await signCmsJwt("a@b.fr", 7);
  return new Request(url, { headers: { Authorization: `Bearer ${jwt}` } });
}

beforeEach(() => {
  process.env.CMS_JWT_SECRET = "secret-de-test-suffisamment-long";
  process.env.CMS_MIN_APP_VERSION = "1.0.0";
  mockRun.mockReset();
});

describe("GET /api/admin/status", () => {
  it("401 sans JWT", async () => {
    expect((await GET(new Request("http://test/api/admin/status"))).status).toBe(401);
  });

  it("renvoie la version minimale, deploy null sans sha", async () => {
    const res = await GET(await authedRequest("http://test/api/admin/status"));
    expect(await res.json()).toEqual({ minAppVersion: "1.0.0", deploy: null });
  });

  it("relaie le run Actions du commit demandé", async () => {
    mockRun.mockResolvedValueOnce({ status: "completed", conclusion: "success", url: "https://gh/run/1" });
    const res = await GET(await authedRequest("http://test/api/admin/status?sha=abc123"));
    expect((await res.json()).deploy).toEqual({ status: "completed", conclusion: "success", url: "https://gh/run/1" });
    expect(mockRun).toHaveBeenCalledWith("abc123");
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm test -- tests/routes-status.test.ts`
Expected: FAIL — route introuvable.

- [ ] **Step 3: Implémenter**

Créer `app/api/admin/status/route.ts` :

```ts
/**
 * GET /api/admin/status — Version minimale d'app requise + état du
 * déploiement Pages d'un commit (?sha=...). Sondée par l'app au démarrage
 * (contrôle de version, détection du réveil Render) et après publication.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/cms-auth";
import { getPagesRunForCommit } from "@/lib/github";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const sha = new URL(request.url).searchParams.get("sha");
  const deploy = sha ? await getPagesRunForCommit(sha) : null;
  return NextResponse.json({
    minAppVersion: process.env.CMS_MIN_APP_VERSION ?? "0.0.0",
    deploy,
  });
}
```

- [ ] **Step 4: Vérifier**

Run: `npm test -- tests/routes-status.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/status tests/routes-status.test.ts
git commit -m "CMS : route /api/admin/status (version min de l'app + état du déploiement Pages)"
```

---

### Task 8 : Configuration de déploiement (render.yaml) + vérification finale

**Files:**
- Modify: `render.yaml` (nouvelles env vars + build filter)
- (Vérification : `.github/workflows/deploy.yml` retire déjà `app/api` entier — `app/api/admin` inclus — rien à changer côté Pages dans ce plan.)

**Interfaces:**
- Consumes: tout le plan.
- Produces: backend déployable ; documentation des variables à saisir dans le dashboard Render.

- [ ] **Step 1: Compléter `render.yaml`**

Dans `envVars`, ajouter après les entrées Wimi existantes :

```yaml
      # ─── CMS (Phase 2) ───
      - key: GITHUB_CMS_TOKEN # PAT fine-grained : ce repo, contents:write + actions:read
        sync: false
      - key: GITHUB_REPO # ex. "org/tn-site"
        sync: false
      - key: WIMI_CMS_SPACE_ID # espace Wimi donnant droit d'accès au CMS
        sync: false
      - key: CMS_JWT_SECRET # openssl rand -hex 32
        sync: false
      - key: CMS_MIN_APP_VERSION # version minimale de l'app CMS acceptée
        value: "0.0.0"
```

Et au niveau du service (même indentation que `startCommand`), le filtre de build — les commits de contenu du CMS ne doivent pas redéployer le backend :

```yaml
    buildFilter:
      ignoredPaths:
        - content/**
        - public/uploads/**
        - cms/**
        - docs/**
```

- [ ] **Step 2: Vérification complète**

Run: `npm test && npm run lint && npm run build`
Expected: tous les tests PASS, lint sans erreur, build OK.

- [ ] **Step 3: Commit + push**

```bash
git add render.yaml
git commit -m "CMS : variables d'env Render + build filter (les commits de contenu ne redéploient pas le backend)"
git push
```

Note : le push déclenche le déploiement Pages (sans effet visible : aucun changement de pages publiques) et le déploiement Render (qui active les routes admin — elles répondront 500 tant que les nouvelles variables ne sont pas saisies dans le dashboard Render, c'est attendu).

- [ ] **Step 4: Actions manuelles à demander à l'utilisateur (bloquantes pour la mise en service, pas pour le code)**

À lister dans le rapport final :
1. Créer le PAT GitHub fine-grained (repo seul, `contents: write` + `actions: read`) → `GITHUB_CMS_TOKEN`.
2. Renseigner sur Render : `GITHUB_CMS_TOKEN`, `GITHUB_REPO`, `WIMI_CMS_SPACE_ID`, `CMS_JWT_SECRET` (`openssl rand -hex 32`).
3. Fournir l'ID de l'espace Wimi qui donne droit au CMS.
4. Test de bout en bout avec de vrais identifiants Wimi :
   `curl -X POST https://<backend>/api/admin/login -H 'Content-Type: application/json' -d '{"email":"…","password":"…"}'` → doit renvoyer un token.

---

## Hors périmètre de ce plan (plans suivants)

- **Plan 2 — App Electron** (`cms/`) : UI, formulaires générés depuis `registry`, brouillons locaux, redimensionnement/conversion WebP des images, `safeStorage`, gestion du cold start Render.
- **Plan 3 — Distribution** : workflow `cms-v*` (electron-builder, matrice 3 OS, GitHub Releases), electron-updater, `paths-ignore: cms/**` sur le workflow Pages.
- **Plans de migration** : lots 2-4 de pages (spec §7).
