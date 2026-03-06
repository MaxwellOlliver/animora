import { apiClient } from "@/lib/api-client";
import type { CursorPaginatedResponse, Series } from "./types";

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
