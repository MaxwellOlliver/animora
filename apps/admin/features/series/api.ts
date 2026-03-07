import { apiClient } from "@/lib/api-client";
import type { CursorPaginatedResponse, Series } from "./types";

export interface CreateSeriesInput {
  name: string;
  synopsis: string;
  contentClassificationId: string;
  genreIds: string[];
  active?: boolean;
}

export interface UpdateSeriesInput {
  name?: string;
  synopsis?: string;
  contentClassificationId?: string;
  genreIds?: string[];
  active?: boolean;
}

export async function fetchSeries({
  cursor,
  limit = 20,
}: {
  cursor?: string;
  limit?: number;
}): Promise<CursorPaginatedResponse<Series>> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("limit", String(limit));

  return apiClient<CursorPaginatedResponse<Series>>(
    `/admin/series?${params.toString()}`,
  );
}

export async function fetchSeriesById(id: string): Promise<Series> {
  return apiClient<Series>(`/admin/series/${id}`);
}

export async function createSeries(input: CreateSeriesInput): Promise<Series> {
  return apiClient<Series>("/admin/series", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSeries(
  id: string,
  input: UpdateSeriesInput,
): Promise<Series> {
  return apiClient<Series>(`/admin/series/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function uploadSeriesBanner(
  id: string,
  file: File,
): Promise<Series> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<Series>(`/admin/series/${id}/banner`, {
    method: "POST",
    body: formData,
  });
}
