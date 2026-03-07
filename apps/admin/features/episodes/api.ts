import { apiClient } from "@/lib/api-client";
import type { Episode } from "./types";

export interface CreateEpisodeInput {
  playlistId: string;
  number: number;
  title: string;
  description?: string;
}

export interface UpdateEpisodeInput {
  number?: number;
  title?: string;
  description?: string;
}

export async function fetchEpisodes(playlistId?: string): Promise<Episode[]> {
  const params = playlistId ? `?playlistId=${playlistId}` : "";
  return apiClient<Episode[]>(`/admin/episodes${params}`);
}

export async function fetchEpisodeById(id: string): Promise<Episode> {
  return apiClient<Episode>(`/admin/episodes/${id}`);
}

export async function createEpisode(
  input: CreateEpisodeInput,
): Promise<Episode> {
  return apiClient<Episode>("/admin/episodes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEpisode(
  id: string,
  input: UpdateEpisodeInput,
): Promise<Episode> {
  return apiClient<Episode>(`/admin/episodes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteEpisode(id: string): Promise<void> {
  await apiClient(`/admin/episodes/${id}`, { method: "DELETE" });
}

export async function uploadEpisodeThumbnail(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await apiClient<void>(`/admin/episodes/${id}/thumbnail`, {
    method: "POST",
    body: formData,
  });
}
