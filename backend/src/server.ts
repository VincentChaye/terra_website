import Fastify from "fastify";
import cors from "@fastify/cors";
import agendaRoutes from "./routes/agenda.js";
import contactEntreprisesRoutes from "./routes/contact-entreprises.js";
import reservationScolairesRoutes from "./routes/reservation-scolaires.js";

const app = Fastify({ logger: true });

// Frontend et backend sont sur des origines distinctes (nginx séparés) :
// FRONTEND_ORIGIN doit être l'origine exacte du frontend (sans le chemin).
// Si absente, on retombe sur `*` (aucune credential/cookie n'est échangée).
await app.register(cors, {
  origin: process.env.FRONTEND_ORIGIN ?? "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400,
});

await app.register(agendaRoutes);
await app.register(contactEntreprisesRoutes);
await app.register(reservationScolairesRoutes);

const port = Number(process.env.PORT ?? 3001);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
