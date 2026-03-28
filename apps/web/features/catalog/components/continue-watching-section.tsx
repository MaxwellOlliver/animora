"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { continueWatchingQueryOptions } from "../queries/fetch-continue-watching";
import { CatalogSection } from "./catalog-section";
import { EpisodeCard } from "./episode-card";

export function ContinueWatchingSection() {
  const { data, isLoading } = useInfiniteQuery(continueWatchingQueryOptions);

  const allEntries = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isLoading && allEntries.length === 0) return null;

  return (
    <CatalogSection
      title="Continue Watching"
      linkHref="/history"
      linkTitle="see history"
    >
      {allEntries.map((entry) => (
        <EpisodeCard key={entry.id} entry={entry} />
      ))}
    </CatalogSection>
  );
}
