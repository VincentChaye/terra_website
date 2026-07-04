/**
 * Coquille : contrôle de version au démarrage (le backend impose
 * CMS_MIN_APP_VERSION — une app aux schémas périmés est bloquée, spec §8),
 * puis barre latérale générée depuis le registre.
 */

import { useEffect, useState } from "react";
import { api, ApiError, versionAtLeast } from "../lib/api";
import { groupedRegistry } from "../lib/form";
import type { Session } from "../lib/session";

type Gate = "checking" | "ok" | "outdated" | "offline";

export function Shell({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [gate, setGate] = useState<Gate>("checking");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [status, version] = await Promise.all([
          api.status(session.token),
          window.cms.appVersion(),
        ]);
        if (cancelled) return;
        setGate(versionAtLeast(version, status.minAppVersion) ? "ok" : "outdated");
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 401) {
          onLogout(); // JWT expiré → retour au login
          return;
        }
        setGate("offline");
      }
    })();
    return () => { cancelled = true; };
  }, [session.token, onLogout]);

  if (gate === "checking") {
    return <p className="centered">Connexion au serveur… (le réveil peut prendre une minute)</p>;
  }
  if (gate === "outdated") {
    return (
      <div className="centered">
        <h1>Mise à jour requise</h1>
        <p>
          Cette version de l'application est trop ancienne pour le serveur.
          Téléchargez la dernière version puis relancez.
        </p>
      </div>
    );
  }
  if (gate === "offline") {
    return (
      <div className="centered">
        <p>Serveur injoignable — vérifiez votre connexion puis relancez l'application.</p>
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <header>
          <strong>Terra Numerica — CMS</strong>
          <span className="muted">{session.email}</span>
        </header>
        <nav>
          {groupedRegistry().map(([group, entries]) => (
            <section key={group}>
              <h2>{group}</h2>
              {entries.map(([key, entry]) => (
                <button key={key} className={selected === key ? "active" : ""}
                  onClick={() => setSelected(key)}>
                  {entry.label}
                </button>
              ))}
            </section>
          ))}
        </nav>
        <button className="logout" onClick={onLogout}>Se déconnecter</button>
      </aside>
      <main>
        {selected ? (
          /* Remplacé par <CollectionScreen> en Task 9. */
          <p className="centered">{selected}</p>
        ) : (
          <p className="centered">Choisissez un contenu à modifier dans le menu.</p>
        )}
      </main>
    </div>
  );
}
