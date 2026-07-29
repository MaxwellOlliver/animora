import { queryOptions } from "@tanstack/react-query";

export type Category = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
};

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch("/api/proxy/catalog/genres");

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  return response.json();
}

export const categoriesQueryOptions = queryOptions({
  queryKey: ["catalog", "genres"],
  queryFn: fetchCategories,
  staleTime: 5 * 60 * 1000,
});
