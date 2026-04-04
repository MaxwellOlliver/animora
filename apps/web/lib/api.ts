import { getSession } from "./session";
import { refreshIfNeeded } from "./refresh-mutex";
import { ApiError } from "./api-internal";

export { ApiError } from "./api-internal";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

const API_BASE_URL = process.env.API_URL ?? "http://localhost:8080/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  persistSession?: boolean;
};

export async function api<T>(
  path: string,
  {
    body,
    auth = true,
    persistSession = false,
    headers: customHeaders,
    ...init
  }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(customHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const session = await getSession();
    if (session.profileId) {
      headers.set("X-Profile-Id", session.profileId);
    }
    if (session.accessToken) {
      await refreshIfNeeded(session, { persistSession });
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    if (auth && !persistSession && response.status === 401) {
      throw new SessionExpiredError();
    }

    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
