import type { IronSession } from "iron-session";
import { apiInternal } from "./api-internal";
import { decodeTokenExpiry, type SessionData } from "./session";

type AuthResponse = { accessToken: string; refreshToken: string };

const REFRESH_THRESHOLD_SECONDS = 120;

const pending = new Map<string, Promise<void>>();

function sessionKey(session: IronSession<SessionData>): string {
  return session.refreshToken ?? "";
}

export function needsRefresh(session: IronSession<SessionData>): boolean {
  if (!session.expiresAt) return false;
  const secondsLeft = session.expiresAt - Math.floor(Date.now() / 1000);
  return secondsLeft < REFRESH_THRESHOLD_SECONDS;
}

export async function refreshIfNeeded(
  session: IronSession<SessionData>,
): Promise<void> {
  if (!needsRefresh(session)) return;

  const key = sessionKey(session);
  if (!key) return;

  const inflight = pending.get(key);
  if (inflight) {
    await inflight;
    return;
  }

  const promise = doRefresh(session);
  pending.set(key, promise);

  try {
    await promise;
  } finally {
    pending.delete(key);
  }
}

async function doRefresh(
  session: IronSession<SessionData>,
): Promise<void> {
  try {
    const data = await apiInternal<AuthResponse>("/auth/refresh", {
      method: "POST",
      token: session.refreshToken,
    });

    session.accessToken = data.accessToken;
    session.refreshToken = data.refreshToken;
    session.expiresAt = decodeTokenExpiry(data.accessToken);
    await session.save();
  } catch {
    session.destroy();
    throw new Error("Session expired");
  }
}
