"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { login, logout, refreshTokens } from "./api"
import { clearTokens, decodeJwt, storeTokens } from "./lib/tokens"
import type { LoginCredentials } from "./types"
import { useAuth } from "@/providers/auth-provider"

export function useLogin() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { actions } = useAuth()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const tokens = await login(credentials)
      const payload = decodeJwt(tokens.accessToken)

      if (!payload || payload.role !== "ADMIN") {
        clearTokens()
        throw new Error("Access denied. Admin privileges required.")
      }

      storeTokens(tokens)
      return { tokens, user: { id: payload.sub, email: payload.email, role: payload.role } }
    },
    onSuccess: () => {
      actions.refresh()
      queryClient.clear()
      router.replace("/")
      router.refresh()
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { actions } = useAuth()

  return useMutation({
    mutationFn: async () => {
      await logout()
      clearTokens()
    },
    onSettled: () => {
      actions.refresh()
      queryClient.clear()
      router.replace("/login")
      router.refresh()
    },
  })
}

export function useRefreshToken() {
  const { actions } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const tokens = await refreshTokens()
      storeTokens(tokens)
      actions.refresh()
      return tokens
    },
    onError: () => {
      clearTokens()
      actions.refresh()
    },
  })
}
