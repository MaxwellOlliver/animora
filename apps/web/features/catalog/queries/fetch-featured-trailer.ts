import { queryOptions } from "@tanstack/react-query";

import { env } from "@/lib/env";

import type { Media } from "./fetch-recommended";

type Video = {
  id: string;
  ownerType: string;
  ownerId: string;
  status: string;
  rawObjectKey: string | null;
  masterPlaylistKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedTrailer = {
  id: string;
  seriesId: string;
  playlistId: string | null;
  number: number;
  title: string;
  thumbnailId: string | null;
  thumbnail: Media | null;
  durationSeconds: number;
  video: Video | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchFeaturedTrailer(
  seriesId: string,
): Promise<FeaturedTrailer | null> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/catalog/series/${seriesId}/featured-trailer`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch featured trailer: ${response.status}`);
  }

  return response.json();
}

export const buildFetchFeaturedTrailerQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["catalog", "series", seriesId, "featured-trailer"],
    queryFn: () => fetchFeaturedTrailer(seriesId),
  });
