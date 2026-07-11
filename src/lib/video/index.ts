import type { IVideoProvider } from "./provider";
import { ZoomProvider } from "./zoom";
import { GoogleMeetProvider } from "./google-meet";
import { TeamsProvider } from "./teams";

export type VideoProviderName = "zoom" | "teams" | "google_meet";

export function getVideoProvider(name?: VideoProviderName): IVideoProvider {
  const provider = name || (process.env.DEFAULT_VIDEO_PROVIDER as VideoProviderName) || "zoom";

  switch (provider) {
    case "google_meet":
      return new GoogleMeetProvider();
    case "teams":
      return new TeamsProvider();
    case "zoom":
    default:
      return new ZoomProvider();
  }
}

export type { IVideoProvider } from "./provider";
export type { CreateMeetingParams, MeetingDetails } from "./provider";
