import { queryOptions } from "@tanstack/react-query";

import type { SeriesReview } from "./fetch-series-reviews";

async function fetchMyReview(seriesId: string): Promise<SeriesReview | null> {
  const response = await fetch(`/api/proxy/profiles/@me/series/${seriesId}/review`);
  if (!response.ok) {
    throw new Error(`Failed to fetch my review: ${response.status}`);
  }
  return response.json();
}

export const buildFetchMyReviewQueryOptions = (seriesId: string) =>
  queryOptions({
    queryKey: ["catalog", "series", seriesId, "my-review"],
    queryFn: () => fetchMyReview(seriesId),
  });
