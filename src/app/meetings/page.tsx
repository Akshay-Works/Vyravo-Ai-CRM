"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Meeting {
  uri: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  inviteeEmail?: string;
  inviteeName?: string;
  eventType?: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/meetings");
      const d = await res.json();
      setMeetings(d.meetings || []);
      setSource(d.source || "");
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const sync = async () => {
    setSyncing(true);
    await fetch("/api/meetings/sync", { method: "POST" });
    setSyncing(false);
    load();
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const today = meetings.filter((m) => {
    const s = new Date(m.startTime);
    return s >= todayStart && s < todayEnd;
  });
  const upcoming = meetings.filter((m) => new Date(m.startTime) >= todayEnd).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold font-[var(--font-heading)]">Meetings</h1>
          <p className="text-sm text-grey mt-1">{source === "calendly" ? "Synced from Calendly" : "View and manage your meetings"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={sync} disabled={syncing} className="btn-secondary text-sm disabled:opacity-50">
            {syncing ? "Syncing..." : "↻ Sync Calendly"}
          </button>
          <a href="https://calendly.com/akshay-navale-work" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
            ＋ Schedule via Calendly
          </a>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid lg:grid-cols-2 gap-6">
          <div className="h-48 rounded-xl bg-surface border border-border" />
          <div className="h-48 rounded-xl bg-surface border border-border" />
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Today */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="text-lg font-semibold mb-4">Today</h3>
              {today.length === 0 ? (
                <div className="text-center py-8 text-grey"><p className="text-sm">No meetings scheduled for today</p></div>
              ) : (
                <div className="space-y-3">
                  {today.map((m) => (
                    <div key={m.uri} className="rounded-lg bg-bg border border-border p-4">
                      <p className="font-medium text-white">{m.name}</p>
                      <p className="text-xs text-grey mt-1">
                        {new Date(m.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — {new Date(m.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {m.inviteeName && <p className="text-xs text-grey-dark mt-1">{m.inviteeName}{m.inviteeEmail ? ` · ${m.inviteeEmail}` : ""}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="text-lg font-semibold mb-4">Upcoming</h3>
              {upcoming.length === 0 ? (
                <div className="text-center py-8 text-grey">
                  <p className="text-sm">No upcoming meetings</p>
                  <a href="https://calendly.com/akshay-navale-work" target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline mt-2 inline-block">
                    Schedule a discovery call →
                  </a>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {upcoming.map((m) => (
                    <div key={m.uri} className="rounded-lg bg-bg border border-border p-4">
                      <p className="font-medium text-white">{m.name}</p>
                      <p className="text-xs text-grey mt-1">{new Date(m.startTime).toLocaleDateString()} · {new Date(m.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      {m.inviteeName && <p className="text-xs text-grey-dark mt-1">{m.inviteeName}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Integration Status */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-lg font-semibold mb-4">Calendar Integration</h3>
            {source === "calendly" ? (
              <div className="text-sm text-green-400">✅ Calendly connected — {meetings.length} upcoming events synced.</div>
            ) : (
              <div>
                <p className="text-sm text-grey mb-4">Connect your calendar to sync meetings automatically.</p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://calendly.com/akshay-navale-work" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors">
                    🗓️ Connect Calendly
                  </a>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
