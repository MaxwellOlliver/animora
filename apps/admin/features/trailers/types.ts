export interface Media {
  id: string;
  key: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
}

export interface Trailer {
  id: string;
  seriesId: string;
  playlistId: string | null;
  number: number;
  title: string;
  durationSeconds: number;
  thumbnailId: string | null;
  thumbnail: Media | null;
  seriesName?: string;
  createdAt: string;
  updatedAt: string;
}
