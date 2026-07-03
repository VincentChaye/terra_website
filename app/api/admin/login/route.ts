/**
 * POST /api/admin/login — Connexion au CMS par identifiants Wimi.
 *
 * Pas d'en-têtes CORS : ces routes sont réservées à l'app Electron
 * (hors navigateur). Le mot de passe est relayé à Wimi puis oublié.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  checkLoginRateLimit, signCmsJwt, userHasCmsAccess, WimiAuthError, wimiUserLogin,
} from "@/lib/cms-auth";

const BodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "inconnue").split(",")[0].trim();
  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives — réessayez dans 15 minutes." },
      { status: 429 }
    );
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email ou mot de passe manquant." }, { status: 400 });
  }

  let session;
  try {
    session = await wimiUserLogin(parsed.data.email, parsed.data.password);
  } catch (e) {
    if (e instanceof WimiAuthError) {
      return NextResponse.json({ error: "Identifiants Wimi incorrects." }, { status: 401 });
    }
    console.error("[admin/login] Wimi indisponible :", e);
    return NextResponse.json(
      { error: "Service Wimi indisponible — réessayez plus tard." },
      { status: 502 }
    );
  }

  if (!(await userHasCmsAccess(session))) {
    return NextResponse.json(
      { error: "Votre compte Wimi n'a pas accès à l'espace du CMS." },
      { status: 403 }
    );
  }

  const token = await signCmsJwt(parsed.data.email, session.userId);
  return NextResponse.json({ token, email: parsed.data.email });
}
