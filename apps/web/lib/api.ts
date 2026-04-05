import "server-only";

import { headers } from "next/headers";
import { ApiError } from "./api-internal";
import { serverEnv } from "./server-env";

export { ApiError } from "./api-internal";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}
type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function api<T>(
  path: string,
  { body, auth = true, headers: customHeaders, ...init }: RequestOptions = {},
): Promise<T> {
  return fetchThroughProxy<T>(path, {
    auth,
    body,
    headers: customHeaders,
    ...init,
  });
}

async function fetchThroughProxy<T>(
  path: string,
  { body, auth = true, headers: customHeaders, ...init }: RequestOptions,
): Promise<T> {
  const requestHeaders = await headers();
  const proxyHeaders = new Headers(customHeaders);
  const cookie = requestHeaders.get("cookie");

  if (body !== undefined) {
    proxyHeaders.set("Content-Type", "application/json");
  }

  if (cookie) {
    proxyHeaders.set("Cookie", cookie);
  }

  const response = await fetch(buildProxyUrl(path), {
    ...init,
    headers: proxyHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    if (auth && response.status === 401) {
      throw new SessionExpiredError();
    }

    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

function buildProxyUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`/api/proxy${normalizedPath}`, serverEnv.APP_URL).toString();
}
