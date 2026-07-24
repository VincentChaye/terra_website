/**
 * lib/email.ts — Envoi d'email via l'API REST Resend (sans SDK)
 *
 * Même approche que lib/wimi.ts : un appel `fetch` direct, pas de dépendance.
 *
 * Variables d'env requises (backend Render) :
 *   RESEND_API_KEY     — clé API Resend
 *   CONTACT_FROM_EMAIL — expéditeur sur domaine vérifié (ex. "Site <site@terra-numerica.org>")
 *   CONTACT_TO_EMAIL   — destinataire des soumissions (ex. contact@terra-numerica.org)
 */

const RESEND_API = "https://api.resend.com/emails";

type SendArgs = {
  subject: string;
  html: string;
  /** Email du soumetteur — l'équipe peut répondre directement. */
  replyTo?: string;
};

export async function sendFormEmail({ subject, html, replyTo }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !from || !to) {
    throw new Error(
      "Email non configuré (RESEND_API_KEY / CONTACT_FROM_EMAIL / CONTACT_TO_EMAIL manquants)"
    );
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend HTTP ${res.status} ${detail}`);
  }
}

/** Échappe le HTML pour insérer en toute sécurité des valeurs utilisateur dans un email. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
