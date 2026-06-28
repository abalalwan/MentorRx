import type { IVideoProvider, CreateMeetingParams, MeetingDetails } from "./provider";
import { randomUUID } from "crypto";

export class GoogleMeetProvider implements IVideoProvider {
  async createMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
    const endTime = new Date(params.startTime.getTime() + params.durationMinutes * 60000);

    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: params.topic,
        start: { dateTime: params.startTime.toISOString(), timeZone: "UTC" },
        end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        attendees: [
          { email: params.hostEmail },
          { email: params.participantEmail },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Google Meet creation failed: ${await res.text()}`);
    }

    const event = await res.json();
    const meetLink = event.conferenceData?.entryPoints?.[0]?.uri || "";

    return {
      providerMeetingId: event.id,
      meetingUrl: meetLink,
      hostUrl: meetLink,
      password: null,
      provider: "google_meet",
    };
  }

  async cancelMeeting(providerMeetingId: string): Promise<void> {
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${providerMeetingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        },
      }
    );
  }
}
