"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  type CreateSeriesInput,
  type UpdateSeriesInput,
  createSeries,
  fetchSeries,
  fetchSeriesById,
  updateSeries,
  uploadSeriesAsset,
} from "./api";
import type { SeriesAssetPurpose } from "./types";

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

export function useSeriesById(id: string) {
  return useQuery({
    queryKey: ["series", id],
    queryFn: () => fetchSeriesById(id),
    enabled: !!id,
  });
}

export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSeriesInput) => createSeries(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["series"] });
    },
  });
}

export function useUpdateSeries(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSeriesInput) => updateSeries(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["series"] }),
        queryClient.invalidateQueries({ queryKey: ["series", id] }),
      ]);
    },
  });
}

export function useUploadSeriesAsset(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      purpose,
      file,
    }: {
      purpose: SeriesAssetPurpose;
      file: File;
    }) => uploadSeriesAsset(id, purpose, file),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["series"] }),
        queryClient.invalidateQueries({ queryKey: ["series", id] }),
      ]);
    },
  });
}
