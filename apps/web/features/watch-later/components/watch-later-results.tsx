"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { SeriesCard } from "@/features/catalog/components/series-card";
import { SeriesResultSkeleton } from "@/features/explore/components/series-result-skeleton";

import { watchLaterQueryOptions } from "../queries/fetch-watch-later";

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

export function WatchLaterResults() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery(watchLaterQueryOptions);

  if (isError) {
    return (
      <p className="text-sm text-danger">
        Something went wrong loading your watch later list. Please try again.
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

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (items.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        You haven&apos;t added any anime to watch later yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        {items.map((series) => (
          <SeriesCard key={series.id} series={series} />
        ))}
      </div>

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
