"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { clearTokens } from "@/lib/session";

export async function signOut() {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // Clear cookies even if API call fails
  } finally {
    await clearTokens();
  }

  redirect("/sign-in");
}
