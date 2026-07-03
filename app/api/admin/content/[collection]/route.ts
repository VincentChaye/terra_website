/**
 * /api/admin/content/{collection}
 * GET = contenu actuel lu depuis main via l'API GitHub (jamais le disque
 * Render, périmé après un commit CMS). PUT = publication (verrou requis).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { registry } from "@/content/registry";
import { requireAuth } from "@/lib/cms-auth";
import { publish, PublishError } from "@/lib/cms-publish";
import { getFile } from "@/lib/github";

type Ctx = { params: Promise<{ collection: string }> };

const PutSchema = z.object({
  content: z.unknown(),
  images: z.array(z.object({ path: z.string(), base64: z.string() })).default([]),
});

async function checkRequest(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth) return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  const { collection } = await ctx.params;
  if (!registry[collection]) {
    return { error: NextResponse.json({ error: "Collection inconnue." }, { status: 404 }) };
  }
  return { auth, collection };
}

export async function GET(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const file = await getFile(`content/${registry[checked.collection].file}`);
  if (!file) return NextResponse.json({ error: "Fichier introuvable sur main." }, { status: 404 });
  return NextResponse.json({ content: JSON.parse(file.text), sha: file.sha });
}

export async function PUT(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const parsed = PutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload invalide." }, { status: 400 });

  try {
    const result = await publish(
      checked.collection, checked.auth.email, parsed.data.content, parsed.data.images
    );
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof PublishError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[admin/content] publication échouée :", e);
    return NextResponse.json({ error: "Publication échouée — réessayez." }, { status: 502 });
  }
}
