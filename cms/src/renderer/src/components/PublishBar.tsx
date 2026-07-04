/**
 * Publier = un commit sur main (via le backend) puis suivi du déploiement
 * Pages jusqu'à son issue. Le PUT n'est jamais rejoué automatiquement
 * (voir main/api.ts) : en cas d'erreur, l'utilisateur décide.
 */

import { useEffect, useState } from "react";
import type { RegistryEntry } from "@site/content/registry";
import { api, ApiError, type DeployRun } from "../lib/api";
import { deployLabel, invalidItems, usedImages } from "../lib/publish";
import type { Session } from "../lib/session";
import type { Draft } from "./CollectionScreen";

export const DEPLOY_POLL_MS = 10_000;

type PublishState =
  | { step: "idle" }
  | { step: "publishing" }
  | { step: "deploying"; sha: string; deploy: DeployRun | null }
  | { step: "failed"; message: string };

type Props = {
  entry: RegistryEntry;
  collection: string;
  session: Session;
  draft: Draft | null;
  editing: boolean;
  /** Publication acceptée : le parent purge le brouillon et l'état du verrou. */
  onPublished: () => void;
  onError: (e: unknown) => void;
};

export function PublishBar({ entry, collection, session, draft, editing, onPublished, onError }: Props) {
  const [state, setState] = useState<PublishState>({ step: "idle" });

  const problems = draft ? invalidItems(entry, draft.content) : [];
  const canPublish = editing && draft !== null && problems.length === 0 && state.step !== "publishing";

  async function publishNow() {
    if (!draft) return;
    setState({ step: "publishing" });
    try {
      const { commitSha } = await api.putContent(
        session.token,
        collection,
        draft.content,
        usedImages(draft.content, draft.images)
      );
      onPublished();
      setState({ step: "deploying", sha: commitSha, deploy: null });
    } catch (e) {
      if (e instanceof ApiError) {
        setState({ step: "failed", message: e.message });
      } else {
        setState({ step: "idle" });
        onError(e);
      }
    }
  }

  // Sondage du déploiement Pages jusqu'à son issue.
  useEffect(() => {
    if (state.step !== "deploying" || state.deploy?.status === "completed") return;
    const timer = setInterval(async () => {
      try {
        const { deploy } = await api.status(session.token, state.sha);
        setState((s) => (s.step === "deploying" ? { ...s, deploy } : s));
      } catch {
        // panne passagère : on retentera au prochain tick
      }
    }, DEPLOY_POLL_MS);
    return () => clearInterval(timer);
  }, [state, session.token]);

  return (
    <div className="publish-bar">
      {draft && problems.length > 0 && (
        <p className="field-error">
          Éléments à corriger avant publication : {problems.join(", ")}
        </p>
      )}
      <button className="primary" disabled={!canPublish} onClick={() => void publishNow()}>
        {state.step === "publishing" ? "Publication…" : "Publier"}
      </button>
      {state.step === "deploying" && <DeployBadge deploy={state.deploy} />}
      {state.step === "failed" && (
        <p className="field-error" role="alert">Publication refusée : {state.message}</p>
      )}
    </div>
  );
}

function DeployBadge({ deploy }: { deploy: DeployRun | null }) {
  const { text, tone } = deployLabel(deploy);
  return <p className={`deploy-badge deploy-${tone}`}>{text}</p>;
}
