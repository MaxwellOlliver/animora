import { getAccessToken, getRefreshToken } from "./lib/tokens"
import type { AuthTokens, LoginCredentials } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new AuthError(
      body?.message ?? "Invalid email or password",
      res.status,
    )
  }

  return res.json()
}

export async function refreshTokens(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new AuthError("No refresh token", 401)
  }

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refreshToken}` },
  })

  if (!res.ok) {
    throw new AuthError("Session expired", res.status)
  }

  return res.json()
}

export async function logout(): Promise<void> {
  const accessToken = getAccessToken()
  if (!accessToken) return

  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
