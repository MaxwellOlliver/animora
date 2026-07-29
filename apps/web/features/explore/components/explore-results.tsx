"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { SeriesCard } from "@/features/catalog/components/series-card";

import type { ExploreFilters } from "../queries/fetch-explore";
import { exploreQueryOptions } from "../queries/fetch-explore";
import { SeriesResultSkeleton } from "./series-result-skeleton";
import { TopResultCard } from "./top-result-card";

function Sentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onVisible();
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={ref} className="h-px w-full" />;
}

interface ExploreResultsProps {
  filters: ExploreFilters;
}

export function ExploreResults({ filters }: ExploreResultsProps) {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery(exploreQueryOptions(filters));

  if (isError) {
    return (
      <p className="text-sm text-danger">
        Something went wrong loading results. Please try again.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 12 }, (_, i) => (
          <SeriesResultSkeleton key={i} />
        ))}
      </div>
    );
  }

  const pages = data?.pages ?? [];
  const items = pages.flatMap((page) => page.items);

  if (items.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        No anime matched your search.
      </p>
    );
  }

  const showTopResults = Boolean(filters.q);
  const topResults = showTopResults ? (pages[0]?.items.slice(0, 3) ?? []) : [];
  const topResultIds = new Set(topResults.map((series) => series.id));
  const restItems = items.filter((series) => !topResultIds.has(series.id));

  return (
    <div className="flex flex-col gap-6">
      {topResults.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">Top results</h2>
          <div className="flex flex-col gap-2">
            {topResults.map((series, index) => (
              <TopResultCard key={series.id} series={series} rank={index + 1} />
            ))}
          </div>
        </div>
      )}

      {restItems.length > 0 && (
        <div className="flex flex-col gap-3">
          {topResults.length > 0 && (
            <h2 className="font-heading text-lg font-semibold">
              All results
            </h2>
          )}
          <div className="flex flex-wrap gap-4">
            {restItems.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </div>
      )}

      {hasNextPage && (
        <>
          <Sentinel onVisible={fetchNextPage} />
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <SeriesResultSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
