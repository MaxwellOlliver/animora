"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSeries } from "./api";

const SERIES_PAGE_SIZE = 20;

export function useSeriesList() {
  return useInfiniteQuery({
    queryKey: ["series"],
    queryFn: ({ pageParam }) =>
      fetchSeries({ cursor: pageParam, limit: SERIES_PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
