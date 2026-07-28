import type { Metadata } from "next";

import { SeasonGrid } from "@/features/season/components/season-grid";
import { SeasonPicker } from "@/features/season/components/season-picker";
import { fetchSeason } from "@/features/season/queries/fetch-season.server";
import {
  getCurrentSeason,
  getSeasonLabel,
  type SeasonName,
  SEASONS,
} from "@/features/season/utils/season";

export const metadata: Metadata = {
  title: "Season - animora",
};

type SeasonPageProps = {
  searchParams: Promise<{ year?: string; season?: string }>;
};

function resolveSeason(params: { year?: string; season?: string }): {
  year: number;
  season: SeasonName;
} {
  const year = Number(params.year);
  const season = params.season as SeasonName;

  if (Number.isInteger(year) && SEASONS.includes(season)) {
    return { year, season };
  }

  return getCurrentSeason();
}

export default async function SeasonPage({ searchParams }: SeasonPageProps) {
  const { year, season } = resolveSeason(await searchParams);
  const entries = await fetchSeason(year, season);

  return (
    <main className="flex min-h-screen flex-col gap-6 px-12 pt-(--navbar-height) pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold mt-12">
            {getSeasonLabel(year, season)} Anime
          </h1>
          <p className="text-sm text-foreground-muted">
            What&apos;s airing this season, day by day.
          </p>
        </div>
        <SeasonPicker year={year} season={season} />
      </div>
      <SeasonGrid entries={entries} />
    </main>
  );
}
