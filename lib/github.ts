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
