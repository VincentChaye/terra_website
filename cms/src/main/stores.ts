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
