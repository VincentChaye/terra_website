import { NextResponse } from "next/server";
import { getPublicEvents } from "@/lib/wimi";
import { corsHeaders, corsPreflight } from "@/lib/cors";

// Route Handler dynamique (non caché par défaut) : chaque requête interroge Wimi.
// Suffisant pour un agenda associatif à faible trafic ; pas d'ISR ici (handler,
// pas page — cf. docs Next « Route Handlers / Caching »).

export function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  if (!process.env.WIMI_APP_TOKEN) {
    return NextResponse.json(
      { error: "Wimi non configuré (WIMI_APP_TOKEN manquant)" },
      { status: 503, headers: corsHeaders() }
    );
  }

  const from = new Date();
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setMonth(to.getMonth() + 4); // 4 mois à venir

  try {
    const events = await getPublicEvents(from, to);
    return NextResponse.json(
      { events },
      { headers: { ...corsHeaders(), "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("[agenda] Erreur Wimi :", err);
    return NextResponse.json(
      { error: String(err instanceof Error ? err.message : err) },
      { status: 502, headers: corsHeaders() }
    );
  }
}
