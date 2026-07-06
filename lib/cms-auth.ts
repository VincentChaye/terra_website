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
  // Cible validée empiriquement (2026-07-06) : « project.GetList » n'existe pas
  // (la WApi renvoie un 400 générique pour toute cible inconnue). La liste des
  // espaces accessibles à la session est main.session.LoadProjects — réponse
  // { projects: [{ project_id, … }], pagination } (batch_size 250 : pas de
  // pagination à gérer à l'échelle de l'association).
  const { data } = await wimiCall(
    "main.session.LoadProjects",
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
