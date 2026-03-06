import { apiClient } from "@/lib/api-client";
import type { Genre } from "./types";

export interface CreateGenreInput {
  name: string;
}

export interface UpdateGenreInput {
  name: string;
  active: boolean;
}

export async function fetchGenres(): Promise<Genre[]> {
  return apiClient<Genre[]>("/admin/genres");
}

export async function fetchGenreById(id: string): Promise<Genre> {
  return apiClient<Genre>(`/admin/genres/${id}`);
}

export async function createGenre(input: CreateGenreInput): Promise<Genre> {
  return apiClient<Genre>("/admin/genres", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateGenre(
  id: string,
  input: UpdateGenreInput,
): Promise<Genre> {
  return apiClient<Genre>(`/admin/genres/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
