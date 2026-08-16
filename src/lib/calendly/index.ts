// Calendly Meeting Integration for Vyravo AI CRM
// Uses the existing meetings table and syncs with Calendly.
// Set CALENDLY_ACCESS_TOKEN env var with your Calendly PAT.

const CALENDLY_API = "https://api.calendly.com";
const CALENDLY_USER_URI = process.env.CALENDLY_USER_URI || "https://api.calendly.com/users/e2dbd741-91ad-48d6-848d-5b3bd982e423";

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  inviteeEmail?: string;
  inviteeName?: string;
  eventType?: string;
}

function getToken(): string | null {
  return process.env.CALENDLY_ACCESS_TOKEN || null;
}

export function isCalendlyConfigured(): boolean {
  return Boolean(getToken());
}

async function calendlyFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  if (!token) throw new Error("CALENDLY_ACCESS_TOKEN not configured");
  const res = await fetch(`${CALENDLY_API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Calendly error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

// List the user's event types (30min discovery call, etc.)
export async function listEventTypes(): Promise<{ uri: string; name: string; duration: number; slug: string }[]> {
  const data = await calendlyFetch(`/event_types?user=${encodeURIComponent(CALENDLY_USER_URI)}`);
  return (data.collection || []).map((et: any) => ({ uri: et.uri, name: et.name, duration: et.duration, slug: et.slug }));
}

// List upcoming scheduled events from Calendly
export async function listUpcomingEvents(count = 50): Promise<CalendlyEvent[]> {
  const params = new URLSearchParams({ user: CALENDLY_USER_URI, count: String(count), status: "active" });
  const data = await calendlyFetch(`/scheduled_events?${params}`);
  return (data.collection || []).map((ev: any) => ({
    uri: ev.uri, name: ev.name, status: ev.status, startTime: ev.start_time, endTime: ev.end_time,
    inviteeEmail: ev.invitee?.email, inviteeName: ev.invitee?.name, eventType: ev.event_type?.name,
  }));
}

// Get a single event by Calendly URI
export async function getEventByUri(eventUri: string): Promise<CalendlyEvent | null> {
  const encoded = encodeURIComponent(eventUri);
  const data = await calendlyFetch(`/scheduled_events/${encoded}`);
  const ev = data?.resource;
  if (!ev) return null;
  return {
    uri: ev.uri, name: ev.name, status: ev.status, startTime: ev.start_time, endTime: ev.end_time,
    inviteeEmail: ev.invitee?.email, inviteeName: ev.invitee?.name, eventType: ev.event_type?.name,
  };
}
