import type { FastifyInstance } from "fastify";
import { contactEntreprisesSchema } from "../lib/forms.js";
import { sendFormEmail, escapeHtml } from "../lib/email.js";

export default async function contactEntreprisesRoutes(app: FastifyInstance) {
  app.post("/api/contact-entreprises", async (request, reply) => {
    const parsed = contactEntreprisesSchema.safeParse(request.body);
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
      <h2>Nouveau contact entreprise</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
        ${row("Entreprise", d.entreprise)}
        ${row("Nom", `${d.prenom} ${d.nom}`)}
        ${row("E-mail", d.email)}
        ${row("Téléphone", d.telephone)}
        ${row("Sujet", d.interet)}
        ${row("Nb participants", d.nbParticipants)}
      </table>
      <p style="font-family:sans-serif;font-size:14px"><strong>Message :</strong><br>${escapeHtml(d.message).replace(/\n/g, "<br>")}</p>
    `;

    try {
      await sendFormEmail({
        subject: `Contact entreprise — ${d.entreprise}`,
        html,
        replyTo: d.email,
      });
    } catch (err) {
      app.log.error(err, "[contact-entreprises] Envoi échoué");
      return reply.status(502).send({ error: "Envoi impossible" });
    }

    return reply.send({ ok: true });
  });
}
