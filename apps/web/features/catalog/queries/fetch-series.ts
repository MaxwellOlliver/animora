import { queryOptions } from "@tanstack/react-query";

export const buildFetchSeriesQueryOptions = (id: string) =>
  queryOptions({
    queryFn: () => new Promise((resolve) => setTimeout(resolve, 2000)),
    queryKey: ["series", id],
  });
