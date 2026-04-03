import type { IronSession } from "iron-session";
import { ApiError, apiInternal } from "./api-internal";
import { getLogger } from "./logger";
import { decodeTokenExpiry, type SessionData } from "./session";

type AuthResponse = { accessToken: string; refreshToken: string };

const REFRESH_THRESHOLD_SECONDS = 120;

const pending = new Map<string, Promise<void>>();
const logger = getLogger().child({ scope: "auth-refresh" });

function tokenSuffix(token?: string): string | null {
  if (!token) return null;
  return token.slice(-8);
}

function getSecondsLeft(session: IronSession<SessionData>): number | null {
  if (!session.expiresAt) return null;
  return session.expiresAt - Math.floor(Date.now() / 1000);
}

function logRefresh(
  event: string,
  details: Record<string, unknown>,
): void {
  logger.info(event, details);
}

function sessionKey(session: IronSession<SessionData>): string {
  return session.refreshToken ?? "";
}

export function needsRefresh(session: IronSession<SessionData>): boolean {
  if (!session.expiresAt) return false;
  const secondsLeft = getSecondsLeft(session);
  if (secondsLeft === null) return false;
  return secondsLeft < REFRESH_THRESHOLD_SECONDS;
}

export async function refreshIfNeeded(
  session: IronSession<SessionData>,
): Promise<void> {
  const secondsLeft = getSecondsLeft(session);
  const shouldRefresh = needsRefresh(session);

  logRefresh("check", {
    expiresAt: session.expiresAt ?? null,
    secondsLeft,
    thresholdSeconds: REFRESH_THRESHOLD_SECONDS,
    shouldRefresh,
    hasRefreshToken: Boolean(session.refreshToken),
    refreshTokenSuffix: tokenSuffix(session.refreshToken),
    accessTokenSuffix: tokenSuffix(session.accessToken),
  });

  if (!shouldRefresh) return;

  const key = sessionKey(session);
  if (!key) {
    logRefresh("skipped:no-refresh-token", {
      expiresAt: session.expiresAt ?? null,
      secondsLeft,
    });
    return;
  }

  const inflight = pending.get(key);
  if (inflight) {
    logRefresh("join-inflight", {
      refreshTokenSuffix: tokenSuffix(key),
    });
    await inflight;
    return;
  }

  logRefresh("start", {
    expiresAt: session.expiresAt ?? null,
    secondsLeft,
    refreshTokenSuffix: tokenSuffix(session.refreshToken),
    accessTokenSuffix: tokenSuffix(session.accessToken),
  });

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

    logRefresh("success", {
      expiresAt: session.expiresAt,
      secondsLeft: getSecondsLeft(session),
      refreshTokenSuffix: tokenSuffix(session.refreshToken),
      accessTokenSuffix: tokenSuffix(session.accessToken),
    });
  } catch (error) {
    const apiError = error instanceof ApiError ? error : null;

    logger.error("failure", {
      expiresAt: session.expiresAt ?? null,
      secondsLeft: getSecondsLeft(session),
      refreshTokenSuffix: tokenSuffix(session.refreshToken),
      accessTokenSuffix: tokenSuffix(session.accessToken),
      error,
      status: apiError?.status ?? null,
      body: apiError?.body ?? null,
    });

    session.destroy();
    throw new Error("Session expired");
  }
}
