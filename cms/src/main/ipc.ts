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
