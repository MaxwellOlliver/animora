export interface Media {
  id: string;
  key: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
}

export type PlaylistType = "season" | "movie" | "special";
export type PlaylistStatus = "upcoming" | "airing" | "finished";

export interface Playlist {
  id: string;
  seriesId: string;
  type: PlaylistType;
  status: PlaylistStatus | null;
  number: number;
  title: string | null;
  studio: string | null;
  coverId: string | null;
  cover: Media | null;
  airStartDate: string | null;
  airEndDate: string | null;
  seriesName?: string;
  createdAt: string;
  updatedAt: string;
}
