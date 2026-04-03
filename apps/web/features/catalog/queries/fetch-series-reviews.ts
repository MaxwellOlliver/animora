import { infiniteQueryOptions } from "@tanstack/react-query";

export type ReviewProfile = {
  id: string;
  name: string;
  avatar: { key: string; purpose: string } | null;
};

export type SeriesReview = {
  id: string;
  seriesId: string;
  profileId: string;
  rating: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  profile: ReviewProfile;
};

type ReviewsPage = {
  items: SeriesReview[];
  nextCursor: string | null;
};

async function fetchSeriesReviews(
  seriesId: string,
  cursor?: string,
): Promise<ReviewsPage> {
  const qs = new URLSearchParams();
  if (cursor) qs.set("cursor", cursor);
  qs.set("limit", "10");
  const query = qs.toString();

  const response = await fetch(`/api/proxy/catalog/series/${seriesId}/reviews${query ? `?${query}` : ""}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch reviews: ${response.status}`);
  }
  return response.json();
}

export const buildFetchSeriesReviewsQueryOptions = (seriesId: string) =>
  infiniteQueryOptions({
    queryKey: ["catalog", "series", seriesId, "reviews"],
    queryFn: ({ pageParam }) => fetchSeriesReviews(seriesId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
