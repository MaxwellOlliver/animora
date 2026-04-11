import { getLogger } from "@animora/logger";
import type { IronSession } from "iron-session";

import { ApiError, apiInternal } from "./api-internal";
import { decodeTokenExpiry, type SessionData } from "./session";

type AuthResponse = { accessToken: string; refreshToken: string };

const REFRESH_THRESHOLD_SECONDS = 120;

const logger = getLogger().child({ scope: "auth-refresh" });

function tokenSuffix(token?: string): string | null {
  if (!token) return null;
  return token.slice(-8);
}

function getSecondsLeft(session: IronSession<SessionData>): number | null {
  if (!session.expiresAt) return null;
  return session.expiresAt - Math.floor(Date.now() / 1000);
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
  if (!needsRefresh(session)) return;

  if (!session.refreshToken) return;

  try {
    const data = await apiInternal<AuthResponse>("/auth/refresh", {
      method: "POST",
      token: session.refreshToken,
    });

    session.accessToken = data.accessToken;
    session.expiresAt = decodeTokenExpiry(data.accessToken);
    await session.save();

    logger.info("refresh-success", {
      expiresAt: session.expiresAt,
      secondsLeft: getSecondsLeft(session),
      accessTokenSuffix: tokenSuffix(session.accessToken),
    });
  } catch (error) {
    const apiError = error instanceof ApiError ? error : null;

    logger.error("refresh-failure", {
      expiresAt: session.expiresAt ?? null,
      secondsLeft: getSecondsLeft(session),
      refreshTokenSuffix: tokenSuffix(session.refreshToken),
      status: apiError?.status ?? null,
      body: apiError?.body ?? null,
    });

    session.destroy();
    throw new Error("Session expired");
  }
}
