"use client";

import Image from "next/image";
import { useState } from "react";

import { buildMediaUrl } from "@/utils/media-utils";

import type { ContentClassificationSummary } from "../../queries/fetch-series";

interface SeriesDescriptionProps {
  description: string;
  studios: string[];
  genres: string[];
  contentClassification: ContentClassificationSummary | null;
}

export function SeriesDescription({
  description,
  studios,
  genres,
  contentClassification,
}: SeriesDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <div
        className="overflow-hidden transition-[height] duration-300"
        style={{ height: expanded ? "auto" : "3lh" }}
      >
        <div className="flex gap-6">
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm leading-relaxed text-foreground-muted">
              {description}
            </p>
          </div>

          <div className="flex w-48 shrink-0 flex-col gap-2 text-sm">
            <div>
              <span className="text-foreground-muted">Studios: </span>
              <span>{studios.length > 0 ? studios.join(", ") : "No info"}</span>
            </div>
            <div>
              <span className="text-foreground-muted">Genres: </span>
              <span>{genres.join(", ")}</span>
            </div>
            {contentClassification && (
              <div>
                <span className="text-foreground-muted">
                  Content Classification:{" "}
                </span>
                {contentClassification.icon && (
                  <Image
                    src={buildMediaUrl(
                      contentClassification.icon.purpose,
                      contentClassification.icon.key,
                    )}
                    alt={contentClassification.name}
                    width={16}
                    height={16}
                    className="inline size-4 align-text-bottom"
                    unoptimized
                  />
                )}{" "}
                <span className="font-medium">
                  {contentClassification.name}
                </span>
                {contentClassification.description && (
                  <span className="text-foreground-muted">
                    {" - "}{contentClassification.description}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!expanded && (
        <div className="absolute inset-x-0 bottom-0 flex items-end bg-linear-to-t from-card via-card/80 to-transparent pt-8">
          <button
            type="button"
            className="text-sm text-secondary hover:underline"
            onClick={() => setExpanded(true)}
          >
            more details
          </button>
        </div>
      )}

      {expanded && (
        <button
          type="button"
          className="mt-2 text-sm text-secondary hover:underline"
          onClick={() => setExpanded(false)}
        >
          less details
        </button>
      )}
    </div>
  );
}
