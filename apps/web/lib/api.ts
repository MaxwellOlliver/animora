import { getSession } from "./session";

const API_BASE_URL = process.env.API_URL ?? "http://localhost:8080/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
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
  const headers = new Headers(customHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const session = await getSession();
    if (session?.accessToken) {
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
