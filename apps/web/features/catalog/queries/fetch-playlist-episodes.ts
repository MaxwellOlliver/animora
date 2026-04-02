import { queryOptions } from "@tanstack/react-query";

import { env } from "@/lib/env";

import type { Media } from "./fetch-recommended";

export type EpisodeSummary = {
  id: string;
  playlistId: string;
  number: number;
  title: string;
  description: string | null;
  thumbnailId: string | null;
  thumbnail: Media | null;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
};

async function fetchPlaylistEpisodes(
  playlistId: string,
): Promise<EpisodeSummary[]> {
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/catalog/playlists/${playlistId}/episodes`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch episodes: ${response.status}`);
  }

  return response.json();
}

export const buildFetchPlaylistEpisodesQueryOptions = (playlistId: string) =>
  queryOptions({
    queryKey: ["catalog", "playlists", playlistId, "episodes"],
    queryFn: () => fetchPlaylistEpisodes(playlistId),
  });
