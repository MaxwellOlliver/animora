"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTrailer,
  type CreateTrailerInput,
  deleteTrailer,
  fetchTrailerById,
  fetchTrailers,
  updateTrailer,
  type UpdateTrailerInput,
  uploadTrailerThumbnail,
} from "./api";

export function useTrailersList(seriesId?: string) {
  return useQuery({
    queryKey: ["trailers", { seriesId }],
    queryFn: () => fetchTrailers(seriesId),
  });
}

export function useTrailerById(id: string) {
  return useQuery({
    queryKey: ["trailers", id],
    queryFn: () => fetchTrailerById(id),
    enabled: !!id,
  });
}

export function useCreateTrailer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTrailerInput) => createTrailer(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trailers"] });
    },
  });
}

export function useUpdateTrailer(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTrailerInput) => updateTrailer(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trailers"] });
    },
  });
}

export function useDeleteTrailer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrailer(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trailers"] });
    },
  });
}

export function useUploadTrailerThumbnail(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadTrailerThumbnail(id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trailers"] });
    },
  });
}
