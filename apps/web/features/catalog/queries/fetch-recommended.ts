import { infiniteQueryOptions } from "@tanstack/react-query";
import { env } from "@/lib/env";
import { MediaPurpose } from "@animora/contracts";

export type Media = {
  id: string;
  key: string;
  purpose: MediaPurpose;
  mimeType: string;
};

export type SeriesAsset = {
  id: string;
  seriesId: string;
  mediaId: string;
  purpose: "banner" | "logo" | "trailer" | "poster";
  media: Media;
};

export type Genre = {
  id: string;
  name: string;
};

export type RecommendedSeries = {
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
};

type CursorPaginatedResponse = {
  items: RecommendedSeries[];
  nextCursor: string | null;
};

async function fetchRecommended(
  cursor?: string,
): Promise<CursorPaginatedResponse> {
  const url = new URL(`${env.NEXT_PUBLIC_API_URL}/catalog/recommended`);
  if (cursor) url.searchParams.set("cursor", cursor);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch recommended: ${response.status}`);
  }

  return response.json();
}

export const recommendedQueryOptions = infiniteQueryOptions({
  queryKey: ["catalog", "recommended"],
  queryFn: ({ pageParam }) => fetchRecommended(pageParam),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
