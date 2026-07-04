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
