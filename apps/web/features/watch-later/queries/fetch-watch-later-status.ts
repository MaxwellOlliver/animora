import { queryOptions } from "@tanstack/react-query";

export type WatchLaterStatus = { isMarked: boolean };

async function fetchWatchLaterStatus(
  seriesId: string,
): Promise<WatchLaterStatus> {
  const response = await fetch(`/api/proxy/watch-later/${seriesId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch watch-later status: ${response.status}`);
  }

  return response.json();
}

export const buildFetchWatchLaterStatusQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["watch-later", seriesId, "status"],
    queryFn: () => fetchWatchLaterStatus(seriesId),
  });
