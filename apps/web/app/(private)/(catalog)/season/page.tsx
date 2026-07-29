import type { Metadata } from "next";
import Image from "next/image";

import { SeasonGrid } from "@/features/season/components/season-grid";
import { SeasonPicker } from "@/features/season/components/season-picker";
import { fetchSeason } from "@/features/season/queries/fetch-season.server";
import {
  getCurrentSeason,
  getSeasonImage,
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
    <main className="relative min-h-screen px-6 pt-(--navbar-height) pb-12">
      <div className="absolute inset-x-0 top-0 -z-10 h-112 overflow-hidden">
        <Image
          key={season}
          src={getSeasonImage(season)}
          alt=""
          fill
          priority
          className="object-cover object-center"
          unoptimized
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-background  to-background/50" />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <h1 className="font-heading text-4xl font-semibold">
            {getSeasonLabel(year, season)} Anime
          </h1>
          <p className="text-sm text-foreground-muted">
            What&apos;s airing this season, day by day.
          </p>
          <SeasonPicker year={year} season={season} />
        </div>

        <SeasonGrid entries={entries} />
      </div>
    </main>
  );
}
