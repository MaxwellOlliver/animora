import "server-only";

import { api } from "@/lib/api";

import type { ScheduleEntry } from "../types";

export async function fetchSchedule(
  from: string,
  to: string,
): Promise<ScheduleEntry[]> {
  return api<ScheduleEntry[]>(`/catalog/schedule?from=${from}&to=${to}`);
}
