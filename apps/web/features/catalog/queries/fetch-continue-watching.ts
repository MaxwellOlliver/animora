import { infiniteQueryOptions } from "@tanstack/react-query";

export type WatchHistoryEpisode = {
  id: string;
  profileId: string;
  episodeId: string;
  positionSeconds: number;
  status: "watching" | "finished";
  createdAt: string;
  updatedAt: string;
  episode: {
    id: string;
    number: number;
    title: string;
    durationSeconds: number | null;
    thumbnailUrl: string | null;
    playlist: {
      id: string;
      number: number;
      title: string | null;
      type: string;
    };
    series: {
      id: string;
      name: string;
    };
  };
};

type CursorPaginatedResponse = {
  items: WatchHistoryEpisode[];
  nextCursor: string | null;
};

async function fetchContinueWatching(
  cursor?: string,
): Promise<CursorPaginatedResponse> {
  const url = new URL("/api/proxy/profiles/@me/watch-history/continue", window.location.origin);
  if (cursor) url.searchParams.set("cursor", cursor);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch continue watching: ${response.status}`);
  }

  return response.json();
}

export const continueWatchingQueryOptions = infiniteQueryOptions({
  queryKey: ["catalog", "continue-watching"],
  queryFn: ({ pageParam }) => fetchContinueWatching(pageParam),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
