export interface Media {
  id: string;
  key: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
}

export interface Genre {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface Series {
  id: string;
  name: string;
  synopsis: string;
  bannerId: string | null;
  banner: Media | null;
  contentClassificationId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  genres: Genre[];
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}
