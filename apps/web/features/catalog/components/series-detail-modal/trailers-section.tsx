"use client";

import { buildMediaUrl } from "@/utils/media-utils";
import type { TrailerSummary } from "../../queries/fetch-series-trailers";
import { TrailerCard } from "./trailer-card";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

interface TrailersSectionProps {
  trailers: TrailerSummary[];
}

export function TrailersSection({ trailers }: TrailersSectionProps) {
  if (trailers.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-heading text-lg font-semibold">Trailers</h3>
      <div className="flex gap-4">
        {trailers.map((trailer) => (
          <TrailerCard
            key={trailer.id}
            title={trailer.title}
            thumbnail={
              trailer.thumbnail
                ? buildMediaUrl(
                    trailer.thumbnail.purpose,
                    trailer.thumbnail.key,
                  )
                : "/images/episode-thumbnail.png"
            }
            duration={formatDuration(trailer.durationSeconds)}
          />
        ))}
      </div>
    </section>
  );
}
