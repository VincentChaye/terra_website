import { NextResponse } from "next/server";
import { corsHeaders, corsPreflight } from "@/lib/cors";
import { contactEntreprisesSchema } from "@/lib/forms";
import { sendFormEmail, escapeHtml } from "@/lib/email";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400, headers: corsHeaders() });
  }

  const parsed = contactEntreprisesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400, headers: corsHeaders() });
  }

  const d = parsed.data;

  // Honeypot rempli → bot probable : on répond OK sans rien envoyer.
  if (d.website && d.website.trim() !== "") {
    return NextResponse.json({ ok: true }, { headers: corsHeaders() });
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
    console.error("[contact-entreprises] Envoi échoué :", err);
    return NextResponse.json({ error: "Envoi impossible" }, { status: 502, headers: corsHeaders() });
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders() });
}
