/**
 * GET /api/admin/uploads/{collection} — Bibliothèque d'images.
 * Liste les .webp de public/uploads/<collection>/ sur main, sous forme de
 * chemins prêts à stocker dans le JSON (« /uploads/<collection>/<fichier> »,
 * affichés par le site via lib/asset.ts).
 */

import { NextResponse } from "next/server";
import { registry } from "@/content/registry";
import { requireAuth } from "@/lib/cms-auth";
import { listDir } from "@/lib/github";

type Ctx = { params: Promise<{ collection: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = await requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  const { collection } = await ctx.params;
  if (!registry[collection]) {
    return NextResponse.json({ error: "Collection inconnue." }, { status: 404 });
  }
  const files = await listDir(`public/uploads/${collection}`);
  return NextResponse.json({
    images: files
      .filter((f) => f.name.endsWith(".webp"))
      .map((f) => `/uploads/${collection}/${f.name}`),
  });
}
