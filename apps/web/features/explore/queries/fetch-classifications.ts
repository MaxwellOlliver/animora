import { queryOptions } from "@tanstack/react-query";

import type { Media } from "@/features/catalog/queries/fetch-recommended";

export type ClassificationOption = {
  id: string;
  name: string;
  description: string | null;
  icon: Media | null;
  active: boolean;
  createdAt: string;
};

async function fetchClassifications(): Promise<ClassificationOption[]> {
  const response = await fetch("/api/proxy/catalog/content-classifications");

  if (!response.ok) {
    throw new Error(`Failed to fetch classifications: ${response.status}`);
  }

  return response.json();
}

export const classificationsQueryOptions = queryOptions({
  queryKey: ["catalog", "content-classifications"],
  queryFn: fetchClassifications,
  staleTime: 5 * 60 * 1000,
});
