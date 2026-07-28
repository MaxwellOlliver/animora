import type { MediaPurpose } from "@animora/contracts";

export type Media = {
  id: string;
  key: string;
  purpose: MediaPurpose;
  mimeType: string;
};

export type EpisodeScheduleEntry = {
  kind: "episode";
  id: string;
  number: number;
  title: string;
  releaseDate: string;
  available: boolean;
  thumbnail: Media | null;
  seriesId: string;
  seriesName: string;
  seriesBanner: Media | null;
  seriesPoster: Media | null;
  playlistId: string;
  playlistNumber: number;
};

export type ExpectedScheduleEntry = {
  kind: "expected";
  date: string;
  releaseTime: string | null;
  seriesId: string;
  seriesName: string;
  seriesBanner: Media | null;
  seriesPoster: Media | null;
  playlistId: string;
  playlistNumber: number;
};

export type ScheduleEntry = EpisodeScheduleEntry | ExpectedScheduleEntry;
