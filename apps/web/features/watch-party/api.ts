import type { WatchPartySession, WatchPartySnapshot } from "./types";

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { body, method } = init;
  const response = await fetch(`/api/proxy${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function createWatchParty(episodeId: string) {
  return request<{ session: WatchPartySession }>("/watch-party", {
    method: "POST",
    body: { episodeId },
  });
}

export function joinWatchParty(code: string) {
  return request<WatchPartySnapshot>(
    `/watch-party/${encodeURIComponent(code)}/join`,
    { method: "POST", body: {} },
  );
}

export function getWatchPartySnapshot(code: string) {
  return request<WatchPartySnapshot>(
    `/watch-party/${encodeURIComponent(code)}`,
  );
}

export async function fetchWatchPartyTicket(): Promise<{
  token: string;
  profileId: string;
}> {
  const res = await fetch("/api/watch-party/ticket");
  if (!res.ok) throw new Error("Failed to obtain watch party ticket");
  return res.json() as Promise<{ token: string; profileId: string }>;
}
