export const SEASONS = ["winter", "spring", "summer", "fall"] as const;

export type SeasonName = (typeof SEASONS)[number];

export function getCurrentSeason(date = new Date()): {
  year: number;
  season: SeasonName;
} {
  const seasonIndex = Math.floor(date.getUTCMonth() / 3);
  return { year: date.getUTCFullYear(), season: SEASONS[seasonIndex] };
}

export function shiftSeason(
  year: number,
  season: SeasonName,
  delta: number,
): { year: number; season: SeasonName } {
  const total = SEASONS.indexOf(season) + delta;
  const yearDelta = Math.floor(total / SEASONS.length);
  const seasonIndex = ((total % SEASONS.length) + SEASONS.length) % SEASONS.length;
  return { year: year + yearDelta, season: SEASONS[seasonIndex] };
}

export function getSeasonLabel(year: number, season: SeasonName): string {
  return `${season[0].toUpperCase()}${season.slice(1)} ${year}`;
}

export function buildSeasonOptions(
  pastCount = 11,
): { year: number; season: SeasonName }[] {
  const current = getCurrentSeason();
  return Array.from({ length: pastCount + 2 }, (_, i) =>
    shiftSeason(current.year, current.season, 1 - i),
  );
}
