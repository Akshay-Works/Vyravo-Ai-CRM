import { NextRequest } from "next/server";
import { listUpcomingEvents, isCalendlyConfigured } from "@/lib/calendly";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isCalendlyConfigured()) {
      const events = await listUpcomingEvents(50);
      return Response.json({ meetings: events, source: "calendly" });
    }
    // Fallback: return empty (no local meeting storage yet)
    return Response.json({ meetings: [], source: "local", note: "Calendly not configured" });
  } catch (e: any) {
    console.error("Meetings API error:", e);
    return Response.json({ error: "Failed to load meetings", detail: String(e?.message || e) }, { status: 500 });
  }
}
