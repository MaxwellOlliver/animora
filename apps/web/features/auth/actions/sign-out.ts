"use server";

import { redirect } from "next/navigation";

import { apiInternal } from "@/lib/api-internal";
import { getSession } from "@/lib/session";

export async function signOut() {
  const session = await getSession();

  if (session.accessToken) {
    try {
      await apiInternal("/auth/logout", {
        method: "POST",
        token: session.accessToken,
      });
    } catch {
      // Best-effort: destroy session even if API call fails
    }
  }

  session.destroy();
  redirect("/sign-in");
}
