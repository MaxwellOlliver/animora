"use client";

import { useState } from "react";

interface SeriesDescriptionProps {
  description: string;
  studios: string[];
  genres: string[];
  contentClassification: string[];
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
              <span>{studios.join(", ")}</span>
            </div>
            <div>
              <span className="text-foreground-muted">Genres: </span>
              <span>{genres.join(", ")}</span>
            </div>
            <div>
              <span className="text-foreground-muted">
                Content Classification:
              </span>
              <br />
              <span>{contentClassification.join(", ")}</span>
            </div>
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
