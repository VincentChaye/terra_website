/**
 * /api/admin/lock/{collection} — Verrou d'édition exclusif.
 * GET = état ; POST = acquérir (423 si pris) ; DELETE = libérer (403 si autrui).
 */

import { NextResponse } from "next/server";
import { registry } from "@/content/registry";
import { requireAuth } from "@/lib/cms-auth";
import { acquireLock, getLockStatus, releaseLock } from "@/lib/cms-locks";

type Ctx = { params: Promise<{ collection: string }> };

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
  return NextResponse.json(await getLockStatus(checked.collection, checked.auth.email));
}

export async function POST(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const result = await acquireLock(checked.collection, checked.auth.email);
  if (!result.ok) {
    return NextResponse.json(
      { error: `En cours d'édition par ${result.heldBy}.`, heldBy: result.heldBy, expiresAt: result.expiresAt },
      { status: 423 }
    );
  }
  return NextResponse.json({ expiresAt: result.expiresAt });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const checked = await checkRequest(request, ctx);
  if ("error" in checked) return checked.error;
  const released = await releaseLock(checked.collection, checked.auth.email);
  if (!released) {
    return NextResponse.json({ error: "Ce verrou appartient à quelqu'un d'autre." }, { status: 403 });
  }
  return new NextResponse(null, { status: 204 });
}
