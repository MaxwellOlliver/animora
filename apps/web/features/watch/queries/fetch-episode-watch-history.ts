import { queryOptions } from "@tanstack/react-query";

export type EpisodeWatchHistory = {
  id: string;
  profileId: string;
  episodeId: string;
  positionSeconds: number;
  status: "watching" | "finished";
  createdAt: string;
  updatedAt: string;
};

async function fetchEpisodeWatchHistory(
  episodeId: string,
): Promise<EpisodeWatchHistory | null> {
  const response = await fetch(`/api/proxy/watch-history/episode/${episodeId}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch episode watch history: ${response.status}`,
    );
  }

  return response.json();
}

export const buildFetchEpisodeWatchHistoryQueryOptions = (episodeId: string) =>
  queryOptions({
    queryKey: ["watch", "episode", episodeId, "history"],
    queryFn: () => fetchEpisodeWatchHistory(episodeId),
    refetchOnWindowFocus: false,
  });
