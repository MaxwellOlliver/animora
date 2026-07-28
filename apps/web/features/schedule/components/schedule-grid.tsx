import { cn } from "@/lib/utils";

import type { ScheduleEntry } from "../types";
import { ScheduleCard } from "./schedule-card";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function entryDateKey(entry: ScheduleEntry): string {
  return entry.kind === "episode" ? entry.releaseDate.slice(0, 10) : entry.date;
}

function entryKey(entry: ScheduleEntry): string {
  return entry.kind === "episode"
    ? entry.id
    : `${entry.playlistId}-${entry.date}`;
}

interface ScheduleGridProps {
  entries: ScheduleEntry[];
  dates: string[];
  todayKey: string;
}

export function ScheduleGrid({ entries, dates, todayKey }: ScheduleGridProps) {
  const entriesByDate = new Map<string, ScheduleEntry[]>();
  for (const date of dates) entriesByDate.set(date, []);
  for (const entry of entries) {
    entriesByDate.get(entryDateKey(entry))?.push(entry);
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-7">
      {dates.map((date) => {
        const isToday = date === todayKey;
        const dayEntries = entriesByDate.get(date) ?? [];
        const dateObj = new Date(`${date}T00:00:00.000Z`);
        const weekday = WEEKDAY_LABELS[dateObj.getUTCDay()];
        const dayNumber = dateObj.getUTCDate();
        const month = MONTH_LABELS[dateObj.getUTCMonth()];

        return (
          <div key={date} className="flex flex-col gap-3">
            <div
              className={cn(
                "flex items-baseline gap-2 border-b pb-2",
                isToday ? "border-secondary" : "border-white/10",
              )}
            >
              <span
                className={cn(
                  "font-heading text-sm font-semibold uppercase",
                  isToday ? "text-secondary" : "text-foreground",
                )}
              >
                {isToday ? "Today" : weekday}
              </span>
              <span className="text-xs text-foreground-muted">
                {month} {dayNumber}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {dayEntries.length === 0 ? (
                <p className="text-xs text-foreground-muted">No episodes</p>
              ) : (
                dayEntries.map((entry) => (
                  <ScheduleCard key={entryKey(entry)} entry={entry} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
