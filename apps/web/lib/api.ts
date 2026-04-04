import { getSession } from "./session";
import { refreshIfNeeded } from "./refresh-mutex";
import { ApiError } from "./api-internal";

export { ApiError } from "./api-internal";

const API_BASE_URL = process.env.API_URL ?? "http://localhost:8080/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function api<T>(
  path: string,
  { body, auth = true, headers: customHeaders, ...init }: RequestOptions = {},
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
      await refreshIfNeeded(session);
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
    throw new ApiError(response.status, errorBody);
  }

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
