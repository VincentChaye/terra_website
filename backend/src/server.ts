import Fastify from "fastify";
import cors from "@fastify/cors";
import agendaRoutes from "./routes/agenda.js";
import contactEntreprisesRoutes from "./routes/contact-entreprises.js";
import reservationScolairesRoutes from "./routes/reservation-scolaires.js";
import rateLimitPlugin from "./lib/rate-limit.js";

// trustProxy : si un nginx/reverse-proxy est placé devant ce process, on lit
// l'IP réelle du visiteur dans X-Forwarded-For (sinon le rate-limiting par IP
// blacklisterait l'IP du proxy pour tout le monde).
const app = Fastify({ logger: true, trustProxy: true });

// Frontend et backend sont sur des origines distinctes (nginx séparés) :
// FRONTEND_ORIGIN doit être l'origine exacte du frontend (sans le chemin).
// Si absente, on retombe sur `*` (aucune credential/cookie n'est échangée) —
// mais c'est presque toujours un oubli de configuration en prod, d'où le warning.
if (!process.env.FRONTEND_ORIGIN) {
  app.log.warn(
    "[cors] FRONTEND_ORIGIN non défini : CORS retombe sur '*' (any origin). " +
      "Vérifiez backend/.env si ceci tourne en production."
  );
}
await app.register(cors, {
  origin: process.env.FRONTEND_ORIGIN ?? "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400,
});

// Appelé directement (pas via app.register) : un plugin enregistré avec
// register() est encapsulé et son addHook ne s'appliquerait pas aux routes
// sœurs (agenda, contact…) enregistrées plus bas — seul un appel direct sur
// l'instance racine ajoute le hook globalement.
await rateLimitPlugin(app);

await app.register(agendaRoutes);
await app.register(contactEntreprisesRoutes);
await app.register(reservationScolairesRoutes);

const port = Number(process.env.PORT ?? 3001);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
