import { queryOptions } from "@tanstack/react-query";

import type { Genre, Media, SeriesAsset } from "./fetch-recommended";

export type ContentClassificationSummary = {
  id: string;
  name: string;
  description: string | null;
  icon: Media | null;
};

export type SeriesDetail = {
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
  contentClassification: ContentClassificationSummary | null;
  rating: {
    average: number;
    count: number;
  };
};

async function fetchSeriesDetail(id: string): Promise<SeriesDetail> {
  const response = await fetch(
    `/api/proxy/catalog/series/${id}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch series: ${response.status}`);
  }

  return response.json();
}

export const buildFetchSeriesQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["catalog", "series", id],
    queryFn: () => fetchSeriesDetail(id),
  });
