import { getServerEnv } from "./server-env";

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
  token?: string;
};

export async function apiInternal<T>(
  path: string,
  { body, token, headers: customHeaders, ...init }: RequestOptions = {},
): Promise<T> {
  const { API_URL } = getServerEnv();
  const headers = new Headers(customHeaders);

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
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
