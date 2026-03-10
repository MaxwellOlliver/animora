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

export type SeriesAssetPurpose = "banner" | "logo" | "trailer";

export interface SeriesAsset {
  id: string;
  seriesId: string;
  mediaId: string;
  purpose: SeriesAssetPurpose;
  media: Media;
  createdAt: string;
}

export interface Series {
  id: string;
  name: string;
  synopsis: string;
  bannerId: string | null;
  contentClassificationId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  genres: Genre[];
  assets: SeriesAsset[];
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
}
