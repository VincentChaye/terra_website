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
