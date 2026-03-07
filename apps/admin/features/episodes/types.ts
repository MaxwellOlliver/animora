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
  playlistName?: string | null;
  seriesName?: string;
  createdAt: string;
  updatedAt: string;
}
