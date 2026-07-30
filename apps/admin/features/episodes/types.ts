export interface Media {
  id: string;
  key: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
}

export interface Episode {
  id: string;
  playlistId: string;
  number: number;
  title: string;
  description: string | null;
  thumbnailId: string | null;
  thumbnail: Media | null;
  durationSeconds: number | null;
  releaseDate: string | null;
  playlistName?: string | null;
  seriesName?: string;
  createdAt: string;
  updatedAt: string;
}

export const EPISODE_TIMESTAMP_TYPES = [
  "recap",
  "opening",
  "post_credit",
  "ending",
] as const;

export type EpisodeTimestampType = (typeof EPISODE_TIMESTAMP_TYPES)[number];

export interface EpisodeTimestamp {
  id: string;
  episodeId: string;
  type: EpisodeTimestampType;
  startSeconds: number;
  endSeconds: number;
}
