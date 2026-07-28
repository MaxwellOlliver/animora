import type { MediaPurpose } from "@animora/contracts";

export type Media = {
  id: string;
  key: string;
  purpose: MediaPurpose;
  mimeType: string;
};

export type PlaylistType = "season" | "movie" | "special";
export type PlaylistStatus = "upcoming" | "airing" | "finished";

export type SeasonEntry = {
  playlistId: string;
  playlistNumber: number;
  playlistTitle: string | null;
  studio: string | null;
  type: PlaylistType;
  status: PlaylistStatus | null;
  releaseWeekday: number | null;
  releaseTime: string | null;
  playlistCover: Media | null;
  seriesId: string;
  seriesName: string;
  seriesBanner: Media | null;
  seriesPoster: Media | null;
};
