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
  apiRequest: (path, opts) => ipcRenderer.invoke("api:request", path, opts),
};

contextBridge.exposeInMainWorld("cms", bridge);
