import { infiniteQueryOptions } from "@tanstack/react-query";

import type { RecommendedSeries } from "@/features/catalog/queries/fetch-recommended";

type WatchLaterResponse = {
  items: RecommendedSeries[];
  nextCursor: string | null;
};

async function fetchWatchLater(cursor?: string): Promise<WatchLaterResponse> {
  const url = new URL("/api/proxy/watch-later", window.location.origin);
  if (cursor) url.searchParams.set("cursor", cursor);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch watch later: ${response.status}`);
  }

  return response.json();
}

export const watchLaterQueryOptions = infiniteQueryOptions({
  queryKey: ["watch-later"],
  queryFn: ({ pageParam }) => fetchWatchLater(pageParam),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
