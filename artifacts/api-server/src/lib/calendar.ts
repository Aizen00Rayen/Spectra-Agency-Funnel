import { ReplitConnectors } from "@replit/connectors-sdk";

type CalendarListEntry = {
  id: string;
  summary?: string;
  primary?: boolean;
  accessRole?: string;
};

type CalendarListResponse = {
  items?: CalendarListEntry[];
};

type CalendarEvent = {
  id?: string;
  htmlLink?: string;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
};

function makeConnectors() {
  return new ReplitConnectors();
}

async function calendarRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await makeConnectors().proxy("google-calendar", path, init);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google Calendar request failed (${response.status}): ${detail.slice(0, 240)}`);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export async function listGoogleCalendars() {
  const data = await calendarRequest<CalendarListResponse>(
    "/calendar/v3/users/me/calendarList?minAccessRole=writer",
  );
  return (data.items ?? []).map((calendar) => ({
    id: calendar.id,
    summary: calendar.summary ?? calendar.id,
    primary: Boolean(calendar.primary),
    accessRole: calendar.accessRole ?? "unknown",
  }));
}

export async function createConsultationEvent(input: {
  calendarId: string;
  clientName: string;
  clientEmail: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
}) {
  const requestId = `spectra-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const event = await calendarRequest<CalendarEvent>(
    `/calendar/v3/calendars/${encodeURIComponent(input.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `Spectra strategy consultation — ${input.clientName}`,
        description:
          "Strategic partnership conversation with Spectra Agency. The Google Calendar invitation contains the Google Meet link.",
        start: {
          dateTime: input.startsAt.toISOString(),
          timeZone: input.timezone,
        },
        end: {
          dateTime: input.endsAt.toISOString(),
          timeZone: input.timezone,
        },
        attendees: [{ email: input.clientEmail, displayName: input.clientName }],
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 1440 },
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      }),
    },
  );

  const meetingUrl =
    event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ??
    event.htmlLink ??
    null;

  return {
    calendarEventId: event.id ?? null,
    meetingUrl,
  };
}
