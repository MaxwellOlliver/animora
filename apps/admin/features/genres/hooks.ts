"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createGenre,
  type CreateGenreInput,
  fetchGenreById,
  fetchGenres,
  updateGenre,
  type UpdateGenreInput,
} from "./api";

export function useGenresList() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
  });
}

export function useGenreById(id: string) {
  return useQuery({
    queryKey: ["genres", id],
    queryFn: () => fetchGenreById(id),
    enabled: !!id,
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGenreInput) => createGenre(input),
    onSuccess: async (created) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["genres"] }),
        queryClient.invalidateQueries({ queryKey: ["genres", created.id] }),
      ]);
    },
  });
}

export function useUpdateGenre(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateGenreInput) => updateGenre(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["genres"] }),
        queryClient.invalidateQueries({ queryKey: ["genres", id] }),
      ]);
    },
  });
}
