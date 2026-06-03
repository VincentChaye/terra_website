import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  entreprise: z.string().min(2),
  nom: z.string().min(2),
  prenom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(10).max(15),
  interet: z.string().min(1),
  nbParticipants: z.number().min(1).max(500).optional(),
  message: z.string().min(10),
  rgpd: z.literal(true),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const data = parsed.data;

  // TODO: send via Resend (add RESEND_API_KEY to .env.local)
  console.log("[contact-entreprises]", {
    entreprise: data.entreprise,
    contact: `${data.prenom} ${data.nom} <${data.email}>`,
    interet: data.interet,
    nbParticipants: data.nbParticipants,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
