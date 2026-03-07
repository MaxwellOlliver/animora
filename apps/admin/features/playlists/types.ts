export interface Media {
  id: string;
  key: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
}

export type PlaylistType = "season" | "movie" | "special";

export interface Playlist {
  id: string;
  seriesId: string;
  type: PlaylistType;
  number: number;
  title: string | null;
  coverId: string | null;
  cover: Media | null;
  seriesName?: string;
  createdAt: string;
  updatedAt: string;
}
