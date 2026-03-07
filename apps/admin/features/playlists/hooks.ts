"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreatePlaylistInput,
  type UpdatePlaylistInput,
  createPlaylist,
  deletePlaylist,
  fetchPlaylistById,
  fetchPlaylists,
  updatePlaylist,
  uploadPlaylistCover,
} from "./api";

export function usePlaylistsList(seriesId?: string) {
  return useQuery({
    queryKey: ["playlists", { seriesId }],
    queryFn: () => fetchPlaylists(seriesId),
  });
}

export function usePlaylistById(id: string) {
  return useQuery({
    queryKey: ["playlists", id],
    queryFn: () => fetchPlaylistById(id),
    enabled: !!id,
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlaylistInput) => createPlaylist(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useUpdatePlaylist(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePlaylistInput) => updatePlaylist(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlaylist(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useUploadPlaylistCover(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadPlaylistCover(id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}
