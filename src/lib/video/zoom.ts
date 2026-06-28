import type { IVideoProvider, CreateMeetingParams, MeetingDetails } from "./provider";

export class ZoomProvider implements IVideoProvider {
  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString("base64");

    const res = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!res.ok) throw new Error("Failed to get Zoom access token");
    const data = await res.json();
    return data.access_token;
  }

  async createMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
    const token = await this.getAccessToken();

    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: params.topic,
        type: 2, // Scheduled meeting
        start_time: params.startTime.toISOString(),
        duration: params.durationMinutes,
        timezone: "UTC",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true,
          auto_recording: "none",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Zoom meeting creation failed: ${err}`);
    }

    const meeting = await res.json();

    return {
      providerMeetingId: String(meeting.id),
      meetingUrl: meeting.join_url,
      hostUrl: meeting.start_url,
      password: meeting.password || null,
      provider: "zoom",
    };
  }

  async cancelMeeting(providerMeetingId: string): Promise<void> {
    const token = await this.getAccessToken();

    await fetch(`https://api.zoom.us/v2/meetings/${providerMeetingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
