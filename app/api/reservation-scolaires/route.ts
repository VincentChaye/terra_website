import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  etablissement: z.string().min(2),
  nom: z.string().min(2),
  prenom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(10).max(15),
  niveau: z.string().min(1),
  nbEleves: z.number().min(1).max(200),
  datesSouhaitees: z.string().min(5),
  message: z.string().optional(),
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
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ from: "...", to: "...", subject: "...", text: "..." });

  console.log("[reservation-scolaires]", {
    etablissement: data.etablissement,
    contact: `${data.prenom} ${data.nom} <${data.email}>`,
    niveau: data.niveau,
    nbEleves: data.nbEleves,
    dates: data.datesSouhaitees,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
