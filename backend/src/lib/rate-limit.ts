import type { FastifyInstance } from "fastify";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const BLACKLIST_TTL_MS = 60 * 60 * 1000; // 1h

type Hits = { timestamps: number[] };

const hitsByIp = new Map<string, Hits>();
const blacklist = new Map<string, number>(); // ip -> expiry timestamp

function isBlacklisted(ip: string): boolean {
  const expiry = blacklist.get(ip);
  if (expiry === undefined) return false;
  if (Date.now() >= expiry) {
    blacklist.delete(ip);
    return false;
  }
  return true;
}

/**
 * Fenêtre glissante par IP : au-delà de 15 requêtes/min, l'IP est blacklistée
 * (429 immédiat) pendant 1h. État en mémoire — remis à zéro à chaque restart
 * du process ; acceptable pour un backend mono-instance, à revoir (store
 * partagé) si le backend est un jour répliqué.
 */
export default async function rateLimitPlugin(app: FastifyInstance) {
  app.addHook("onRequest", async (request, reply) => {
    const ip = request.ip;

    if (isBlacklisted(ip)) {
      return reply.status(429).send({ error: "Trop de requêtes, réessayez plus tard" });
    }

    const now = Date.now();
    const hits = hitsByIp.get(ip) ?? { timestamps: [] };
    hits.timestamps = hits.timestamps.filter((t) => now - t < WINDOW_MS);
    hits.timestamps.push(now);
    hitsByIp.set(ip, hits);

    if (hits.timestamps.length > MAX_REQUESTS_PER_WINDOW) {
      blacklist.set(ip, now + BLACKLIST_TTL_MS);
      hitsByIp.delete(ip);
      app.log.warn(`[rate-limit] IP ${ip} blacklistée (>${MAX_REQUESTS_PER_WINDOW} req/min)`);
      return reply.status(429).send({ error: "Trop de requêtes, réessayez plus tard" });
    }
  });

  // Purge périodique pour ne pas laisser grossir les Maps indéfiniment.
  setInterval(() => {
    const now = Date.now();
    for (const [ip, hits] of hitsByIp) {
      hits.timestamps = hits.timestamps.filter((t) => now - t < WINDOW_MS);
      if (hits.timestamps.length === 0) hitsByIp.delete(ip);
    }
    for (const [ip, expiry] of blacklist) {
      if (now >= expiry) blacklist.delete(ip);
    }
  }, WINDOW_MS).unref();
}
