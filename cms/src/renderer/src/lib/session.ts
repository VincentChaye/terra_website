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
