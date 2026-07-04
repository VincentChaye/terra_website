/**
 * Écran d'une entrée du registre : liste + formulaire (collection) ou
 * formulaire direct (singleton).
 *
 * Règles (spec §4-5) :
 *  - lecture : toujours le contenu de main (API GitHub via le backend) ;
 *  - édition : uniquement verrou en poche (sinon lecture seule + bandeau) ;
 *  - toute modification vit dans un brouillon local (userData/drafts),
 *    autosauvegardé — fermer ou planter ne perd rien ;
 *  - publication : Task 10 (PublishBar).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { registry } from "@site/content/registry";
import { api, ApiError, type LockStatus } from "../lib/api";
import { emptyItem, fieldErrors, itemLabel, moveItem } from "../lib/form";
import type { Session } from "../lib/session";
import { ItemForm } from "./ItemForm";
import { PublishBar } from "./PublishBar";

export type Draft = {
  content: unknown;
  /** Images en attente de publication : chemin (sans « / ») → base64. */
  images: Record<string, string>;
  savedAt: string;
};

export const DRAFT_SAVE_DELAY_MS = 500;

type Props = { collection: string; session: Session; onAuthExpired: () => void };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export function CollectionScreen({ collection, session, onAuthExpired }: Props) {
  const entry = registry[collection];
  const [server, setServer] = useState<{ content: unknown; sha: string } | null>(null);
  const [lock, setLock] = useState<LockStatus>({ locked: false });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [library, setLibrary] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fail = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) {
        onAuthExpired(); // JWT expiré → retour au login
        return;
      }
      setError(e instanceof ApiError ? e.message : "Serveur injoignable — réessayez.");
    },
    [onAuthExpired]
  );

  // Chargement initial : contenu (main), verrou, brouillon, bibliothèque.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [content, lockStatus, rawDraft, uploads] = await Promise.all([
          api.getContent(session.token, collection),
          api.lockStatus(session.token, collection),
          window.cms.readDraft(collection),
          api.listUploads(session.token, collection),
        ]);
        if (cancelled) return;
        setServer(content);
        setLock(lockStatus);
        setDraft(rawDraft as Draft | null);
        setLibrary(uploads);
      } catch (e) {
        if (!cancelled) fail(e);
      }
    })();
    return () => { cancelled = true; };
  }, [collection, session.token, fail]);

  // Autosauvegarde débouncée du brouillon…
  useEffect(() => {
    if (!draft) return;
    const t = setTimeout(() => void window.cms.writeDraft(collection, draft), DRAFT_SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [draft, collection]);

  // …et sauvegarde immédiate au démontage (dernières frappes jamais perdues).
  const draftRef = useRef(draft);
  draftRef.current = draft;
  useEffect(
    () => () => {
      if (draftRef.current) void window.cms.writeDraft(collection, draftRef.current);
    },
    [collection]
  );

  if (!entry) return null;
  if (error) return <p className="field-error centered">{error}</p>;
  if (!server) return <p className="centered">Chargement…</p>;

  const editing = lock.locked && lock.ownedByCaller;
  const working = draft?.content ?? server.content;
  const items = entry.kind === "collection" ? ((working as Record<string, unknown>[]) ?? []) : null;

  function patchDraft(patch: (d: Draft) => Draft): void {
    setDraft((prev) => {
      const base: Draft = prev ?? { content: server!.content, images: {}, savedAt: "" };
      return { ...patch(base), savedAt: new Date().toISOString() };
    });
  }
  const setContent = (content: unknown) => patchDraft((d) => ({ ...d, content }));
  const addImage = (path: string, base64: string) =>
    patchDraft((d) => ({ ...d, images: { ...d.images, [path]: base64 } }));

  async function acquire() {
    try {
      const result = await api.acquireLock(session.token, collection);
      setLock(
        result.ok
          ? { locked: true, email: session.email, expiresAt: result.expiresAt, ownedByCaller: true }
          : { locked: true, email: result.heldBy, expiresAt: result.expiresAt, ownedByCaller: false }
      );
    } catch (e) {
      fail(e);
    }
  }

  async function release() {
    try {
      await api.releaseLock(session.token, collection);
      setLock({ locked: false });
    } catch (e) {
      fail(e);
    }
  }

  async function discardDraft() {
    if (!window.confirm("Abandonner le brouillon local et revenir au contenu publié ?")) return;
    await window.cms.deleteDraft(collection);
    setDraft(null);
    setSelected(null);
  }

  async function handlePublished() {
    // Le PUT du backend a commité ET libéré le verrou : on reflète localement.
    await window.cms.deleteDraft(collection);
    setServer((s) => (draftRef.current && s ? { ...s, content: draftRef.current.content } : s));
    setDraft(null);
    setLock({ locked: false });
  }

  function addItem() {
    setContent([emptyItem(entry), ...items!]);
    setSelected(0);
    setQuery("");
  }

  function deleteItem(index: number) {
    if (!window.confirm("Supprimer cet élément ?")) return;
    setContent(items!.filter((_, i) => i !== index));
    setSelected(null);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items!.length) return; // no-op dans moveItem : ne pas toucher à la sélection
    setContent(moveItem(items!, index, delta));
    if (selected === index) setSelected(target);
    else if (selected === target) setSelected(index);
  }

  const visible = items
    ?.map((item, index) => ({ item, index }))
    .filter(({ item }) => itemLabel(entry, item).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>{entry.label}</h1>
        {editing ? (
          <button onClick={() => void release()}>Libérer le verrou</button>
        ) : (
          <button onClick={() => void acquire()} disabled={lock.locked}>Modifier</button>
        )}
      </header>

      {lock.locked && !lock.ownedByCaller && (
        <p className="banner banner-lock">
          En cours d'édition par {lock.email} jusqu'au {formatDate(lock.expiresAt)} — lecture seule.
        </p>
      )}

      {draft && (
        <p className="banner banner-draft">
          Brouillon local du {formatDate(draft.savedAt)} (non publié).
          <button onClick={() => void discardDraft()}>Abandonner le brouillon</button>
        </p>
      )}

      {entry.kind === "singleton" ? (
        <ItemForm entry={entry} collection={collection}
          item={working as Record<string, unknown>}
          errors={fieldErrors(entry, working)} readOnly={!editing}
          images={draft?.images ?? {}} library={library}
          onChange={setContent} onImageReady={addImage} />
      ) : (
        <div className="collection-layout">
          <div className="item-list">
            <input type="search" placeholder="Rechercher…" value={query}
              onChange={(e) => setQuery(e.target.value)} />
            {editing && <button onClick={addItem}>Ajouter</button>}
            <ul>
              {visible!.map(({ item, index }) => (
                <li key={index} className={selected === index ? "active" : ""}>
                  <button className="item-title" onClick={() => setSelected(index)}>
                    {itemLabel(entry, item) || "(sans titre)"}
                  </button>
                  {editing && (
                    <span className="item-actions">
                      <button disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
                      <button disabled={index === items!.length - 1} onClick={() => move(index, +1)}>↓</button>
                      <button onClick={() => deleteItem(index)}>✕</button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="item-detail">
            {selected !== null && items![selected] !== undefined ? (
              <ItemForm entry={entry} collection={collection}
                item={items![selected]}
                errors={fieldErrors(entry, items![selected])} readOnly={!editing}
                images={draft?.images ?? {}} library={library}
                onChange={(item) => setContent(items!.map((it, i) => (i === selected ? item : it)))}
                onImageReady={addImage} />
            ) : (
              <p className="muted">Sélectionnez un élément dans la liste.</p>
            )}
          </div>
        </div>
      )}
      <PublishBar entry={entry} collection={collection} session={session}
        draft={draft} editing={editing}
        onPublished={() => void handlePublished()} onError={fail} />
    </div>
  );
}
