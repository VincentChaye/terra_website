import { NextResponse } from "next/server";
import { getPublicEvents } from "@/lib/wimi";

// Cache 5 minutes côté serveur
export const revalidate = 300;

export async function GET() {
  if (!process.env.WIMI_APP_TOKEN) {
    return NextResponse.json(
      { error: "Wimi non configuré (WIMI_APP_TOKEN manquant)" },
      { status: 503 }
    );
  }

  const from = new Date();
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setMonth(to.getMonth() + 4); // 4 mois à venir

  try {
    const events = await getPublicEvents(from, to);
    return NextResponse.json({ events }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[agenda] Erreur Wimi :", err);
    return NextResponse.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 502 }
    );
  }
}
