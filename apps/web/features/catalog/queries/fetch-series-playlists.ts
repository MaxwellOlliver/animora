import { queryOptions } from "@tanstack/react-query";

import { env } from "@/lib/env";

import type { Media } from "./fetch-recommended";

export type PlaylistSummary = {
  id: string;
  seriesId: string;
  type: "season" | "movie" | "special";
  status: "upcoming" | "airing" | "finished" | null;
  number: number;
  title: string | null;
  studio: string | null;
  coverId: string | null;
  cover: Media | null;
  airStartDate: string | null;
  airEndDate: string | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchSeriesPlaylists(
  seriesId: string,
): Promise<PlaylistSummary[]> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/catalog/series/${seriesId}/playlists`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch playlists: ${response.status}`);
  }

  return response.json();
}

export const buildFetchSeriesPlaylistsQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["catalog", "series", seriesId, "playlists"],
    queryFn: () => fetchSeriesPlaylists(seriesId),
  });
