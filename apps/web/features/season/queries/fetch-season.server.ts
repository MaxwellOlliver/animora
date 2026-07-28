import "server-only";

import { api } from "@/lib/api";

import type { SeasonEntry } from "../types";
import type { SeasonName } from "../utils/season";

export async function fetchSeason(
  year: number,
  season: SeasonName,
): Promise<SeasonEntry[]> {
  return api<SeasonEntry[]>(`/catalog/season?year=${year}&season=${season}`);
}
