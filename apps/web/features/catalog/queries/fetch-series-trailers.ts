import { queryOptions } from "@tanstack/react-query";

import { env } from "@/lib/env";

import type { Media } from "./fetch-recommended";

export type TrailerSummary = {
  id: string;
  seriesId: string;
  playlistId: string | null;
  number: number;
  title: string;
  thumbnailId: string | null;
  thumbnail: Media | null;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
};

async function fetchSeriesTrailers(
  seriesId: string,
): Promise<TrailerSummary[]> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/catalog/series/${seriesId}/trailers`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch trailers: ${response.status}`);
  }

  return response.json();
}

export const buildFetchSeriesTrailersQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["catalog", "series", seriesId, "trailers"],
    queryFn: () => fetchSeriesTrailers(seriesId),
  });
