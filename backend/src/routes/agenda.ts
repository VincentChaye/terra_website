import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { getPublicEvents, type WimiEvent } from "../lib/wimi.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SPAN_MS = 2 * 366 * 24 * 3600 * 1000; // 2 ans max

// Cache en mémoire des réponses Wimi, par plage de dates : au plus un appel
// Wimi par plage toutes les 30 s. Côté navigateur, `no-cache` force une
// revalidation à chaque rechargement de page ; l'ETag permet alors de
// répondre 304 (sans corps) tant que les données n'ont pas changé.
const CACHE_TTL_MS = 30 * 1000;
const cache = new Map<string, { at: number; events: WimiEvent[]; etag: string }>();

function eventsEtag(events: WimiEvent[]): string {
  return `"${createHash("sha1").update(JSON.stringify(events)).digest("hex")}"`;
}

export default async function agendaRoutes(app: FastifyInstance) {
  app.get("/api/agenda", async (request, reply) => {
    if (!process.env.WIMI_APP_TOKEN) {
      return reply.status(503).send({ error: "Wimi non configuré (WIMI_APP_TOKEN manquant)" });
    }

    const query = request.query as Record<string, string | undefined>;
    const fromParam = query.from;
    const toParam = query.to;

    // Défaut (rétro-compatible) : aujourd'hui → +4 mois
    let from = new Date();
    from.setHours(0, 0, 0, 0);
    let to = new Date(from);
    to.setMonth(to.getMonth() + 4);

    if (fromParam || toParam) {
      if (!fromParam || !toParam || !DATE_RE.test(fromParam) || !DATE_RE.test(toParam)) {
        return reply.status(400).send({ error: "Paramètres from/to invalides (format attendu : YYYY-MM-DD)" });
      }
      from = new Date(fromParam);
      to = new Date(toParam);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) {
        return reply.status(400).send({ error: "Plage from/to invalide" });
      }
      if (to.getTime() - from.getTime() > MAX_SPAN_MS) {
        return reply.status(400).send({ error: "Plage from/to trop large (2 ans maximum)" });
      }
    }

    const key = `${from.toISOString()}|${to.toISOString()}`;
    let entry = cache.get(key);

    if (!entry || Date.now() - entry.at >= CACHE_TTL_MS) {
      try {
        const events = await getPublicEvents(from, to);
        entry = { at: Date.now(), events, etag: eventsEtag(events) };
        cache.set(key, entry);
        // Purge des entrées expirées pour que le cache ne grossisse pas indéfiniment.
        for (const [k, v] of cache) {
          if (Date.now() - v.at >= CACHE_TTL_MS) cache.delete(k);
        }
      } catch (err) {
        return reply.status(502).send({ error: err instanceof Error ? err.message : String(err) });
      }
    }

    reply.header("Cache-Control", "no-cache");
    reply.header("ETag", entry.etag);

    // Données inchangées depuis la dernière visite du navigateur : 304 sans corps.
    if (request.headers["if-none-match"] === entry.etag) {
      return reply.status(304).send();
    }

    return reply.send({ events: entry.events });
  });
}
