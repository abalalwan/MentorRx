import type { IVideoProvider, CreateMeetingParams, MeetingDetails } from "./provider";

export class TeamsProvider implements IVideoProvider {
  private async getAccessToken(): Promise<string> {
    const res = await fetch(
      `https://login.microsoftonline.com/${process.env.TEAMS_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.TEAMS_CLIENT_ID!,
          client_secret: process.env.TEAMS_CLIENT_SECRET!,
          scope: "https://graph.microsoft.com/.default",
        }),
      }
    );

    if (!res.ok) throw new Error(`Failed to get Teams access token: ${await res.text()}`);
    const data = await res.json();
    return data.access_token;
  }

  async createMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
    const token = await this.getAccessToken();
    const endTime = new Date(params.startTime.getTime() + params.durationMinutes * 60000);
    const organizerId = process.env.TEAMS_ORGANIZER_ID;

    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${organizerId}/onlineMeetings`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: params.topic,
          startDateTime: params.startTime.toISOString(),
          endDateTime: endTime.toISOString(),
          participants: {
            attendees: [
              { upn: params.participantEmail },
            ],
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Teams meeting creation failed: ${await res.text()}`);
    }

    const meeting = await res.json();

    return {
      providerMeetingId: meeting.id,
      meetingUrl: meeting.joinWebUrl,
      hostUrl: meeting.joinWebUrl,
      password: meeting.audioConferencing?.accessCode ?? null,
      provider: "teams",
    };
  }

  async cancelMeeting(providerMeetingId: string): Promise<void> {
    const token = await this.getAccessToken();
    const organizerId = process.env.TEAMS_ORGANIZER_ID;

    await fetch(
      `https://graph.microsoft.com/v1.0/users/${organizerId}/onlineMeetings/${providerMeetingId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
}
