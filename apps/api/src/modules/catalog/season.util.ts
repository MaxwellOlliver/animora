export const SEASONS = ['winter', 'spring', 'summer', 'fall'] as const;

export type SeasonName = (typeof SEASONS)[number];

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getSeasonDateRange(
  year: number,
  season: SeasonName,
): { from: string; to: string } {
  const startMonth = SEASONS.indexOf(season) * 3;
  const from = new Date(Date.UTC(year, startMonth, 1));
  const to = new Date(Date.UTC(year, startMonth + 3, 0));
  return { from: toDateKey(from), to: toDateKey(to) };
}
