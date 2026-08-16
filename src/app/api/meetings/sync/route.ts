import { NextRequest } from "next/server";
import { listUpcomingEvents, isCalendlyConfigured } from "@/lib/calendly";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!isCalendlyConfigured()) {
    return Response.json({ error: "CALENDLY_ACCESS_TOKEN not configured" }, { status: 400 });
  }

  try {
    const events = await listUpcomingEvents(50);
    let synced = 0;
    for (const ev of events) {
      // Upsert by Calendly URI as the meeting link
      const existing = await pool.query(
        `SELECT id FROM meetings WHERE meeting_link = $1 LIMIT 1`, [ev.uri]
      );
      if ((existing.rowCount ?? 0) > 0) continue; // already synced

      await pool.query(
        `INSERT INTO meetings (title, description, scheduled_at, duration, meeting_link, status, attendees)
         VALUES ($1, $2, $3, 30, $4, 'scheduled', $5::jsonb)`,
        [
          ev.name || "Discovery Call",
          ev.eventType ? `Event type: ${ev.eventType}` : null,
          ev.startTime,
          ev.uri,
          JSON.stringify(ev.inviteeName ? [{ name: ev.inviteeName, email: ev.inviteeEmail || "" }] : []),
        ]
      );
      synced++;
    }
    return Response.json({ success: true, synced, total: events.length });
  } catch (e: any) {
    console.error("Calendly sync error:", e);
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
