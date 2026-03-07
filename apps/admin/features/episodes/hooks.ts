"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateEpisodeInput,
  type UpdateEpisodeInput,
  createEpisode,
  deleteEpisode,
  fetchEpisodeById,
  fetchEpisodes,
  updateEpisode,
  uploadEpisodeThumbnail,
} from "./api";

export function useEpisodesList(playlistId?: string) {
  return useQuery({
    queryKey: ["episodes", { playlistId }],
    queryFn: () => fetchEpisodes(playlistId),
  });
}

export function useEpisodeById(id: string) {
  return useQuery({
    queryKey: ["episodes", id],
    queryFn: () => fetchEpisodeById(id),
    enabled: !!id,
  });
}

export function useCreateEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEpisodeInput) => createEpisode(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });
}

export function useUpdateEpisode(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEpisodeInput) => updateEpisode(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEpisode(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });
}

export function useUploadEpisodeThumbnail(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadEpisodeThumbnail(id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["episodes"] });
    },
  });
}
