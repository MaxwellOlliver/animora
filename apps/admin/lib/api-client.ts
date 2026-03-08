import { getAccessToken } from "@/features/auth/lib/tokens";
import {
  clearTokens,
  storeTokens,
} from "@/features/auth/lib/tokens";
import { refreshTokens } from "@/features/auth/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<void> | null = null;

async function ensureFreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const tokens = await refreshTokens();
      storeTokens(tokens);
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const token = getAccessToken();
  const isFormDataBody =
    typeof FormData !== "undefined" && init?.body instanceof FormData;
  const hasBody = !!init?.body;

  return {
    ...(hasBody && !isFormDataBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...init?.headers,
  };
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let res = await request(path, init);

  if (res.status === 401) {
    try {
      await ensureFreshAccessToken();
      res = await request(path, init);
    } catch {
      clearTokens();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired", 401);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      body?.message ?? `Request failed (${res.status})`,
      res.status,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
