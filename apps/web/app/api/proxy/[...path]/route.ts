import { getLogger } from "@animora/logger";
import { NextRequest, NextResponse } from "next/server";

import { refreshIfNeeded } from "@/lib/refresh-mutex";
import { serverEnv } from "@/lib/server-env";
import { getSession } from "@/lib/session";

const API_BASE_URL = serverEnv.API_URL;
const logger = getLogger().child({ scope: "api-proxy" });

function tokenSuffix(token?: string): string | null {
  if (!token) return null;
  return token.slice(-8);
}

function getSecondsLeft(expiresAt?: number): number | null {
  if (!expiresAt) return null;
  return expiresAt - Math.floor(Date.now() / 1000);
}

function logProxy(event: string, details: Record<string, unknown>): void {
  logger.info(event, details);
}

async function proxyRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const session = await getSession();

  const target = `${API_BASE_URL}/${path.join("/")}${req.nextUrl.search}`;
  const secondsLeft = getSecondsLeft(session.expiresAt);

  logProxy("request:start", {
    method: req.method,
    path,
    search: req.nextUrl.search,
    target,
    hasAccessToken: Boolean(session.accessToken),
    hasRefreshToken: Boolean(session.refreshToken),
    accessTokenSuffix: tokenSuffix(session.accessToken),
    refreshTokenSuffix: tokenSuffix(session.refreshToken),
    expiresAt: session.expiresAt ?? null,
    secondsLeft,
    profileId: session.profileId ?? null,
  });

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (session.accessToken) {
    try {
      await refreshIfNeeded(session);
      logProxy("request:auth-ready", {
        method: req.method,
        expiresAt: session.expiresAt ?? null,
        secondsLeft: getSecondsLeft(session.expiresAt),
        accessTokenSuffix: tokenSuffix(session.accessToken),
        refreshTokenSuffix: tokenSuffix(session.refreshToken),
      });
    } catch (error) {
      logger.warn("request:session-expired", {
        method: req.method,
        expiresAt: session.expiresAt ?? null,
        secondsLeft: getSecondsLeft(session.expiresAt),
        accessTokenSuffix: tokenSuffix(session.accessToken),
        refreshTokenSuffix: tokenSuffix(session.refreshToken),
        error,
      });
      return NextResponse.json({ message: "Session expired" }, { status: 401 });
    }
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  if (session.profileId) {
    headers.set("X-Profile-Id", session.profileId);
  }

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  let upstream: Response;

  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    });
  } catch (error) {
    logger.error("request:upstream-error", {
      method: req.method,

      target,
      error,
    });
    throw error;
  }

  logProxy("request:upstream-response", {
    method: req.method,
    status: upstream.status,
    ok: upstream.ok,
    expiresAt: session.expiresAt ?? null,
    secondsLeft: getSecondsLeft(session.expiresAt),
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) {
    responseHeaders.set("Content-Type", upstreamContentType);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
