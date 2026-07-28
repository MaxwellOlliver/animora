import type { SeasonEntry } from "../types";
import { SeasonCard } from "./season-card";

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface SeasonGridProps {
  entries: SeasonEntry[];
}

function DaySection({
  title,
  entries,
}: {
  title: string;
  entries: SeasonEntry[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h3>
      {entries.length === 0 ? (
        <p className="text-xs text-foreground-muted">Nothing airing</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {entries.map((entry) => (
            <SeasonCard key={entry.playlistId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SeasonGrid({ entries }: SeasonGridProps) {
  const entriesByWeekday = new Map<number, SeasonEntry[]>();
  const unscheduled: SeasonEntry[] = [];

  for (const entry of entries) {
    if (entry.releaseWeekday == null) {
      unscheduled.push(entry);
      continue;
    }
    const bucket = entriesByWeekday.get(entry.releaseWeekday);
    if (bucket) bucket.push(entry);
    else entriesByWeekday.set(entry.releaseWeekday, [entry]);
  }

  return (
    <div className="flex flex-col gap-8">
      {WEEKDAY_LABELS.map((label, weekday) => (
        <DaySection
          key={label}
          title={label}
          entries={entriesByWeekday.get(weekday) ?? []}
        />
      ))}

      {unscheduled.length > 0 && (
        <DaySection title="Unscheduled" entries={unscheduled} />
      )}
    </div>
  );
}
