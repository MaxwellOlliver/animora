"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { recommendedQueryOptions } from "../queries/fetch-recommended";
import { CatalogSection } from "./catalog-section";
import { SeriesCard } from "./series-card";
import { SeriesCardSkeleton } from "./series-card-skeleton";

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

  return <div ref={ref} className="shrink-0 w-px" />;
}

export function RecommendedSection() {
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    recommendedQueryOptions,
  );

  const allSeries = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <CatalogSection title="Recommended" linkHref="/history" linkTitle="see all">
      {isLoading ? (
        Array.from({ length: 10 }, (_, i) => <SeriesCardSkeleton key={i} />)
      ) : (
        <>
          {allSeries.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
          {hasNextPage && (
            <>
              <Sentinel onVisible={fetchNextPage} />
              {Array.from({ length: 4 }, (_, i) => (
                <SeriesCardSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          )}
        </>
      )}
    </CatalogSection>
  );
}
