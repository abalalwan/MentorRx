export interface CreateMeetingParams {
  topic: string;
  startTime: Date;
  durationMinutes: number;
  hostEmail: string;
  participantEmail: string;
  bookingId: string;
}

export interface MeetingDetails {
  providerMeetingId: string;
  meetingUrl: string;
  hostUrl: string | null;
  password: string | null;
  provider: "zoom" | "teams" | "google_meet";
}

export interface IVideoProvider {
  createMeeting(params: CreateMeetingParams): Promise<MeetingDetails>;
  cancelMeeting(providerMeetingId: string): Promise<void>;
}
