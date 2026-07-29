import { infiniteQueryOptions } from "@tanstack/react-query";

import type { Genre, Media, SeriesAsset } from "@/features/catalog/queries/fetch-recommended";

export type ExploreClassification = {
  id: string;
  name: string;
  description: string | null;
  icon: Media | null;
};

export type ExploreSeriesStatus = "airing" | "upcoming" | "finished";

export type ExploreSeries = {
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
  contentClassification: ExploreClassification | null;
  releaseYear: number | null;
  status: ExploreSeriesStatus | null;
  rating: { average: number; count: number };
};

type ExploreResponse = {
  items: ExploreSeries[];
  nextCursor: string | null;
};

export type ExploreFilters = {
  q?: string;
  categoryIds: string[];
  classifications: string[];
};

async function fetchExplore(
  filters: ExploreFilters,
  cursor?: string,
): Promise<ExploreResponse> {
  const url = new URL("/api/proxy/catalog/explore", window.location.origin);
  if (filters.q) url.searchParams.set("q", filters.q);
  for (const id of filters.categoryIds) {
    url.searchParams.append("categoryIds", id);
  }
  for (const id of filters.classifications) {
    url.searchParams.append("classifications", id);
  }
  if (cursor) url.searchParams.set("cursor", cursor);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch explore results: ${response.status}`);
  }

  return response.json();
}

export function exploreQueryOptions(filters: ExploreFilters) {
  return infiniteQueryOptions({
    queryKey: ["catalog", "explore", filters],
    queryFn: ({ pageParam }) => fetchExplore(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
