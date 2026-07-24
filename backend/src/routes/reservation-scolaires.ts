import type { FastifyInstance } from "fastify";
import { reservationScolairesSchema } from "../lib/forms.js";
import { sendFormEmail, escapeHtml } from "../lib/email.js";

export default async function reservationScolairesRoutes(app: FastifyInstance) {
  app.post("/api/reservation-scolaires", async (request, reply) => {
    const parsed = reservationScolairesSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Données invalides" });
    }

    const d = parsed.data;

    // Honeypot rempli → bot probable : on répond OK sans rien envoyer.
    if (d.website && d.website.trim() !== "") {
      return reply.send({ ok: true });
    }

    const row = (label: string, value?: string) =>
      value ? `<tr><td style="padding:4px 12px 4px 0;color:#666"><strong>${label}</strong></td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>` : "";

    const html = `
      <h2>Nouvelle demande de réservation scolaire</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        ${row("Établissement", d.etablissement)}
        ${row("Nom", `${d.prenom} ${d.nom}`)}
        ${row("E-mail", d.email)}
        ${row("Téléphone", d.telephone)}
        ${row("Niveau", d.niveau)}
        ${row("Nb élèves", d.nbEleves)}
        ${row("Disponibilités", d.datesSouhaitees)}
      </table>
      ${d.message ? `<p style="font-family:sans-serif;font-size:14px"><strong>Message :</strong><br>${escapeHtml(d.message).replace(/\n/g, "<br>")}</p>` : ""}
    `;

    try {
      await sendFormEmail({
        subject: `Réservation scolaire — ${d.etablissement}`,
        html,
        replyTo: d.email,
      });
    } catch (err) {
      app.log.error(err, "[reservation-scolaires] Envoi échoué");
      return reply.status(502).send({ error: "Envoi impossible" });
    }

    return reply.send({ ok: true });
  });
}
