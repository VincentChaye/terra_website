/**
 * GET /api/admin/status — Version minimale d'app requise + état du
 * déploiement Pages d'un commit (?sha=...). Sondée par l'app au démarrage
 * (contrôle de version, détection du réveil Render) et après publication.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/cms-auth";
import { getPagesRunForCommit } from "@/lib/github";

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (!auth) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const sha = new URL(request.url).searchParams.get("sha");
  const deploy = sha ? await getPagesRunForCommit(sha) : null;
  return NextResponse.json({
    minAppVersion: process.env.CMS_MIN_APP_VERSION ?? "0.0.0",
    deploy,
  });
}
