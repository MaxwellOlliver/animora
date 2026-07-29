import type { SeasonEntry } from "../types";
import { SeasonCard } from "./season-card";

interface SeasonGridProps {
  entries: SeasonEntry[];
}

export function SeasonGrid({ entries }: SeasonGridProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        Nothing airing this season.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {entries.map((entry) => (
        <SeasonCard key={entry.playlistId} entry={entry} />
      ))}
    </div>
  );
}
