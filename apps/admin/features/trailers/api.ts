import { apiClient } from "@/lib/api-client";

import type { Trailer } from "./types";

export interface CreateTrailerInput {
  seriesId: string;
  playlistId?: string;
  number: number;
  title: string;
  durationSeconds: number;
}

export interface UpdateTrailerInput {
  playlistId?: string;
  number?: number;
  title?: string;
  durationSeconds?: number;
}

export async function fetchTrailers(seriesId?: string): Promise<Trailer[]> {
  const params = seriesId ? `?seriesId=${seriesId}` : "";
  return apiClient<Trailer[]>(`/admin/trailers${params}`);
}

export async function fetchTrailerById(id: string): Promise<Trailer> {
  return apiClient<Trailer>(`/admin/trailers/${id}`);
}

export async function createTrailer(
  input: CreateTrailerInput,
): Promise<Trailer> {
  return apiClient<Trailer>("/admin/trailers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTrailer(
  id: string,
  input: UpdateTrailerInput,
): Promise<Trailer> {
  return apiClient<Trailer>(`/admin/trailers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTrailer(id: string): Promise<void> {
  await apiClient(`/admin/trailers/${id}`, { method: "DELETE" });
}

export async function uploadTrailerThumbnail(
  id: string,
  file: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  await apiClient<void>(`/admin/trailers/${id}/thumbnail`, {
    method: "POST",
    body: formData,
  });
}
