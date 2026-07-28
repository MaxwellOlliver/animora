import type { Metadata } from "next";

import { ScheduleGrid } from "@/features/schedule/components/schedule-grid";
import { fetchSchedule } from "@/features/schedule/queries/fetch-schedule.server";

export const metadata: Metadata = {
  title: "Release Schedule - animora",
};

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildWeekDates(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 3 + i);
    return toDateKey(date);
  });
}

export default async function SchedulePage() {
  const dates = buildWeekDates();
  const todayKey = toDateKey(new Date());
  const entries = await fetchSchedule(dates[0], dates[dates.length - 1]);

  return (
    <main className="flex min-h-screen flex-col gap-6 px-12 pt-(--navbar-height) pb-12">
      <div>
        <h1 className="font-heading text-3xl font-semibold mt-12">
          Release Schedule
        </h1>
        <p className="text-sm text-foreground-muted">
          New episodes, day by day.
        </p>
      </div>
      <ScheduleGrid entries={entries} dates={dates} todayKey={todayKey} />
    </main>
  );
}
