"use client"

import { createContext, use, useCallback, useMemo, useSyncExternalStore } from "react"

import { decodeJwt, getAccessToken, isTokenExpired } from "@/features/auth/lib/tokens"
import type { AuthUser } from "@/features/auth/types"

// --- Context interface: state + actions + meta (composition pattern) ---

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
}

interface AuthActions {
  /** Force re-read of token state (call after login/logout mutations settle) */
  refresh: () => void
}

interface AuthContextValue {
  state: AuthState
  actions: AuthActions
}

const AuthContext = createContext<AuthContextValue | null>(null)

// --- External store for cookie-based token state ---

let listeners: Array<() => void> = []

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function notifyListeners() {
  for (const listener of listeners) {
    listener()
  }
}

let cachedToken: string | null | undefined
let cachedSnapshot: AuthUser | null = null

function getSnapshot(): AuthUser | null {
  if (typeof document === "undefined") return null
  const token = getAccessToken()
  if (token === cachedToken) return cachedSnapshot

  cachedToken = token
  if (!token) {
    cachedSnapshot = null
    return cachedSnapshot
  }

  const payload = decodeJwt(token)
  if (!payload || payload.role !== "ADMIN" || isTokenExpired(payload)) {
    cachedSnapshot = null
    return cachedSnapshot
  }

  cachedSnapshot = { id: payload.sub, email: payload.email, role: payload.role }
  return cachedSnapshot
}

function getServerSnapshot(): AuthUser | null {
  return null
}

// --- Provider ---

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const refresh = useCallback(() => {
    notifyListeners()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      state: {
        user,
        isAuthenticated: user !== null,
      },
      actions: { refresh },
    }),
    [user, refresh],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

// --- Hook (React 19: use() instead of useContext) ---

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
