import type { AuthTokens, JwtPayload } from "../types"

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Strict`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? match[1] : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`
}

export function storeTokens(tokens: AuthTokens) {
  // Access token: short-lived (match API expiration, default 1h)
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, 60 * 60)
  // Refresh token: long-lived (7 days)
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, 60 * 60 * 24 * 7)
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  deleteCookie(ACCESS_TOKEN_KEY)
  deleteCookie(REFRESH_TOKEN_KEY)
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".")
    const decoded = JSON.parse(atob(payload))
    return decoded as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(payload: JwtPayload): boolean {
  return Date.now() >= payload.exp * 1000
}
