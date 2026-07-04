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
