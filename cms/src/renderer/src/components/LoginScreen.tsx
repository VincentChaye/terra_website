/**
 * Connexion par identifiants Wimi. Le mot de passe part au backend (HTTPS)
 * qui le relaie à Wimi — jamais stocké. Au-delà de 8 s, la lenteur est
 * presque sûrement le réveil du serveur Render (plan free) : on l'affiche.
 */

import { useRef, useState } from "react";
import { ApiError } from "../lib/api";

const WAKING_HINT_MS = 8_000;

export function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [waking, setWaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wakingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    wakingTimer.current = setTimeout(() => setWaking(true), WAKING_HINT_MS);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Serveur injoignable — vérifiez votre connexion internet puis réessayez."
      );
    } finally {
      clearTimeout(wakingTimer.current);
      setPending(false);
      setWaking(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1>Terra Numerica — CMS</h1>
        <p className="muted">Connectez-vous avec votre compte Wimi.</p>
        <div className="field">
          <label htmlFor="login-email">Email Wimi</label>
          <input id="login-email" type="email" required value={email} disabled={pending}
            onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="login-password">Mot de passe</label>
          <input id="login-password" type="password" required value={password} disabled={pending}
            onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "Connexion…" : "Se connecter"}
        </button>
        {waking && (
          <p className="muted">Réveil du serveur… (jusqu'à une minute, merci de patienter)</p>
        )}
        {error && <p className="field-error" role="alert">{error}</p>}
      </form>
    </div>
  );
}
