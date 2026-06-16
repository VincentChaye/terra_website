import { NextResponse } from "next/server";
import { corsHeaders, corsPreflight } from "@/lib/cors";

const WIMI_API = "https://api.wimi.pro";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  const token = process.env.WIMI_APP_TOKEN;
  const spaceId = process.env.WIMI_SPACE_ID;

  if (!token) {
    return NextResponse.json(
      { error: "Wimi non configuré (WIMI_APP_TOKEN manquant)" },
      { status: 503, headers: corsHeaders() }
    );
  }

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setMonth(to.getMonth() + 4);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const payload = {
    header: {
      target: "calendar.event.GetList",
      identification: { app_token: token, api_version: "1.2" },
    },
    body: {
      start_date: fmt(from),
      end_date: fmt(to),
      ...(spaceId ? { project_id: Number(spaceId) } : {}),
    },
  };

  const res = await fetch(WIMI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const raw = await res.json();
  return NextResponse.json({ debug: true, payload_sent: payload, raw_response: raw }, { headers: corsHeaders() });
}
