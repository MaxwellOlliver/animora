import { api } from "@/lib/api";

import type { SeriesDetail } from "./fetch-series";

export async function fetchSeriesDetail(id: string): Promise<SeriesDetail> {
  return api<SeriesDetail>(`/catalog/series/${id}`);
}
